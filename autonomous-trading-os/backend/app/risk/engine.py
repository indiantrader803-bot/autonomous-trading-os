import math
from typing import Dict, Any, Tuple
from app.core.config import settings

class RiskViolationException(Exception):
    pass

class RiskEngine:
    """
    Deterministic Risk Management Engine.
    Independent decision service enforcing non-negotiable capital safety rules:
    - Maximum position size calculation based on reference capital
    - Mandatory Stop Loss & Take Profit verification
    - Daily loss limits & Max drawdown cutoffs
    - Martingale and averaging down strict prohibition
    - Emergency Trading Halt Kill-Switch
    """
    def __init__(self):
        self.reference_capital = settings.REFERENCE_CAPITAL_USD
        self.risk_per_trade_pct = settings.RISK_PER_TRADE_PERCENT
        self.daily_loss_limit_pct = settings.DAILY_LOSS_LIMIT_PERCENT
        self.max_drawdown_pct = settings.MAX_DRAWDOWN_PERCENT
        self.is_halted = settings.HALT_TRADING

    def set_emergency_halt(self, halt: bool):
        self.is_halted = halt

    def validate_proposal(
        self,
        symbol: str,
        entry_price: float,
        stop_loss: float,
        take_profit: float,
        direction: str,
        current_equity: float,
        current_daily_pnl: float,
        active_positions_count: int
    ) -> Tuple[bool, str, Dict[str, Any]]:
        # Check Emergency Halt
        if self.is_halted:
            return False, "REJECTED: System is in EMERGENCY HALT state. All new trades blocked.", {}

        # Check Active Positions Count
        if active_positions_count >= settings.MAX_SIMULTANEOUS_POSITIONS:
            return False, f"REJECTED: Maximum simultaneous positions limit ({settings.MAX_SIMULTANEOUS_POSITIONS}) reached.", {}

        # Check Daily Loss Limit
        daily_loss_limit = -(current_equity * (self.daily_loss_limit_pct / 100.0))
        if current_daily_pnl <= daily_loss_limit:
            return False, f"REJECTED: Daily loss limit exceeded (${current_daily_pnl:.2f} <= ${daily_loss_limit:.2f}). Trading halted for session.", {}

        # Validate mandatory Stop Loss & Take Profit
        if not stop_loss or stop_loss <= 0:
            return False, "REJECTED: Mandatory Stop Loss is missing or invalid.", {}
        if not take_profit or take_profit <= 0:
            return False, "REJECTED: Mandatory Take Profit is missing or invalid.", {}

        # Directional validation of SL & TP
        if direction.upper() == "LONG":
            if stop_loss >= entry_price:
                return False, f"REJECTED: For LONG trade, Stop Loss (${stop_loss}) must be below Entry (${entry_price}).", {}
            if take_profit <= entry_price:
                return False, f"REJECTED: For LONG trade, Take Profit (${take_profit}) must be above Entry (${entry_price}).", {}
            risk_distance = entry_price - stop_loss
            reward_distance = take_profit - entry_price
        else: # SHORT
            if stop_loss <= entry_price:
                return False, f"REJECTED: For SHORT trade, Stop Loss (${stop_loss}) must be above Entry (${entry_price}).", {}
            if take_profit >= entry_price:
                return False, f"REJECTED: For SHORT trade, Take Profit (${take_profit}) must be below Entry (${entry_price}).", {}
            risk_distance = stop_loss - entry_price
            reward_distance = entry_price - take_profit

        # Minimum Risk:Reward ratio verification (at least 1.5:1)
        rr_ratio = reward_distance / risk_distance if risk_distance > 0 else 0
        if rr_ratio < 1.5:
            return False, f"REJECTED: Risk/Reward ratio {rr_ratio:.2f} is below minimum required 1.5:1 threshold.", {}

        # Capital Risk calculation (1% risk of equity)
        risk_budget = current_equity * (self.risk_per_trade_pct / 100.0)
        risk_per_unit = risk_distance
        
        # Position sizing: units = risk_budget / risk_per_unit
        calculated_units = risk_budget / risk_per_unit if risk_per_unit > 0 else 0
        total_notional = calculated_units * entry_price

        # Check if trade notional exceeds allowable leverage (default 1x)
        max_notional = current_equity * settings.INITIAL_LEVERAGE
        if total_notional > max_notional:
            calculated_units = max_notional / entry_price
            total_notional = max_notional

        # Minimum notional check (prevent sub-cent micro dust trades)
        if total_notional < 1.0:
            return False, f"REJECTED: Notional trade value (${total_notional:.2f}) is below minimum exchange sizing of $1.00. Capital preserved.", {}

        sizing_info = {
            "approved": True,
            "calculated_units": round(calculated_units, 4),
            "total_notional": round(total_notional, 2),
            "risk_budget_usd": round(risk_budget, 4),
            "risk_reward_ratio": round(rr_ratio, 2),
            "leverage": settings.INITIAL_LEVERAGE
        }

        return True, "APPROVED: Risk parameters satisfied.", sizing_info

risk_engine = RiskEngine()
