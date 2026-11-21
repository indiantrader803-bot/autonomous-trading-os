import urllib.request
import json
import time
import os
import sys

def main():
    print("[DAEMON 24/7] Autonomous Trading Desk Background Daemon Active...", flush=True)
    while True:
        try:
            payload = json.dumps({
                "symbol": "JELLY",
                "direction": "LONG",
                "market_price": 0.000028,
                "timeframe": "1m"
            }).encode()

            req = urllib.request.Request(
                "http://localhost:8000/api/v1/committee/evaluate",
                data=payload,
                headers={"Content-Type": "application/json"}
            )
            with urllib.request.urlopen(req) as response:
                res = json.loads(response.read().decode())
                status = res.get("status")
                print(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] Committee Evaluation: {status}", flush=True)
        except Exception as e:
            print(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] Daemon cycle tick: {e}", flush=True)
        
        time.sleep(30)

if __name__ == "__main__":
    main()
