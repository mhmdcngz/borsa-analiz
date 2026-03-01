import yfinance as yf
from datetime import datetime
from dateutil.relativedelta import relativedelta
import math
import os
import google.generativeai as genai
from dotenv import load_dotenv
import feedparser
import requests

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
class StockDataFetcher:
    """Ajan 1: Veri Mühendisi"""
    def __init__(self, ticker: str):
        self.ticker = ticker

    def fetch_data(self):
        stock = yf.Ticker(self.ticker)
        df = stock.history(period="2y", interval="1d")

        if df.empty:
            return None

        # Eksik veya hatalı verileri temizle
        df.dropna(subset=['Open', 'High', 'Low', 'Close', 'Volume'], inplace=True)

        # Basit Hareketli Ortalamaları (SMA) hesapla
        df['SMA_20'] = df['Close'].rolling(window=20).mean()
        df['SMA_50'] = df['Close'].rolling(window=50).mean()

        raw_data = []
        for index, row in df.iterrows():
            if math.isnan(row["Open"]) or math.isnan(row["Close"]) or math.isinf(row["Volume"]):
                continue

            raw_data.append({
                "date": index.strftime('%Y-%m-%d'),
                "open": float(row["Open"]),
                "high": float(row["High"]),
                "low": float(row["Low"]),
                "close": float(row["Close"]),
                "volume": float(row["Volume"]),
                "sma20": float(row["SMA_20"]) if not math.isnan(row["SMA_20"]) else None,
                "sma50": float(row["SMA_50"]) if not math.isnan(row["SMA_50"]) else None
            })

        return raw_data


class TradingViewFormatter:
    """Ajan 2: Arayüz Formatlayıcı"""
    @staticmethod
    def format_data(raw_data):
        candlestick_series = []
        histogram_series = []
        sma20_series = []
        sma50_series = []

        for item in raw_data:
            candlestick_series.append({
                "time": item["date"],
                "open": item["open"],
                "high": item["high"],
                "low": item["low"],
                "close": item["close"]
            })

            is_green = item["close"] >= item["open"]
            histogram_series.append({
                "time": item["date"],
                "value": item["volume"],
                "color": 'rgba(38, 166, 154, 0.5)' if is_green else 'rgba(239, 83, 80, 0.5)'
            })

            if item.get("sma20") is not None:
                sma20_series.append({
                    "time": item["date"],
                    "value": item["sma20"]
                })
            
            if item.get("sma50") is not None:
                sma50_series.append({
                    "time": item["date"],
                    "value": item["sma50"]
                })

        return {
            "candlestickSeries": candlestick_series,
            "histogramSeries": histogram_series,
            "sma20Series": sma20_series,
            "sma50Series": sma50_series
        }


def get_formatted_stock_data(ticker: str):
    # Ajan 1: Veriyi çek
    fetcher = StockDataFetcher(ticker)
    raw_data = fetcher.fetch_data()
    
    if not raw_data:
        return None
        
    # Ajan 2: Veriyi formatla
    return TradingViewFormatter.format_data(raw_data)


class NewsAgent:
    """Ajan 3: Haber Toplayıcı (Google News RSS)"""
    def __init__(self, ticker: str):
        self.ticker = ticker

    def fetch_news(self):
        try:
            # .IS uzantısını temizle
            search_query = self.ticker.replace(".IS", "")
            url = f"https://news.google.com/rss/search?q={search_query}+hisse+ekonomi&hl=tr&gl=TR&ceid=TR:tr"
            
            feed = feedparser.parse(url)
            
            if not feed.entries:
                return "Haber bulunamadı"
                
            news_items = []
            for entry in feed.entries[:5]: # En güncel 5 haber
                news_items.append(entry.title)
                
            return ". ".join(news_items)
            
        except Exception as e:
            print(f"Haber çekme hatası: {e}")
            return "Haber bulunamadı"


