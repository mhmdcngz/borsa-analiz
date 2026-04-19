import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_read_root():
    # FastAPI'de kök dizin tanımlı değilse 404 dönmeli
    response = client.get("/")
    assert response.status_code in [200, 404]

def test_get_stock_data():
    response = client.get("/api/stock/THYAO")
    assert response.status_code == 200
    data = response.json()
    assert data["ticker"] == "THYAO"
    assert "candlestickSeries" in data

def test_get_fundamentals():
    response = client.get("/api/fundamentals/THYAO")
    assert response.status_code == 200
    data = response.json()
    assert "marketCap" in data

def test_get_simulation():
    response = client.get("/api/simulation/THYAO?amount=1000&months=3")
    assert response.status_code == 200
    data = response.json()
    assert "totalInvested" in data
    assert data["totalInvested"] == 3000.0
