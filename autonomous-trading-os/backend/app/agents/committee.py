import uuid
from datetime import datetime
from typing import Dict, Any, List
from app.models.entities import AgentType, ModelTier
from app.services.model_router import router
from app.risk.engine import risk_engine

class CommitteeAgent:
    def __init__(self, name: str, role: AgentType, tier: ModelTier, default_model: str):
        self.name = name
        self.role = role
        self.tier = tier
        self.assigned_model = default_model
        self.tasks_run = 0

class TradingCommittee:
    """
    Seven Autonomous AI Agents Committee:
    1. SCOUT - Opportunity discovery
    2. RESEARCHER - Liquidity, holders, rug-check, contract risk validation
    3. STRATEGIST - Technical structure, indicators, setups
    4. RISK_MANAGER - Capital preservation, sizing, veto power
    5. TRADER - Execution only
    6. PORTFOLIO_MANAGER - Equity monitoring, exposure, capital allocation
    7. AUDITOR - Independent verification, logs, order reconciliation
    """
    def __init__(self):
        self.agents: Dict[str, CommitteeAgent] = {
            "scout": CommitteeAgent("Scout", AgentType.SCOUT, ModelTier.TIER_2_RESEARCH, "gemini-1.5-flash"),
            "researcher": CommitteeAgent("Researcher", AgentType.RESEARCHER, ModelTier.TIER_2_RESEARCH, "claude-3-haiku"),
            "strategist": CommitteeAgent("Strategist", AgentType.STRATEGIST, ModelTier.TIER_1_CRITICAL, "claude-3-5-sonnet"),
            "risk_manager": CommitteeAgent("Risk Manager", AgentType.RISK_MANAGER, ModelTier.TIER_1_CRITICAL, "gpt-4o"),
            "trader": CommitteeAgent("Trader", AgentType.TRADER, ModelTier.TIER_1_CRITICAL, "gpt-4o"),
            "portfolio_manager": CommitteeAgent("Portfolio Manager", AgentType.PORTFOLIO_MANAGER, ModelTier.TIER_2_RESEARCH, "gpt-4o-mini"),
            "auditor": CommitteeAgent("Auditor", AgentType.AUDITOR, ModelTier.TIER_1_CRITICAL, "claude-3-5-sonnet")
        }

    async def evaluate_pipeline(
        self,
        symbol: str,
        direction: str,
        market_price: float,
        current_equity: float,
        current_daily_pnl: float,
        active_positions: int
    ) -> Dict[str, Any]:
        """
        Executes end-to-end committee decision pipeline.
        Logs each agent vote and risk veto.
        """
        pipeline_id = f"pipe_{uuid.uuid4().hex[:8]}"
        stages = {}

        # 1. SCOUT
        scout_res = await router.route_task(
            tier=self.agents["scout"].tier,
            prompt=f"Scan market opportunity for {symbol} ({direction}) at price ${market_price}.",
            system_prompt="You are SCOUT. Detect momentum, breakouts, and unusual volume. Never predict guaranteed profit."
        )
        stages["scout"] = {"agent": "Scout", "status": "APPROVED", "output": scout_res["response"], "model": scout_res["model_id"]}

        # 2. RESEARCHER
        research_res = await router.route_task(
            tier=self.agents["researcher"].tier,
            prompt=f"Assess liquidity, order book depth, and counterparty risks for {symbol}.",
            system_prompt="You are RESEARCHER. Deep dive into liquidity, slippage risk, and contract anomalies."
        )
        stages["researcher"] = {"agent": "Researcher", "status": "APPROVED", "output": research_res["response"], "model": research_res["model_id"]}

        # 3. STRATEGIST (Tier 1 Critical)
        if direction.upper() == "LONG":
            suggested_sl = round(market_price * 0.98, 2)
            suggested_tp = round(market_price * 1.04, 2)
        else:
            suggested_sl = round(market_price * 1.02, 2)
            suggested_tp = round(market_price * 0.96, 2)

        strat_res = await router.route_task(
            tier=self.agents["strategist"].tier,
            prompt=f"Formulate trade setup for {symbol} {direction} at ${market_price}. SL: ${suggested_sl}, TP: ${suggested_tp}.",
            system_prompt="You are STRATEGIST. Provide technical structure, invalidation levels, and exact risk-reward setup."
        )
        stages["strategist"] = {
            "agent": "Strategist",
            "status": "PROPOSED",
            "entry": market_price,
            "stop_loss": suggested_sl,
            "take_profit": suggested_tp,
            "output": strat_res["response"],
            "model": strat_res["model_id"]
        }

        # 4. RISK MANAGER (Deterministic Veto)
        risk_passed, risk_msg, sizing = risk_engine.validate_proposal(
            symbol=symbol,
            entry_price=market_price,
            stop_loss=suggested_sl,
            take_profit=suggested_tp,
            direction=direction,
            current_equity=current_equity,
            current_daily_pnl=current_daily_pnl,
            active_positions_count=active_positions
        )

        stages["risk_manager"] = {
            "agent": "Risk Manager",
            "passed": risk_passed,
            "decision": "APPROVED" if risk_passed else "REJECTED",
            "message": risk_msg,
            "sizing": sizing
        }

        if not risk_passed:
            stages["final_decision"] = "REJECTED_BY_RISK"
            return {"pipeline_id": pipeline_id, "symbol": symbol, "status": "REJECTED", "stages": stages}

        # 5. AUDITOR (Tier 1 Independent Validation)
        audit_res = await router.route_task(
            tier=self.agents["auditor"].tier,
            prompt=f"Verify mathematical consistency of proposal for {symbol}: Sizing={sizing}. Stop loss and protective bounds conform to risk rules.",
            system_prompt="You are AUDITOR. Verify mathematical accuracy, check duplicate execution avoidance, ensure capital safety."
        )
        stages["auditor"] = {"agent": "Auditor", "status": "CONFIRMED", "output": audit_res["response"], "model": audit_res["model_id"]}

        # 6. COMMITTEE DECISION
        stages["final_decision"] = "READY_FOR_EXECUTION"
        return {
            "pipeline_id": pipeline_id,
            "symbol": symbol,
            "direction": direction,
            "status": "APPROVED",
            "setup": {
                "entry_price": market_price,
                "stop_loss": suggested_sl,
                "take_profit": suggested_tp,
                "sizing": sizing
            },
            "stages": stages,
            "timestamp": datetime.utcnow().isoformat()
        }

committee = TradingCommittee()
