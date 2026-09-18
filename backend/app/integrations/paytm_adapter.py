from typing import Dict, Any
import random
import uuid

class PaytmStreamAdapter:
    """
    Simulates real-time Paytm QR / Soundbox payment webhooks.
    """
    @staticmethod
    def simulate_soundbox_payment(merchant_id: str) -> Dict[str, Any]:
        categories = ["beverages", "snacks", "staples", "dairy", "personal_care"]
        cat = random.choice(categories)
        amount_map = {
            "beverages": random.choice([20.0, 40.0, 45.0, 70.0]),
            "snacks": random.choice([10.0, 20.0, 35.0, 50.0]),
            "staples": random.choice([120.0, 250.0, 480.0]),
            "dairy": random.choice([32.0, 64.0, 85.0]),
            "personal_care": random.choice([45.0, 95.0, 150.0])
        }
        return {
            "transaction_id": f"paytm_tx_{uuid.uuid4().hex[:10]}",
            "merchant_id": merchant_id,
            "amount": amount_map[cat],
            "category": cat,
            "mode": "UPI_SOUNDBOX",
            "status": "SUCCESS"
        }

paytm_adapter = PaytmStreamAdapter()
