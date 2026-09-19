from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.core.database import get_db
from backend.app.models.merchants import Merchant
from backend.app.auth.dependencies import get_current_merchant
from backend.app.recommendations.recommendation_service import recommendation_service
from backend.app.recommendations.feedback_service import feedback_service
from backend.app.schemas.recommendations import RecommendationActionRequest
from backend.app.security.audit import audit_logger

from backend.app.integrations.llm_provider import llm_provider
from backend.app.integrations.cognee_adapter import cognee_adapter
from backend.app.analytics.trade_radar import trade_radar_engine
from backend.app.analytics.price_pulse import price_pulse_engine

router = APIRouter()

# Seeded recommendation ids carry their category, e.g. rec_price_pulse_snacks.
_KNOWN_CATEGORIES = ("beverages", "snacks", "staples", "dairy", "personal_care")


def _category_from_rec_id(rec_id: str) -> str:
    """Best-effort category for the knowledge-graph edge."""
    lowered = (rec_id or "").lower()
    for cat in _KNOWN_CATEGORIES:
        if cat in lowered:
            return cat
    return "general"

@router.get("")
async def list_recommendations(
    merchant: Merchant = Depends(get_current_merchant),
    db: AsyncSession = Depends(get_db)
):
    recs = await recommendation_service.get_merchant_recommendations(db, merchant.id)
    return {"recommendations": recs}

@router.post("/generate-llm")
async def generate_meta_llama_recommendation(
    category: str = "snacks",
    lang: str = "en",
    merchant: Merchant = Depends(get_current_merchant),
    db: AsyncSession = Depends(get_db)
):
    # 1. Pull empirical Trade Radar and Price Pulse context
    signals = await trade_radar_engine.get_signals(db, merchant.id, merchant.cluster_id)
    atv_context = await price_pulse_engine.get_price_context(db, merchant.id, merchant.cluster_id, category)

    # 2. Invoke Meta-Llama 3.3 70B (OpenRouter or NVIDIA NIM, with local fallback) in preferred language
    insight = await llm_provider.generate_growth_insight(
        merchant_name=merchant.name,
        cluster_name=merchant.cluster_id,
        demand_signals=signals,
        atv_context=atv_context,
        lang=lang
    )


    return {
        "status": "success",
        "provider": llm_provider.provider_name,
        "is_live_key": llm_provider.is_configured,
        "recommendation": insight
    }


@router.post("/{rec_id}/action")
async def record_recommendation_action(
    rec_id: str,
    body: RecommendationActionRequest,
    merchant: Merchant = Depends(get_current_merchant),
    db: AsyncSession = Depends(get_db)
):
    success = await feedback_service.record_action(
        db=db,
        recommendation_id=rec_id,
        merchant_id=merchant.id,
        action=body.action,
        notes=body.notes
    )
    if not success:
        raise HTTPException(status_code=404, detail="Recommendation not found.")

    await audit_logger.log_event(
        db=db,
        event_type=f"RECOMMENDATION_{body.action.upper()}",
        merchant_id=merchant.id,
        status="SUCCESS",
        details={"recommendation_id": rec_id, "action": body.action}
    )

    # Close the reinforcement loop from slide 7: the outcome becomes an edge in
    # the Cognee graph, so this merchant's next recommendation - and their
    # cohort peers' - are computed from what actually worked.
    cognee_adapter.register_merchant(
        merchant.id, merchant.name, merchant.cluster_id, merchant.category
    )
    memory = cognee_adapter.record_decision(
        merchant_id=merchant.id,
        action=rec_id.replace("rec_", ""),
        category=_category_from_rec_id(rec_id),
        result=body.action,
        recommendation_id=rec_id,
        notes=body.notes or "",
    )

    return {
        "status": "success",
        "action": body.action,
        "recommendation_id": rec_id,
        "memory": memory,
    }


from pydantic import BaseModel
from backend.app.recommendations.llm_guard import llm_safety_guard
from backend.app.analytics.cashflow import cashflow_engine
from backend.app.analytics.festival import festival_engine

class ChatCopilotRequest(BaseModel):
    query: str
    lang: str = "hi"

