"use client";

import { useEffect, useState } from "react";

interface SimulationProps {
    ticker: string;
}

interface SimulationData {
    totalInvested: number;
    totalShares: number;
    currentValue: number;
    profitLossPercentage: number;
    error?: string;
}

export default function Simulation({ ticker }: SimulationProps) {
    const [data, setData] = useState<SimulationData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [amount, setAmount] = useState<number>(1000);
    const [months, setMonths] = useState<number>(6);

    const fetchSimulation = async (fetchAmount: number, fetchMonths: number) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`http://localhost:8000/api/simulation/${ticker}?amount=${fetchAmount}&months=${fetchMonths}`);
            if (!response.ok) {
                throw new Error("Simülasyon verisi alınamadı.");
            }
            const result = await response.json();

            if (result.error) {
                throw new Error(result.error);
            }

            setData(result);
        } catch (err: any) {
            setError(err.message || "Bir hata oluştu.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSimulation(amount, months);
    }, [ticker]);

    const handleCalculate = (e: React.FormEvent) => {
        e.preventDefault();
        fetchSimulation(amount, months);
    };

    if (loading && !data) {
        return (
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-xl relative overflow-hidden group">
                <div className="animate-pulse space-y-4">
                    <div className="h-6 bg-neutral-800 rounded w-1/2"></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="h-16 bg-neutral-800 rounded"></div>
                        <div className="h-16 bg-neutral-800 rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-xl text-red-400">
                Simülasyon Hatası: {error}
            </div>
        );
    }

    if (!data) return null;

    const isProfit = data.profitLossPercentage >= 0;
    const plColor = isProfit ? "text-emerald-400" : "text-rose-400";
    const plBg = isProfit ? "bg-emerald-400/10 border-emerald-500/20" : "bg-rose-400/10 border-rose-500/20";
    const plSign = isProfit ? "+" : "";

    return (
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-xl relative overflow-hidden group hover:border-emerald-500/50 transition-colors duration-500 h-full">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 via-teal-500 to-blue-600 opacity-70 group-hover:opacity-100 transition-opacity"></div>

            <div className="flex items-center space-x-3 mb-4">
                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-2 rounded-lg shadow-lg shadow-emerald-500/20">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h2 className="text-xl font-bold text-white tracking-wide">DCA Backtest Analizi</h2>
            </div>

            <form onSubmit={handleCalculate} className="grid grid-cols-5 gap-3 mb-6 bg-neutral-950/50 p-3 rounded-lg border border-neutral-800/80">
                <div className="col-span-2">
                    <label className="block text-xs font-medium text-neutral-400 mb-1">Aylık Tutar (TL)</label>
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(Number(e.target.value))}
                        className="w-full bg-neutral-900 border border-neutral-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors"
                        min="10"
                    />
                </div>
                <div className="col-span-2">
                    <label className="block text-xs font-medium text-neutral-400 mb-1">Süre (Ay)</label>
                    <input
                        type="number"
                        value={months}
                        onChange={(e) => setMonths(Number(e.target.value))}
                        className="w-full bg-neutral-900 border border-neutral-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors"
                        min="1"
                        max="240"
                    />
                </div>
                <div className="col-span-1 flex items-end">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-[38px] bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold rounded-md text-xs sm:text-sm transition-all shadow-lg shadow-emerald-900/40 disabled:opacity-50 flex items-center justify-center"
                    >
                        {loading ? '...' : 'Bul'}
                    </button>
                </div>
            </form>

            <div className={`grid grid-cols-2 gap-4 mb-4 transition-opacity duration-300 ${loading ? 'opacity-50' : 'opacity-100'}`}>
                <div className="bg-neutral-950 p-4 rounded-lg border border-neutral-800/50">
                    <p className="text-sm text-neutral-400 mb-1">Toplam Yatırım</p>
                    <p className="text-xl font-bold text-neutral-100">
                        {data.totalInvested.toLocaleString('tr-TR')} ₺
                    </p>
                </div>
                <div className="bg-neutral-950 p-4 rounded-lg border border-neutral-800/50">
                    <p className="text-sm text-neutral-400 mb-1">Güncel Değer</p>
                    <p className={`text-xl font-bold ${plColor}`}>
                        {data.currentValue.toLocaleString('tr-TR')} ₺
                    </p>
                </div>
            </div>

            <div className={`mt-2 p-3 rounded-lg border flex justify-between items-center transition-opacity duration-300 ${plBg} ${loading ? 'opacity-50' : 'opacity-100'}`}>
                <span className="text-sm font-medium">Toplam Getiri</span>
                <span className={`text-xl font-bold ${plColor}`}>
                    {plSign}{data.profitLossPercentage.toFixed(2)}%
                </span>
            </div>
            <div className={`mt-4 text-xs text-neutral-500 text-center transition-opacity duration-300 ${loading ? 'opacity-50' : 'opacity-100'}`}>
                *Geçmiş {months} ay boyunca her ayın ilk işlem günü o ayki fiyattan alım yapıldığı varsayılır. ({data.totalShares.toLocaleString('tr-TR')} Lot)
            </div>
        </div>
    );
}
