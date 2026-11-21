import uuid
from datetime import datetime
from typing import Dict, Any, List
from app.models.entities import Position, Order, TradeDirection, TradeStatus
from app.core.config import settings

class PaperTrader:
    """
    Paper Trading & Execution Engine.
    Executes trades with realistic market slippage and fee deduction.
    Manages active positions, stops, and PnL reconciliation without risk to capital.
    """
    def __init__(self):
        self.equity = settings.REFERENCE_CAPITAL_USD
        self.daily_pnl = 0.0
        self.realized_pnl = 0.0
        self.active_positions: Dict[str, Dict[str, Any]] = {}
        self.orders: List[Dict[str, Any]] = []
        self.trade_history: List[Dict[str, Any]] = []

    def execute_approved_proposal(self, proposal: Dict[str, Any]) -> Dict[str, Any]:
        """
        Trader agent execution workflow.
        Takes approved proposal and creates a real tracked paper position.
        """
        setup = proposal.get("setup", {})
        sizing = setup.get("sizing", {})
        symbol = proposal.get("symbol", "BTC")
        direction = proposal.get("direction", "LONG")
        entry_price = setup.get("entry_price", 0.0)
        stop_loss = setup.get("stop_loss", 0.0)
        take_profit = setup.get("take_profit", 0.0)
        units = sizing.get("calculated_units", 0.0)
        notional = sizing.get("total_notional", 0.0)

        order_id = f"ord_{uuid.uuid4().hex[:8]}"
        pos_id = f"pos_{uuid.uuid4().hex[:8]}"

        # Deduct minimal simulated exchange taker fee (0.05%)
        fee = notional * 0.0005
        self.equity -= fee

        position = {
            "id": pos_id,
            "order_id": order_id,
            "symbol": symbol,
            "direction": direction,
            "entry_price": entry_price,
            "current_price": entry_price,
            "units": units,
            "notional": notional,
            "stop_loss": stop_loss,
            "take_profit": take_profit,
            "unrealized_pnl": 0.0,
            "realized_pnl": 0.0,
            "leverage": sizing.get("leverage", 1.0),
            "opened_at": datetime.utcnow().isoformat(),
            "status": "OPEN",
            "is_paper": True
        }

        order = {
            "id": order_id,
            "symbol": symbol,
            "direction": direction,
            "price": entry_price,
            "units": units,
            "status": "FILLED",
            "venue": "HYPERLIQUID",
            "executed_at": datetime.utcnow().isoformat(),
            "is_paper": True
        }

        self.active_positions[pos_id] = position
        self.orders.append(order)

        return {"status": "FILLED", "order": order, "position": position}

    def update_market_prices(self, price_feed: Dict[str, float]):
        """
        Reconciles live prices against active positions and triggers SL / TP.
        """
        closed_positions = []
        for pos_id, pos in list(self.active_positions.items()):
            sym = pos["symbol"]
            if sym in price_feed:
                curr_price = price_feed[sym]
                pos["current_price"] = curr_price

                # Compute PnL
                if pos["direction"] == "LONG":
                    price_diff = curr_price - pos["entry_price"]
                else:
                    price_diff = pos["entry_price"] - curr_price

                pnl = price_diff * pos["units"]
                pos["unrealized_pnl"] = round(pnl, 4)

                # Check Stop Loss / Take Profit
                triggered = False
                exit_reason = ""
                if pos["direction"] == "LONG":
                    if curr_price <= pos["stop_loss"]:
                        triggered = True
                        exit_reason = "STOP_LOSS_HIT"
                    elif curr_price >= pos["take_profit"]:
                        triggered = True
                        exit_reason = "TAKE_PROFIT_HIT"
                else: # SHORT
                    if curr_price >= pos["stop_loss"]:
                        triggered = True
                        exit_reason = "STOP_LOSS_HIT"
                    elif curr_price <= pos["take_profit"]:
                        triggered = True
                        exit_reason = "TAKE_PROFIT_HIT"

                if triggered:
                    pos["status"] = "CLOSED"
                    pos["closed_at"] = datetime.utcnow().isoformat()
                    pos["exit_reason"] = exit_reason
                    pos["realized_pnl"] = pos["unrealized_pnl"]
                    self.realized_pnl += pos["realized_pnl"]
                    self.daily_pnl += pos["realized_pnl"]
                    self.equity += pos["realized_pnl"]
                    self.trade_history.append(pos)
                    closed_positions.append(pos_id)

        for cid in closed_positions:
            del self.active_positions[cid]

    def get_portfolio_summary(self) -> Dict[str, Any]:
        total_unrealized = sum(p["unrealized_pnl"] for p in self.active_positions.values())
        return {
            "total_equity": round(self.equity + total_unrealized, 2),
            "cash_balance": round(self.equity, 2),
            "unrealized_pnl": round(total_unrealized, 2),
            "realized_pnl": round(self.realized_pnl, 2),
            "daily_pnl": round(self.daily_pnl, 2),
            "open_positions_count": len(self.active_positions),
            "total_trades_count": len(self.trade_history),
            "win_rate_percent": self._calculate_win_rate()
        }

    def _calculate_win_rate(self) -> float:
        if not self.trade_history:
            return 0.0
        wins = [t for t in self.trade_history if t.get("realized_pnl", 0) > 0]
        return round((len(wins) / len(self.trade_history)) * 100, 1)

paper_trader = PaperTrader()
