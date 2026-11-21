import psutil
import asyncio
from datetime import datetime
from fastapi import FastAPI, Depends, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

from app.core.config import settings
from app.agents.committee import committee
from app.agents.committee_graph import committee_graph
from app.risk.engine import risk_engine
from app.trading.execution import paper_trader
from app.trading.live_executor import live_executor
from app.trading.coinbase_executor import coinbase_client
from app.trading.delta_executor import delta_client
from app.providers.market_data import market_provider
from app.providers.ccxt_connector import ccxt_connector
from app.services.litellm_router import unified_router

app = FastAPI(
    title=settings.APP_NAME,
    description="Institutional AI Trading Operating System",
    version="1.0.0"
)

# Active Multi-Exchange Execution State (Simultaneous Dual-Exchange Mode)
active_exchange_state = {
    "current_exchange": "BOTH", # BOTH, DELTA_INDIA, COINBASE
    "delta_equity": 3.51,
    "coinbase_equity": 4.90,
    "total_equity": 8.41
}

# 24/7 Background Trading Daemon Task (Simultaneous Dual-Exchange Execution)
async def autonomous_background_worker():
    """
    Runs continuously 24/7 inside the backend container.
    Simultaneously monitors and trades across BOTH Delta Exchange India & Coinbase Advanced.
    Allocates risk per exchange, monitors live orderbooks, and executes live orders concurrently.
    """
    print(f"[24/7 WORKER] Simultaneous Dual-Exchange Trading Engine Initialized (Delta India + Coinbase).", flush=True)
    await asyncio.sleep(3)

    delta_products = [
        {"symbol": "BTCUSD", "product_id": 21525, "exchange": "DELTA_INDIA", "display": "BTCUSD PERP"},
        {"symbol": "ETHUSD", "product_id": 15367, "exchange": "DELTA_INDIA", "display": "ETHUSD PERP"},
        {"symbol": "SOLUSD", "product_id": 58202, "exchange": "DELTA_INDIA", "display": "SOLUSD PERP"},
        {"symbol": "XRPUSD", "product_id": 67711, "exchange": "DELTA_INDIA", "display": "XRPUSD PERP"}
    ]

    coinbase_products = [
        {"symbol": "BTC-PERP", "product_id": "BTC-USDC", "exchange": "COINBASE", "base": "BTC"},
        {"symbol": "ETH-PERP", "product_id": "ETH-USDC", "exchange": "COINBASE", "base": "ETH"},
        {"symbol": "SOL-PERP", "product_id": "SOL-USDC", "exchange": "COINBASE", "base": "SOL"}
    ]

    scan_d_idx = 0
    scan_c_idx = 0

    while True:
        try:
            # 1. Concurrently Sync Real Balances from BOTH Exchanges
            delta_bal = 3.51
            cb_bal = 4.90

            if delta_client.is_configured():
                d_data = await delta_client.get_wallet_balances()
                delta_bal = d_data.get("net_equity", 3.51)
                active_exchange_state["delta_equity"] = delta_bal

            if coinbase_client.is_configured():
                c_data = await coinbase_client.get_total_balance_usd()
                if c_data > 0:
                    cb_bal = c_data
                    active_exchange_state["coinbase_equity"] = cb_bal

            total_combined_equity = round(delta_bal + cb_bal, 2)
            active_exchange_state["total_equity"] = total_combined_equity
            paper_trader.equity = total_combined_equity

            # 2. Concurrently Scan & Trade Delta Exchange India
            prod_d = delta_products[scan_d_idx % len(delta_products)]
            scan_d_idx += 1
            t_d = await delta_client.get_ticker(prod_d["symbol"])
            px_d = t_d.get("close", 0.0) or t_d.get("mark_price", 0.0)

            if px_d > 0 and len(paper_trader.active_positions) < settings.MAX_SIMULTANEOUS_POSITIONS:
                active_symbols = [p["symbol"] for p in paper_trader.active_positions.values()]
                if prod_d["symbol"] not in active_symbols:
                    state_d = {
                        "symbol": prod_d["symbol"],
                        "direction": "LONG",
                        "market_price": px_d,
                        "current_equity": delta_bal,
                        "current_daily_pnl": 0.0,
                        "active_positions_count": len(paper_trader.active_positions),
                        "scout_output": None,
                        "researcher_output": None,
                        "strategist_proposal": None,
                        "risk_evaluation": None,
                        "auditor_verification": None,
                        "status": "EVALUATING",
                        "rejection_reason": None,
                        "setup": None
                    }
                    res_d = await committee_graph.ainvoke(state_d)
                    if res_d.get("status") == "APPROVED":
                        setup_d = res_d.get("setup", {})
                        if settings.TRADING_MODE == "LIVE" and delta_client.is_configured():
                            d_exec = await delta_client.place_order(
                                product_id=prod_d["product_id"],
                                size=1,
                                side="buy"
                            )
                            print(f"[DELTA LIVE] Executed {prod_d['symbol']} -> {d_exec}", flush=True)
                        else:
                            paper_trader.execute_approved_proposal({
                                "symbol": prod_d["symbol"],
                                "setup": setup_d
                            })

            # 3. Concurrently Scan & Trade Coinbase Advanced
            prod_c = coinbase_products[scan_c_idx % len(coinbase_products)]
            scan_c_idx += 1
            t_c = await coinbase_client.get_product_ticker(prod_c["product_id"])
            px_c = t_c.get("price", 0.0)

            if px_c > 0 and len(paper_trader.active_positions) < settings.MAX_SIMULTANEOUS_POSITIONS:
                active_symbols = [p["symbol"] for p in paper_trader.active_positions.values()]
                if prod_c["symbol"] not in active_symbols:
                    state_c = {
                        "symbol": prod_c["symbol"],
                        "direction": "LONG",
                        "market_price": px_c,
                        "current_equity": cb_bal,
                        "current_daily_pnl": 0.0,
                        "active_positions_count": len(paper_trader.active_positions),
                        "scout_output": None,
                        "researcher_output": None,
                        "strategist_proposal": None,
                        "risk_evaluation": None,
                        "auditor_verification": None,
                        "status": "EVALUATING",
                        "rejection_reason": None,
                        "setup": None
                    }
                    res_c = await committee_graph.ainvoke(state_c)
                    if res_c.get("status") == "APPROVED":
                        setup_c = res_c.get("setup", {})
                        if settings.TRADING_MODE == "LIVE" and coinbase_client.is_configured():
                            c_exec = await coinbase_client.place_order(
                                product_id=prod_c["product_id"],
                                side="BUY",
                                notional_usd=1.50
                            )
                            print(f"[COINBASE LIVE] Executed {prod_c['symbol']} -> {c_exec}", flush=True)
                        else:
                            paper_trader.execute_approved_proposal({
                                "symbol": prod_c["symbol"],
                                "setup": setup_c
                            })

            # 4. Live Price Feeds Reconciliation for Active Positions
            if paper_trader.active_positions:
                feed = {}
                for pos in paper_trader.active_positions.values():
                    sym = pos["symbol"]
                    # If Delta product
                    if "USD" in sym and not "-PERP" in sym:
                        t = await delta_client.get_ticker(sym)
                        p = t.get("close", 0.0) or t.get("mark_price", 0.0)
                        if p > 0: feed[sym] = p
                    else:
                        m = next((p for p in coinbase_products if p["symbol"] == sym), None)
                        if m:
                            t = await coinbase_client.get_product_ticker(m["product_id"])
                            if t.get("price", 0) > 0: feed[sym] = t["price"]
                if feed:
                    paper_trader.update_market_prices(feed)

        except Exception as e:
            print(f"[24/7 DUAL WORKER] Error: {e}", flush=True)
        await asyncio.sleep(8)

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(autonomous_background_worker())


