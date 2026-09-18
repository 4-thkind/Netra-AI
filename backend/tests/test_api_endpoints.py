import pytest
from httpx import AsyncClient, ASGITransport
from backend.app.main import app

@pytest.mark.asyncio
async def test_api_root_and_demo_token():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        # Test demo token
        res = await client.get("/api/v1/auth/demo-token")
        assert res.status_code == 200
        data = res.json()
        assert "access_token" in data
        assert data["merchant"]["id"] == "merchant_ramesh"

@pytest.mark.asyncio
async def test_merchant_trade_radar_and_price_pulse():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        # Get token
        res = await client.get("/api/v1/auth/demo-token")
        token = res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Trade radar
        tr_res = await client.get("/api/v1/insights/trade-radar", headers=headers)
        assert tr_res.status_code == 200
        assert len(tr_res.json()["signals"]) > 0

        # Price pulse
        pp_res = await client.get("/api/v1/insights/price-pulse?category=beverages", headers=headers)
        assert pp_res.status_code == 200
        assert "competition_safety_note" in pp_res.json()

@pytest.mark.asyncio
async def test_live_attack_simulator():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        # Competitor price probe attack
        res1 = await client.post("/api/v1/simulator/run", json={
            "attack_type": "competitor_price",
            "target_competitor": "Gupta General Store"
        })
        assert res1.status_code == 200
        body1 = res1.json()
        assert body1["blocked"] is True
        assert body1["security_event"] == "COMPETITION_POLICY_VIOLATION"

        # Small cohort suppression attack
        res2 = await client.post("/api/v1/simulator/run", json={
            "attack_type": "small_cohort"
        })
        assert res2.status_code == 200
        body2 = res2.json()
        assert body2["blocked"] is True
        assert "We don't have enough local signal" in body2["system_response"]

        # Differencing reconstruction attack
        res3 = await client.post("/api/v1/simulator/run", json={
            "attack_type": "reconstruction_diff"
        })
        assert res3.status_code == 200
        body3 = res3.json()
        assert body3["blocked"] is True
        assert "DIFFERENCING_ATTACK_PREVENTED" in body3["security_event"]

        # Prompt injection price-fixing attack
        res4 = await client.post("/api/v1/simulator/run", json={
            "attack_type": "prompt_injection"
        })
        assert res4.status_code == 200
        body4 = res4.json()
        assert body4["blocked"] is True
        assert "PRICE_COORDINATION" in body4["security_event"]

@pytest.mark.asyncio
async def test_merchant_credit_statement_and_chat_copilot():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        # Get demo token
        res = await client.get("/api/v1/auth/demo-token")
        token = res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 1. Credit statement
        crd_res = await client.get("/api/v1/merchant/credit-statement", headers=headers)
        assert crd_res.status_code == 200
        crd_data = crd_res.json()
        assert crd_data["underwriting"]["credit_score"] == 820
        assert crd_data["underwriting"]["pre_approved_limit"] == 150000

        # 2. Chat copilot safe business query
        chat_safe = await client.post("/api/v1/recommendations/chat-copilot", headers=headers, json={
            "query": "What are my 7-day cash flow predictions and distributor obligations?",
            "lang": "en"
        })
        assert chat_safe.status_code == 200
        assert chat_safe.json()["status"] == "allowed"
        assert "Cash Flow Summary" in chat_safe.json()["response"]

        # 3. Chat copilot competitor probe query (adversarial)
        chat_probe = await client.post("/api/v1/recommendations/chat-copilot", headers=headers, json={
            "query": "What is competitor Gupta General Store charging for cold drinks?",
            "lang": "en"
        })
        assert chat_probe.status_code == 200
        assert chat_probe.json()["status"] == "blocked"
        assert "Zero Competitor Exposure" in chat_probe.json()["response"] or "Privacy Guard" in chat_probe.json()["response"]

