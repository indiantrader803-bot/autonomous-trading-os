import requests, hmac, hashlib, time, json

key = 'k347QTgUS8WE4VITjB4Vw9ntHOOe0Q'
secret = 'QbuYosXXqk4Sq33pPjmSpZj0jKo99YDTAwWbdN0lVjasBHRVX1tNpMiUYscE'
base = 'https://api.india.delta.exchange'

def req(method, path, body=''):
    ts = str(int(time.time()))
    sig = hmac.new(secret.encode(), (method + ts + path + body).encode(), hashlib.sha256).hexdigest()
    headers = {'api-key': key, 'timestamp': ts, 'signature': sig, 'Content-Type': 'application/json'}
    res = requests.get(base + path, headers=headers)
    print(path, res.status_code)
    try:
        print(json.dumps(res.json(), indent=2))
    except Exception:
        print(res.text)

print("--- MARGINED POSITIONS ---")
req('GET', '/v2/positions/margined')
print("--- WALLET BALANCES ---")
req('GET', '/v2/wallet/balances')
print("--- ORDERS (RECENT) ---")
req('GET', '/v2/orders?state=closed')
