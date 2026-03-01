"use client";

import { useEffect, useState } from "react";

interface TechnicalSummaryProps {
    ticker: string;
}

interface TechnicalData {
    rsi14: number | null;
    sma20: number | null;
    sma50: number | null;
    close: number | null;
    macdLine: number | null;
    macdSignal: number | null;
    volume: number | null;
    volumeSma20: number | null;
    bbUp: number | null;
    bbLow: number | null;
}

export default function TechnicalSummary({ ticker }: TechnicalSummaryProps) {
    const [data, setData] = useState<TechnicalData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let active = true;

        const fetchTechnicalData = async () => {
            setLoading(true);
            setError(null);
            try {
                // Verileri aynı hisse grafiği için aldığımız servisten çekiyoruz (agents.py içindeki StockDataFetcher)
                const res = await fetch(`http://127.0.0.1:8000/api/stock/${ticker}`);
                if (!res.ok) throw new Error("Teknik veriler alınamadı.");

                const result = await res.json();
                if (!active) return;

                // Sadece en son günün verisini alalım
                if (result && result.candlestickSeries && result.candlestickSeries.length > 0) {
                    const lastIndex = result.candlestickSeries.length - 1;
                    const closeValue = result.candlestickSeries[lastIndex].close;

                    const rsiValue = result.rsi14Series && result.rsi14Series.length > 0
                        ? result.rsi14Series[result.rsi14Series.length - 1].value
                        : null;

                    const sma20Value = result.sma20Series && result.sma20Series.length > 0
                        ? result.sma20Series[result.sma20Series.length - 1].value
                        : null;

                    const sma50Value = result.sma50Series && result.sma50Series.length > 0
                        ? result.sma50Series[result.sma50Series.length - 1].value
                        : null;

                    const macdLineValue = result.macdLineSeries && result.macdLineSeries.length > 0
                        ? result.macdLineSeries[result.macdLineSeries.length - 1].value
                        : null;

                    const macdSignalValue = result.macdSignalSeries && result.macdSignalSeries.length > 0
                        ? result.macdSignalSeries[result.macdSignalSeries.length - 1].value
                        : null;

                    const volumeValue = result.histogramSeries && result.histogramSeries.length > 0
                        ? result.histogramSeries[result.histogramSeries.length - 1].value
                        : null;

                    // Note: We don't have volumeSma20 strictly forwarded in frontend as its own series line currently, 
                    // but we do have access to it from the raw technical string format or from the raw API model if it was added. 
                    // To keep it clean, we can calculate volumeSma20 on the frontend if needed, or rely on what is available.
                    // For now, let's calculate a rough 20-day SMA of volume on the frontend since we have the histogram array.
                    let volumeSma20Value = null;
                    if (result.histogramSeries && result.histogramSeries.length >= 20) {
                        const recentVols = result.histogramSeries.slice(-20).map((v: any) => v.value);
                        volumeSma20Value = recentVols.reduce((a: number, b: number) => a + b, 0) / 20;
                    }

                    const bbUpValue = result.bbUpperSeries && result.bbUpperSeries.length > 0
                        ? result.bbUpperSeries[result.bbUpperSeries.length - 1].value
                        : null;

                    const bbLowValue = result.bbLowerSeries && result.bbLowerSeries.length > 0
                        ? result.bbLowerSeries[result.bbLowerSeries.length - 1].value
                        : null;

                    setData({
                        close: closeValue,
                        rsi14: rsiValue,
                        sma20: sma20Value,
                        sma50: sma50Value,
                        macdLine: macdLineValue,
                        macdSignal: macdSignalValue,
                        volume: volumeValue,
                        volumeSma20: volumeSma20Value,
                        bbUp: bbUpValue,
                        bbLow: bbLowValue
                    });
                } else {
                    setError("Uygun veri bulunamadı.");
                }
            } catch (err: any) {
                if (active) setError(err.message);
            } finally {
                if (active) setLoading(false);
            }
        };

        fetchTechnicalData();

        return () => {
            active = false;
        };
    }, [ticker]);


    const generateInterpretations = () => {
        if (!data) return [];

        const insights = [];
        const { rsi14, sma20, sma50, close, macdLine, macdSignal, volume, volumeSma20, bbUp, bbLow } = data;

        // RSI Yorumu
        if (rsi14 !== null) {
            if (rsi14 > 70) {
                insights.push({
                    title: "Aşırı Alım",
                    desc: "Fiyat doygunluğa ulaşmış olabilir, kar satışı gelebilir.",
                    type: "negative",
                    icon: "⬇️"
                });
            } else if (rsi14 < 30) {
                insights.push({
                    title: "Aşırı Satım",
                    desc: "Fiyat dip seviyelerde, tepki alımı beklenebilir.",
                    type: "positive",
                    icon: "⬆️"
                });
            } else {
                insights.push({
                    title: "Nötr Bölge",
                    desc: "RSI normal seviyelerde seyrediyor.",
                    type: "neutral",
                    icon: "➡️"
                });
            }
        }

        // SMA Yorumları
        if (close !== null) {
            if (sma50 !== null) {
                if (close > sma50) {
                    insights.push({
                        title: "Yükselen Trend",
                        desc: "Fiyat uzun vadeli ortalamanın (SMA50) üzerinde seyrediyor.",
                        type: "positive",
                        icon: "⬆️"
                    });
                } else {
                    insights.push({
                        title: "Düşüş Eğilimi",
                        desc: "Fiyat uzun vadeli ortalamanın (SMA50) altında kaldı.",
                        type: "negative",
                        icon: "⬇️"
                    });
                }
            }

            if (sma20 !== null) {
                if (close < sma20) {
                    insights.push({
                        title: "Kısa Vadeli Baskı",
                        desc: "Satış baskısı devam ediyor (SMA20 altında).",
                        type: "negative",
                        icon: "⬇️"
                    });
                } else {
                    insights.push({
                        title: "Kısa Vadeli İvme",
                        desc: "Kısa vadeli hareketli ortalamanın (SMA20) üzerinde, ivme pozitif.",
                        type: "positive",
                        icon: "⬆️"
                    });
                }
            }
        }

        // MACD Yorumu
        if (macdLine !== null && macdSignal !== null) {
            if (macdLine > macdSignal) {
                insights.push({
                    title: "POZİTİF TREND",
                    desc: "MACD al sinyali üretiyor. (MACD > Sinyal)",
                    type: "positive",
                    icon: "📈"
                });
            } else {
                insights.push({
                    title: "NEGATİF TREND",
                    desc: "MACD sat sinyali üretti. (MACD < Sinyal)",
                    type: "negative",
                    icon: "📉"
                });
            }
        }

        // Hacim (Volume) Yorumu
        if (volume !== null && volumeSma20 !== null) {
            if (volume > volumeSma20) {
                insights.push({
                    title: "GÜÇLÜ HACİM",
                    desc: "Son gün hacmi ortalamanın üstünde. Hareket destekleniyor.",
                    type: "positive",
                    icon: "🔥"
                });
            } else {
                insights.push({
                    title: "ZAYIF HACİM",
                    desc: "Hareket zayıf hacimle gerçekleşiyor. Teyit eksikliği olabilir.",
                    type: "neutral",
                    icon: "🧊"
                });
            }
        }

        // Bollinger Bantları Yorumu
        if (close !== null && bbUp !== null && bbLow !== null) {
            const distanceFromUp = (bbUp - close) / close;
            const distanceFromLow = (close - bbLow) / close;

            if (distanceFromUp > 0 && distanceFromUp < 0.02) {
                insights.push({
                    title: "DİRENÇ BÖLGESİ",
                    desc: "Fiyat üst banda (%2) yakın, kâr satışı görülebilir.",
                    type: "negative",
                    icon: "⚠️"
                });
            } else if (distanceFromLow > 0 && distanceFromLow < 0.02) {
                insights.push({
                    title: "DESTEK BÖLGESİ",
                    desc: "Fiyat alt banda (%2) yakın, tepki yükselişi gelebilir.",
                    type: "positive",
                    icon: "🟢"
                });
            } else {
                insights.push({
                    title: "NORMAL VOLATİLİTE",
                    desc: "Fiyat bantların orta kanalında salınıyor.",
                    type: "neutral",
                    icon: "〰️"
                });
            }
        }

        return insights;
    };


    if (loading) {
        return (
            <div className="bg-neutral-900 ring-1 ring-white/10 rounded-2xl p-4 md:p-6 shadow-2xl animate-pulse flex justify-between gap-4 overflow-x-auto">
                <div className="flex-1 min-w-[200px] bg-neutral-800 rounded-lg p-3 h-20"></div>
                <div className="flex-1 min-w-[200px] bg-neutral-800 rounded-lg p-3 h-20"></div>
                <div className="flex-1 min-w-[200px] bg-neutral-800 rounded-lg p-3 h-20"></div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 shadow-2xl text-slate-400 text-sm flex items-center">
                Veriler yüklenemedi veya eksik.
            </div>
        );
    }

    const insights = generateInterpretations();

    return (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-teal-400 to-emerald-500 opacity-70"></div>

            <div className="p-4 md:p-6 text-white grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
                {insights.map((item, index) => {
                    const colorConfig = {
                        positive: "border-emerald-500/30 bg-emerald-950/20 group-hover:border-emerald-500",
                        negative: "border-red-500/30 bg-red-950/20 group-hover:border-red-500",
                        neutral: "border-slate-600/30 bg-slate-800/20 group-hover:border-slate-500",
                    }[item.type];

                    const titleColorConfig = {
                        positive: "text-emerald-400",
                        negative: "text-red-400",
                        neutral: "text-slate-300",
                    }[item.type];

                    return (
                        <div
                            key={index}
                            className={`flex1 w-full rounded-xl border p-4 transition-all duration-300 group ${colorConfig}`}
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-xl md:text-2xl">{item.icon}</span>
                                <h4 className={`font-bold tracking-wide uppercase text-sm ${titleColorConfig}`}>{item.title}</h4>
                            </div>
                            <p className="text-sm text-slate-400 leading-relaxed font-medium">
                                {item.desc}
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
