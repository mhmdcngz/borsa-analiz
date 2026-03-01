import yfinance as yf
from datetime import datetime
from dateutil.relativedelta import relativedelta
import math

class StockDataFetcher:
    """Ajan 1: Veri Mühendisi"""
    def __init__(self, ticker: str):
        self.ticker = ticker

    def fetch_data(self):
        end_date = datetime.now()
        start_date = end_date - relativedelta(months=6)

        stock = yf.Ticker(self.ticker)
        df = stock.history(start=start_date.strftime('%Y-%m-%d'),
                           end=end_date.strftime('%Y-%m-%d'),
                           interval="1d")

        if df.empty:
            return None

        # Eksik veya hatalı verileri temizle
        df.dropna(inplace=True)

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
                "volume": float(row["Volume"])
            })

        return raw_data


class TradingViewFormatter:
    """Ajan 2: Arayüz Formatlayıcı"""
    @staticmethod
    def format_data(raw_data):
        candlestick_series = []
        histogram_series = []

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

        return {
            "candlestickSeries": candlestick_series,
            "histogramSeries": histogram_series
        }


def get_formatted_stock_data(ticker: str):
    # Ajan 1: Veriyi çek
    fetcher = StockDataFetcher(ticker)
    raw_data = fetcher.fetch_data()
    
    if not raw_data:
        return None
        
    # Ajan 2: Veriyi formatla
    return TradingViewFormatter.format_data(raw_data)
