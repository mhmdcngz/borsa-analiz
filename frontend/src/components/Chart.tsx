'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, CandlestickSeries, HistogramSeries, LineSeries } from 'lightweight-charts';

export default function Chart({ ticker }: { ticker: string }) {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [legendData, setLegendData] = useState<{
        time: string;
        open: string;
        high: string;
        low: string;
        close: string;
    } | null>(null);

    useEffect(() => {
        let active = true;

        const fetchDataAndDraw = async () => {
            setLoading(true);
            setError(null);

            try {
                const res = await fetch(`http://127.0.0.1:8000/api/stock/${ticker}`);
                if (!res.ok) throw new Error('Veri çekilemedi. Lütfen hisse kodunu kontrol edin.');

                const data = await res.json();
                if (!active) return;
                if (!chartContainerRef.current) return;

                // 🛑 ÖNEMLİ DÜZELTME 1: Varsa eski grafiği temizle ve REFERANSI SIFIRLA
                if (chartRef.current) {
                    chartRef.current.remove();
                    chartRef.current = null;
                }

                // 1. Grafik Özellikleri (Koyu Tema)
                const chart = createChart(chartContainerRef.current, {
                    layout: {
                        background: { type: ColorType.Solid, color: '#131722' },
                        textColor: '#d1d4dc',
                    },
                    grid: {
                        vertLines: { color: '#2B2B43' },
                        horzLines: { color: '#2B2B43' },
                    },
                    width: chartContainerRef.current.clientWidth,
                    height: 600,
                });
                chartRef.current = chart;

                // 2. Mum Grafiği Ekle
                const candlestickSeries = chart.addSeries(CandlestickSeries, {
                    upColor: '#26a69a',
                    downColor: '#ef5350',
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
                    priceScaleId: '',
                });

                volumeSeries.priceScale().applyOptions({
                    scaleMargins: {
                        top: 0.8,
                        bottom: 0,
                    },
                });
                volumeSeries.setData(data.histogramSeries);

                // 4. SMA_20 ve SMA_50 Ekle
                if (data.sma20Series && data.sma20Series.length > 0) {
                    const sma20 = chart.addSeries(LineSeries, {
                        color: 'rgba(41, 98, 255, 1)', // Mavi
                        lineWidth: 3,
                        crosshairMarkerVisible: false,
                        priceLineVisible: false,
                    });
                    sma20.setData(data.sma20Series);
                }

                if (data.sma50Series && data.sma50Series.length > 0) {
                    const sma50 = chart.addSeries(LineSeries, {
                        color: 'rgba(255, 152, 0, 1)', // Turuncu
                        lineWidth: 3,
                        crosshairMarkerVisible: false,
                        priceLineVisible: false,
                    });
                    sma50.setData(data.sma50Series);
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
                        setLegendData({
                            time: lastData.time,
                            open: lastData.open.toFixed(2),
                            high: lastData.high.toFixed(2),
                            low: lastData.low.toFixed(2),
                            close: lastData.close.toFixed(2),
                        });
                    } else {
                        // Fare mumun üzerinde
                        const dataAtTime = param.seriesData.get(candlestickSeries) as any;
                        if (dataAtTime) {
                            setLegendData({
                                time: dataAtTime.time,
                                open: dataAtTime.open.toFixed(2),
                                high: dataAtTime.high.toFixed(2),
                                low: dataAtTime.low.toFixed(2),
                                close: dataAtTime.close.toFixed(2),
                            });
                        }
                    }
                });

                // İlk yüklemede en son veriyi legenda ata
                const lastDataInit = data.candlestickSeries[data.candlestickSeries.length - 1];
                setLegendData({
                    time: lastDataInit.time,
                    open: lastDataInit.open.toFixed(2),
                    high: lastDataInit.high.toFixed(2),
                    low: lastDataInit.low.toFixed(2),
                    close: lastDataInit.close.toFixed(2),
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
    }, [ticker]);

    return (
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
                <div className="absolute top-4 left-4 z-20 bg-neutral-900/80 backdrop-blur-md border border-neutral-700/50 rounded-lg p-3 text-sm font-medium shadow-2xl space-y-1 pointer-events-none">
                    <div className="text-teal-400 font-bold mb-1 border-b border-neutral-700 pb-1">{legendData.time}</div>
                    <div className="flex space-x-4 text-neutral-300">
                        <span>A: <span className="text-white">{legendData.open}</span></span>
                        <span>Y: <span className="text-white">{legendData.high}</span></span>
                        <span>D: <span className="text-white">{legendData.low}</span></span>
                        <span>K: <span className="text-white">{legendData.close}</span></span>
                    </div>
                    <div className="flex space-x-4 text-xs mt-1 pt-1 border-t border-neutral-700/50">
                        <span className="text-blue-500">── SMA(20)</span>
                        <span className="text-orange-500">── SMA(50)</span>
                    </div>
                </div>
            )}

            <div ref={chartContainerRef} className="w-full" />
        </div>
    );
}