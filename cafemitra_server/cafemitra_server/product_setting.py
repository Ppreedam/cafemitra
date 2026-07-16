"""Product-level feature switches and payment gateway configuration."""

import os


PAYMENT_GATEWAYS = {
    "razorpay": {
        "enabled": os.getenv("RAZORPAY_ENABLED", "0") == "1",
        "key_id": os.getenv("RAZORPAY_KEY_ID", ""),
        "key_secret": os.getenv("RAZORPAY_KEY_SECRET", ""),
    },
    "direct_upi": {
        "enabled": os.getenv("DIRECT_UPI_ENABLED", "1") == "1",
    },
}

# The first enabled gateway is used. Change this order to change priority.
PAYMENT_GATEWAY_PRIORITY = ("razorpay", "direct_upi")


def active_payment_gateway():
    for name in PAYMENT_GATEWAY_PRIORITY:
        config = PAYMENT_GATEWAYS.get(name, {})
        if config.get("enabled"):
            if name == "razorpay" and not (config.get("key_id") and config.get("key_secret")):
                continue
            return name, config
    return None, {}
