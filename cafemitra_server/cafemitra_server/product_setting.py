"""Product-level feature switches and payment gateway configuration."""

import os


PAYMENT_GATEWAYS = {
    "phonepe": {
        "enabled": os.getenv("PHONEPE_ENABLED", "0") == "1",
        "mode": os.getenv("PHONEPE_MODE", "test"),  # "test" (sandbox) or "live"
        "client_id": os.getenv("PHONEPE_CLIENT_ID", ""),
        "client_secret": os.getenv("PHONEPE_CLIENT_SECRET", ""),
        "client_version": os.getenv("PHONEPE_CLIENT_VERSION", "1"),
        # Set to whatever you enter in PhonePe dashboard > Create Webhook -
        # PhonePe hashes these into the Authorization header it sends us.
        "webhook_username": os.getenv("PHONEPE_WEBHOOK_USERNAME", ""),
        "webhook_password": os.getenv("PHONEPE_WEBHOOK_PASSWORD", ""),
    },
    "payu": {
        "enabled": os.getenv("PAYU_ENABLED", "0") == "1",
        "mode": os.getenv("PAYU_MODE", "test"),  # "test" or "live"
        "merchant_key": os.getenv("PAYU_MERCHANT_KEY", ""),
        "salt": os.getenv("PAYU_SALT", ""),
        # Not used for the hosted-checkout hash flow below; kept for future
        # S2S REST calls (e.g. verify/refund) that authenticate via OAuth.
        "client_id": os.getenv("PAYU_CLIENT_ID", ""),
        "client_secret": os.getenv("PAYU_CLIENT_SECRET", ""),
    },
    "razorpay": {
        "enabled": os.getenv("RAZORPAY_ENABLED", "0") == "1",
        "key_id": os.getenv("RAZORPAY_KEY_ID", ""),
        "key_secret": os.getenv("RAZORPAY_KEY_SECRET", ""),
    },
    "direct_upi": {
        "enabled": os.getenv("DIRECT_UPI_ENABLED", "1") == "1",
    },
}

# The first enabled (and fully configured) gateway is used. Change this order to change priority.
PAYMENT_GATEWAY_PRIORITY = ("phonepe", "payu", "razorpay", "direct_upi")


def active_payment_gateway():
    for name in PAYMENT_GATEWAY_PRIORITY:
        config = PAYMENT_GATEWAYS.get(name, {})
        if not config.get("enabled"):
            continue
        if name == "phonepe" and not (config.get("client_id") and config.get("client_secret")):
            continue
        if name == "payu" and not (config.get("merchant_key") and config.get("salt")):
            continue
        if name == "razorpay" and not (config.get("key_id") and config.get("key_secret")):
            continue
        return name, config
    return None, {}