@router.post("/chat-copilot")
async def chat_with_copilot(
    body: ChatCopilotRequest,
    merchant: Merchant = Depends(get_current_merchant),
    db: AsyncSession = Depends(get_db)
):
    """
    Live WhatsApp Copilot conversational endpoint.
    Guarantees strict competition safety: competitor probes are intercepted and logged to Sentinel.
    """
    user_query = body.query.strip()
    lang = body.lang or "hi"

    # 1. Evaluate Query Against Competition & Privacy Safety Guard
    is_safe, violation_reason = llm_safety_guard.validate_content(user_query)

    if not is_safe:
        # Audit Log Blocked Adversarial Incident
        await audit_logger.log_event(
            db=db,
            event_type="COMPETITOR_PROBE_BLOCKED",
            merchant_id=merchant.id,
            status="BLOCKED",
            details={
                "channel": "whatsapp_copilot",
                "query": user_query,
                "violation": violation_reason,
                "severity": "HIGH",
                "invariant": "Zero Competitor Exposure (k-Anonymity)"
            }
        )

        localized_block_responses = {
            "hi": "⚠️ *गोपनीयता सुरक्षा सक्रिय (Privacy Intercept)*\n\nNetrā किसी भी व्यक्तिगत प्रतियोगी दुकान (जैसे गुप्ता जनरल स्टोर) की कीमतें या व्यक्तिगत बिक्री डेटा उजागर नहीं करता है।\n\n🔒 *हमारा सिद्धांत:* सामूहिक बाज़ार विश्लेषण (Differential Privacy) सुरक्षित है, लेकिन पड़ोसी दुकानदारों की जासूसी पूर्णतः प्रतिबंधित है।",
            "en": "⚠️ *Privacy Guard Intercept*\n\nNetrā strictly forbids competitor snooping or revealing individual store pricing (e.g., Gupta General Store).\n\n🔒 *Our Invariant:* Network intelligence without merchant exposure. All market insights are protected under Differential Privacy & k-Anonymity (N>=10).",
            "ta": "⚠️ *தனியுரிமை பாதுகாப்பு செயல்படுத்தப்பட்டது*\n\nNetrā போட்டியாளர் கடைகளின் தனிப்பட்ட விலைகளை ஒருபோதும் பகிராது. சந்தை போக்கு மட்டுமே கூட்டாகப் பகிரப்படும்.",
            "te": "⚠️ *గోప్యతా రక్షణ క్రియాశీలంగా ఉంది*\n\nNetrā పోటీదారుల దుకాణాల వ్యక్తిగత ధరలను లేదా డేటాను ఎప్పటికీ బహిర్గతం చేయదు.",
            "kn": "⚠️ *ಗೌಪ್ಯತೆ ರಕ್ಷಣೆ ಸಕ್ರಿಯವಾಗಿದೆ*\n\nNetrā ಯಾವುದೇ ನೆರೆಯ ಅಂಗಡಿಯ ವೈಯಕ್ತಿಕ ದರಗಳನ್ನು ಹಂಚಿಕೊಳ್ಳುವುದಿಲ್ಲ.",
            "mr": "⚠️ *गोपनीयता संरक्षण सक्रिय*\n\nNetrā कोणत्याही शेजारील दुकानदारांची वैयक्तिक किंमत किंवा डेटा कधीही उघड करत नाही.",
            "bn": "⚠️ *গোপনীয়তা সুরক্ষা সক্রিয়*\n\nNetrā কোনো প্রতিবেশী দোকানের ব্যক্তিগত দাম বা তথ্য প্রকাশ করে না।"
        }

        return {
            "status": "blocked",
            "safety_verdict": "BLOCKED",
            "reason": violation_reason,
            "response": localized_block_responses.get(lang, localized_block_responses["en"])
        }

    # 2. Legitimate Business Query: Aggregate Relevant Netrā Empirical Context
    q_lower = user_query.lower()
    
    # Check if asking about cash flow / money / payments
    if any(w in q_lower for w in ["cash", "money", "flow", "paisa", "kharcha", "payment", "bank", "settlement"]):
        cf_data = cashflow_engine.generate_7day_projection(merchant.id)
        total_inflow = cf_data["total_projected_7d"]
        if lang == "hi":
            reply = f"💰 *7-दिवसीय कैश फ्लो विश्लेषण:*\n\n• अनुमानित 7-दिन कुल बिक्री: ₹{total_inflow:,.2f}\n• वितरक देनदारी: ₹32,000.00\n• अनुमानित शुद्ध बचत: ₹{total_inflow - 32000:,.2f}\n\n💡 *सलाह:* {cf_data['recommended_action']}"
        else:
            reply = f"💰 *7-Day Cash Flow Summary:*\n\n• Projected 7-Day Inflow: ₹{total_inflow:,.2f}\n• Supplier Outflow: ₹32,000.00\n• Net Projected Surplus: ₹{total_inflow - 32000:,.2f}\n\n💡 *Advice:* {cf_data['recommended_action']}"

    
    # Check if asking about festival / season / holidays
    elif any(w in q_lower for w in ["festival", "navratri", "holi", "diwali", "tyohar", "fasting", "puja"]):
        fests = festival_engine.get_upcoming_festivals()
        fest = fests[0] if fests else None
        fest_name = fest.get("festival_name", "नवरात्रि") if fest else "नवरात्रि"
        days_left = fest.get("days_remaining", 9) if fest else 9
        if lang == "hi":
            reply = f"🪔 *आगामी पर्व अलर्ट ({fest_name} - T-{days_left} दिन शेष):*\n\nसाउथ दिल्ली क्लस्टर में कुट्टू आटा, शुद्ध घी, साबूदाना और पूजा सामग्री की मांग 35% बढ़ रही है।\n\n📦 *सुझाव:* थोक वितरक से ₹3,500 का अग्रिम फास्टिंग बंडल मंगवाएं। 1-टैप Purchase Order तैयार है।"
        else:
            reply = f"🪔 *Upcoming Festival Demand ({fest_name} - T-{days_left} days):*\n\nDemand for fasting items (Kuttu Atta, Desi Ghee, Sabudana) is surging +35% across your South Delhi cluster.\n\n📦 *Recommendation:* Stock a ₹3,500 wholesale festive bundle early. Use 1-tap PO to lock distributor rates."

    # General / open-ended question -> live LLM, grounded in privacy-safe data.
    else:
        signals = await trade_radar_engine.get_signals(db, merchant.id, merchant.cluster_id)
        top_signal = signals[0] if signals else None
        cat = top_signal.get("category", "beverages") if top_signal else "beverages"
        # trade_radar emits market_velocity as a fraction (0.18); render it as "+18%"
        vel = f"+{round(top_signal.get('market_velocity', 0.18) * 100)}%" if top_signal else "+18%"

        # Only aggregates cross into the prompt. The model never sees a raw
        # transaction or any individual merchant's figures, so it cannot leak
        # what it was never given.
        safe_context = {
            "cluster": merchant.cluster_id,
            "top_category": cat,
            "category_momentum": vel,
            "signals": [
                {
                    "category": s.get("category"),
                    "momentum_pct": round(s.get("market_velocity", 0) * 100),
                    "your_activity": s.get("merchant_activity_level"),
                }
                for s in signals[:4]
            ],
        }

        llm_reply = await llm_provider.answer_merchant_question(
            question=user_query, context=safe_context, lang=lang
        )

        # Outbound screening: a model will suggest cutting prices to the market
        # median if allowed to. If it does, drop the generated text and serve
        # the deterministic bundling answer instead.
        if llm_reply:
            out_safe, out_reason = llm_safety_guard.validate_content(llm_reply)
            if out_safe:
                reply = llm_reply
            else:
                await audit_logger.log_event(
                    db=db,
                    event_type="LLM_OUTPUT_REJECTED",
                    merchant_id=merchant.id,
                    status="BLOCKED",
                    details={"violation": out_reason, "channel": "whatsapp_copilot"},
                )
                llm_reply = None

        if not llm_reply:
            if lang == "hi":
                reply = f"📊 *लाजपत नगर क्लस्टर रुझान:*\n\nआज आपके इलाके में *{cat.capitalize()}* श्रेणी में {vel} की तेज़ मांग देखी जा रही है।\n\n💡 *रणनीति:* छूट देने के बजाय 2 नग का कॉम्बो (जैसे ₹45 Tea-Time बंडल) बनाएं। मार्जिन सुरक्षित रहेगा और बिक्री बढ़ेगी!"
            else:
                reply = f"📊 *Lajpat Nagar Cluster Intelligence:*\n\nHyperlocal demand for *{cat.capitalize()}* has surged by {vel} today across 43 cluster stores.\n\n💡 *Strategy:* Avoid single-unit discounting. Create a ₹45 bundle (Beverage + Snack). This preserves gross margins while boosting basket size."

    # Audit Log Safe Query
    await audit_logger.log_event(
        db=db,
        event_type="COPILOT_QUERY_ANSWERED",
        merchant_id=merchant.id,
        status="ALLOWED",
        details={"query": user_query, "lang": lang, "channel": "whatsapp_copilot"}
    )

    return {
        "status": "allowed",
        "safety_verdict": "SAFE",
        "response": reply,
        # Attribution so the UI can show whether a live model answered or the
        # deterministic fallback did - never imply AI that did not run.
        "engine": llm_provider.last_model_used or "netra_rules_engine",
        "is_live_llm": bool(llm_provider.last_model_used),
    }

