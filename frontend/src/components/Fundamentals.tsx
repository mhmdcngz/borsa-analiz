"use client";

import { useEffect, useState } from "react";

interface FundamentalsProps {
    ticker: string;
}

interface FundamentalData {
    trailingPE: number | string;
    priceToBook: number | string;
    marketCap: number | string;
    dividendYield: number | string;
    fiftyTwoWeekHigh: number | string;
    fiftyTwoWeekLow: number | string;
}

export default function Fundamentals({ ticker }: FundamentalsProps) {
    const [data, setData] = useState<FundamentalData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchFundamentals = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`http://localhost:8000/api/fundamentals/${ticker}`);
                if (!response.ok) {
                    throw new Error("Temel veriler alınamadı.");
                }
                const result = await response.json();
                setData(result);
            } catch (err: any) {
                setError(err.message || "Bir hata oluştu.");
            } finally {
                setLoading(false);
            }
        };

        fetchFundamentals();
    }, [ticker]);

    // Yardımcı formatlama fonksiyonları
    const formatNumber = (val: any) => {
        if (val === "N/A" || val === null || val === undefined) return "N/A";
        if (typeof val === 'number') {
            if (val >= 1e9) return (val / 1e9).toFixed(2) + " Mr ₺";
            if (val >= 1e6) return (val / 1e6).toFixed(2) + " Mn ₺";
            return val.toLocaleString('tr-TR', { maximumFractionDigits: 2 });
        }
        return val;
    };

    const formatPercent = (val: any) => {
        if (val === "N/A" || val === null || val === undefined) return "N/A";
        if (typeof val === 'number') return (val * 100).toFixed(2) + "%";
        return val;
    };

    if (loading) {
        return (
            <div className="bg-neutral-900 ring-1 ring-white/10 rounded-2xl p-4 md:p-6 shadow-2xl animate-pulse flex justify-between gap-4 overflow-x-auto">
                {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="flex-1 min-w-[120px] bg-neutral-800 rounded-lg p-3">
                        <div className="h-4 bg-neutral-700 rounded w-1/2 mb-2"></div>
                        <div className="h-6 bg-neutral-600 rounded w-3/4"></div>
                    </div>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-neutral-900 ring-1 ring-white/10 rounded-2xl p-4 shadow-2xl text-red-400">
                Temel veriler yüklenemedi: {error}
            </div>
        );
    }

    const items = [
        { label: "F/K Oranı", value: formatNumber(data?.trailingPE), numValue: data?.trailingPE },
        { label: "PD/DD", value: formatNumber(data?.priceToBook), numValue: data?.priceToBook },
        { label: "Piyasa Değeri", value: formatNumber(data?.marketCap), numValue: data?.marketCap },
        { label: "Temettü Verimi", value: formatPercent(data?.dividendYield), numValue: data?.dividendYield },
        { label: "52H Zirve", value: formatNumber(data?.fiftyTwoWeekHigh), numValue: data?.fiftyTwoWeekHigh },
        { label: "52H Dip", value: formatNumber(data?.fiftyTwoWeekLow), numValue: data?.fiftyTwoWeekLow },
    ];

    const getValueColor = (val: any) => {
        if (typeof val === 'number') {
            if (val > 0) return 'text-emerald-400';
            if (val < 0) return 'text-red-400';
        }
        return 'text-neutral-100';
    };

    return (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-teal-400 to-emerald-500 opacity-70"></div>

            {/* 3x2 veya 2x3 Grid yapısı, içeriden border-slate-800 ile ayrılmış */}
            <div className="text-white grid grid-cols-2 md:grid-cols-3 divide-y divide-x divide-slate-800 border-t border-slate-800 mt-4 md:mt-6">
                {items.map((item, index) => (
                    <div
                        key={index}
                        className="flex flex-col p-4 md:p-6 bg-neutral-950/50 hover:bg-neutral-800/50 transition-colors group cursor-default"
                    >
                        <span className="text-xs text-neutral-400 uppercase tracking-wider font-semibold mb-2 group-hover:text-teal-400/80 transition-colors">
                            {item.label}
                        </span>
                        <span className={`text-xl md:text-2xl font-black ${getValueColor(item.numValue)}`}>
                            {item.value}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