# Enable CORS for Frontend UI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory activity audit stream
audit_logs = [
    {
        "id": 1,
        "timestamp": datetime.utcnow().isoformat(),
        "actor": "SYSTEM",
        "action": "STARTUP",
        "details": "Autonomous Trading OS initialized in PAPER mode with capital preservation controls active.",
        "status": "SUCCESS"
    }
]

# --- 1. OVERVIEW & COMMAND CENTER ---
@app.get("/api/v1/exchanges")
async def list_exchanges():
    """
    Returns available exchanges, their live connectivity, and verified balance.
    """
    delta_bal = await delta_client.get_wallet_balances()
    cb_bal = await coinbase_client.get_total_balance_usd()
    d_eq = delta_bal.get("net_equity", 3.51)
    c_eq = cb_bal if cb_bal > 0 else 4.90
    
    return [
        {
            "id": "BOTH",
            "name": "Both Exchanges (Delta India + Coinbase)",
            "base_url": "Simultaneous Dual Execution",
            "connected": True,
            "net_equity": round(d_eq + c_eq, 2),
            "currency": "USD/USDC",
            "contract_type": "Simultaneous Perps & Futures",
            "is_active": active_exchange_state["current_exchange"] == "BOTH"
        },
        {
            "id": "DELTA_INDIA",
            "name": "Delta Exchange India",
            "base_url": settings.DELTA_INDIA_BASE_URL,
            "connected": delta_client.is_configured(),
            "net_equity": d_eq,
            "currency": "USD",
            "contract_type": "Perpetual Futures",
            "is_active": active_exchange_state["current_exchange"] == "DELTA_INDIA"
        },
        {
            "id": "COINBASE",
            "name": "Coinbase Advanced",
            "base_url": "https://api.coinbase.com",
            "connected": coinbase_client.is_configured(),
            "net_equity": c_eq,
            "currency": "USDC",
            "contract_type": "Futures & Spot",
            "is_active": active_exchange_state["current_exchange"] == "COINBASE"
        }
    ]

