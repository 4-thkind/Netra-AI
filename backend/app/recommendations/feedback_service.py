from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from backend.app.models.recommendations import Recommendation, RecommendationOutcome
import uuid

class FeedbackService:
    @staticmethod
    async def record_action(
        db: AsyncSession,
        recommendation_id: str,
        merchant_id: str,
        action: str,
        notes: str = None
    ) -> bool:
        stmt = select(Recommendation).where(
            Recommendation.id == recommendation_id,
            Recommendation.merchant_id == merchant_id
        )
        result = await db.execute(stmt)
        rec = result.scalar_one_or_none()
        if not rec:
            return False

        rec.status = action
        outcome = RecommendationOutcome(
            id=f"outcome_{uuid.uuid4().hex[:10]}",
            recommendation_id=recommendation_id,
            merchant_id=merchant_id,
            action_taken=action,
            feedback_notes=notes,
            outcome_metrics={"status": "recorded"}
        )
        db.add(outcome)
        await db.commit()
        return True

feedback_service = FeedbackService()
