import time, hmac, hashlib, requests

api_key = 'k347QTgUS8WE4VITjB4Vw9ntHOOe0Q'
api_secret = 'QbuYosXXqk4Sq33pPjmSpZj0jKo99YDTAwWbdN0lVjasBHRVX1tNpMiUYscE'
base_url = 'https://api.india.delta.exchange'

# Fetch perpetual futures products
res = requests.get(base_url + '/v2/products')
if res.status_code == 200:
    products = res.json().get('result', [])
    perps = [p for p in products if p.get('contract_type') == 'perpetual_futures']
    print(f'Total perps found: {len(perps)}')
    for p in perps[:8]:
        print(p.get('symbol'), 'ID:', p.get('id'), 'Tick:', p.get('tick_size'))
