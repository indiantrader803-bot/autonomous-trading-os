import time, base64, requests, jwt
from cryptography.hazmat.primitives.asymmetric import ed25519
from cryptography.hazmat.primitives import serialization

key_name = 'organizations/6d27216d-8101-495c-b234-352cf7881f1d/apiKeys/2b10ad83-c3c3-42be-836f-a108ddc13bd5'
key_raw = 'nRkDC5CUV7tg9RNXsBPAxl5Upx3A1zMJTEKIAIBLBt21+f1VdjuG5d61dJskiVIAt6xWjXFGbjn7d3OE3rkYRQ=='
seed = base64.b64decode(key_raw)[:32]
priv_key = ed25519.Ed25519PrivateKey.from_private_bytes(seed)
pem = priv_key.private_bytes(
    encoding=serialization.Encoding.PEM,
    format=serialization.PrivateFormat.PKCS8,
    encryption_algorithm=serialization.NoEncryption()
)

def build_auth_header(method, path):
    uri = f'{method} api.coinbase.com{path}'
    payload = {
        'sub': key_name,
        'iss': 'cdp',
        'nbf': int(time.time()),
        'exp': int(time.time()) + 120,
        'uri': uri
    }
    token = jwt.encode(payload, pem, algorithm='EdDSA', headers={'kid': key_name, 'nonce': str(int(time.time()))})
    return {'Authorization': f'Bearer {token}'}

res = requests.get('https://api.coinbase.com/api/v3/brokerage/accounts', headers=build_auth_header('GET', '/api/v3/brokerage/accounts'))
print('Status:', res.status_code)
if res.status_code == 200:
    accs = res.json().get('accounts', [])
    print('Total accounts:', len(accs))
    for a in accs:
        val = float(a.get('available_balance', {}).get('value', 0))
        if val > 0 or a.get('currency') in ['USD', 'USDC']:
            print(a.get('name'), a.get('currency'), val)