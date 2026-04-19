import pytest
from agents import StockDataFetcher, FundamentalAgent, SimulationAgent

def test_stock_data_fetcher_format():
    # Geçersiz bir ticker bile olsa sınıfa atanabiliyor olmalı (hata fırlatmamalı)
    fetcher = StockDataFetcher("THYAO")
    assert fetcher.ticker == "THYAO.IS"
    
    fetcher_with_is = StockDataFetcher("ASELS.IS")
    assert fetcher_with_is.ticker == "ASELS.IS"

def test_stock_data_fetcher_real_data():
    # Gerçek veri çekme testi (Ağ bağlantısı gerektirir)
    fetcher = StockDataFetcher("THYAO")
    data = fetcher.fetch_data()
    assert data is not None
    assert len(data) > 0
    assert "close" in data[0]
    assert "date" in data[0]

def test_fundamental_agent():
    agent = FundamentalAgent("THYAO")
    data = agent.fetch_fundamentals()
    assert isinstance(data, dict)
    assert "marketCap" in data

def test_simulation_agent():
    agent = SimulationAgent("THYAO")
    result = agent.run_simulation(monthly_investment_amount=1000, months=3)
    assert "totalInvested" in result
    assert result["totalInvested"] > 0
    assert "currentValue" in result
