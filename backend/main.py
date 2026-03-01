from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from agents import get_formatted_stock_data

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
