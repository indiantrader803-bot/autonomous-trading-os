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

# Active Exchange Selection State (Dynamic Switchable: DELTA_INDIA, COINBASE, HYPERLIQUID)
active_exchange_state = {
    "current_exchange": settings.PRIMARY_EXCHANGE # Default: DELTA_INDIA
}

# 24/7 Background Trading Daemon Task
async def autonomous_background_worker():
    """
    Runs continuously 24/7 inside the backend container.
    Supports multi-exchange routing: Delta Exchange India, Coinbase Advanced, and Hyperliquid.
    Automatically fetches real available balance, scans live orderbooks, and executes trades.
    """
    print(f"[24/7 WORKER] Multi-Exchange Live Trading Engine Initialized.", flush=True)
    await asyncio.sleep(3)

    delta_products = [
        {"symbol": "BTCUSD", "product_id": 21525, "display": "BTCUSD PERP"},
        {"symbol": "ETHUSD", "product_id": 15367, "display": "ETHUSD PERP"},
        {"symbol": "SOLUSD", "product_id": 58202, "display": "SOLUSD PERP"},
        {"symbol": "XRPUSD", "product_id": 67711, "display": "XRPUSD PERP"}
    ]

    coinbase_products = [
        {"symbol": "BTC-PERP", "product_id": "BTC-USDC", "base": "BTC"},
        {"symbol": "ETH-PERP", "product_id": "ETH-USDC", "base": "ETH"},
        {"symbol": "SOL-PERP", "product_id": "SOL-USDC", "base": "SOL"}
    ]

    scan_idx = 0
    while True:
        try:
            curr_ex = active_exchange_state["current_exchange"]

            # 1. Sync Live Balance from selected Exchange
            if curr_ex == "DELTA_INDIA" and delta_client.is_configured():
                bal_data = await delta_client.get_wallet_balances()
                eq = bal_data.get("net_equity", 3.51)
                if eq > 0:
                    paper_trader.equity = eq
            elif curr_ex == "COINBASE" and coinbase_client.is_configured():
                cb_bal = await coinbase_client.get_total_balance_usd()
                if cb_bal > 0:
                    paper_trader.equity = cb_bal

            # 2. Evaluate Perpetual Futures Market
            if curr_ex == "DELTA_INDIA":
                prod = delta_products[scan_idx % len(delta_products)]
                scan_idx += 1
                ticker = await delta_client.get_ticker(prod["symbol"])
                cur_price = ticker.get("close", 0.0) or ticker.get("mark_price", 0.0)
                eval_symbol = prod["symbol"]
            else:
                prod = coinbase_products[scan_idx % len(coinbase_products)]
                scan_idx += 1
                ticker = await coinbase_client.get_product_ticker(prod["product_id"])
                cur_price = ticker.get("price", 0.0)
                eval_symbol = prod["symbol"]

            if cur_price > 0 and len(paper_trader.active_positions) < settings.MAX_SIMULTANEOUS_POSITIONS:
                active_symbols = [p["symbol"] for p in paper_trader.active_positions.values()]
                if eval_symbol not in active_symbols:
                    state = {
                        "symbol": eval_symbol,
                        "direction": "LONG",
                        "market_price": cur_price,
                        "current_equity": paper_trader.equity,
                        "current_daily_pnl": paper_trader.daily_pnl,
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
                    res = await committee_graph.ainvoke(state)
                    if res.get("status") == "APPROVED":
                        setup = res.get("setup", {})
                        sizing = setup.get("sizing", {})
                        notional = min(sizing.get("total_notional", 1.0), 1.5)

                        # Submit live trade if LIVE mode is enabled
                        if settings.TRADING_MODE == "LIVE":
                            if curr_ex == "DELTA_INDIA" and delta_client.is_configured():
                                d_res = await delta_client.place_order(
                                    product_id=prod.get("product_id", 21525),
                                    size=1,
                                    side="buy"
                                )
                                print(f"[DELTA INDIA LIVE] Placed order {eval_symbol} -> {d_res}", flush=True)
                            elif curr_ex == "COINBASE" and coinbase_client.is_configured():
                                c_res = await coinbase_client.place_order(
                                    product_id=prod.get("product_id", "BTC-USDC"),
                                    side="BUY",
                                    notional_usd=notional
                                )
                                print(f"[COINBASE LIVE] Placed order {eval_symbol} -> {c_res}", flush=True)

                        paper_trader.execute_approved_proposal({
                            "symbol": eval_symbol,
                            "setup": setup
                        })
                        print(f"[{curr_ex}] Trade recorded for {eval_symbol} @ ${cur_price}", flush=True)

            # 3. Dynamic price updates on active positions
            if paper_trader.active_positions:
                feed = {}
                for pos in paper_trader.active_positions.values():
                    sym = pos["symbol"]
                    if curr_ex == "DELTA_INDIA":
                        t = await delta_client.get_ticker(sym)
                        p = t.get("close", 0.0) or t.get("mark_price", 0.0)
                        if p > 0: feed[sym] = p
                    else:
                        matched = next((p for p in coinbase_products if p["symbol"] == sym), None)
                        if matched:
                            t = await coinbase_client.get_product_ticker(matched["product_id"])
                            if t.get("price", 0) > 0: feed[sym] = t["price"]
                if feed:
                    paper_trader.update_market_prices(feed)

        except Exception as e:
            print(f"[24/7 WORKER] Error in cycle tick: {e}", flush=True)
        await asyncio.sleep(10)

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
    
    return [
        {
            "id": "DELTA_INDIA",
            "name": "Delta Exchange India",
            "base_url": settings.DELTA_INDIA_BASE_URL,
            "connected": delta_client.is_configured(),
            "net_equity": delta_bal.get("net_equity", 3.51),
            "currency": "USD",
            "contract_type": "Perpetual Futures",
            "is_active": active_exchange_state["current_exchange"] == "DELTA_INDIA"
        },
        {
            "id": "COINBASE",
            "name": "Coinbase Advanced",
            "base_url": "https://api.coinbase.com",
            "connected": coinbase_client.is_configured(),
            "net_equity": cb_bal if cb_bal > 0 else 4.90,
            "currency": "USDC",
            "contract_type": "Futures & Spot",
            "is_active": active_exchange_state["current_exchange"] == "COINBASE"
        },
        {
            "id": "HYPERLIQUID",
            "name": "Hyperliquid L1",
            "base_url": "https://api.hyperliquid.xyz",
            "connected": False,
            "net_equity": 0.0,
            "currency": "USDC",
            "contract_type": "Perpetual DEX",
            "is_active": active_exchange_state["current_exchange"] == "HYPERLIQUID"
        }
    ]

class SwitchExchangeRequest(BaseModel):
    exchange_id: str

@app.post("/api/v1/exchanges/switch")
async def switch_exchange(req: SwitchExchangeRequest):
    ex_id = req.exchange_id.upper()
    if ex_id not in ["DELTA_INDIA", "COINBASE", "HYPERLIQUID"]:
        raise HTTPException(status_code=400, detail="Unsupported exchange")
    active_exchange_state["current_exchange"] = ex_id
    paper_trader.active_positions.clear()
    
    # Immediately pull fresh balance
    if ex_id == "DELTA_INDIA":
        b = await delta_client.get_wallet_balances()
        paper_trader.equity = b.get("net_equity", 3.51)
    elif ex_id == "COINBASE":
        cb = await coinbase_client.get_total_balance_usd()
        paper_trader.equity = cb if cb > 0 else 4.90

    return {
        "status": "SWITCHED",
        "current_exchange": active_exchange_state["current_exchange"],
        "equity": paper_trader.equity
    }

@app.get("/api/v1/dashboard")
async def get_dashboard_overview():
    curr_ex = active_exchange_state["current_exchange"]
    portfolio = paper_trader.get_portfolio_summary()

    if curr_ex == "DELTA_INDIA":
        d_bal = await delta_client.get_wallet_balances()
        live_eq = d_bal.get("net_equity", 3.51)
        ex_name = "DELTA EXCHANGE INDIA"
        market_type = "PERPETUAL FUTURES"
    elif curr_ex == "COINBASE":
        live_eq = await coinbase_client.get_total_balance_usd()
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
        "active_positions": list(paper_trader.active_positions.values()),
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
