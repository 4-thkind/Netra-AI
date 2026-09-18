from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Index
from sqlalchemy.sql import func
from backend.app.core.database import Base

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(String, primary_key=True, index=True)
    merchant_id = Column(String, ForeignKey("merchants.id"), index=True, nullable=False)
    category_id = Column(String, index=True, nullable=False)  # beverages, snacks, staples, dairy, etc.
    amount = Column(Float, nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    location_bucket = Column(String, index=True, nullable=False)

    __table_args__ = (
        Index("ix_tx_merchant_ts", "merchant_id", "timestamp"),
        Index("ix_tx_bucket_cat", "location_bucket", "category_id"),
    )
