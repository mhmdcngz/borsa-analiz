"use client";

import { useState, useRef, useEffect } from 'react';
import Chart from '@/components/Chart';
import NewsAnalysis from '@/components/NewsAnalysis';
import Fundamentals from '@/components/Fundamentals';
import Simulation from '@/components/Simulation';
import { STOCK_LIST } from '@/data/stocks';

export default function Home() {
  const [ticker, setTicker] = useState("THYAO.IS");
  const [searchInput, setSearchInput] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredStocks = STOCK_LIST.filter(stock =>
    stock.code.toLowerCase().includes(searchInput.toLowerCase()) ||
    stock.name.toLowerCase().includes(searchInput.toLowerCase())
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      let val = searchInput.trim().toUpperCase();
      if (!val.includes('.')) {
        val = val + '.IS';
      }
      setTicker(val);
      setShowDropdown(false);
    }
  };

  const selectStock = (stock: typeof STOCK_LIST[0]) => {
    setTicker(stock.symbol);
    setSearchInput(stock.code);
    setShowDropdown(false);
  };

  return (
    <main className="min-h-screen bg-neutral-950 p-6 md:p-12 text-neutral-50 flex justify-center">
      <div className="w-full max-w-6xl">
        <header className="mb-12 text-center flex flex-col items-center">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-teal-400 via-indigo-500 to-purple-600 bg-clip-text text-transparent mb-4">
            Borsa Analiz Paneli
          </h1>
          <p className="text-neutral-400 text-lg md:text-xl font-medium mb-8">
            {ticker} - Hisse Analiz Raporu
          </p>

          <div className="w-full max-w-2xl relative" ref={dropdownRef}>
            <form onSubmit={handleSearch} className="flex relative items-center w-full z-20">
              <input
                type="text"
                placeholder="Hisse Kodu veya Şirket Adı Ara (Örn: ASELS, Apple)"
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                className="bg-neutral-900 border-2 border-neutral-700 text-white text-lg rounded-l-xl focus:ring-0 focus:border-teal-500 block w-full p-4 px-6 outline-none transition-colors shadow-2xl placeholder-neutral-500"
              />
              <button
                type="submit"
                className="bg-teal-600 hover:bg-teal-500 text-white font-bold text-lg rounded-r-xl px-8 py-4 transition-colors flex items-center justify-center border-2 border-teal-600 hover:border-teal-500 shadow-2xl"
              >
                <svg className="w-6 h-6 md:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className="hidden md:inline">Ara</span>
              </button>
            </form>

            {/* Dropdown Menu */}
            {showDropdown && searchInput.trim() !== "" && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl z-30 max-h-60 overflow-y-auto custom-scrollbar text-left text-base">
                {filteredStocks.length > 0 ? (
                  <ul className="py-2">
                    {filteredStocks.map((stock, idx) => (
                      <li
                        key={idx}
                        onClick={() => selectStock(stock)}
                        className="px-6 py-3 hover:bg-neutral-800 cursor-pointer flex justify-between items-center transition-colors border-b border-neutral-800/50 last:border-0"
                      >
                        <span className="font-bold text-teal-400">{stock.code}</span>
                        <span className="text-sm text-neutral-400">{stock.name}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="px-6 py-4 text-neutral-500 text-center">
                    Girdiğiniz hisse kodu listede yok. Aramak için "Enter"a basın.
                  </div>
                )}
              </div>
            )}
          </div>
        </header>

        <section className="mb-6 border-b border-neutral-800 pb-2">
          <Fundamentals ticker={ticker} />
        </section>

        <section className="bg-neutral-900 ring-1 ring-white/10 rounded-2xl p-2 md:p-4 shadow-2xl mb-8">
          <Chart ticker={ticker} />
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-full">
            <NewsAnalysis ticker={ticker} />
          </div>
          <div className="h-full">
            <Simulation ticker={ticker} />
          </div>
        </section>
      </div>
    </main>
  );
}
