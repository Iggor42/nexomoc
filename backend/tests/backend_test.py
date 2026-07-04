# pytest backend_test.py - NexoMoc Backend API endpoints test suite
# This file contains the complete test suite.

import os
import pytest
import requests
from dotenv import load_dotenv
from pathlib import Path

# Load frontend env to get the public backend URL
FRONTEND_ENV_PATH = Path("/app/frontend/.env")
if FRONTEND_ENV_PATH.exists():
    with open(FRONTEND_ENV_PATH, "r") as f:
        for line in f:
            if line.startswith("REACT_APP_BACKEND_URL="):
                os.environ["REACT_APP_BACKEND_URL"] = line.split("=", 1)[1].strip()

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
assert BASE_URL, "REACT_APP_BACKEND_URL must be configured!"

@pytest.fixture
def api_client():
    """Shared requests session"""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session

@pytest.fixture
def auth_header():
    """Authorization header with test token"""
    return {"Authorization": "Bearer test_session_token_moc_abc"}

class TestPublicRoutes:
    """Tests for public endpoints that require no authentication"""

    def test_root_api(self, api_client):
        # 1. Verify backend root API responds successfully at /api
        response = api_client.get(f"{BASE_URL}/api")
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "online"
        assert "NexoMoc" in data.get("message", "")

    def test_list_freelancers(self, api_client):
        # 2. Verify public freelancers search and category filtering at /api/freelancers
        response = api_client.get(f"{BASE_URL}/api/freelancers")
        assert response.status_code == 200
        freelancers = response.json()
        assert isinstance(freelancers, list)
        
        # Verify that all returned freelancers have a phone number (as per code rule)
        for f in freelancers:
            assert f.get("phone") != ""

        # Test filtering by category
        response_filtered = api_client.get(f"{BASE_URL}/api/freelancers", params={"category": "Construção e Reformas"})
        assert response_filtered.status_code == 200
        freelancers_filtered = response_filtered.json()
        assert isinstance(freelancers_filtered, list)
        for f in freelancers_filtered:
            assert "Construção e Reformas" in f.get("categories", [])

    def test_get_freelancer_by_id(self, api_client):
        # 3. Verify public retrieve of freelancer profile by ID at /api/freelancers/user_thiago123
        response = api_client.get(f"{BASE_URL}/api/freelancers/user_thiago123")
        assert response.status_code == 200
        freelancer = response.json()
        assert freelancer.get("user_id") == "user_thiago123"
        assert freelancer.get("name") == "Thiago Silva"
        assert "Construção e Reformas" in freelancer.get("categories", [])

    def test_client_demand_lifecycle(self, api_client):
        # 4. Verify client demand submission (zero-login) at POST /api/demands and retrieve at GET /api/demands
        # Let's post a test demand
        demand_payload = {
            "client_name": "TEST Client",
            "client_phone": "+5538999990000",
            "client_email": "test.client@gmail.com",
            "title": "TEST Pintor para casa",
            "category": "Construção e Reformas",
            "description": "Preciso pintar uma sala de teste rapidamente.",
            "budget": "R$ 300"
        }
        post_response = api_client.post(f"{BASE_URL}/api/demands", json=demand_payload)
        assert post_response.status_code == 200
        demand_data = post_response.json()
        assert "demand_id" in demand_data
        assert demand_data["client_name"] == "TEST Client"
        assert demand_data["title"] == "TEST Pintor para casa"

        # Now get the list and check if our TEST demand is there
        get_response = api_client.get(f"{BASE_URL}/api/demands")
        assert get_response.status_code == 200
        demands = get_response.json()
        assert isinstance(demands, list)
        
        # Verify persistence
        found = False
        for d in demands:
            if d.get("demand_id") == demand_data["demand_id"]:
                found = True
                assert d["client_name"] == "TEST Client"
                assert d["title"] == "TEST Pintor para casa"
                break
        assert found, "Created client demand was not persisted in database!"


class TestAuthRequiredRoutes:
    """Tests for routes that require session_token authentication"""

    def test_auth_me_unauthenticated(self, api_client):
        # 5. Verify authenticated route /api/auth/me returns 401 when unauthenticated
        response = api_client.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code == 401

    def test_auth_me_authenticated(self, api_client, auth_header):
        # 6. Verify authenticated route /api/auth/me returns 200 and profile when authorized with test_session_token_moc_abc
        response = api_client.get(f"{BASE_URL}/api/auth/me", headers=auth_header)
        assert response.status_code == 200
        profile = response.json()
        assert profile.get("user_id") == "test-user-moc-123"
        assert profile.get("email") == "test.freelancer@nexomoc.com.br"
        assert profile.get("name") == "Pedro Silva de Montes Claros"

    def test_manage_services(self, api_client, auth_header):
        # 7. Verify adding and removing services at /api/auth/services
        service_payload = {
            "title": "TEST Serviço Especial",
            "description": "Serviço de teste temporário para verificação de API.",
            "price": "R$ 500"
        }
        # Add service
        add_response = api_client.post(f"{BASE_URL}/api/auth/services", json=service_payload, headers=auth_header)
        assert add_response.status_code == 200
        add_data = add_response.json()
        assert add_data.get("status") == "success"
        service_id = add_data["service"]["id"]
        assert add_data["service"]["title"] == "TEST Serviço Especial"

        # Verify it was persisted on /api/auth/me
        me_response = api_client.get(f"{BASE_URL}/api/auth/me", headers=auth_header)
        assert me_response.status_code == 200
        services = me_response.json().get("services", [])
        assert any(s.get("id") == service_id for s in services)

        # Delete service
        del_response = api_client.delete(f"{BASE_URL}/api/auth/services/{service_id}", headers=auth_header)
        assert del_response.status_code == 200
        assert del_response.json().get("status") == "success"

        # Verify it is no longer on /api/auth/me
        me_response_after = api_client.get(f"{BASE_URL}/api/auth/me", headers=auth_header)
        services_after = me_response_after.json().get("services", [])
        assert not any(s.get("id") == service_id for s in services_after)

    def test_manage_portfolio(self, api_client, auth_header):
        # 8. Verify adding and removing portfolio items at /api/auth/portfolio
        portfolio_payload = {
            "title": "TEST Trabalho Incrível",
            "description": "Descrição de teste para portfólio de freelancer.",
            "image_url": "https://images.unsplash.com/photo-1594398985750-3b54ec074a0a?w=600"
        }
        # Add portfolio item
        add_response = api_client.post(f"{BASE_URL}/api/auth/portfolio", json=portfolio_payload, headers=auth_header)
        assert add_response.status_code == 200
        add_data = add_response.json()
        assert add_data.get("status") == "success"
        portfolio_id = add_data["portfolio_item"]["id"]
        assert add_data["portfolio_item"]["title"] == "TEST Trabalho Incrível"

        # Verify persistence on /api/auth/me
        me_response = api_client.get(f"{BASE_URL}/api/auth/me", headers=auth_header)
        assert me_response.status_code == 200
        portfolio = me_response.json().get("portfolio", [])
        assert any(p.get("id") == portfolio_id for p in portfolio)

        # Delete portfolio item
        del_response = api_client.delete(f"{BASE_URL}/api/auth/portfolio/{portfolio_id}", headers=auth_header)
        assert del_response.status_code == 200
        assert del_response.json().get("status") == "success"

        # Verify it is removed
        me_response_after = api_client.get(f"{BASE_URL}/api/auth/me", headers=auth_header)
        portfolio_after = me_response_after.json().get("portfolio", [])
        assert not any(p.get("id") == portfolio_id for p in portfolio_after)
