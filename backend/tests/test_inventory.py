import pytest
from httpx import AsyncClient, ASGITransport
from backend.app.main import app

@pytest.mark.asyncio
async def test_inventory_overview_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        # Get demo token
        auth_res = await client.get("/api/v1/auth/demo-token")
        assert auth_res.status_code == 200
        token = auth_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        res = await client.get("/api/v1/inventory/overview", headers=headers)
        assert res.status_code == 200
        data = res.json()
        assert data["total_skus"] >= 10
        assert data["total_inventory_value"] > 0
        assert data["dead_capital_locked"] > 0
        assert data["dead_stock_sku_count"] > 0
        assert data["low_stock_sku_count"] > 0
        assert data["cluster_group_discount_pct"] >= 3.0

@pytest.mark.asyncio
async def test_inventory_items_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        auth_res = await client.get("/api/v1/auth/demo-token")
        token = auth_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        res = await client.get("/api/v1/inventory/items", headers=headers)
        assert res.status_code == 200
        items = res.json()
        assert len(items) >= 10
        first = items[0]
        assert "sku_name" in first
        assert "barcode" in first
        assert "current_stock" in first
        assert "margin_pct" in first
        assert "velocity_status" in first

@pytest.mark.asyncio
async def test_dead_stock_bundles_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        auth_res = await client.get("/api/v1/auth/demo-token")
        token = auth_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        res = await client.get("/api/v1/inventory/dead-stock", headers=headers)
        assert res.status_code == 200
        bundles = res.json()
        assert len(bundles) > 0
        b = bundles[0]
        assert "bundle_title" in b
        assert b["slow_days_aging"] >= 21
        assert b["bundle_price"] < b["regular_price"]
        assert b["preserved_margin_pct"] > 0

@pytest.mark.asyncio
async def test_reorder_alerts_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        auth_res = await client.get("/api/v1/auth/demo-token")
        token = auth_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        res = await client.get("/api/v1/inventory/reorder-alerts", headers=headers)
        assert res.status_code == 200
        alerts = res.json()
        assert len(alerts) > 0
        a = alerts[0]
        assert a["current_stock"] <= a["min_threshold"]
        assert "depletion_hours_left" in a
        assert "whatsapp_po_text" in a
        assert "Sharmaji" in a["wholesaler_name"]

@pytest.mark.asyncio
async def test_cluster_pool_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        auth_res = await client.get("/api/v1/auth/demo-token")
        token = auth_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        res = await client.get("/api/v1/inventory/cluster-pool", headers=headers)
        assert res.status_code == 200
        pool = res.json()
        assert pool["participating_merchants"] >= 10
        assert ">= 10" in pool["privacy_guarantee"]
        assert len(pool["current_pooled_tenders"]) >= 3

@pytest.mark.asyncio
async def test_simulate_pos_sale_and_dispatch_po():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        auth_res = await client.get("/api/v1/auth/demo-token")
        token = auth_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 1. Fetch items to get a barcode
        items_res = await client.get("/api/v1/inventory/items", headers=headers)
        items = items_res.json()
        test_item = items[0]
        initial_stock = test_item["current_stock"]

        # 2. Simulate POS barcode scan
        pos_payload = {
            "barcode": test_item["barcode"],
            "quantity": 1
        }
        pos_res = await client.post("/api/v1/inventory/simulate-pos-sale", json=pos_payload, headers=headers)
        assert pos_res.status_code == 200
        pos_data = pos_res.json()
        assert pos_data["status"] == "success"
        assert pos_data["remaining_stock"] == max(0, initial_stock - 1)
        assert "Paytm" in pos_data["soundbox_announcement"]

        # 3. Test PO dispatch
        po_payload = {
            "item_id": test_item["id"],
            "crates": 2
        }
        po_res = await client.post("/api/v1/inventory/dispatch-po", json=po_payload, headers=headers)
        assert po_res.status_code == 200
        po_data = po_res.json()
        assert po_data["status"] == "dispatched"
        assert po_data["crates_ordered"] == 2
