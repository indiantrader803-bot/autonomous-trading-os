import time, base64, jwt, httpx
from cryptography.hazmat.primitives.asymmetric import ed25519
from cryptography.hazmat.primitives import serialization

key_name = "organizations/6d27216d-8101-495c-b234-352cf7881f1d/apiKeys/2b10ad83-c3c3-42be-836f-a108ddc13bd5"
key_raw = "nRkDC5CUV7tg9RNXsBPAxl5Upx3A1zMJTEKIAIBLBt21+f1VdjuG5d61dJskiVIAt6xWjXFGbjn7d3OE3rkYRQ=="
seed = base64.b64decode(key_raw)[:32]
pk = ed25519.Ed25519PrivateKey.from_private_bytes(seed)
pem = pk.private_bytes(
    encoding=serialization.Encoding.PEM,
    format=serialization.PrivateFormat.PKCS8,
    encryption_algorithm=serialization.NoEncryption()
)

def token(method, path):
    clean = path.split("?")[0]
    uri = f"{method.upper()} api.coinbase.com{clean}"
    now = int(time.time())
    payload = {"sub": key_name, "iss": "cdp", "nbf": now, "exp": now + 120, "uri": uri}
    return jwt.encode(payload, pem, algorithm="EdDSA", headers={"kid": key_name, "nonce": str(now)})

# Check positions/cfm or accounts
path = "/api/v3/brokerage/orders/historical/fills"
tok = token("GET", path)
headers = {"Authorization": f"Bearer {tok}", "Content-Type": "application/json"}
res = httpx.get(f"https://api.coinbase.com{path}", headers=headers)
print("Fills:", res.status_code, res.text[:300])

path2 = "/api/v3/brokerage/orders/historical/batch"
tok2 = token("GET", path2)
headers2 = {"Authorization": f"Bearer {tok2}", "Content-Type": "application/json"}
res2 = httpx.get(f"https://api.coinbase.com{path2}?order_status=OPEN", headers=headers2)
print("Open Orders:", res2.status_code, res2.text[:300])
