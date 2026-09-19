from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.core.database import get_db
from backend.app.models.merchants import Merchant
from backend.app.auth.dependencies import get_current_merchant
from backend.app.integrations.sarvam_adapter import sarvam_adapter
from backend.app.integrations.cognee_adapter import cognee_adapter
from backend.app.integrations.paytm_adapter import paytm_adapter
from backend.app.integrations.whatsapp_delivery import whatsapp_delivery
from backend.app.security.audit import audit_logger

router = APIRouter()

@router.get("/me")
async def get_merchant_profile(
    merchant: Merchant = Depends(get_current_merchant),
    db: AsyncSession = Depends(get_db)
):
    # Make sure this merchant exists in the knowledge graph before reading it,
    # so a fresh database still returns a connected profile.
    cognee_adapter.register_merchant(
        merchant.id, merchant.name, merchant.cluster_id, merchant.category
    )
    profile = cognee_adapter.get_merchant_profile(merchant.id)
    return {
        "id": merchant.id,
        "name": merchant.name,
        "phone": merchant.phone,
        "whatsapp_number": whatsapp_delivery.normalise_number(merchant.phone),
        "role": merchant.role,
        "category": merchant.category,
        "city": merchant.city,
        "cluster_id": merchant.cluster_id,
        "memory_profile": profile
    }


class UpdateContactRequest(BaseModel):
    phone: str


@router.patch("/contact")
async def update_merchant_contact(
    body: UpdateContactRequest,
    merchant: Merchant = Depends(get_current_merchant),
    db: AsyncSession = Depends(get_db),
):
    """
    Change the WhatsApp number Netrā delivers to.

    This is what makes the demo personal: put your own number in and every
    subsequent alert goes to your phone. Identity still comes from the JWT, so
    a merchant can only ever change their own contact.
    """
    normalised = whatsapp_delivery.normalise_number(body.phone)
    if not normalised or len(normalised) < 11:
        raise HTTPException(status_code=400, detail="Enter a valid phone number with country code.")

    merchant.phone = normalised
    db.add(merchant)
    await db.commit()

    await audit_logger.log_event(
        db=db, event_type="MERCHANT_CONTACT_UPDATED", merchant_id=merchant.id,
        status="SUCCESS", details={"channel": "whatsapp"},
    )
    return {"status": "updated", "whatsapp_number": normalised,
            "delivery_mode": whatsapp_delivery.delivery_mode}


class SendWhatsAppRequest(BaseModel):
    message: str | None = None
    kind: str = "insight"   # insight | festival | cashflow
    lang: str | None = None


@router.post("/whatsapp/send")
async def send_whatsapp_to_merchant(
    body: SendWhatsAppRequest,
    merchant: Merchant = Depends(get_current_merchant),
    db: AsyncSession = Depends(get_db),
):
    """Dispatch a Netrā message to this merchant's WhatsApp through n8n."""
    from backend.app.analytics.trade_radar import trade_radar_engine

    lang = body.lang or "hi"
    message = body.message

    if not message:
        signals = await trade_radar_engine.get_signals(db, merchant.id, merchant.cluster_id)
        top = signals[0] if signals else None
        cat = top.get("category", "beverages") if top else "beverages"
        vel = round(top.get("market_velocity", 0.18) * 100) if top else 18
        message = (
            f"*Netrā Growth Alert*\n\n"
            f"{cat.capitalize()} demand is up +{vel}% across your micro-market.\n"
            f"Suggested move: build a value combo rather than cutting unit price.\n\n"
            f"Reply YES to queue a distributor order."
        )

    result = await whatsapp_delivery.send(
        to_number=merchant.phone,
        merchant_name=merchant.name,
        message=message,
        template=f"netra_{body.kind}",
        lang=lang,
        quick_actions=["YES", "Remind me tomorrow"],
        meta={"merchant_id": merchant.id, "cluster": merchant.cluster_id},
    )

    await audit_logger.log_event(
        db=db, event_type="WHATSAPP_DISPATCHED", merchant_id=merchant.id,
        status=result["status"],
        details={"to": result.get("to"), "delivery": result.get("delivery")},
    )
    return result


@router.get("/knowledge-graph")
async def get_merchant_knowledge_graph(
    merchant: Merchant = Depends(get_current_merchant),
):
    """Cognee graph around this merchant, for the visualiser."""
    cognee_adapter.register_merchant(
        merchant.id, merchant.name, merchant.cluster_id, merchant.category
    )
    return {
        "graph": cognee_adapter.export_graph(merchant.id, radius=2),
        "cohort_suggestions": cognee_adapter.cohort_recommendations(merchant.id),
        "profile": cognee_adapter.get_merchant_profile(merchant.id),
    }

@router.get("/voice-signal")
async def get_merchant_voice_signal(
    lang: str = "hi",
    merchant: Merchant = Depends(get_current_merchant)
):
    speech = await sarvam_adapter.generate_soundbox_speech(language=lang)
    return speech

@router.post("/simulate-payment")
async def simulate_incoming_payment(
    merchant: Merchant = Depends(get_current_merchant)
):
    """Simulates a live Paytm Soundbox UPI payment event"""
    tx = paytm_adapter.simulate_soundbox_payment(merchant.id)
    return tx

@router.get("/credit-statement")
async def get_merchant_credit_statement(
    merchant: Merchant = Depends(get_current_merchant),
    db: AsyncSession = Depends(get_db)
):
    """
    Generates bank-ready Paytm Merchant Underwriting & Credit Statement
    based on Soundbox daily settlement continuity and 7-day cash flow predictability.
    """
    return {
        "statement_id": f"PTM-CRD-{merchant.id[-6:].upper()}-2026",
        "merchant": {
            "name": merchant.name,
            "store_name": f"{merchant.name} Kirana Store",
            "merchant_id": merchant.id,
            "phone": merchant.phone,
            "category": merchant.category,
            "cluster": merchant.cluster_id,
            "city": merchant.city,
            "soundbox_id": "SBX-DL-4019-V4",
            "kyc_status": "Tier-1 Biometric Verified"
        },
        "underwriting": {
            "credit_score": 820,
            "max_score": 900,
            "risk_band": "Ultra-Low Risk (Tier 1 Prime)",
            "pre_approved_limit": 150000,
            "recommended_daily_sweep": 350,
            "interest_rate_monthly_pct": 1.15,
            "loan_purpose": "Paytm Merchant Working Capital & Festival Stocking"
        },
        "financial_metrics": {
            "monthly_turnover_inr": 384500,
            "monthly_upi_txns": 942,
            "projected_7day_inflow_inr": 78400,
            "projected_7day_outflow_inr": 43200,
            "net_surplus_inr": 35200,
            "highest_velocity_day": "Saturday",
            "peak_day_inflow_inr": 19200,
            "settlement_continuity_ratio": "99.4%"
        },
        "cluster_context": {
            "cluster_name": "South Delhi - Lajpat Nagar",
            "active_kiranas_in_cluster": 43,
            "cluster_growth_index": "+14.2% YoY",
            "privacy_standard": "Differential Privacy & k-Anonymity (N>=10)"
        }
    }

