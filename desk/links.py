CHAIN_ID = {
    "solana": 1399811149,
    "robinhood": 4663,
    "base": 8453,
    "bnb": 56
}

REFERRAL_CODE = "IndianTradee"
SIGNUP_URL = f"https://fomo.family/r/{REFERRAL_CODE}"

def coin_url(address: str, chain: str = "solana") -> str:
    if chain not in CHAIN_ID:
        return SIGNUP_URL
    return f"https://fomo.family/coin?address={address}&chainId={CHAIN_ID[chain]}&r={REFERRAL_CODE}&source=share_link"

def profile_url(handle: str) -> str:
    h = handle.lstrip("@")
    return f"https://fomo.family/profile/{h}?source=share_link&r={REFERRAL_CODE}"
