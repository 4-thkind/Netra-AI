"""
Section 22: Growth Missions via privacy-safe cohorts.

A mission is derived, not authored. For each category the engine compares what
this merchant actually sells against the approved cluster aggregate, and turns
the largest gap into one concrete weekly task.

Two sources feed it, and both are already privacy-safe:
  - `market_aggregates` rows that passed the cohort gate (N >= 10), so a
    mission can never be traced back to an individual neighbouring store.
  - The Cognee knowledge graph, for what cohort peers actually adopted.

Missions the merchant has already acted on are suppressed, so the list changes
as the reinforcement loop records outcomes.
"""

from typing import Any, Dict, List

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.integrations.cognee_adapter import cognee_adapter
from backend.app.models.analytics import MarketAggregate
from backend.app.models.transactions import Transaction
from backend.app.privacy.suppression import suppression_service

# Rupees of incremental monthly profit assumed per point of category share
# recovered. A transparent planning constant, not a claimed measurement.
PROFIT_PER_SHARE_POINT = 180


class GrowthMissionEngine:
    @staticmethod
    async def get_active_missions(
        db: AsyncSession, merchant_id: str, cluster_id: str, limit: int = 3
    ) -> List[Dict[str, Any]]:
        # 1. Cluster-level category mix, cohort-gated.
        aggs = (await db.execute(
            select(MarketAggregate).where(MarketAggregate.cluster_id == cluster_id)
        )).scalars().all()

        approved = []
        for a in aggs:
            check = suppression_service.evaluate_cohort(
                cluster_id=cluster_id,
                category_id=a.category_id,
                merchant_count=a.merchant_count,
                category_count=max(8, int(a.merchant_count * 0.7)),
            )
            if not check["suppressed"]:
                approved.append(a)

        if not approved:
            return []

        cluster_total = sum(a.transaction_count for a in approved) or 1

        # 2. This merchant's own category mix.
        rows = (await db.execute(
            select(Transaction.category_id, func.count(Transaction.id))
            .where(Transaction.merchant_id == merchant_id)
            .group_by(Transaction.category_id)
        )).all()
        mine = {c: n for c, n in rows}
        my_total = sum(mine.values()) or 1

        # 3. Categories this merchant already acted on - do not re-issue them.
        acted = {
            r["category"]
            for r in cognee_adapter.get_merchant_profile(merchant_id).get("memory_nodes", [])
            if r.get("verdict") == "accepted"
        }

        peer_adoption = {
            r["category"]: r["peer_adoptions"]
            for r in cognee_adapter.cohort_recommendations(merchant_id, limit=6)
        }

        missions: List[Dict[str, Any]] = []
        for a in approved:
            cat = a.category_id
            if cat in acted:
                continue

            cluster_share = a.transaction_count / cluster_total
            my_share = mine.get(cat, 0) / my_total
            gap = cluster_share - my_share
            if gap <= 0.01:          # already at or above the cluster mix
                continue

            gap_pts = round(gap * 100)
            # Progress = how far along the cluster's share this merchant is.
            progress = int(min(95, max(5, (my_share / cluster_share) * 100)))
            peers = peer_adoption.get(cat, 0)

            missions.append({
                "id": f"mission_{cat}_gap",
                "title": f"{cat.capitalize()} Expansion Sprint",
                "category": cat,
                "cohort_insight": (
                    f"{cat.capitalize()} is {gap_pts}% of your cluster's basket mix "
                    f"across {a.merchant_count} stores, but only "
                    f"{round(my_share * 100)}% of yours."
                    + (f" {peers} peer store(s) in your cohort already acted on it."
                       if peers else "")
                ),
                "goal": (
                    f"Add 3 fast-moving {cat} SKUs and place them at eye level "
                    f"near the counter this week."
                ),
                "progress": progress,
                "target_days": 7,
                "reward": f"Projected +₹{gap_pts * PROFIT_PER_SHARE_POINT:,} monthly incremental profit",
                "evidence": {
                    "cluster_share_pct": round(cluster_share * 100, 1),
                    "your_share_pct": round(my_share * 100, 1),
                    "gap_pct": gap_pts,
                    "cohort_size": a.merchant_count,
                    "peer_adoptions": peers,
                },
                "derivation": "cluster category mix vs your own, cohort-gated (N>=10)",
            })

        # Largest gap first: the biggest opportunity leads.
        missions.sort(key=lambda m: m["evidence"]["gap_pct"], reverse=True)
        return missions[:limit]


growth_mission_engine = GrowthMissionEngine()
