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
        df['Volume_SMA_20'] = df['Volume'].rolling(window=20).mean()

        # Bollinger Bantları
        df['BB_STD'] = df['Close'].rolling(window=20).std()
        df['BB_UP'] = df['SMA_20'] + (df['BB_STD'] * 2)
        df['BB_LOW'] = df['SMA_20'] - (df['BB_STD'] * 2)

        # RSI (14) Hesaplama
        delta = df['Close'].diff()
        up = delta.clip(lower=0)
        down = -1 * delta.clip(upper=0)
        ema_up = up.ewm(com=13, adjust=False).mean()
        ema_down = down.ewm(com=13, adjust=False).mean()
        rs = ema_up / ema_down
        df['RSI_14'] = 100 - (100 / (1 + rs))

        # MACD (12, 26, 9) Hesaplama
        df['EMA_12'] = df['Close'].ewm(span=12, adjust=False).mean()
        df['EMA_26'] = df['Close'].ewm(span=26, adjust=False).mean()
        df['MACD_Line'] = df['EMA_12'] - df['EMA_26']
        df['MACD_Signal'] = df['MACD_Line'].ewm(span=9, adjust=False).mean()
        df['MACD_Hist'] = df['MACD_Line'] - df['MACD_Signal']

        # Kullanıcının talebi üzerine NaN değerlerini doldur (bfill ile geçmişe dönük doldurma)
        df.bfill(inplace=True)
        df.fillna(50, inplace=True)

        raw_data = []
        for index, row in df.iterrows():
            raw_data.append({
                "date": index.strftime('%Y-%m-%d'),
                "open": float(row["Open"]),
                "high": float(row["High"]),
                "low": float(row["Low"]),
                "close": float(row["Close"]),
                "volume": float(row["Volume"]),
                "sma20": float(row["SMA_20"]),
                "sma50": float(row["SMA_50"]),
                "bb_up": float(row["BB_UP"]),
                "bb_low": float(row["BB_LOW"]),
                "rsi14": float(row["RSI_14"]),
                "macd_line": float(row["MACD_Line"]) if "MACD_Line" in row else None,
                "macd_signal": float(row["MACD_Signal"]) if "MACD_Signal" in row else None,
                "macd_hist": float(row["MACD_Hist"]) if "MACD_Hist" in row else None,
                "volume_sma_20": float(row["Volume_SMA_20"]) if "Volume_SMA_20" in row else None
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
        bb_up_series = []
        bb_low_series = []
        rsi14_series = []
        macd_line_series = []
        macd_signal_series = []
        macd_hist_series = []

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
                sma20_series.append({"time": item["date"], "value": item["sma20"]})
            
            if item.get("sma50") is not None:
                sma50_series.append({"time": item["date"], "value": item["sma50"]})

            if item.get("bb_up") is not None:
                bb_up_series.append({"time": item["date"], "value": item["bb_up"]})

            if item.get("bb_low") is not None:
                bb_low_series.append({"time": item["date"], "value": item["bb_low"]})

            if item.get("rsi14") is not None:
                rsi14_series.append({"time": item["date"], "value": item["rsi14"]})

            if item.get("macd_line") is not None and not math.isnan(item["macd_line"]):
                macd_line_series.append({"time": item["date"], "value": item["macd_line"]})

            if item.get("macd_signal") is not None and not math.isnan(item["macd_signal"]):
                macd_signal_series.append({"time": item["date"], "value": item["macd_signal"]})

            if item.get("macd_hist") is not None and not math.isnan(item["macd_hist"]):
                is_hist_green = item["macd_hist"] >= 0
                macd_hist_series.append({
                    "time": item["date"], 
                    "value": item["macd_hist"],
                    "color": 'rgba(38, 166, 154, 0.5)' if is_hist_green else 'rgba(239, 83, 80, 0.5)'
                })

        return {
            "candlestickSeries": candlestick_series,
            "histogramSeries": histogram_series,
            "sma20Series": sma20_series,
            "sma50Series": sma50_series,
            "bbUpperSeries": bb_up_series,
            "bbLowerSeries": bb_low_series,
            "rsi14Series": rsi14_series,
            "macdLineSeries": macd_line_series,
            "macdSignalSeries": macd_signal_series,
            "macdHistSeries": macd_hist_series
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

    def generate_summary(self, news_text: str, technical_data=None):
        if not news_text or news_text == "Haber bulunamadı":
            news_section = "Bu hisse senedi için güncel bir haber bulunamadı."
        else:
            news_section = f"Haberler: {news_text}"

        prompt = (
            f"Sen kıdemli bir borsa analistisin. Sana verilen {self.ticker} hissesine ait teknik (RSI, SMA, Fiyat vb.) ve temel (Haberler, Rasyolar) verileri kullanarak KESİNLİKLE aşağıdaki Markdown formatına uyarak bir analiz yaz. Uzun paragraflardan kaçın, her şeyi kısa, net ve maddeler halinde yaz:\n\n"
            f"### 🎯 Genel Özet\n"
            f"[Buraya 1-2 cümlelik durum özeti yaz]\n\n"
            f"### 📊 Teknik Görünüm\n"
            f"* **Fiyat ve Ortalama:** [Fiyatın SMA ile ilişkisini yorumla]\n"
            f"* **Momentum (RSI):** [RSI değerini yorumla]\n"
            f"* **Bantlar:** [Bollinger durumunu yorumla]\n\n"
        )
        
        if technical_data:
            rsi = technical_data.get('rsi14', 50)
            sma50 = technical_data.get('sma50', 1)
            close = technical_data.get('close', 1)
            bb_up = technical_data.get('bb_up', 1)
            bb_low = technical_data.get('bb_low', 1)
            
            # Yeni eklenen veriler
            macd_line = technical_data.get('macd_line', 0.0)
            macd_signal = technical_data.get('macd_signal', 0.0)
            macd_hist = technical_data.get('macd_hist', 0.0)
            volume_current = technical_data.get('volume', 0.0)
            volume_avg_20 = technical_data.get('volume_sma_20', 0.0)
            
            sma_status = "altında" if close < sma50 else "üstünde"
            bb_dist = round(((bb_up - close) / close) * 100, 2) if bb_up and close else 0

            prompt += (
                f"### 🌪️ Momentum ve Hacim (MACD & Volatilite)\n"
                f"* **Hacim Onayı:** [Bugünkü hacmi ({volume_current}), 20 günlük ortalama hacimle ({volume_avg_20}) kıyasla. Eğer fiyat artıyorsa ve hacim de ortalamanın üzerindeyse 'Yükseliş hacimle destekleniyor' de. Hacim düşükse 'Harekete katılım zayıf' şeklinde yorumla.]\n"
                f"* **MACD Sinyali:** [MACD çizgisinin ({macd_line:.2f}), Sinyal çizgisini ({macd_signal:.2f}) yukarı mı (Al Sinyali) yoksa aşağı mı (Sat Sinyali) kestiğini ve histogramın ({macd_hist:.2f}) yönünü (momentum artıyor/azalıyor) yorumla.]\n\n"
                f"### 📰 Temel Beklentiler\n"
                f"* [Haberlerden veya rasyolardan çıkarılan en önemli 1. madde]\n"
                f"* [Haberlerden çıkarılan 2. madde]\n\n"
                f"### 💡 Strateji ve Sonuç\n"
                f"[Kısa, net yatırımcı tavsiyesi ve dikkat edilmesi gereken destek/direnç seviyeleri]\n\n"
            )

            prompt += (
                f"--- TEKNİK DURUM ---\n"
                f"- RSI (14 Günlük): {rsi:.2f}\n"
                f"- Fiyat ({close:.2f}), SMA 50'nin ({sma50:.2f}) {sma_status}.\n"
                f"- Bollinger Üst Bandına (Direnç) uzaklık: %{bb_dist}\n"
                f"- Bollinger Alt Bandı (Destek): {bb_low:.2f}\n\n"
            )

        prompt += f"--- HABERLER ---\n{news_section}"

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