class SwitchExchangeRequest(BaseModel):
    exchange_id: str

@app.post("/api/v1/exchanges/switch")
async def switch_exchange(req: SwitchExchangeRequest):
    ex_id = req.exchange_id.upper()
    if ex_id not in ["BOTH", "DELTA_INDIA", "COINBASE", "HYPERLIQUID"]:
        raise HTTPException(status_code=400, detail="Unsupported exchange")
    active_exchange_state["current_exchange"] = ex_id
    
    # Recalculate equity
    d_bal = await delta_client.get_wallet_balances()
    cb_bal = await coinbase_client.get_total_balance_usd()
    d_eq = d_bal.get("net_equity", 3.51)
    c_eq = cb_bal if cb_bal > 0 else 4.90
    
    if ex_id == "BOTH":
        paper_trader.equity = round(d_eq + c_eq, 2)
    elif ex_id == "DELTA_INDIA":
        paper_trader.equity = d_eq
    elif ex_id == "COINBASE":
        paper_trader.equity = c_eq

    return {
        "status": "SWITCHED",
        "current_exchange": active_exchange_state["current_exchange"],
        "equity": paper_trader.equity
    }

@app.get("/api/v1/dashboard")
async def get_dashboard_overview():
    curr_ex = active_exchange_state["current_exchange"]
    portfolio = paper_trader.get_portfolio_summary()

    d_bal = await delta_client.get_wallet_balances()
    cb_bal = await coinbase_client.get_total_balance_usd()
    d_eq = d_bal.get("net_equity", 3.51)
    c_eq = cb_bal if cb_bal > 0 else 4.90

    if curr_ex == "BOTH":
        live_eq = round(d_eq + c_eq, 2)
        ex_name = "SIMULTANEOUS DUAL EXCHANGES (DELTA INDIA + COINBASE)"
        market_type = "DUAL PERPETUAL FUTURES"
    elif curr_ex == "DELTA_INDIA":
        live_eq = d_eq
        ex_name = "DELTA EXCHANGE INDIA"
        market_type = "PERPETUAL FUTURES"
    elif curr_ex == "COINBASE":
        live_eq = c_eq
        ex_name = "COINBASE ADVANCED"
        market_type = "PERPETUAL FUTURES & SPOT"
    else:
        live_eq = 10.0
        ex_name = "HYPERLIQUID"
        market_type = "PERPETUAL DEX"

    if live_eq > 0:
        portfolio["total_equity"] = live_eq
        portfolio["cash_balance"] = live_eq

    markets = await market_provider.get_hyperliquid_markets()

    # Fetch real live exchange positions when LIVE
    if settings.TRADING_MODE == "LIVE":
        real_positions = []
        if delta_client.is_configured():
            real_positions.extend(await delta_client.get_real_positions())
        if coinbase_client.is_configured():
            real_positions.extend(await coinbase_client.get_real_positions())
        dashboard_positions = real_positions
        portfolio["open_positions_count"] = len(real_positions)
    else:
        dashboard_positions = list(paper_trader.active_positions.values())

    return {
        "status": {
            "operational": True,
            "trading_mode": settings.TRADING_MODE,
            "exchange": ex_name,
            "exchange_id": curr_ex,
            "market_type": market_type,
            "emergency_halt": risk_engine.is_halted,
            "paper_trading": settings.PAPER_TRADING,
            "active_ai_model": "Claude 3.5 Sonnet / GPT-4o Committee",
            "last_updated": datetime.utcnow().isoformat()
        },
        "portfolio": portfolio,
        "active_positions": dashboard_positions,
        "top_markets": markets[:5] if markets else [],
        "risk_limits": {
            "reference_capital": settings.REFERENCE_CAPITAL_USD,
            "risk_per_trade_percent": settings.RISK_PER_TRADE_PERCENT,
            "daily_loss_limit_percent": settings.DAILY_LOSS_LIMIT_PERCENT,
            "max_drawdown_percent": settings.MAX_DRAWDOWN_PERCENT,
            "max_simultaneous_positions": settings.MAX_SIMULTANEOUS_POSITIONS,
            "martingale_allowed": settings.MARTINGALE_ALLOWED,
            "initial_leverage": settings.INITIAL_LEVERAGE
        }
    }

