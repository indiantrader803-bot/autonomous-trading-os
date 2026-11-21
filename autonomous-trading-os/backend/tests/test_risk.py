import pytest
from app.risk.engine import risk_engine
from app.core.config import settings

def test_risk_rejection_when_halted():
    risk_engine.set_emergency_halt(True)
    passed, msg, _ = risk_engine.validate_proposal(
        symbol="BTC", entry_price=90000.0, stop_loss=88000.0, take_profit=95000.0,
        direction="LONG", current_equity=10.0, current_daily_pnl=0.0, active_positions_count=0
    )
    assert passed is False
    assert "EMERGENCY HALT" in msg
    risk_engine.set_emergency_halt(False)

def test_risk_rejection_on_invalid_stop_loss():
    # Long trade with stop loss above entry price
    passed, msg, _ = risk_engine.validate_proposal(
        symbol="ETH", entry_price=3000.0, stop_loss=3100.0, take_profit=3400.0,
        direction="LONG", current_equity=10.0, current_daily_pnl=0.0, active_positions_count=0
    )
    assert passed is False
    assert "Stop Loss" in msg

def test_risk_rejection_on_insufficient_risk_reward():
    # R:R is 1:1 ($100 reward vs $100 risk) - fails minimum 1.5:1 requirement
    passed, msg, _ = risk_engine.validate_proposal(
        symbol="SOL", entry_price=200.0, stop_loss=190.0, take_profit=210.0,
        direction="LONG", current_equity=10.0, current_daily_pnl=0.0, active_positions_count=0
    )
    assert passed is False
    assert "Risk/Reward ratio" in msg

def test_risk_approval_and_position_sizing():
    # Long trade with 1:2 R:R ($20 risk, $40 reward)
    passed, msg, sizing = risk_engine.validate_proposal(
        symbol="SOL", entry_price=200.0, stop_loss=180.0, take_profit=240.0,
        direction="LONG", current_equity=10.0, current_daily_pnl=0.0, active_positions_count=0
    )
    assert passed is True
    assert "APPROVED" in msg
    assert sizing["approved"] is True
    assert sizing["total_notional"] <= 10.0 # Bounded by 1x leverage of $10 reference equity
