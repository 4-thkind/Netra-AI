import asyncio
import uuid
import random
from datetime import datetime, timedelta, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from backend.app.models.merchants import Merchant, MerchantPreference
from backend.app.models.transactions import Transaction
from backend.app.models.analytics import MarketCluster, MarketAggregate
from backend.app.models.recommendations import Recommendation
from backend.app.auth.security import hash_password
from backend.app.core.database import AsyncSessionLocal

CITIES = ["Delhi"]
CLUSTERS = [
    {"id": "delhi_lajpat_nagar", "name": "Lajpat Nagar Central Market", "count": 42},
    {"id": "delhi_karol_bagh", "name": "Karol Bagh Arya Samaj Rd", "count": 38},
    {"id": "delhi_chandni_chowk", "name": "Chandni Chowk Katra", "count": 55},
    {"id": "delhi_indirapuram", "name": "Indirapuram Nyay Khand", "count": 29},
    {"id": "delhi_rohini", "name": "Rohini Sector 7 Market", "count": 34},
    {"id": "isolated_rural_cluster", "name": "Isolated Outpost (4 Stores Demo)", "count": 4}
]

CATEGORIES = ["beverages", "snacks", "staples", "dairy", "personal_care"]

async def seed_synthetic_data():
    async with AsyncSessionLocal() as db:
        # Check if already seeded
        res = await db.execute(select(func.count(Merchant.id)))
        count = res.scalar() or 0
        if count > 10:
            print("Database already contains merchants. Skipping duplicate seeding.")
            return

        print("Seeding synthetic data: Sanjeev & 200+ Kirana Merchants...")

        # 1. Seed Sanjeev Kumar (Hero Merchant)
        ramesh = Merchant(
            id="merchant_ramesh",
            external_id_hash="hash_ramesh_paytm_01",
            name="Sanjeev Kumar (Sanjeev Kirana Store)",
            phone="9876543210",
            role="MERCHANT",
            category="kirana",
            city="Delhi",
            cluster_id="delhi_lajpat_nagar",
            hashed_password=hash_password("ramesh123")
        )
        db.add(ramesh)

        ramesh_pref = MerchantPreference(
            merchant_id="merchant_ramesh",
            language="hi",
            preferred_channel="soundbox",
            risk_tolerance="moderate",
            notification_enabled=True
        )
        db.add(ramesh_pref)

        # 2. Seed Admin & Auditor
        admin = Merchant(
            id="admin_sec_officer",
            external_id_hash="hash_admin_paytm_00",
            name="Security Admin (Paytm Sentinel)",
            phone="9999999999",
            role="ADMIN",
            category="internal",
            city="Delhi",
            cluster_id="delhi_lajpat_nagar",
            hashed_password=hash_password("admin123")
        )
        db.add(admin)

        auditor = Merchant(
            id="privacy_auditor_01",
            external_id_hash="hash_auditor_01",
            name="Regulatory Privacy Auditor",
            phone="9888888888",
            role="PRIVACY_AUDITOR",
            category="compliance",
            city="Delhi",
            cluster_id="delhi_lajpat_nagar",
            hashed_password=hash_password("auditor123")
        )
        db.add(auditor)

        # 3. Seed Clusters
        for c in CLUSTERS:
            mc = MarketCluster(
                id=c["id"],
                name=c["name"],
                city="Delhi",
                radius_km=1.0,
                merchant_count=c["count"]
            )
            db.add(mc)

        # 4. Seed Synthetic Merchants across clusters
        common_pwd_hash = hash_password("kirana123")
        store_names = ["Shree Ram Provision", "Gupta General Store", "Aggarwal Traders", "Krishna Daily Mart", "Balaji Stores", "Verma Kirana", "Patel Brothers", "Sharma & Sons"]
        
        seeded_merchant_ids = ["merchant_ramesh"]
        for c in CLUSTERS:
            for i in range(c["count"]):
                m_id = f"m_{c['id']}_{i+1}"
                name = f"{random.choice(store_names)} ({c['name'][:10]} #{i+1})"
                m = Merchant(
                    id=m_id,
                    external_id_hash=f"hash_{m_id}",
                    name=name,
                    phone=f"9810{random.randint(100000, 999999)}",
                    role="MERCHANT",
                    category="kirana",
                    city="Delhi",
                    cluster_id=c["id"],
                    hashed_password=common_pwd_hash
                )
                db.add(m)
                seeded_merchant_ids.append(m_id)

        # 5. Seed Pre-aggregated Market Features (Privacy-Safe Zone)
        aggregates_config = [
            ("delhi_lajpat_nagar", "beverages", 42, 1280, 42.0, 30.0, 65.0, 0.18),
            ("delhi_lajpat_nagar", "snacks", 42, 1840, 36.0, 25.0, 48.0, 0.08),
            ("delhi_lajpat_nagar", "staples", 38, 920, 280.0, 150.0, 450.0, 0.03),
            ("delhi_lajpat_nagar", "dairy", 40, 1650, 55.0, 32.0, 85.0, 0.12),
            ("delhi_lajpat_nagar", "personal_care", 32, 610, 88.0, 45.0, 150.0, -0.02),
            # Isolated small cohort (4 stores) -> Marked for suppression demonstration
            ("isolated_rural_cluster", "beverages", 4, 95, 38.0, 25.0, 50.0, 0.05),
            ("isolated_rural_cluster", "snacks", 4, 110, 32.0, 20.0, 45.0, 0.02)
        ]

        for cid, cat, m_cnt, tx_cnt, med, p25, p75, vel in aggregates_config:
            agg = MarketAggregate(
                id=f"agg_{cid}_{cat}",
                cluster_id=cid,
                category_id=cat,
                time_window="7d",
                merchant_count=m_cnt,
                transaction_count=tx_cnt,
                median_atv=med,
                p25_atv=p25,
                p75_atv=p75,
                volume_velocity=vel,
                confidence=0.92 if m_cnt >= 10 else 0.45,
                privacy_status="APPROVED" if m_cnt >= 10 else "SUPPRESSED"
            )
            db.add(agg)

        # 6. Seed Sanjeev Initial Recommendations
        recs = [
            Recommendation(
                id="rec_trade_radar_beverages",
                merchant_id="merchant_ramesh",
                recommendation_type="trade_radar",
                title="Rising Afternoon Beverage Demand",
                message="Beverage demand is up +18% across the broader South Delhi cluster. Your afternoon sales have not captured this momentum.",
                what="Afternoon cold beverage demand has increased +18% across South Delhi.",
                why="Broader market aggregates show a strong seasonal spike due to warmer afternoons.",
                so_what="Your store is currently under-indexing with fewer cold drinks sold between 2 PM and 6 PM.",
                expected_action="Expand chilled soft drink and energy drink inventory by 2 crates before Friday.",
                reason="Hyperlocal category velocity gap detected.",
                evidence=["South Delhi beverage velocity: +18%", "Your 7-day beverage share: 9% (cluster median: 19%)"],
                confidence=0.88,
                status="pending",
                safety_status="approved",
                expires_at=datetime.now(timezone.utc) + timedelta(days=5)
            ),
            Recommendation(
                id="rec_price_pulse_snacks",
                merchant_id="merchant_ramesh",
                recommendation_type="price_pulse",
                title="Snack Basket Optimization",
                message="Your average snack ticket value is above the category median. Rather than lowering prices, test a high-margin evening combo.",
                what="Your average snack transaction (₹48) is in the 75th percentile of the local market (₹25–₹48 range).",
                why="Individual price changes risk margins without volume guarantees.",
                so_what="Shoppers buying single snacks may hesitate, but will eagerly accept a multi-item bundle.",
                expected_action="Create an evening 'Tea Time Combo' (Biscuits + Namkeen pack) for ₹55 with free packaging.",
                reason="Healthy basket ATV with bundling opportunity.",
                evidence=["Cluster Median ATV: ₹36", "Cluster P75 ATV: ₹48", "Zero competitor price exposure"],
                confidence=0.83,
                status="pending",
                safety_status="approved",
                expires_at=datetime.now(timezone.utc) + timedelta(days=7)
            ),
            Recommendation(
                id="rec_cashflow_settlement",
                merchant_id="merchant_ramesh",
                recommendation_type="cashflow",
                title="Optimize Distributor Settlement Schedule",
                message="Projected cash flow indicates high inflows this weekend. Schedule distributor payouts for Saturday afternoon.",
                what="Upcoming 7-day projected cash flow is ₹78,400 with peak liquidity on Saturday.",
                why="Weekend consumer footfall consistently yields 40% higher UPI collections.",
                so_what="Paying distributors on slow Tuesday mornings causes unnecessary working capital stress.",
                expected_action="Defer major FMCG supplier payment of ₹15,000 from Tuesday to Saturday 3 PM.",
                reason="Working capital smoothing based on your own historical patterns.",
                evidence=["Historic weekend collection multiplier: 1.38x", "Projected Tuesday balance: ₹8,200"],
                confidence=0.91,
                status="pending",
                safety_status="approved",
                expires_at=datetime.now(timezone.utc) + timedelta(days=7)
            )
        ]

        for r in recs:
            db.add(r)

        # 7. Seed 90 days of transactions for Sanjeev
        now = datetime.now(timezone.utc)
        print("Generating 90 days of transactions for Sanjeev...")
        tx_count = 0
        for day_offset in range(90, 0, -1):
            day_time = now - timedelta(days=day_offset)
            num_txs = random.randint(15, 30)
            for _ in range(num_txs):
                cat = random.choice(CATEGORIES)
                amt = random.choice([20.0, 35.0, 50.0, 85.0, 140.0, 220.0, 450.0])
                tx = Transaction(
                    id=f"tx_ramesh_{day_offset}_{uuid.uuid4().hex[:6]}",
                    merchant_id="merchant_ramesh",
                    category_id=cat,
                    amount=amt,
                    timestamp=day_time + timedelta(hours=random.randint(7, 21), minutes=random.randint(0, 59)),
                    location_bucket="delhi_lajpat_nagar"
                )
                db.add(tx)
                tx_count += 1

        await db.commit()
        print(f"Successfully seeded database with {len(seeded_merchant_ids)} merchants and {tx_count} transactions.")

if __name__ == "__main__":
    asyncio.run(seed_synthetic_data())
