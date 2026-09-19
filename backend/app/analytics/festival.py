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
    def get_upcoming_festivals(today: datetime | None = None) -> List[Dict[str, Any]]:
        """
        Walk the festival calendar and return whatever is genuinely next.

        Previously this returned a hardcoded Navratri card regardless of the
        date. It now computes days-remaining against the real calendar above,
        rolling a past date into next year so the T-14 window keeps working
        as the year turns.
        """
        now = today or datetime.now(timezone.utc)
        upcoming = []

        for f in FestivalEngine.FESTIVALS:
            date = datetime.strptime(f["date"], "%Y-%m-%d").replace(tzinfo=timezone.utc)
            if (date - now).days < 0:
                date = date.replace(year=date.year + 1)
            days = (date - now).days

            lead = f["impact_days_prior"]
            # Inside the prep window the alert is urgent; outside it is a heads-up.
            level = "High" if days <= lead else "Watch"
            categories = ", ".join(f["high_demand_categories"][:2])

            upcoming.append({
                "festival_name": f["name"],
                "date": f"In {days} Days" if days else "Today",
                "days_remaining": days,
                "within_prep_window": days <= lead,
                "impact_level": f"{level} (+35% {categories})",
                "recommended_stock": f["high_demand_categories"],
                "suggested_offer": f["suggested_action"],
                "derivation": f"calendar date {f['date']} minus today, T-{lead} prep window",
            })

        # Nearest first, so the card always shows what to act on now.
        upcoming.sort(key=lambda x: x["days_remaining"])
        return upcoming[:3]

festival_engine = FestivalEngine()
