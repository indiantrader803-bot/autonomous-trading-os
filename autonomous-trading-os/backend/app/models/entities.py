import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Enum, Text, JSON, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class AgentType(str, enum.Enum):
    SCOUT = "SCOUT"
    RESEARCHER = "RESEARCHER"
    STRATEGIST = "STRATEGIST"
    RISK_MANAGER = "RISK_MANAGER"
    TRADER = "TRADER"
    PORTFOLIO_MANAGER = "PORTFOLIO_MANAGER"
    AUDITOR = "AUDITOR"

class ModelTier(str, enum.Enum):
    TIER_1_CRITICAL = "TIER_1_CRITICAL"
    TIER_2_RESEARCH = "TIER_2_RESEARCH"
    TIER_3_ROUTINE = "TIER_3_ROUTINE"

class TradeDirection(str, enum.Enum):
    LONG = "LONG"
    SHORT = "SHORT"

class TradeStatus(str, enum.Enum):
    PENDING_APPROVAL = "PENDING_APPROVAL"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    SUBMITTED = "SUBMITTED"
    FILLED = "FILLED"
    CLOSED = "CLOSED"
    CANCELLED = "CANCELLED"

class Agent(Base):
    __tablename__ = "agents"
    id = Column(String(50), primary_key=True)
    name = Column(String(100), nullable=False)
    role = Column(Enum(AgentType), nullable=False)
    description = Column(Text, nullable=False)
    assigned_model = Column(String(100), nullable=False, default="claude-3-5-sonnet")
    assigned_tier = Column(Enum(ModelTier), nullable=False, default=ModelTier.TIER_2_RESEARCH)
    is_active = Column(Boolean, default=True)
    last_active = Column(DateTime, default=datetime.utcnow)
    performance_score = Column(Float, default=1.0)
    total_tasks_run = Column(Integer, default=0)

class Opportunity(Base):
    __tablename__ = "opportunities"
    id = Column(String(50), primary_key=True)
    symbol = Column(String(50), nullable=False)
    market_venue = Column(String(50), default="HYPERLIQUID") # HYPERLIQUID, SOLANA_PUMP, DEX
    direction = Column(Enum(TradeDirection), nullable=False)
    confidence_score = Column(Float, nullable=False)
    suggested_entry = Column(Float, nullable=False)
    suggested_sl = Column(Float, nullable=False)
    suggested_tp = Column(Float, nullable=False)
    risk_reward_ratio = Column(Float, nullable=False)
    market_regime = Column(String(100))
    supporting_evidence = Column(JSON)
    agent_votes = Column(JSON)
    status = Column(String(50), default="DISCOVERED") # DISCOVERED, RESEARCHED, PROPOSED, RISK_APPROVED, REJECTED, EXECUTED
    created_at = Column(DateTime, default=datetime.utcnow)

class Position(Base):
    __tablename__ = "positions"
    id = Column(String(50), primary_key=True)
    symbol = Column(String(50), nullable=False)
    venue = Column(String(50), default="HYPERLIQUID")
    direction = Column(Enum(TradeDirection), nullable=False)
    entry_price = Column(Float, nullable=False)
    current_price = Column(Float, nullable=False)
    size = Column(Float, nullable=False)
    leverage = Column(Float, default=1.0)
    unrealized_pnl = Column(Float, default=0.0)
    realized_pnl = Column(Float, default=0.0)
    stop_loss = Column(Float, nullable=False)
    take_profit = Column(Float, nullable=False)
    is_open = Column(Boolean, default=True)
    is_paper = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    closed_at = Column(DateTime, nullable=True)

class Order(Base):
    __tablename__ = "orders"
    id = Column(String(50), primary_key=True)
    client_order_id = Column(String(100), unique=True)
    symbol = Column(String(50), nullable=False)
    venue = Column(String(50), default="HYPERLIQUID")
    direction = Column(Enum(TradeDirection), nullable=False)
    price = Column(Float, nullable=False)
    quantity = Column(Float, nullable=False)
    order_type = Column(String(50), default="LIMIT")
    status = Column(Enum(TradeStatus), default=TradeStatus.SUBMITTED)
    is_paper = Column(Boolean, default=True)
    opportunity_id = Column(String(50), nullable=True)
    executed_at = Column(DateTime, default=datetime.utcnow)

class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    actor = Column(String(100), nullable=False) # Agent name, User, or System
    action = Column(String(100), nullable=False)
    details = Column(JSON)
    status = Column(String(50), default="SUCCESS")
    ai_model_used = Column(String(100), nullable=True)
    tier_used = Column(String(50), nullable=True)

class SystemMetric(Base):
    __tablename__ = "system_metrics"
    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    equity = Column(Float, default=10.0)
    unrealized_pnl = Column(Float, default=0.0)
    daily_drawdown_percent = Column(Float, default=0.0)
    max_drawdown_percent = Column(Float, default=0.0)
    win_rate = Column(Float, default=0.0)
    active_positions_count = Column(Integer, default=0)
