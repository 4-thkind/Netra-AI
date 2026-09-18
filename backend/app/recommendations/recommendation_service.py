from typing import List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from backend.app.models.recommendations import Recommendation
from backend.app.recommendations.llm_guard import llm_safety_guard

class RecommendationService:
    @staticmethod
    async def get_merchant_recommendations(
        db: AsyncSession, 
        merchant_id: str
    ) -> List[Dict[str, Any]]:
        stmt = select(Recommendation).where(
            Recommendation.merchant_id == merchant_id,
            Recommendation.status == "pending"
        )
        result = await db.execute(stmt)
        recs = result.scalars().all()

        output = []
        for r in recs:
            # Re-verify through LLM safety guard before dispatch
            safe, reason = llm_safety_guard.validate_content(f"{r.title} {r.message} {r.expected_action}")
            if safe:
                output.append({
                    "id": r.id,
                    "type": r.recommendation_type,
                    "title": r.title,
                    "headline": r.title,
                    "message": r.message,
                    "what": r.what,
                    "why": r.why,
                    "so_what": r.so_what,
                    "expected_action": r.expected_action,
                    "confidence": r.confidence,
                    "status": r.status,
                    "evidence": r.evidence or []
                })
        return output

recommendation_service = RecommendationService()
