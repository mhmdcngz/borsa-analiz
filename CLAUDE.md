# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**borsa-analiz** is a Turkish stock market analysis platform with AI-powered insights. It combines real-time technical analysis, fundamental data, news aggregation, and Gemini AI integration to provide comprehensive stock analysis and simulation capabilities.

## Tech Stack

### Frontend
- **Framework:** Next.js 16.1.6 (App Router) with React 19.2.3
- **Styling:** Tailwind CSS 4
- **Charts:** Lightweight Charts 5.1.0 (TradingView-quality interactive charts)
- **Markdown Rendering:** react-markdown 10.1.0
- **TypeScript:** 5.x with strict mode enabled
- **Path Alias:** `@/*` maps to `src/*`

### Backend
- **Framework:** FastAPI with Uvicorn server
- **Python:** 3.9+
- **Data Source:** YFinance (Yahoo Finance API)
- **AI Integration:** Google Generative AI (Gemini)
- **Data Processing:** Pandas, python-dateutil
- **News Feed:** feedparser, requests
- **Environment:** python-dotenv for configuration

## Architecture

### System Design
The application follows a **client-server architecture**:
- **Frontend (Next.js):** Next-gen React UI running on `http://localhost:3000`
- **Backend (FastAPI):** REST API server on `http://127.0.0.1:8000`
- **Communication:** HTTP requests with CORS enabled (open policy for development)

### Frontend Structure (`/frontend`)
```
src/
  app/
    layout.tsx      - Root layout with metadata and global styles
    page.tsx        - Home page (stock search and analysis dashboard)
  components/
    Chart.tsx                  - Lightweight Charts integration with indicators (RSI, MACD, Bollinger Bands, SMA, Volume)
    TechnicalSummary.tsx      - Technical analysis summary view
    NewsAnalysis.tsx          - News feed and AI-generated summary
    Fundamentals.tsx          - Fundamental metrics display
    Simulation.tsx            - Investment simulation component
  data/
    stocks.ts       - 500+ BIST stock ticker list with company names
```

**Key Patterns:**
- Components fetch data directly from backend API via `http://127.0.0.1:8000/api/...`
- Client-side state management for UI (chart settings, toggles for indicators)
- Markdown rendering for AI-generated analysis summaries
- Responsive design with Tailwind CSS

### Backend Structure (`/backend`)
```
main.py             - FastAPI app initialization and 4 main routes
agents.py           - Business logic modules (likely contains multiple agent classes)
```

**Core API Endpoints:**
- `GET /api/stock/{ticker}` - Fetch formatted stock price and technical data
- `GET /api/analysis/{ticker}` - Combined AI analysis (news + technical indicators)
- `GET /api/fundamentals/{ticker}` - Fundamental metrics (P/E, dividend, etc.)
- `GET /api/simulation/{ticker}?amount=1000.0&months=6` - Investment simulation with monthly contributions

**Backend Agent Pattern:**
The backend uses an agent-based architecture:
- `StockDataFetcher` - Retrieves historical price data via YFinance
- `NewsAgent` - Aggregates stock-related news via feedparser
- `AIAgent` - Generates Markdown summaries using Gemini API (combines news + technical data)
- `FundamentalAgent` - Fetches fundamental metrics from YFinance
- `SimulationAgent` - Runs DCA (dollar-cost averaging) simulations
- `get_formatted_stock_data()` - Main data aggregation function

## Commands

### Frontend Development
```bash
cd frontend

# Development server (hot reload)
npm run dev

# Production build
npm run build

# Start production server
npm start

# Linting
npm run lint

# Testing
npm test
```

### Backend Development
```bash
cd backend

# Install dependencies (first time only)
pip install -r requirements.txt

# Development server with auto-reload
uvicorn main:app --reload

# Production server (without reload)
uvicorn main:app --host 0.0.0.0 --port 8000

# Testing
python -m pytest tests/
```

### Environment Setup
Create a `.env` file in the `/backend` directory with:
```
GEMINI_API_KEY=your_api_key_here
```

## Key Implementation Details

### Data Flow Example: Stock Analysis
1. User searches for a stock ticker (e.g., "ASELS") on the frontend
2. Frontend calls `GET http://127.0.0.1:8000/api/analysis/ASELS`
3. Backend orchestrates:
   - `StockDataFetcher` pulls 6+ months of price data via YFinance
   - `NewsAgent` fetches recent news articles about the ticker
   - `AIAgent` calls Gemini API with: news content + technical metrics
   - Returns Markdown-formatted AI summary
4. Frontend renders summary and displays interactive chart with indicators

### Chart Indicators
The Lightweight Charts integration supports toggle-able indicators:
- **RSI** (Relative Strength Index) - Momentum oscillator
- **MACD** - Trend-following momentum indicator
- **Bollinger Bands** - Volatility bands
- **SMA** - 20 and 50-period moving averages
- **Volume Bars** - Trading volume visualization

### Compliance
Frontend includes "Yatırım Tavsiyesi Değildir" (YTD - Not Investment Advice) disclaimers:
- Modal warnings on stock selection
- Persistent footer notice (SPK compliance for Turkish regulations)

## Configuration Files

- `frontend/tsconfig.json` - TypeScript compiler options (strict mode, ES2017 target)
- `frontend/next.config.ts` - Next.js build configuration (minimal defaults)
- `frontend/tailwind.config.ts` - Tailwind CSS customization
- `backend/requirements.txt` - Python package dependencies
- `backend/.env` - Environment variables (GEMINI_API_KEY required)

## Important Notes

### CORS Policy
The backend allows all origins (`allow_origins=["*"]`) for development. This should be restricted in production.

### API Rate Limiting
YFinance and Gemini API have rate limits. Consider implementing caching or request throttling for production.

### Stock Ticker Coverage
Frontend includes a curated list of 500+ BIST (Borsa Istanbul) stocks in `data/stocks.ts`. Maintain this list for the smart search feature.

### Error Handling
- Frontend components should gracefully handle API failures (404, 500 responses)
- Backend endpoints return HTTPException with descriptive Turkish error messages
