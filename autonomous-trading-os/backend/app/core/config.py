from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    APP_NAME: str = "Autonomous Trading OS"
    APP_SHORT_NAME: str = "ATOS"
    APP_TAGLINE: str = "Intelligence. Discipline. Execution."
    APP_ENV: str = "development"
    APP_SECRET_KEY: str = "atos_super_secret_master_key_998822"
    
    # Trading State
    TRADING_MODE: str = "LIVE" # OBSERVATION, PAPER, APPROVAL, AUTONOMOUS, LIVE
    PAPER_TRADING: bool = False
    LIVE_TRADING_ENABLED: bool = True
    HALT_TRADING: bool = False
    
    # Storage
    DATABASE_URL: str = "postgresql+asyncpg://atos_user:atos_secure_pass@localhost:5434/atos_db"
    REDIS_URL: str = "redis://localhost:6380/0"
    
    # Risk Parameters
    REFERENCE_CAPITAL_USD: float = 10.0
    RISK_PER_TRADE_PERCENT: float = 1.0
    DAILY_LOSS_LIMIT_PERCENT: float = 3.0
    MAX_DRAWDOWN_PERCENT: float = 10.0
    MAX_SIMULTANEOUS_POSITIONS: int = 10
    INITIAL_LEVERAGE: float = 1.0
    MANDATORY_STOP_LOSS: bool = True
    MANDATORY_TAKE_PROFIT: bool = True
    MARTINGALE_ALLOWED: bool = False
    AVERAGING_DOWN_ALLOWED: bool = False
    
    # AI Keys (Optional, fallback-safe)
    OPENAI_API_KEY: Optional[str] = None
    ANTHROPIC_API_KEY: Optional[str] = None
    GEMINI_API_KEY: Optional[str] = None
    XAI_API_KEY: Optional[str] = None
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    
    # Exchange / Data APIs
    PRIMARY_EXCHANGE: str = "COINBASE"
    COINBASE_API_KEY: Optional[str] = "organizations/6d27216d-8101-495c-b234-352cf7881f1d/apiKeys/2b10ad83-c3c3-42be-836f-a108ddc13bd5"
    COINBASE_API_SECRET: Optional[str] = "nRkDC5CUV7tg9RNXsBPAxl5Upx3A1zMJTEKIAIBLBt21+f1VdjuG5d61dJskiVIAt6xWjXFGbjn7d3OE3rkYRQ=="
    HYPERLIQUID_TESTNET: bool = True
    HYPERLIQUID_WALLET_ADDRESS: Optional[str] = None
    HYPERLIQUID_API_SECRET: Optional[str] = None
    SOLANA_RPC_HTTP_URL: str = "https://api.mainnet-beta.solana.com"
    DEXSCREENER_ENABLED: bool = True
    BIRDEYE_API_KEY: Optional[str] = None
    COINGECKO_API_KEY: Optional[str] = None
    
    # Telegram Alerts
    TELEGRAM_BOT_TOKEN: Optional[str] = None
    TELEGRAM_CHAT_ID: Optional[str] = None

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
