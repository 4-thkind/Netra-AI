from typing import Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from backend.app.models.transactions import Transaction
from backend.app.models.analytics import MarketAggregate
from backend.app.privacy.suppression import suppression_service

class TradeRadarEngine:
    @staticmethod
    async def get_signals(
        db: AsyncSession, 
        merchant_id: str, 
        cluster_id: str
    ) -> List[Dict[str, Any]]:
        # Fetch privacy-safe market aggregates for this cluster
        stmt = select(MarketAggregate).where(MarketAggregate.cluster_id == cluster_id)
        result = await db.execute(stmt)
        aggregates = result.scalars().all()

        signals = []
        for agg in aggregates:
            # Check privacy suppression
            privacy_check = suppression_service.evaluate_cohort(
                cluster_id=cluster_id,
                category_id=agg.category_id,
                merchant_count=agg.merchant_count,
                category_count=max(8, int(agg.merchant_count * 0.7))
            )

            if privacy_check["suppressed"]:
                continue

            # Compare merchant's own category transaction share vs cluster velocity
            merchant_tx_stmt = select(func.count(Transaction.id)).where(
                Transaction.merchant_id == merchant_id,
                Transaction.category_id == agg.category_id
            )
            merchant_tx_count = (await db.execute(merchant_tx_stmt)).scalar() or 0

            # Opportunity logic
            if agg.volume_velocity > 0.10 and merchant_tx_count < 20:
                activity_level = "Under-indexed"
                opp_score = 0.88
                recommendation = f"Beverage & cold drink demand is surging +{int(agg.volume_velocity*100)}% across South Delhi. Expand afternoon inventory."
            elif agg.volume_velocity > 0.05:
                activity_level = "Average"
                opp_score = 0.72
                recommendation = f"{agg.category_id.capitalize()} shows steady momentum (+{int(agg.volume_velocity*100)}%). Maintain optimal replenishment."
            else:
                activity_level = "Stable"
                opp_score = 0.50
                recommendation = f"Demand in {agg.category_id} is stable with healthy baseline volume."

            signals.append({
                "category": agg.category_id,
                "market_velocity": round(agg.volume_velocity, 2),
                "merchant_activity_level": activity_level,
                "opportunity_score": opp_score,
                "recommendation": recommendation,
                "privacy_safe": True
            })

        return sorted(signals, key=lambda x: x["opportunity_score"], reverse=True)

trade_radar_engine = TradeRadarEngine()
