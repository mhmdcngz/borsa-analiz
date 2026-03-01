'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, CandlestickSeries, HistogramSeries } from 'lightweight-charts';

export default function Chart({ ticker }: { ticker: string }) {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let active = true;

        const fetchDataAndDraw = async () => {
            setLoading(true);
            setError(null);

            try {
                // Doğrudan Python FastAPI Backend'ine istek atılıyor (CORS ayarlı olmalı)
                const res = await fetch(`http://127.0.0.1:8000/api/stock/${ticker}`);
                if (!res.ok) throw new Error('Veri çekilemedi. Python FastAPI servisinin (http://127.0.0.1:8000) çalıştığından emin olun.');

                const data = await res.json();
                if (!active) return;

                if (!chartContainerRef.current) return;

                // Varsa eski grafiği temizle (React strict mode için)
                if (chartRef.current) chartRef.current.remove();

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
                    priceScaleId: '', // Hacim barlarını grafiğin en altına hizalamak için boş bırak
                });

                volumeSeries.priceScale().applyOptions({
                    scaleMargins: {
                        top: 0.8, // Ekranın alt %20'lik kısmına sığdırır
                        bottom: 0,
                    },
                });
                volumeSeries.setData(data.histogramSeries);

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
            if (chartRef.current) chartRef.current.remove();
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

            <div ref={chartContainerRef} className="w-full" />
        </div>
    );
}
