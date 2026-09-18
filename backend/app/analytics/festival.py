from datetime import datetime, timezone
from typing import Dict, Any, List

class FestivalEngine:
    """
    Section 21: Regional Indian Festival Calendar & Inventory Ramp-up.
    """
    FESTIVALS = [
        {
            "name": "Holi Festival of Colors",
            "date": "2026-03-04",
            "impact_days_prior": 14,
            "high_demand_categories": ["Dry Fruits", "Sweets & Gulal", "Cold Drinks", "Snacks"],
            "suggested_action": "Stock up on packaged thandai, namkeen gift boxes, and beverages 10 days in advance."
        },
        {
            "name": "Navratri & Ram Navami",
            "date": "2026-03-20",
            "impact_days_prior": 10,
            "high_demand_categories": ["Fasting Staples (Kuttu Atta, Sabudana)", "Rock Salt", "Dairy (Ghee, Curd)"],
            "suggested_action": "Set up a prominent front-of-store 'Vrat Specials' display."
        },
        {
            "name": "Eid-ul-Fitr",
            "date": "2026-03-21",
            "impact_days_prior": 12,
            "high_demand_categories": ["Sevaiyan/Vermicelli", "Dates", "Spices", "Dry Fruits"],
            "suggested_action": "Ensure bulk inventory of premium vermicelli and dairy cream."
        },
        {
            "name": "Diwali & Dhanteras Festive Surge",
            "date": "2026-11-08",
            "impact_days_prior": 21,
            "high_demand_categories": ["Confectionery", "Dry Fruit Hampers", "Cooking Oil", "Diyas"],
            "suggested_action": "Secure distributor bulk discounts for chocolate gift hampers 3 weeks prior."
        }
    ]

    @staticmethod
    def get_upcoming_festivals() -> List[Dict[str, Any]]:
        # In demo mode, present the next upcoming festive event
        return [
            {
                "festival_name": "Navratri Fasting Season",
                "date": "In 9 Days",
                "days_remaining": 9,
                "impact_level": "High (+35% Dairy & Vrat Staples)",
                "recommended_stock": ["Sabudana", "Kuttu/Singhara Atta", "Amul Pure Ghee", "Sendha Namak"],
                "suggested_offer": "Pre-packaged 'Complete Vrat Essentials Kit' priced at ₹299."
            }
        ]

festival_engine = FestivalEngine()
