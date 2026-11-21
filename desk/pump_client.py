import httpx
import logging
from typing import Optional, Dict, Any

logger = logging.getLogger("pump_fun_api")

class PumpFunClient:
    """
    Client for pump.fun Developer API (docs.pump.fun) and PumpPortal (pumpportal.fun).
    Supports token retrieval, bonding curve lookups, and trade routing.
    """
    PUMP_API_BASE = "https://frontend-api-v3.pump.fun"
    PUMP_PORTAL_BASE = "https://pumpportal.fun/api"

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key
        self.headers = {
            "User-Agent": "GrokBot/1.0",
            "Accept": "application/json"
        }
        if api_key:
            self.headers["Authorization"] = f"Bearer {api_key}"

    async def get_token_details(self, mint: str) -> Optional[Dict[str, Any]]:
        """Fetch token bonding curve and metadata from pump.fun"""
        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                res = await client.get(f"{self.PUMP_API_BASE}/coins/{mint}", headers=self.headers)
                if res.status_code == 200:
                    return res.json()
            except Exception as e:
                logger.error(f"Error fetching token {mint}: {e}")
        return None

    async def get_candlesticks(self, mint: str, offset: int = 0, limit: int = 50) -> Optional[list]:
        """Fetch historical candlestick data for a pump.fun coin"""
        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                res = await client.get(
                    f"{self.PUMP_API_BASE}/candlesticks/{mint}?offset={offset}&limit={limit}",
                    headers=self.headers
                )
                if res.status_code == 200:
                    return res.json()
            except Exception as e:
                logger.error(f"Error fetching candles for {mint}: {e}")
        return None

    async def build_trade_transaction(self, mint: str, action: str, amount: float, slippage: int = 10, priority_fee: float = 0.003) -> Optional[Dict[str, Any]]:
        """
        Builds a trade transaction via PumpPortal local transaction endpoint.
        action: 'buy' | 'sell'
        denominatedInSol: True for buys
        """
        payload = {
            "action": action,
            "mint": mint,
            "amount": amount,
            "denominatedInSol": "true" if action == "buy" else "false",
            "slippage": slippage,
            "priorityFee": priority_fee,
            "pool": "pump"
        }
        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                res = await client.post(f"{self.PUMP_PORTAL_BASE}/trade-local", json=payload, headers=self.headers)
                if res.status_code == 200:
                    return res.json()
            except Exception as e:
                logger.error(f"Error building trade for {mint}: {e}")
        return None
