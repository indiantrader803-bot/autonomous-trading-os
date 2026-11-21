from typing import TypedDict, List, Dict, Any, Optional
from langgraph.graph import StateGraph, END
from app.models.entities import ModelTier
from app.services.litellm_router import unified_router
from app.risk.engine import risk_engine

class CommitteeState(TypedDict):
    symbol: str
    direction: str
    market_price: float
    current_equity: float
    current_daily_pnl: float
    active_positions_count: int
    scout_output: Optional[Dict[str, Any]]
    researcher_output: Optional[Dict[str, Any]]
    strategist_proposal: Optional[Dict[str, Any]]
    risk_evaluation: Optional[Dict[str, Any]]
    auditor_verification: Optional[Dict[str, Any]]
    status: str
    rejection_reason: Optional[str]
    setup: Optional[Dict[str, Any]]

async def scout_node(state: CommitteeState) -> Dict[str, Any]:
    res = await unified_router.route_task(
        tier=ModelTier.TIER_2_RESEARCH,
        prompt=f"Detect breakout momentum, volume anomalies, and order flow pressure for {state['symbol']} ({state['direction']}) at ${state['market_price']}.",
        system_prompt="You are SCOUT. Scan market conditions. Never predict guaranteed profit."
    )
    return {"scout_output": {"status": "DISCOVERED", "model": res["model_id"], "notes": res["response"]}}

async def researcher_node(state: CommitteeState) -> Dict[str, Any]:
    res = await unified_router.route_task(
        tier=ModelTier.TIER_2_RESEARCH,
        prompt=f"Assess liquidity pools, order book depth, and contract counterparty risks for {state['symbol']}.",
        system_prompt="You are RESEARCHER. Uncover hidden illiquidity, bid-ask spread risks, and contract anomalies."
    )
    return {"researcher_output": {"status": "VERIFIED", "model": res["model_id"], "notes": res["response"]}}

async def strategist_node(state: CommitteeState) -> Dict[str, Any]:
    sym = state["symbol"]
    px = state["market_price"]
    direction = state["direction"].upper()

    decimals = 8 if px < 1.0 else 2
    if direction == "LONG":
        sl = round(px * 0.98, decimals)
        tp = round(px * 1.04, decimals)
    else:
        sl = round(px * 1.02, decimals)
        tp = round(px * 0.96, decimals)

    res = await unified_router.route_task(
        tier=ModelTier.TIER_1_CRITICAL,
        prompt=f"Structure institutional trade setup for {sym} {direction} at ${px}. SL: ${sl}, TP: ${tp}.",
        system_prompt="You are STRATEGIST. Provide rigorous invalidation thresholds, technical confirmation, and R:R profile."
    )
    return {
        "strategist_proposal": {
            "entry_price": px,
            "stop_loss": sl,
            "take_profit": tp,
            "model": res["model_id"],
            "notes": res["response"]
        }
    }

async def risk_manager_node(state: CommitteeState) -> Dict[str, Any]:
    strat = state.get("strategist_proposal") or {}
    passed, reason, sizing = risk_engine.validate_proposal(
        symbol=state["symbol"],
        entry_price=strat.get("entry_price", state["market_price"]),
        stop_loss=strat.get("stop_loss", 0.0),
        take_profit=strat.get("take_profit", 0.0),
        direction=state["direction"],
        current_equity=state["current_equity"],
        current_daily_pnl=state["current_daily_pnl"],
        active_positions_count=state["active_positions_count"]
    )
    if not passed:
        return {
            "status": "REJECTED",
            "rejection_reason": reason,
            "risk_evaluation": {"passed": False, "reason": reason}
        }
    return {
        "risk_evaluation": {"passed": True, "sizing": sizing, "reason": reason},
        "setup": {
            "entry_price": strat["entry_price"],
            "stop_loss": strat["stop_loss"],
            "take_profit": strat["take_profit"],
            "sizing": sizing
        }
    }

def route_after_risk(state: CommitteeState):
    if state.get("status") == "REJECTED":
        return END
    return "auditor"

async def auditor_node(state: CommitteeState) -> Dict[str, Any]:
    res = await unified_router.route_task(
        tier=ModelTier.TIER_1_CRITICAL,
        prompt=f"Mathematically audit trade proposal for {state['symbol']}: Setup={state.get('setup')}. Confirm zero order duplication.",
        system_prompt="You are AUDITOR. Confirm capital preservation parameters and exact math before execution."
    )
    return {
        "status": "APPROVED",
        "auditor_verification": {"status": "CONFIRMED", "model": res["model_id"], "notes": res["response"]}
    }

# Build LangGraph committee state machine
workflow = StateGraph(CommitteeState)
workflow.add_node("scout", scout_node)
workflow.add_node("researcher", researcher_node)
workflow.add_node("strategist", strategist_node)
workflow.add_node("risk_manager", risk_manager_node)
workflow.add_node("auditor", auditor_node)

workflow.set_entry_point("scout")
workflow.add_edge("scout", "researcher")
workflow.add_edge("researcher", "strategist")
workflow.add_edge("strategist", "risk_manager")
workflow.add_conditional_edges("risk_manager", route_after_risk, {
    END: END,
    "auditor": "auditor"
})
workflow.add_edge("auditor", END)

committee_graph = workflow.compile()