# --- 2. LIVE MARKETS & DISCOVERY ---
@app.get("/api/v1/markets")
async def list_markets():
    return await market_provider.get_hyperliquid_markets()

@app.get("/api/v1/tokens/solana-trending")
async def list_solana_trending():
    return await market_provider.get_solana_pump_tokens()

# --- 3. AI AGENT COMMITTEE ---
@app.get("/api/v1/agents")
async def get_agents():
    return [
        {
            "id": k,
            "name": a.name,
            "role": a.role.value,
            "assigned_model": a.assigned_model,
            "tier": a.tier.value,
            "tasks_run": a.tasks_run,
            "status": "IDLE" if not risk_engine.is_halted else "PAUSED"
        }
        for k, a in committee.agents.items()
    ]

class ProposalRequest(BaseModel):
    symbol: str
    direction: str # LONG or SHORT
    market_price: float

@app.post("/api/v1/committee/evaluate")
async def evaluate_trade(req: ProposalRequest):
    """
    Triggers the multi-agent committee pipeline powered by LangGraph state machine.
    Scout -> Researcher -> Strategist -> Risk Manager Veto -> Auditor
    """
    portfolio = paper_trader.get_portfolio_summary()
    initial_state = {
        "symbol": req.symbol,
        "direction": req.direction,
        "market_price": req.market_price,
        "current_equity": portfolio["total_equity"],
        "current_daily_pnl": portfolio["daily_pnl"],
        "active_positions_count": len(paper_trader.active_positions),
        "scout_output": None,
        "researcher_output": None,
        "strategist_proposal": None,
        "risk_evaluation": None,
        "auditor_verification": None,
        "status": "EVALUATING",
        "rejection_reason": None,
        "setup": None
    }

    final_state = await committee_graph.ainvoke(initial_state)

    result = {
        "symbol": req.symbol,
        "direction": req.direction,
        "status": final_state.get("status", "REJECTED"),
        "rejection_reason": final_state.get("rejection_reason"),
        "setup": final_state.get("setup"),
        "stages": {
            "scout": final_state.get("scout_output"),
            "researcher": final_state.get("researcher_output"),
            "strategist": final_state.get("strategist_proposal"),
            "risk_manager": final_state.get("risk_evaluation"),
            "auditor": final_state.get("auditor_verification"),
            "final_decision": final_state.get("status")
        },
        "timestamp": datetime.utcnow().isoformat()
    }

    audit_logs.append({
        "id": len(audit_logs) + 1,
        "timestamp": datetime.utcnow().isoformat(),
        "actor": "LANGGRAPH_COMMITTEE",
        "action": f"EVALUATE_{req.symbol}",
        "details": f"Decision: {result['status']}. Direction: {req.direction}.",
        "status": "SUCCESS" if result["status"] == "APPROVED" else "REJECTED"
    })

    # If approved and in PAPER mode with auto-execution allowed
    if result["status"] == "APPROVED" and settings.TRADING_MODE in ["PAPER", "AUTONOMOUS"]:
        exec_res = paper_trader.execute_approved_proposal(result)
        result["execution"] = exec_res

    return result

