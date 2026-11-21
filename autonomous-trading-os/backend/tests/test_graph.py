import pytest
from app.agents.committee_graph import committee_graph

@pytest.mark.asyncio
async def test_langgraph_committee():
    state = {
        "symbol": "BTC",
        "direction": "LONG",
        "market_price": 94800.0,
        "current_equity": 10.0,
        "current_daily_pnl": 0.0,
        "active_positions_count": 0,
        "scout_output": None,
        "researcher_output": None,
        "strategist_proposal": None,
        "risk_evaluation": None,
        "auditor_verification": None,
        "status": "INIT",
        "rejection_reason": None,
        "setup": None
    }
    result = await committee_graph.ainvoke(state)
    assert result["status"] == "APPROVED"
    assert result["risk_evaluation"]["passed"] is True
    assert result["setup"]["entry_price"] == 94800.0
