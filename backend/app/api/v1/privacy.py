from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.core.database import get_db
from backend.app.models.merchants import Merchant
from backend.app.auth.dependencies import get_current_merchant
from backend.app.privacy.policies import privacy_policy
from backend.app.privacy.query_budget import query_budget_service

router = APIRouter()

@router.get("/policy")
async def get_privacy_policy():
    return {
        "min_market_merchants": privacy_policy.min_market_merchants,
        "min_category_merchants": privacy_policy.min_category_merchants,
        "max_sensitive_queries_per_window": privacy_policy.max_sensitive_queries_per_window,
        "geographic_expansion_enabled": privacy_policy.geographic_expansion_enabled,
        "noise_injection_enabled": privacy_policy.noise_enabled,
        "differential_noise_epsilon": privacy_policy.noise_epsilon,
        "primary_rule": "Network intelligence without merchant exposure."
    }

@router.get("/budget")
async def get_merchant_query_budget(
    merchant: Merchant = Depends(get_current_merchant)
):
    rem = query_budget_service.get_remaining_budget(merchant.id)
    return {
        "merchant_id": merchant.id,
        "remaining_queries": rem,
        "max_limit": privacy_policy.max_sensitive_queries_per_window,
        "window_hours": privacy_policy.query_window_hours
    }
