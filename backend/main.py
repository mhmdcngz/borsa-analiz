import asyncio
import json
import threading

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from agents import get_formatted_stock_data, NewsAgent, AIAgent, StockDataFetcher, FundamentalAgent, SimulationAgent

limiter = Limiter(key_func=get_remote_address)
app = FastAPI()
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/stock/{ticker}")
@limiter.limit("20/minute")
async def get_stock_data(request: Request, ticker: str):
    try:
        data = get_formatted_stock_data(ticker)
        if not data:
            raise HTTPException(status_code=404, detail="Hisse senedi verisi bulunamadı")
        return {"ticker": ticker.upper(), **data}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/analysis/{ticker}")
@limiter.limit("10/minute")
async def get_stock_analysis(request: Request, ticker: str, persona: str = "short_term"):
    def event_stream_producer(queue: "asyncio.Queue"):
        try:
            fetcher = StockDataFetcher(ticker)
            raw_data = fetcher.fetch_data()
            tech_data = raw_data[-1] if raw_data else None

            news_agent = NewsAgent(ticker)
            news_result = news_agent.fetch_news_with_sentiment()

            asyncio.run_coroutine_threadsafe(
                queue.put({"type": "sentiment", "score": news_result["sentiment"]["score"], "label": news_result["sentiment"]["label"]}),
                loop
            )

            ai_agent = AIAgent(ticker, persona=persona)
            for chunk in ai_agent.generate_summary_stream(news_result["news_text"], tech_data):
                asyncio.run_coroutine_threadsafe(queue.put({"type": "chunk", "text": chunk}), loop)

            asyncio.run_coroutine_threadsafe(queue.put({"type": "done"}), loop)
        except Exception as e:
            asyncio.run_coroutine_threadsafe(queue.put({"type": "error", "message": str(e)}), loop)

    async def event_stream():
        nonlocal loop
        loop = asyncio.get_event_loop()
        queue: asyncio.Queue = asyncio.Queue()

        thread = threading.Thread(target=event_stream_producer, args=(queue,), daemon=True)
        thread.start()

        while True:
            event = await queue.get()
            yield f"data: {json.dumps(event, ensure_ascii=False)}\n\n"
            if event["type"] in ("done", "error"):
                break

    loop = None
    return StreamingResponse(event_stream(), media_type="text/event-stream", headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"})


@app.get("/api/fundamentals/{ticker}")
@limiter.limit("20/minute")
async def get_fundamentals(request: Request, ticker: str):
    try:
        agent = FundamentalAgent(ticker)
        return agent.fetch_fundamentals()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/simulation/{ticker}")
@limiter.limit("10/minute")
async def run_simulation(request: Request, ticker: str, amount: float = 1000.0, months: int = 6):
    try:
        agent = SimulationAgent(ticker)
        return agent.run_simulation(monthly_investment_amount=amount, months=months)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