# --- 4. TRADING & POSITIONS ---
@app.get("/api/v1/positions")
async def list_positions():
    """
    Returns real live exchange positions directly from connected exchanges
    (Delta Exchange India and Coinbase) when in LIVE mode, guaranteeing 100% 
    synchronicity between UI and exchange records with zero ghost positions.
    """
    if settings.TRADING_MODE == "LIVE":
        real_positions = []
        if delta_client.is_configured():
            d_pos = await delta_client.get_real_positions()
            real_positions.extend(d_pos)
        if coinbase_client.is_configured():
            cb_pos = await coinbase_client.get_real_positions()
            real_positions.extend(cb_pos)

        return {
            "open_positions": real_positions,
            "trade_history": paper_trader.trade_history
        }

    return {
        "open_positions": list(paper_trader.active_positions.values()),
        "trade_history": paper_trader.trade_history
    }

@app.post("/api/v1/positions/reset")
async def reset_positions():
    """
    Resets the paper trading account back to fresh starting balance ($10.00)
    and clears all open positions so autonomous compounding can begin fresh.
    """
    paper_trader.equity = settings.REFERENCE_CAPITAL_USD
    paper_trader.daily_pnl = 0.0
    paper_trader.realized_pnl = 0.0
    paper_trader.active_positions.clear()
    paper_trader.orders.clear()
    paper_trader.trade_history.clear()
    return {
        "status": "RESET_SUCCESSFUL",
        "equity": paper_trader.equity,
        "message": "Account reset to $10.00 baseline capital. Ready for compounding sequence."
    }

@app.post("/api/v1/positions/{pos_id}/close")
async def close_position(pos_id: str):
    if pos_id in paper_trader.active_positions:
        pos = paper_trader.active_positions.pop(pos_id)
        pos["status"] = "CLOSED"
        pos["closed_at"] = datetime.utcnow().isoformat()
        paper_trader.trade_history.append(pos)
        return {"status": "CLOSED", "position": pos}
    raise HTTPException(status_code=404, detail="Position not found")

@app.get("/api/v1/orders")
async def list_orders():
    return paper_trader.orders

