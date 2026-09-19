"""
WhatsApp delivery through n8n.

Netrā never talks to the WhatsApp Business API directly. It POSTs a message
envelope to an n8n webhook, and n8n owns the last mile — that is the whole
point of the orchestration layer in the architecture slide: swapping WhatsApp
Cloud API for Twilio, Gupshup or plain SMS is an n8n change, not a code change.

Delivery modes, chosen automatically:

  live      N8N_WEBHOOK_URL is set and reachable -> n8n dispatches the message.
  simulated no webhook configured -> the envelope is still built, logged and
            returned, so the demo works offline and the payload is inspectable.

The destination number comes from the merchant record, so changing a merchant's
phone (or registering your own) changes who gets the message.
"""

from __future__ import annotations

import re
from datetime import datetime, timezone
from typing import Any, Dict, Optional

import httpx

from backend.app.core.config import settings


class WhatsAppDeliveryService:
    """Builds and dispatches merchant WhatsApp messages via n8n."""

    #: Last envelope built, so the UI can show exactly what was sent.
    last_envelope: Optional[Dict[str, Any]] = None

    @staticmethod
    def normalise_number(raw: str, default_cc: str = "91") -> str:
        """
        Return an E.164-ish number WhatsApp will accept.

        Merchants enter numbers every possible way — "98765 43210",
        "+91-98765-43210", "098765 43210". Normalise rather than reject.
        """
        digits = re.sub(r"\D", "", raw or "")
        if not digits:
            return ""
        # Drop a domestic trunk prefix before adding a country code.
        if len(digits) == 11 and digits.startswith("0"):
            digits = digits[1:]
        if len(digits) == 10:
            digits = default_cc + digits
        return "+" + digits

    @property
    def webhook_url(self) -> Optional[str]:
        url = (settings.N8N_WEBHOOK_URL or "").strip()
        # The default points at a local n8n that is usually not running; treat
        # an unset/placeholder value as "simulate" rather than failing loudly.
        if not url or url.endswith("/webhook/netra"):
            return None
        return url

    @property
    def is_live(self) -> bool:
        return self.webhook_url is not None

    async def send(
        self,
        *,
        to_number: str,
        merchant_name: str,
        message: str,
        template: str = "netra_insight",
        lang: str = "hi",
        quick_actions: Optional[list[str]] = None,
        meta: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """Dispatch one message. Never raises - delivery failure is reported."""
        number = self.normalise_number(to_number)
        envelope: Dict[str, Any] = {
            "channel": "whatsapp",
            "to": number,
            "merchant_name": merchant_name,
            "template": template,
            "lang": lang,
            "body": message,
            "quick_actions": quick_actions or [],
            "sent_at": datetime.now(timezone.utc).isoformat(),
            "source": "netra",
            "meta": meta or {},
        }
        self.last_envelope = envelope

        if not number:
            return {**envelope, "status": "FAILED",
                    "delivery": "invalid_number",
                    "detail": "No usable phone number on the merchant record."}

        if not self.is_live:
            # Simulated: the envelope is real, only the last mile is absent.
            return {**envelope, "status": "SIMULATED", "delivery": "n8n_not_configured",
                    "detail": "Set N8N_WEBHOOK_URL to dispatch through a live n8n instance."}

        try:
            async with httpx.AsyncClient(timeout=httpx.Timeout(connect=4.0, read=10.0,
                                                               write=8.0, pool=4.0)) as client:
                res = await client.post(self.webhook_url, json=envelope)
            if 200 <= res.status_code < 300:
                return {**envelope, "status": "SENT", "delivery": "n8n_webhook",
                        "n8n_status": res.status_code,
                        "n8n_response": res.text[:400]}
            return {**envelope, "status": "FAILED", "delivery": "n8n_webhook",
                    "n8n_status": res.status_code, "detail": res.text[:400]}
        except Exception as e:
            return {**envelope, "status": "FAILED", "delivery": "n8n_webhook",
                    "detail": f"{type(e).__name__}: {e}"}


whatsapp_delivery = WhatsAppDeliveryService()


def _demo() -> None:
    """Self-check for the normalisation rules merchants actually trigger."""
    n = WhatsAppDeliveryService.normalise_number
    assert n("9876543210") == "+919876543210"
    assert n("09876543210") == "+919876543210"          # trunk prefix dropped
    assert n("+91 98765-43210") == "+919876543210"      # already has cc
    assert n("+1 415 555 0132") == "+14155550132"       # non-Indian preserved
    assert n("") == ""
    assert n("abc") == ""
    print("OK  number normalisation")


if __name__ == "__main__":
    _demo()
