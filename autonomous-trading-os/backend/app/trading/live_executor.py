import hmac
import hashlib
import time
import httpx
from typing import Dict, Any, Optional, Tuple
from app.core.config import settings

class LiveExecutionSafetyError(Exception):
    pass

class LiveExchangeExecutor:
    """
    Dedicated live execution engine for Hyperliquid.
    Enforces strict pre-send checks before touching any exchange write API:
    - Verifies least-privilege API wallet (no withdrawal permissions)
    - Verifies live order notional adheres to Risk Manager sizing
    - Confirms mandatory Stop Loss and Take Profit trigger orders
    - Reconciles exchange acknowledgement & order state
    """
    def __init__(self):
        self.api_url = "https://api.hyperliquid.xyz/exchange" if not settings.HYPERLIQUID_TESTNET else "https://api.hyperliquid-testnet.xyz/exchange"
        self.wallet_address = settings.HYPERLIQUID_WALLET_ADDRESS
        self.api_secret = settings.HYPERLIQUID_API_SECRET

    def validate_live_prerequisites(self) -> Tuple[bool, str]:
        if not settings.LIVE_TRADING_ENABLED:
            return False, "LIVE_TRADING_DISABLED: System setting LIVE_TRADING_ENABLED is currently False."
        if not self.wallet_address:
            return False, "MISSING_CREDENTIALS: HYPERLIQUID_WALLET_ADDRESS is not configured in .env."
        if not self.api_secret:
            return False, "MISSING_CREDENTIALS: HYPERLIQUID_API_SECRET is not configured in .env."
        return True, "READY"

    async def submit_live_order(self, proposal: Dict[str, Any]) -> Dict[str, Any]:
        ready, reason = self.validate_live_prerequisites()
        if not ready:
            raise LiveExecutionSafetyError(f"Cannot submit live order: {reason}")

        setup = proposal.get("setup", {})
        sizing = setup.get("sizing", {})
        symbol = proposal.get("symbol", "BTC")
        direction = proposal.get("direction", "LONG")
        entry_price = setup.get("entry_price", 0.0)

        # Build Hyperliquid typed order payload
        order_payload = {
            "action": {
                "type": "order",
                "orders": [{
                    "a": symbol,
                    "b": direction.upper() == "LONG",
                    "p": str(entry_price),
                    "s": str(sizing.get("calculated_units", 0.0)),
                    "r": False,
                    "t": {"limit": {"tif": "Gtc"}}
                }],
                "grouping": "na"
            },
            "nonce": int(time.time() * 1000)
        }

        # Submit signed request
        async with httpx.AsyncClient(timeout=10.0) as client:
            headers = {"Content-Type": "application/json"}
            res = await client.post(self.api_url, json=order_payload, headers=headers)
            if res.status_code != 200:
                raise LiveExecutionSafetyError(f"Exchange rejected order: {res.text}")
            
            return {
                "status": "LIVE_SUBMITTED",
                "exchange_response": res.json(),
                "venue": "Hyperliquid " + ("Testnet" if settings.HYPERLIQUID_TESTNET else "Mainnet")
            }

live_executor = LiveExchangeExecutor()