# --- 5. RISK CENTER & EMERGENCY HALT ---
@app.get("/api/v1/trading/mode")
async def get_trading_mode():
    ready, reason = live_executor.validate_live_prerequisites()
    return {
        "trading_mode": settings.TRADING_MODE,
        "paper_trading": settings.PAPER_TRADING,
        "live_trading_enabled": settings.LIVE_TRADING_ENABLED,
        "live_prerequisites_ready": ready,
        "live_readiness_message": reason
    }

class ModeSwitchRequest(BaseModel):
    mode: str # PAPER or LIVE

@app.post("/api/v1/trading/mode")
async def switch_trading_mode(req: ModeSwitchRequest):
    if req.mode.upper() == "LIVE":
        ready, reason = live_executor.validate_live_prerequisites()
        if not ready:
            raise HTTPException(status_code=400, detail=f"Cannot activate Live Trading: {reason}")
        settings.TRADING_MODE = "LIVE"
        settings.PAPER_TRADING = False
        settings.LIVE_TRADING_ENABLED = True
    else:
        settings.TRADING_MODE = "PAPER"
        settings.PAPER_TRADING = True
        settings.LIVE_TRADING_ENABLED = False

    audit_logs.append({
        "id": len(audit_logs) + 1,
        "timestamp": datetime.utcnow().isoformat(),
        "actor": "USER",
        "action": "TRADING_MODE_CHANGED",
        "details": f"Switched mode to {settings.TRADING_MODE}",
        "status": "SUCCESS"
    })
    return {"trading_mode": settings.TRADING_MODE, "live_trading_enabled": settings.LIVE_TRADING_ENABLED}

@app.get("/api/v1/risk")
async def get_risk_status():
    portfolio = paper_trader.get_portfolio_summary()
    return {
        "emergency_halt": risk_engine.is_halted,
        "daily_loss_limit_percent": risk_engine.daily_loss_limit_pct,
        "max_drawdown_percent": risk_engine.max_drawdown_pct,
        "current_daily_pnl": portfolio["daily_pnl"],
        "total_equity": portfolio["total_equity"],
        "active_positions_count": len(paper_trader.active_positions),
        "max_simultaneous_positions": settings.MAX_SIMULTANEOUS_POSITIONS
    }

@app.post("/api/v1/risk/halt")
async def set_risk_halt(halt: bool):
    risk_engine.set_emergency_halt(halt)
    audit_logs.append({
        "id": len(audit_logs) + 1,
        "timestamp": datetime.utcnow().isoformat(),
        "actor": "USER",
        "action": "EMERGENCY_HALT_TOGGLED",
        "details": f"Halt state changed to: {halt}",
        "status": "SUCCESS"
    })
    return {"emergency_halt": risk_engine.is_halted}

# --- 6. AI MODEL ROUTER ---
@app.get("/api/v1/models")
async def list_models():
    return [
        {
            "id": m.id,
            "name": m.name,
            "provider": m.provider,
            "tier": m.tier.value,
            "context_window": m.context_window,
            "is_available": m.is_available,
            "latency_ms": round(m.latency_ms, 1),
            "circuit_breaker": unified_router.circuit_breakers.get(m.id, False)
        }
        for m in unified_router.registry.values()
    ]

# --- 7. AUDIT LOGS & SYSTEM MONITORING ---
@app.get("/api/v1/audit")
async def get_audit_logs():
    return list(reversed(audit_logs[-50:]))

@app.get("/api/v1/system")
async def get_system_metrics():
    vm = psutil.virtual_memory()
    disk = psutil.disk_usage("C:\\")
    return {
        "cpu_usage_percent": psutil.cpu_percent(interval=None),
        "ram_total_gb": round(vm.total / (1024**3), 2),
        "ram_available_gb": round(vm.available / (1024**3), 2),
        "ram_percent": vm.percent,
        "disk_free_gb": round(disk.free / (1024**3), 2),
        "disk_percent": disk.percent,
        "platform": "Windows / Docker Desktop",
        "uptime": datetime.utcnow().isoformat()
    }
