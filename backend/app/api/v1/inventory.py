from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.core.database import get_db
from backend.app.models.merchants import Merchant
from backend.app.auth.dependencies import get_current_merchant
from backend.app.analytics.inventory_engine import inventory_engine

router = APIRouter()


class PosSaleRequest(BaseModel):
    barcode: str
    quantity: int = 1


class DispatchPoRequest(BaseModel):
    item_id: str
    crates: Optional[int] = None


@router.get("/overview")
async def get_inventory_overview(
    merchant: Merchant = Depends(get_current_merchant),
    db: AsyncSession = Depends(get_db)
):
    """Returns high-level inventory overview: dead capital, stockouts, valuation, and cluster pool."""
    return await inventory_engine.get_overview(db, merchant.id)


@router.get("/items")
async def get_inventory_items(
    merchant: Merchant = Depends(get_current_merchant),
    db: AsyncSession = Depends(get_db)
):
    """Returns all SKU records with stock levels, margins, aging days, and velocity status."""
    return await inventory_engine.get_items(db, merchant.id)


@router.get("/dead-stock")
async def get_dead_stock_bundles(
    merchant: Merchant = Depends(get_current_merchant),
    db: AsyncSession = Depends(get_db)
):
    """Returns AI-generated combo bundles liquidating stagnant goods (>21 days) before expiry."""
    return await inventory_engine.get_dead_stock_bundles(db, merchant.id)


@router.get("/reorder-alerts")
async def get_reorder_alerts(
    merchant: Merchant = Depends(get_current_merchant),
    db: AsyncSession = Depends(get_db)
):
    """Returns T-minus depletion forecaster alerts with pre-filled WhatsApp distributor POs."""
    return await inventory_engine.get_reorder_alerts(db, merchant.id)


@router.get("/cluster-pool")
async def get_cluster_group_pool(
    merchant: Merchant = Depends(get_current_merchant),
    db: AsyncSession = Depends(get_db)
):
    """Returns differential privacy cluster wholesale purchasing pool (N >= 10)."""
    cluster_id = merchant.cluster_id or "delhi_lajpat_nagar"
    return await inventory_engine.get_cluster_group_pool(db, cluster_id)


@router.post("/simulate-pos-sale")
async def simulate_pos_sale(
    req: PosSaleRequest,
    merchant: Merchant = Depends(get_current_merchant),
    db: AsyncSession = Depends(get_db)
):
    """Simulates a live Paytm Smart POS barcode scan at checkout counter."""
    try:
        return await inventory_engine.simulate_pos_sale(
            db=db,
            merchant_id=merchant.id,
            barcode=req.barcode,
            quantity=req.quantity
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/dispatch-po")
async def dispatch_reorder_po(
    req: DispatchPoRequest,
    merchant: Merchant = Depends(get_current_merchant),
    db: AsyncSession = Depends(get_db)
):
    """Dispatches a 1-tap wholesale Purchase Order to distributor via WhatsApp."""
    try:
        return await inventory_engine.dispatch_reorder_po(
            db=db,
            merchant_id=merchant.id,
            item_id=req.item_id,
            custom_crates=req.crates
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
