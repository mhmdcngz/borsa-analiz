'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, CandlestickSeries, HistogramSeries, LineSeries } from 'lightweight-charts';

export default function Chart({ ticker }: { ticker: string }) {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<any>(null);

    // Seri referanslarını tutalım (useEffect içerisinde applyOptions kullanabilmek için)
    const seriesRefs = useRef<{
        sma20: any;
        sma50: any;
        bbUp: any;
        bbLow: any;
        rsi: any;
        macdLine: any;
        macdSignal: any;
        macdHist: any;
        volume: any;
    }>({
        sma20: null,
        sma50: null,
        bbUp: null,
        bbLow: null,
        rsi: null,
        macdLine: null,
        macdSignal: null,
        macdHist: null,
        volume: null,
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Görünürlük State'leri
    const [showSMA, setShowSMA] = useState(true);
    const [showBB, setShowBB] = useState(true);
    const [showRSI, setShowRSI] = useState(true);
    const [showMACD, setShowMACD] = useState(true);
    const [showVolume, setShowVolume] = useState(true);

    const [legendData, setLegendData] = useState<{
        time: string;
        open: string;
        high: string;
        low: string;
        close: string;
        rsi: string | null;
        macdLine: string | null;
        macdSignal: string | null;
        macdHist: string | null;
        volume: string | null;
        bbUp: string | null;
        bbLow: string | null;
        sma20: string | null;
        sma50: string | null;
    } | null>(null);

    useEffect(() => {
        let active = true;

        const fetchDataAndDraw = async () => {
            setLoading(true);
            setError(null);

            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://algobist.onrender.com";
                const res = await fetch(`${apiUrl}/api/stock/${ticker}`);
                if (!res.ok) throw new Error('Veri çekilemedi. Lütfen hisse kodunu kontrol edin.');

                const data = await res.json();
                if (!active) return;
                if (!chartContainerRef.current) return;

                // 🛑 ÖNEMLİ DÜZELTME 1: Varsa eski grafiği temizle ve REFERANSI SIFIRLA
                if (chartRef.current) {
                    chartRef.current.remove();
                    chartRef.current = null;
                }

                // 1. Grafik Özellikleri (Slate Teması)
                const chart = createChart(chartContainerRef.current, {
                    layout: {
                        background: { type: ColorType.Solid, color: '#0f172a' },
                        textColor: '#94a3b8',
                    },
                    grid: {
                        vertLines: { color: '#1e293b' },
                        horzLines: { color: '#1e293b' },
                    },
                    rightPriceScale: {
                        scaleMargins: {
                            top: 0.1,
                            bottom: 0.2, // Üst panelin ana ölçeği, alt %20'sini boş bırakır
                        },
                    },
                    width: chartContainerRef.current.clientWidth,
                    height: 600,
                });
                chartRef.current = chart;

                // 2. Mum Grafiği Ekle
                const candlestickSeries = chart.addSeries(CandlestickSeries, {
                    upColor: '#26a69a', // Neon yeşil
                    downColor: '#ef5350', // Neon kırmızı
                    borderVisible: false,
                    wickUpColor: '#26a69a',
                    wickDownColor: '#ef5350',
                });
                candlestickSeries.setData(data.candlestickSeries);

                // 3. Hacim Grafiği Ekle
                const volumeSeries = chart.addSeries(HistogramSeries, {
                    priceFormat: {
                        type: 'volume',
                    },
                    priceScaleId: 'volume',
                    pane: 0
                } as any);

                volumeSeries.priceScale().applyOptions({
                    scaleMargins: {
                        top: 0.80,
                        bottom: 0, // Ana panelin hemen altında
                    },
                });
                volumeSeries.setData(data.histogramSeries);
                seriesRefs.current.volume = volumeSeries;

                // 4. SMA_20 ve SMA_50 Ekle
                let sma20: any = null;
                if (data.sma20Series && data.sma20Series.length > 0) {
                    sma20 = chart.addSeries(LineSeries, {
                        color: 'rgba(41, 98, 255, 1)', // Mavi
                        lineWidth: 2,
                        crosshairMarkerVisible: false,
                        priceLineVisible: false,
                        visible: showSMA,
                    });
                    sma20.setData(data.sma20Series);
                    seriesRefs.current.sma20 = sma20;
                }

                let sma50: any = null;
                if (data.sma50Series && data.sma50Series.length > 0) {
                    sma50 = chart.addSeries(LineSeries, {
                        color: 'rgba(255, 152, 0, 1)', // Turuncu
                        lineWidth: 2,
                        crosshairMarkerVisible: false,
                        priceLineVisible: false,
                        visible: showSMA,
                    });
                    sma50.setData(data.sma50Series);
                    seriesRefs.current.sma50 = sma50;
                }

                // 5. Bollinger Bantları (Üst ve Alt) Ekle
                let bbUp: any = null;
                let bbLow: any = null;
                if (data.bbUpperSeries && data.bbUpperSeries.length > 0) {
                    bbUp = chart.addSeries(LineSeries, {
                        color: 'rgba(200, 200, 200, 0.4)', // Açık gri/beyaz, yarı saydam
                        lineWidth: 1,
                        lineStyle: 3, // Dashed
                        crosshairMarkerVisible: false,
                        priceLineVisible: false,
                        autoscaleInfoProvider: () => null,
                        visible: showBB,
                    });
                    bbUp.setData(data.bbUpperSeries);
                    seriesRefs.current.bbUp = bbUp;
                }
                if (data.bbLowerSeries && data.bbLowerSeries.length > 0) {
                    bbLow = chart.addSeries(LineSeries, {
                        color: 'rgba(200, 200, 200, 0.4)', // Açık gri/beyaz, yarı saydam
                        lineWidth: 1,
                        lineStyle: 3, // Dashed
                        crosshairMarkerVisible: false,
                        priceLineVisible: false,
                        autoscaleInfoProvider: () => null,
                        visible: showBB,
                    });
                    bbLow.setData(data.bbLowerSeries);
                    seriesRefs.current.bbLow = bbLow;
                }

                // 6. Alt Panel: RSI (14)
                let rsiSeriesLine: any = null;
                if (data.rsi14Series && data.rsi14Series.length > 0) {
                    rsiSeriesLine = chart.addSeries(LineSeries, {
                        color: '#E040FB', // Mor
                        lineWidth: 2,
                        priceScaleId: 'rsi', // RSI için özel eksen ID'si
                        pane: 1, // Pane 1 (RSI Paneli)
                        priceLineVisible: false,
                        visible: showRSI,
                    } as any);

                    // RSI için özel Price Scale ayarı (referans üzerinden doğrudan)
                    chart.priceScale('rsi').applyOptions({
                        scaleMargins: {
                            top: 0.1,
                            bottom: 0.1, // Alt ve üstten 0.1 boşluk
                        },
                        textColor: '#E040FB', // Sağ eksen etiketinin rengi
                    });

                    rsiSeriesLine.setData(data.rsi14Series);
                    seriesRefs.current.rsi = rsiSeriesLine;

                    // RSI için 70 (Aşırı Alım) ve 30 (Aşırı Satım) PriceLine ları
                    rsiSeriesLine.createPriceLine({
                        price: 70,
                        color: 'rgba(239, 83, 80, 0.5)', // Kırmızımsı
                        lineWidth: 1,
                        lineStyle: 3, // Dashed
                        axisLabelVisible: true,
                        title: 'Aşırı Alım',
                    });
                    rsiSeriesLine.createPriceLine({
                        price: 30,
                        color: 'rgba(38, 166, 154, 0.5)', // Yeşilimsi
                        lineWidth: 1,
                        lineStyle: 3, // Dashed
                        axisLabelVisible: true,
                        title: 'Aşırı Satım',
                    });
                }

                // 7. Alt Panel 2: MACD
                let macdLineSeries: any = null;
                let macdSignalSeries: any = null;
                let macdHistSeries: any = null;

                if (data.macdLineSeries && data.macdLineSeries.length > 0) {
                    macdHistSeries = chart.addSeries(HistogramSeries, {
                        priceScaleId: 'macd',
                        pane: 2,
                        visible: showMACD,
                    } as any);

                    macdLineSeries = chart.addSeries(LineSeries, {
                        color: '#2962FF', // Mavi
                        lineWidth: 2,
                        priceScaleId: 'macd',
                        pane: 2,
                        priceLineVisible: false,
                        visible: showMACD,
                    } as any);

                    macdSignalSeries = chart.addSeries(LineSeries, {
                        color: '#FF6D00', // Turuncu
                        lineWidth: 2,
                        priceScaleId: 'macd',
                        pane: 2,
                        priceLineVisible: false,
                        visible: showMACD,
                    } as any);

                    chart.priceScale('macd').applyOptions({
                        scaleMargins: {
                            top: 0.1,
                            bottom: 0.1,
                        },
                    });

                    macdHistSeries.setData(data.macdHistSeries);
                    macdLineSeries.setData(data.macdLineSeries);
                    macdSignalSeries.setData(data.macdSignalSeries);

                    seriesRefs.current.macdLine = macdLineSeries;
                    seriesRefs.current.macdSignal = macdSignalSeries;
                    seriesRefs.current.macdHist = macdHistSeries;
                }

                // Crosshair olayını dinle (Fare takibi)
                chart.subscribeCrosshairMove((param) => {
                    if (
                        param.point === undefined ||
                        !param.time ||
                        param.point.x < 0 ||
                        param.point.x > chartContainerRef.current!.clientWidth ||
                        param.point.y < 0 ||
                        param.point.y > chartContainerRef.current!.clientHeight
                    ) {
                        // Fare grafik dışında, son veriyi göster
                        const lastData = data.candlestickSeries[data.candlestickSeries.length - 1];
                        const lastVolume = data.histogramSeries ? data.histogramSeries[data.histogramSeries.length - 1]?.value : null;
                        const lastRsi = data.rsi14Series ? data.rsi14Series[data.rsi14Series.length - 1]?.value?.toFixed(2) : null;
                        const lastMacdLine = data.macdLineSeries ? data.macdLineSeries[data.macdLineSeries.length - 1]?.value?.toFixed(2) : null;
                        const lastMacdSignal = data.macdSignalSeries ? data.macdSignalSeries[data.macdSignalSeries.length - 1]?.value?.toFixed(2) : null;
                        const lastMacdHist = data.macdHistSeries ? data.macdHistSeries[data.macdHistSeries.length - 1]?.value?.toFixed(2) : null;
                        const lastBbUp = data.bbUpperSeries ? data.bbUpperSeries[data.bbUpperSeries.length - 1]?.value?.toFixed(2) : null;
                        const lastBbLow = data.bbLowerSeries ? data.bbLowerSeries[data.bbLowerSeries.length - 1]?.value?.toFixed(2) : null;
                        const lastSma20 = data.sma20Series ? data.sma20Series[data.sma20Series.length - 1]?.value?.toFixed(2) : null;
                        const lastSma50 = data.sma50Series ? data.sma50Series[data.sma50Series.length - 1]?.value?.toFixed(2) : null;

                        // Utility to format millions
                        const formatVolume = (vol: number | null) => {
                            if (vol === null) return 'N/A';
                            if (vol >= 1000000) return (vol / 1000000).toFixed(2) + 'M';
                            if (vol >= 1000) return (vol / 1000).toFixed(2) + 'K';
                            return vol.toString();
                        };

                        setLegendData({
                            time: lastData.time,
                            open: lastData.open.toFixed(2),
                            high: lastData.high.toFixed(2),
                            low: lastData.low.toFixed(2),
                            close: lastData.close.toFixed(2),
                            volume: formatVolume(lastVolume),
                            rsi: lastRsi,
                            macdLine: lastMacdLine,
                            macdSignal: lastMacdSignal,
                            macdHist: lastMacdHist,
                            bbUp: lastBbUp,
                            bbLow: lastBbLow,
                            sma20: lastSma20,
                            sma50: lastSma50,
                        });
                    } else {
                        // Fare mumun üzerinde
                        const dataAtTime = param.seriesData.get(candlestickSeries) as any;
                        const volData = (volumeSeries && param.logical !== null && param.logical !== undefined)
                            ? volumeSeries.dataByIndex(param.logical) as any
                            : null;
                        const rsiData = (rsiSeriesLine && param.logical !== null && param.logical !== undefined)
                            ? rsiSeriesLine.dataByIndex(param.logical) as any
                            : null;
                        const macdLineData = (macdLineSeries && param.logical !== null && param.logical !== undefined)
                            ? macdLineSeries.dataByIndex(param.logical) as any
                            : null;
                        const macdSignalData = (macdSignalSeries && param.logical !== null && param.logical !== undefined)
                            ? macdSignalSeries.dataByIndex(param.logical) as any
                            : null;
                        const macdHistData = (macdHistSeries && param.logical !== null && param.logical !== undefined)
                            ? macdHistSeries.dataByIndex(param.logical) as any
                            : null;

                        const bbUpData = bbUp ? param.seriesData.get(bbUp) as any : null;
                        const bbLowData = bbLow ? param.seriesData.get(bbLow) as any : null;
                        const sma20Data = sma20 ? param.seriesData.get(sma20) as any : null;
                        const sma50Data = sma50 ? param.seriesData.get(sma50) as any : null;

                        // Utility to format millions
                        const formatVolume = (vol: number | null) => {
                            if (vol === null || vol === undefined) return 'N/A';
                            if (vol >= 1000000) return (vol / 1000000).toFixed(2) + 'M';
                            if (vol >= 1000) return (vol / 1000).toFixed(2) + 'K';
                            return vol.toString();
                        };

                        if (dataAtTime) {
                            setLegendData({
                                time: dataAtTime.time,
                                open: dataAtTime.open.toFixed(2),
                                high: dataAtTime.high.toFixed(2),
                                low: dataAtTime.low.toFixed(2),
                                close: dataAtTime.close.toFixed(2),
                                volume: formatVolume(volData?.value),
                                rsi: rsiData ? rsiData.value?.toFixed(2) : null,
                                macdLine: macdLineData ? macdLineData.value?.toFixed(2) : null,
                                macdSignal: macdSignalData ? macdSignalData.value?.toFixed(2) : null,
                                macdHist: macdHistData ? macdHistData.value?.toFixed(2) : null,
                                bbUp: bbUpData ? bbUpData.value?.toFixed(2) : null,
                                bbLow: bbLowData ? bbLowData.value?.toFixed(2) : null,
                                sma20: sma20Data ? sma20Data.value?.toFixed(2) : null,
                                sma50: sma50Data ? sma50Data.value?.toFixed(2) : null,
                            });
                        }
                    }
                });

                // İlk yüklemede en son veriyi legenda ata
                const lastDataInit = data.candlestickSeries[data.candlestickSeries.length - 1];
                const lastVolumeInit = data.histogramSeries ? data.histogramSeries[data.histogramSeries.length - 1]?.value : null;
                const lastRsiInit = data.rsi14Series ? data.rsi14Series[data.rsi14Series.length - 1]?.value?.toFixed(2) : null;
                const lastMacdLineInit = data.macdLineSeries ? data.macdLineSeries[data.macdLineSeries.length - 1]?.value?.toFixed(2) : null;
                const lastMacdSignalInit = data.macdSignalSeries ? data.macdSignalSeries[data.macdSignalSeries.length - 1]?.value?.toFixed(2) : null;
                const lastMacdHistInit = data.macdHistSeries ? data.macdHistSeries[data.macdHistSeries.length - 1]?.value?.toFixed(2) : null;
                const lastBbUpInit = data.bbUpperSeries ? data.bbUpperSeries[data.bbUpperSeries.length - 1]?.value?.toFixed(2) : null;
                const lastBbLowInit = data.bbLowerSeries ? data.bbLowerSeries[data.bbLowerSeries.length - 1]?.value?.toFixed(2) : null;
                const lastSma20Init = data.sma20Series ? data.sma20Series[data.sma20Series.length - 1]?.value?.toFixed(2) : null;
                const lastSma50Init = data.sma50Series ? data.sma50Series[data.sma50Series.length - 1]?.value?.toFixed(2) : null;

                const formatVolumeInit = (vol: number | null) => {
                    if (vol === null) return 'N/A';
                    if (vol >= 1000000) return (vol / 1000000).toFixed(2) + 'M';
                    if (vol >= 1000) return (vol / 1000).toFixed(2) + 'K';
                    return vol.toString();
                };

                setLegendData({
                    time: lastDataInit.time,
                    open: lastDataInit.open.toFixed(2),
                    high: lastDataInit.high.toFixed(2),
                    low: lastDataInit.low.toFixed(2),
                    close: lastDataInit.close.toFixed(2),
                    volume: formatVolumeInit(lastVolumeInit),
                    rsi: lastRsiInit,
                    macdLine: lastMacdLineInit,
                    macdSignal: lastMacdSignalInit,
                    macdHist: lastMacdHistInit,
                    bbUp: lastBbUpInit,
                    bbLow: lastBbLowInit,
                    sma20: lastSma20Init,
                    sma50: lastSma50Init,
                });

                // Zaman Çizelgesine tam sığdır
                chart.timeScale().fitContent();

            } catch (err: any) {
                if (active) setError(err.message);
            } finally {
                if (active) setLoading(false);
            }
        };

        fetchDataAndDraw();

        // Ekran boyutu değişince otomatik boyutlandırma (Responsive)
        const handleResize = () => {
            if (chartContainerRef.current && chartRef.current) {
                chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
            }
        };

        window.addEventListener('resize', handleResize);

        return () => {
            active = false;
            window.removeEventListener('resize', handleResize);
            // 🛑 ÖNEMLİ DÜZELTME 2: Component ekrandan kalkınca REFERANSI SIFIRLA
            if (chartRef.current) {
                chartRef.current.remove();
                chartRef.current = null;
            }
        };
    }, [ticker]); // showSMA, showBB vs buraya YOK, bunlar re-fetch tetiklemesin.

    // Effect for handling visibility toggles
    useEffect(() => {
        if (!chartRef.current) return;

        if (seriesRefs.current.sma20) seriesRefs.current.sma20.applyOptions({ visible: showSMA });
        if (seriesRefs.current.sma50) seriesRefs.current.sma50.applyOptions({ visible: showSMA });
        if (seriesRefs.current.bbUp) seriesRefs.current.bbUp.applyOptions({ visible: showBB });
        if (seriesRefs.current.bbLow) seriesRefs.current.bbLow.applyOptions({ visible: showBB });
        if (seriesRefs.current.rsi) seriesRefs.current.rsi.applyOptions({ visible: showRSI });
        if (seriesRefs.current.macdLine) seriesRefs.current.macdLine.applyOptions({ visible: showMACD });
        if (seriesRefs.current.macdSignal) seriesRefs.current.macdSignal.applyOptions({ visible: showMACD });
        if (seriesRefs.current.macdHist) seriesRefs.current.macdHist.applyOptions({ visible: showMACD });
        if (seriesRefs.current.volume) seriesRefs.current.volume.applyOptions({ visible: showVolume });

    }, [showSMA, showBB, showRSI, showMACD, showVolume]);

    // UI helper for active toggle class
    const toggleClass = (isActive: boolean) =>
        isActive
            ? "px-3 py-1 text-xs font-semibold rounded-md border transition-all duration-200 bg-teal-500/20 text-teal-400 border-teal-500/50 hover:bg-teal-500/30"
            : "px-3 py-1 text-xs font-semibold rounded-md border transition-all duration-200 bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700";

    return (
        <div className="flex flex-col">
            {/* Control Panel (Toggles) */}
            <div className="flex flex-wrap gap-2 mb-4">
                <button onClick={() => setShowSMA(!showSMA)} className={toggleClass(showSMA)}>
                    SMA (20,50)
                </button>
                <button onClick={() => setShowBB(!showBB)} className={toggleClass(showBB)}>
                    Bollinger Bantları
                </button>
                <button onClick={() => setShowVolume(!showVolume)} className={toggleClass(showVolume)}>
                    Hacim (Volume)
                </button>
                <button onClick={() => setShowRSI(!showRSI)} className={toggleClass(showRSI)}>
                    RSI (14)
                </button>
                <button onClick={() => setShowMACD(!showMACD)} className={toggleClass(showMACD)}>
                    MACD (12,26,9)
                </button>
            </div>

            <div className="w-full relative shadow-lg rounded-xl overflow-hidden border border-neutral-800 bg-[#131722] min-h-[600px]">
                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center text-teal-400 bg-[#131722] z-10 bg-opacity-90 font-semibold tracking-widest">
                        VERİLER YÜKLENİYOR...
                    </div>
                )}

                {error && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-red-500 bg-[#131722] z-10 font-medium px-4 text-center">
                        <span className="text-3xl mb-2">⚠️</span>
                        <span>HATA: {error}</span>
                    </div>
                )}

                {/* OHLC Legend Kutusu */}
                {!loading && !error && legendData && (
                    <div className="absolute top-4 left-4 z-20 bg-[#0f172a]/90 backdrop-blur-md border border-slate-700/50 rounded-lg p-3 text-sm shadow-2xl pointer-events-none font-mono">
                        <div className="text-emerald-400 font-bold mb-2 border-b border-slate-700 pb-1">{legendData.time}</div>
                        <div className="flex flex-col space-y-1 text-xs">
                            <div className="flex space-x-3 text-slate-300">
                                <span>A: <span className="text-white">{legendData.open}</span></span>
                                <span>Y: <span className="text-white">{legendData.high}</span></span>
                                <span>D: <span className="text-white">{legendData.low}</span></span>
                                <span>K: <span className="text-white">{legendData.close}</span></span>
                            </div>
                            <div className="flex space-x-3 mt-1 pt-1 border-t border-slate-700/50">
                                <span className="text-blue-500">SMA(20): <span className="text-white">{legendData.sma20 || 'N/A'}</span></span>
                                <span className="text-orange-500">SMA(50): <span className="text-white">{legendData.sma50 || 'N/A'}</span></span>
                            </div>
                            <div className="flex space-x-3 mt-1">
                                <span className="text-slate-400">BB Üst: <span className="text-white">{legendData.bbUp || 'N/A'}</span></span>
                                <span className="text-slate-400">BB Alt: <span className="text-white">{legendData.bbLow || 'N/A'}</span></span>
                            </div>
                            <div className="flex space-x-3 mt-1 pt-1 border-t border-slate-700/50">
                                <span className="text-[#E040FB]">RSI(14): <span className="text-white font-bold">{legendData.rsi || 'N/A'}</span></span>
                                <span className="text-[#26a69a]">VOL: <span className="text-white">{legendData.volume || 'N/A'}</span></span>
                            </div>
                            <div className="flex space-x-3 mt-1 pt-1 border-t border-slate-700/50">
                                <span className="text-slate-400">MACD(12,26): <span className="text-[#2962FF] font-bold">{legendData.macdLine || 'N/A'}</span></span>
                                <span className="text-slate-400">SinyaL(9): <span className="text-[#FF6D00] font-bold">{legendData.macdSignal || 'N/A'}</span></span>
                                <span className="text-slate-400">Hist: <span className={Number(legendData.macdHist) >= 0 ? 'text-[#26a69a]' : 'text-[#ef5350]'}>{legendData.macdHist || 'N/A'}</span></span>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={chartContainerRef} className="w-full" />
            </div>
        </div>
    );
}