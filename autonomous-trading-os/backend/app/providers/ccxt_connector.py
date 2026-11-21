import ccxt.async_support as ccxt
from typing import List, Dict, Any, Optional

class CCXTMarketConnector:
    """
    Unified market data connector utilizing CCXT for standard crypto exchanges,
    alongside native Hyperliquid and DexScreener integrations.
    """
    def __init__(self):
        self.supported_exchanges = ["binance", "bybit", "okx"]

    async def fetch_ticker(self, exchange_id: str, symbol: str) -> Optional[Dict[str, Any]]:
        try:
            if not hasattr(ccxt, exchange_id):
                return None
            exchange_class = getattr(ccxt, exchange_id)
            exchange = exchange_class({"enableRateLimit": True})
            try:
                ticker = await exchange.fetch_ticker(symbol)
                return {
                    "exchange": exchange_id,
                    "symbol": symbol,
                    "last": ticker.get("last"),
                    "bid": ticker.get("bid"),
                    "ask": ticker.get("ask"),
                    "volume": ticker.get("quoteVolume"),
                    "change_24h": ticker.get("percentage")
                }
            finally:
                await exchange.close()
        except Exception:
            return None

ccxt_connector = CCXTMarketConnector()
