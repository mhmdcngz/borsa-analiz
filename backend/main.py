from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from agents import get_formatted_stock_data, NewsAgent, AIAgent, FundamentalAgent, SimulationAgent

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/stock/{ticker}")
def get_stock_data(ticker: str):
    try:
        data = get_formatted_stock_data(ticker)
        if not data:
            raise HTTPException(status_code=404, detail="Hisse senedi verisi bulunamadı")
            
        return {"ticker": ticker.upper(), **data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/analysis/{ticker}")
def get_stock_analysis(ticker: str):
    try:
        news_agent = NewsAgent(ticker)
        news_items = news_agent.fetch_news()
        
        ai_agent = AIAgent(ticker)
        summary = ai_agent.generate_summary(news_items)
        
        return {"summary": summary}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/fundamentals/{ticker}")
def get_fundamentals(ticker: str):
    try:
        agent = FundamentalAgent(ticker)
        return agent.fetch_fundamentals()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/simulation/{ticker}")
def run_simulation(ticker: str, amount: float = 1000.0, months: int = 6):
    try:
        agent = SimulationAgent(ticker)
        return agent.run_simulation(monthly_investment_amount=amount, months=months)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
