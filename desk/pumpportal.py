import asyncio
import json
import logging
from typing import Callable, Optional
import websockets

logger = logging.getLogger("pump_portal_scanner")

class PumpPortalScanner:
    """
    Bot 1 (Scanner) connection to PumpPortal streaming data.
    Connects to wss://pumpportal.fun/api/data and subscribes to:
      1. subscribeNewToken
      2. subscribeMigration
    """
    WS_URL = "wss://pumpportal.fun/api/data"

    def __init__(self, on_token_callback: Optional[Callable] = None, on_migration_callback: Optional[Callable] = None):
        self.on_token = on_token_callback
        self.on_migration = on_migration_callback
        self.is_running = False

    async def connect_and_listen(self):
        self.is_running = True
        backoff = 1

        while self.is_running:
            try:
                logger.info("Connecting to PumpPortal WebSocket...")
                async with websockets.connect(self.WS_URL, ping_interval=20, ping_timeout=10) as ws:
                    # Subscribe to new launches and curve migrations (free feeds)
                    await ws.send(json.dumps({"method": "subscribeNewToken"}))
                    await ws.send(json.dumps({"method": "subscribeMigration"}))
                    logger.info("Subscribed to PumpPortal new tokens and migrations.")
                    backoff = 1

                    async for message in ws:
                        try:
                            data = json.loads(message)
                            tx_type = data.get("txType")

                            if tx_type == "create" or "mint" in data:
                                if self.on_token:
                                    await self.on_token(data)
                            elif tx_type == "migration" or data.get("method") == "migration":
                                if self.on_migration:
                                    await self.on_migration(data)
                        except Exception as e:
                            logger.error(f"Error parsing message: {e}")

            except (websockets.ConnectionClosed, Exception) as err:
                logger.warning(f"PumpPortal socket disconnected: {err}. Reconnecting in {backoff}s...")
                await asyncio.sleep(backoff)
                backoff = min(60, backoff * 2)

    def stop(self):
        self.is_running = False
