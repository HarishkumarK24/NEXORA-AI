import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health():
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "HEALTHY"

def test_requirements_auth_roles():
    # Test valid administrator login with username
    res = client.post("/api/v1/auth/login", json={"username": "admin", "password": "Nexora@Admin2026"})
    assert res.status_code == 200, f"Login failed for admin: {res.text}"
    data = res.json()
    assert data["user"]["role"] == "Administrator"
    assert "access_token" in data

    # Test valid administrator login with email
    res_email = client.post("/api/v1/auth/login", json={"username": "admin@nexora.ai", "password": "Nexora@Admin2026"})
    assert res_email.status_code == 200
    assert res_email.json()["user"]["role"] == "Administrator"

    # Test invalid password rejection
    res_invalid = client.post("/api/v1/auth/login", json={"username": "admin", "password": "wrong_password"})
    assert res_invalid.status_code == 401

def test_project_workspace_and_architecture_data():
    res = client.get("/api/v1/projects/1")
    assert res.status_code == 200
    data = res.json()
    assert data["project"]["code"] == "PRJ-ECOM-001"
    assert len(data["documents"]) >= 4
    assert len(data["requirements"]) >= 8
    assert len(data["issues"]) >= 2
    assert len(data["questions"]) >= 2
    assert data["architecture"] is not None
    assert len(data["adrs"]) >= 2

def test_clarification_response_and_dynamic_reanalysis():
    # Login as administrator
    res_auth = client.post("/api/v1/auth/login", json={"username": "admin", "password": "Nexora@Admin2026"})
    assert res_auth.status_code == 200
    token = res_auth.json()["access_token"]

    # Submit response to clarification question 1
    resp_payload = {
        "question_id": 1,
        "selected_option": "Stripe & Razorpay Dual Gateway",
        "response_text": "We will launch in India first with Razorpay, then expand with Stripe."
    }
    res_ans = client.post(
        "/api/v1/clarifications/respond",
        json=resp_payload,
        headers={"Authorization": f"Bearer {token}"}
    )
    assert res_ans.status_code == 200
    assert res_ans.json()["status"] == "ANSWERED_AND_REANALYZED"
    assert res_ans.json()["readiness_score"] > 40.0

def test_architecture_stress_lab_scenario():
    # Inject 100k scaling stress scenario
    stress_payload = {
        "project_id": 1,
        "scenario_id": "scenario_1_scale_100k"
    }
    res = client.post("/api/v1/stress/inject", json=stress_payload)
    assert res.status_code == 200
    data = res.json()
    assert data["scenario"] == "scenario_1_scale_100k"
    assert "100,000" in data["change_impact"]