class AIAgent:
    """Ajan 4: AI Analisti"""
    def __init__(self, ticker: str):
        self.ticker = ticker

    def generate_summary(self, news_text: str):
        if not news_text or news_text == "Haber bulunamadı":
            return "Bu hisse senedi için güncel bir haber bulunamadı."

        prompt = (
            f"Sen kıdemli bir Borsa İstanbul analistisin. Aşağıda {self.ticker} hissesi ile ilgili son dakika haber başlıkları verilmiştir. "
            f"Sadece bu haberlere dayanarak, hissenin piyasa yönü (olumlu/olumsuz) hakkında yatırımcılara yönelik 3 cümlelik, "
            f"profesyonel bir özet analiz yaz.\n\n"
            f"Haberler: {news_text}"
        )

        try:
            api_key = os.getenv("GEMINI_API_KEY")
            if not api_key or api_key == "senin_api_anahtarin_buraya":
                return "Mock AI Özeti: Haberler genel olarak olumlu bir tablo çiziyor. Şirketin yeni dönem bilançosu yatırımcıları tatmin edebilecek düzeyde. Kısa vadede yükseliş trendinin devam etmesi beklenebilir."
                
            model = genai.GenerativeModel('gemini-2.5-flash')
            response = model.generate_content(prompt)
            return response.text.replace('\n', ' ').strip()
        except Exception as e:
            print(f"AI özet hatası: {e}")
            return "Mock AI Özeti (API Hatası): Küresel piyasalardaki dalgalanmalar hisseyi etkilemiş görünüyor. Yatırımcıların destek seviyelerini yakından takip etmesi önerilir."


class FundamentalAgent:
    """Ajan 5: Temel Analiz Uzmanı"""
    def __init__(self, ticker: str):
        self.ticker = ticker

    def fetch_fundamentals(self):
        try:
            stock = yf.Ticker(self.ticker)
            info = stock.info

            return {
                "trailingPE": info.get("trailingPE", "N/A"),
                "priceToBook": info.get("priceToBook", "N/A"),
                "marketCap": info.get("marketCap", "N/A"),
                "dividendYield": info.get("dividendYield", "N/A"),
                "fiftyTwoWeekHigh": info.get("fiftyTwoWeekHigh", "N/A"),
                "fiftyTwoWeekLow": info.get("fiftyTwoWeekLow", "N/A")
            }
        except Exception as e:
            print(f"Temel verileri çekme hatası: {e}")
            return {
                "trailingPE": "N/A", "priceToBook": "N/A", "marketCap": "N/A",
                "dividendYield": "N/A", "fiftyTwoWeekHigh": "N/A", "fiftyTwoWeekLow": "N/A"
            }


class SimulationAgent:
    """Ajan 6: Portföy Simülasyon Uzmanı"""
    def __init__(self, ticker: str):
        self.ticker = ticker

    def run_simulation(self, monthly_investment_amount: float = 1000.0, months: int = 6):
        try:
            fetcher = StockDataFetcher(self.ticker)
            raw_data = fetcher.fetch_data()

            if not raw_data:
                return {"error": "Simülasyon için yeterli veri bulunamadı."}

            # Verileri tarihe göre sırala (eskiden yeniye)
            raw_data.sort(key=lambda x: x['date'])

            # Her ayın ilk işlem gününü bul
            monthly_first_days = {}
            for item in raw_data:
                month_key = item['date'][:7] # YYYY-MM
                if month_key not in monthly_first_days:
                    monthly_first_days[month_key] = item

            if not monthly_first_days:
                return {"error": "Veri ayrıştırılamadı."}

            sorted_months = sorted(list(monthly_first_days.keys()))
            if len(sorted_months) > months:
                target_months = sorted_months[-months:]
            else:
                target_months = sorted_months

            total_invested = 0.0
            total_shares = 0.0

            # Her ay yatırım yap
            for month in target_months:
                day_data = monthly_first_days[month]
                price = day_data['close']
                shares_bought = monthly_investment_amount / price
                total_invested += monthly_investment_amount
                total_shares += shares_bought

            # Güncel değeri hesapla (Son kapanış fiyatı üzerinden)
            last_price = raw_data[-1]['close']
            current_value = total_shares * last_price
            
            # Kar/Zarar Yüzdesi
            profit_loss_pct = ((current_value - total_invested) / total_invested) * 100 if total_invested > 0 else 0

            return {
                "totalInvested": round(total_invested, 2),
                "totalShares": round(total_shares, 2),
                "currentValue": round(current_value, 2),
                "profitLossPercentage": round(profit_loss_pct, 2)
            }

        except Exception as e:
            print(f"Simülasyon hatası: {e}")
            return {"error": str(e)}
