import pytest
from httpx import AsyncClient, ASGITransport
from backend.app.main import app

@pytest.mark.asyncio
async def test_n8n_workflows_info_and_triggers():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        # 1. Info endpoint
        info_res = await client.get("/api/v1/n8n/info")
        assert info_res.status_code == 200
        info_data = info_res.json()
        assert info_data["n8n_cloud_voucher"] == "2026-COMMUNITY-HACKATHON-INDIA-18D35A55"
        # Assert on the workflows that must exist rather than a bare count, so
        # registering a new one does not fail an unrelated test.
        ids = {w["id"] for w in info_data["workflows"]}
        assert {"wf_daily_eod", "wf_festival_t14", "wf_privacy_sentinel",
                "wf_whatsapp_delivery"} <= ids
        assert all(w["nodes"] for w in info_data["workflows"])

        # 2. Trigger EOD workflow
        eod_res = await client.post("/api/v1/n8n/trigger/eod")
        assert eod_res.status_code == 200
        eod_data = eod_res.json()
        assert eod_data["status"] == "SUCCESS"
        assert len(eod_data["steps_executed"]) == 5

        # 3. Trigger Festival T-14 workflow
        fest_res = await client.post("/api/v1/n8n/trigger/festival")
        assert fest_res.status_code == 200
        fest_data = fest_res.json()
        assert fest_data["status"] == "SUCCESS"

        # 4. Trigger Privacy Sentinel workflow (cohort = 4 -> suppressed)
        priv_res = await client.post("/api/v1/n8n/trigger/privacy-sentinel?cohort_size=4")
        assert priv_res.status_code == 200
        assert priv_res.json()["status"] == "SUPPRESSED"
