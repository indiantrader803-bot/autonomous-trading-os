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
from app.providers.market_data import market_provider
from app.providers.ccxt_connector import ccxt_connector
from app.services.litellm_router import unified_router

app = FastAPI(
    title=settings.APP_NAME,
    description="Institutional AI Trading Operating System",
    version="1.0.0"
)

# 24/7 Background Trading Daemon Task
async def autonomous_background_worker():
    """
    Runs continuously 24/7 inside the backend container.
    Connected directly to Coinbase Advanced Trade & Perpetual Futures.
    Tracks real balances, analyzes live market orderbooks, and executes live trades.
    """
    print(f"[24/7 WORKER] Coinbase Live Trading Engine Initialized. Mode: {settings.TRADING_MODE}", flush=True)
    await asyncio.sleep(3)

    # Perpetual Futures and High-Liquidity Products on Coinbase
    coinbase_products = [
        {"symbol": "BTC-PERP", "product_id": "BTC-USDC", "base": "BTC"},
        {"symbol": "ETH-PERP", "product_id": "ETH-USDC", "base": "ETH"},
        {"symbol": "SOL-PERP", "product_id": "SOL-USDC", "base": "SOL"},
        {"symbol": "DOGE-PERP", "product_id": "DOGE-USDC", "base": "DOGE"},
        {"symbol": "XRP-PERP", "product_id": "XRP-USDC", "base": "XRP"}
    ]

    scan_idx = 0
    while True:
        try:
            # Query real live balance from Coinbase
            cb_balance = await coinbase_client.get_total_balance_usd()
            if cb_balance > 0:
                paper_trader.equity = cb_balance

            # Evaluate selected perpetual/spot market
            prod = coinbase_products[scan_idx % len(coinbase_products)]
            scan_idx += 1

            ticker = await coinbase_client.get_product_ticker(prod["product_id"])
            cur_price = ticker.get("price", 0.0)

            if cur_price > 0 and len(paper_trader.active_positions) < settings.MAX_SIMULTANEOUS_POSITIONS:
                active_symbols = [p["symbol"] for p in paper_trader.active_positions.values()]
                if prod["symbol"] not in active_symbols:
                    state = {
                        "symbol": prod["symbol"],
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
                        notional = min(sizing.get("total_notional", 1.0), 2.0) # Conservative $2.00 size on Coinbase

                        # Submit live order if LIVE mode enabled
                        if settings.TRADING_MODE == "LIVE" and coinbase_client.is_configured():
                            cb_res = await coinbase_client.place_order(
                                product_id=prod["product_id"],
                                side="BUY",
                                notional_usd=notional
                            )
                            print(f"[COINBASE LIVE] Placed order for {prod['symbol']} ${notional} -> {cb_res}", flush=True)

                        paper_trader.execute_approved_proposal({
                            "symbol": prod["symbol"],
                            "setup": setup
                        })
                        print(f"[COINBASE] Trade recorded for {prod['symbol']} @ ${cur_price}", flush=True)

            # Reconcile active prices with live Coinbase market prices
            if paper_trader.active_positions:
                feed = {}
                for pos in paper_trader.active_positions.values():
                    sym = pos["symbol"]
                    # Match symbol to product
                    matched = next((p for p in coinbase_products if p["symbol"] == sym), None)
                    if matched:
                        t = await coinbase_client.get_product_ticker(matched["product_id"])
                        if t.get("price", 0) > 0:
                            feed[sym] = t["price"]
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
@app.get("/api/v1/dashboard")
async def get_dashboard_overview():
    portfolio = paper_trader.get_portfolio_summary()
    cb_balance = await coinbase_client.get_total_balance_usd()
    if cb_balance > 0:
        portfolio["total_equity"] = cb_balance
        portfolio["cash_balance"] = cb_balance

    markets = await market_provider.get_hyperliquid_markets()
    return {
        "status": {
            "operational": True,
            "trading_mode": settings.TRADING_MODE,
            "exchange": "COINBASE ADVANCED",
            "market_type": "PERPETUAL FUTURES & SPOT",
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
