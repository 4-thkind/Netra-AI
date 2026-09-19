from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.core.database import get_db
from backend.app.models.merchants import Merchant
from backend.app.auth.dependencies import get_current_merchant
from backend.app.analytics.trade_radar import trade_radar_engine
from backend.app.analytics.price_pulse import price_pulse_engine
from backend.app.analytics.cashflow import cashflow_engine
from backend.app.analytics.festival import festival_engine
from backend.app.analytics.growth_missions import growth_mission_engine

router = APIRouter()

@router.get("/trade-radar")
async def get_trade_radar(
    merchant: Merchant = Depends(get_current_merchant),
    db: AsyncSession = Depends(get_db)
):
    signals = await trade_radar_engine.get_signals(db, merchant.id, merchant.cluster_id)
    return {"cluster_id": merchant.cluster_id, "signals": signals}

@router.get("/price-pulse")
async def get_price_pulse(
    category: str = "snacks",
    merchant: Merchant = Depends(get_current_merchant),
    db: AsyncSession = Depends(get_db)
):
    context = await price_pulse_engine.get_price_context(db, merchant.id, merchant.cluster_id, category)
    return context

@router.get("/cashflow")
async def get_cashflow_forecast(
    merchant: Merchant = Depends(get_current_merchant),
    db: AsyncSession = Depends(get_db),
):
    # Fitted on this merchant's own transaction history. No privacy gate is
    # needed: the model only ever sees the caller's own data.
    return await cashflow_engine.forecast_from_history(db, merchant.id)

@router.get("/festival")
async def get_festivals():
    alerts = festival_engine.get_upcoming_festivals()
    return {"upcoming": alerts}

@router.get("/growth-missions")
async def get_growth_missions(
    merchant: Merchant = Depends(get_current_merchant)
):
    missions = growth_mission_engine.get_active_missions(merchant.id)
    return {"missions": missions}
