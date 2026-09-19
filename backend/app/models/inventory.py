from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.sql import func
from backend.app.core.database import Base

class InventoryItem(Base):
    __tablename__ = "inventory_items"

    id = Column(String, primary_key=True, index=True)
    merchant_id = Column(String, ForeignKey("merchants.id"), index=True, nullable=False)
    sku_name = Column(String, nullable=False)
    barcode = Column(String, index=True, nullable=False)
    category = Column(String, index=True, nullable=False)  # beverages, snacks, staples, dairy, personal_care
    current_stock = Column(Integer, default=0, nullable=False)
    min_reorder_threshold = Column(Integer, default=10, nullable=False)
    cost_price = Column(Float, nullable=False)
    selling_price = Column(Float, nullable=False)
    days_in_inventory = Column(Integer, default=0)  # Aging counter
    velocity_status = Column(String, default="NORMAL")  # CRITICAL_LOW, FAST_MOVING, NORMAL, SLOW_MOVING
    expiry_days = Column(Integer, default=90)  # Days remaining until expiration
    unit = Column(String, default="pcs")  # pcs, crate, pack, kg
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
