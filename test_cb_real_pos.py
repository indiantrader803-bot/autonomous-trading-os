import asyncio
import sys
sys.path.insert(0, 'c:/Users/karth/Downloads/autonomous_trading_os_bundle/autonomous-trading-os/backend')

from app.trading.coinbase_executor import coinbase_client

async def run():
    p = await coinbase_client.get_real_positions()
    print("COINBASE REAL POSITIONS COUNT:", len(p))
    for item in p:
        print("  ->", item)

asyncio.run(run())
