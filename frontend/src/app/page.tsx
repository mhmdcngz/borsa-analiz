"use client";

import { useState, useRef, useEffect } from 'react';
import Chart from '@/components/Chart';
import NewsAnalysis from '@/components/NewsAnalysis';
import Fundamentals from '@/components/Fundamentals';
import Simulation from '@/components/Simulation';
import TechnicalSummary from '@/components/TechnicalSummary';
import { STOCK_LIST } from '@/data/stocks';

export default function Home() {
  const [ticker, setTicker] = useState("THYAO.IS");
  const [searchInput, setSearchInput] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Sadece client tarafında (tarayıcıda) çalışması için localStorage kontrolü
    const isAccepted = localStorage.getItem('disclaimerAccepted');
    if (!isAccepted) {
      setShowDisclaimer(true);
    }
  }, []);

  const handleAcceptDisclaimer = () => {
    localStorage.setItem('disclaimerAccepted', 'true');
    setShowDisclaimer(false);
  };

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
    <main className="min-h-screen bg-[#0a0a0a] text-slate-300 font-sans pb-10 relative">

      {/* Yasal Uyarı Modalı */}
      {showDisclaimer && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-xl w-full p-6 md:p-8 flex flex-col gap-4">
            <h2 className="text-xl md:text-2xl font-bold text-amber-500 uppercase tracking-wider flex items-center gap-2">
              <span>⚠️</span> AlgoBIST'e Hoş Geldiniz
            </h2>
            <p className="text-sm md:text-base text-slate-300 leading-relaxed font-medium">
              Burada yer alan yatırım bilgi, yorum ve tavsiyeleri yatırım danışmanlığı kapsamında değildir. Yatırım danışmanlığı hizmeti; aracı kurumlar, portföy yönetim şirketleri, mevduat kabul etmeyen bankalar ile müşteri arasında imzalanacak yatırım danışmanlığı sözleşmesi çerçevesinde sunulmaktadır. Burada yer alan yorum ve tavsiyeler, yorum ve tavsiyede bulunanların kişisel görüşlerine dayanmaktadır. Bu görüşler mali durumunuz ile risk ve getiri tercihlerinize uygun olmayabilir. Bu nedenle, sadece burada yer alan bilgilere dayanılarak yatırım kararı verilmesi beklentilerinize uygun sonuçlar doğurmayabilir. AlgoBIST bir karar destek sistemidir.
            </p>
            <button
              onClick={handleAcceptDisclaimer}
              className="mt-4 w-full bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold py-3 px-6 rounded-lg transition-colors shadow-lg shadow-teal-500/20 uppercase tracking-widest text-sm"
            >
              Okudum, Kabul Ediyorum
            </button>
          </div>
        </div>
      )}

      {/* Üst Kısım: Yapışkan Header & Banner */}
      <header className="sticky top-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-slate-800 p-4 shadow-lg shadow-black/50">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">

          {/* Sol Kısım: Logo / Sembol */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500 tracking-tight">
              AlgoBIST
            </h1>
            <div className="text-sm font-mono text-slate-400 font-semibold mt-1 bg-slate-800/50 px-3 py-1 rounded inline-block">
              {ticker} | CANLI VERİ
            </div>
          </div>

          {/* Orta Kısım: Arama Çubuğu */}
          <div className="w-full max-w-xl relative shrink-0" ref={dropdownRef}>
            <form onSubmit={handleSearch} className="flex relative items-center w-full z-20 shadow-inner rounded-md overflow-hidden ring-1 ring-slate-700 focus-within:ring-teal-500 transition-all">
              <input
                type="text"
                placeholder="Hisse Kodu (Örn: ASELS)"
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                className="bg-slate-900/50 border-none text-white text-sm focus:ring-0 block w-full p-2.5 outline-none placeholder-slate-500 font-mono uppercase"
              />
              <button
                type="submit"
                className="bg-slate-800 hover:bg-slate-700 border-l border-slate-700 text-teal-400 font-bold text-sm px-4 py-2.5 transition-colors flex items-center justify-center uppercase tracking-wider"
              >
                Bul
              </button>
            </form>

            {/* Dropdown Menu */}
            {showDropdown && searchInput.trim() !== "" && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-700 rounded-md shadow-2xl z-50 max-h-60 overflow-y-auto custom-scrollbar text-left text-sm font-mono">
                {filteredStocks.length > 0 ? (
                  <ul className="py-1">
                    {filteredStocks.map((stock, idx) => (
                      <li
                        key={idx}
                        onClick={() => selectStock(stock)}
                        className="px-4 py-2 hover:bg-slate-800 cursor-pointer flex justify-between items-center transition-colors border-b border-slate-800/50 last:border-0"
                      >
                        <div className="flex flex-col">
                          <span className="font-medium text-white">{stock.name}</span>
                          <span className="text-xs text-slate-400 mt-0.5">{stock.code}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="px-4 py-3 text-slate-500 text-center text-xs">
                    Sonuç bulunamadı. Aramak için "Bul"a basın.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Grid İçerik Alanı */}
      <div className="max-w-[1600px] mx-auto p-4 md:p-6 mt-2 grid grid-cols-1 md:grid-cols-12 gap-6">

        {/* SOL KOLON: Grafik (8 Kolon) */}
        <section className="col-span-1 md:col-span-8 flex flex-col h-full min-h-[500px] md:min-h-[70vh]">
          <div className="bg-slate-900/40 backdrop-blur-lg border border-slate-700/50 rounded-xl p-4 shadow-2xl relative flex flex-col flex-1 overflow-hidden h-full">
            <div className="text-xs text-[#26a69a] font-bold uppercase tracking-widest mb-3 flex items-center">
              <span className="mr-2 inline-block w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
              Fiyat & Teknik Grafiği
            </div>
            {/* Chart componenti full height cover etsin */}
            <div className="flex-1 w-full relative">
              <Chart ticker={ticker} />
            </div>
          </div>
        </section>

        {/* SAĞ KOLON: Rasyolar ve Simülasyon (4 Kolon) */}
        <section className="col-span-1 md:col-span-4 flex flex-col gap-6">
          {/* Rasyo Kartı */}
          <div className="bg-slate-900/40 backdrop-blur-lg border border-slate-700/50 rounded-xl p-4 shadow-2xl relative overflow-hidden">
            <div className="text-xs text-indigo-400 font-bold uppercase tracking-widest mb-4">
              Temel Analiz
            </div>
            <Fundamentals ticker={ticker} />
          </div>

          {/* Simülasyon Kartı (Tırmanarak Büyüsün) */}
          <div className="bg-slate-900/40 backdrop-blur-lg border border-slate-700/50 rounded-xl p-4 shadow-2xl relative overflow-hidden flex-1">
            <div className="text-xs text-purple-400 font-bold uppercase tracking-widest mb-4">
              DCA Backtest
            </div>
            <Simulation ticker={ticker} />
          </div>
        </section>

        {/* ALT BÖLÜM: Tam Genişlik AI / Haber / Teknik Analiz Özeti (12 Kolon) */}
        <section className="col-span-1 md:col-span-12 flex flex-col gap-6">
          {/* Teknik Görünüm Özeti */}
          <div className="bg-slate-900/40 backdrop-blur-lg border border-slate-700/50 rounded-xl p-4 shadow-2xl relative overflow-hidden">
            <div className="text-xs text-[#26a69a] font-bold uppercase tracking-widest mb-4">
              Teknik Görünüm Özeti
            </div>
            <TechnicalSummary ticker={ticker} />
          </div>

          <div className="bg-slate-900/40 backdrop-blur-lg border border-slate-700/50 rounded-xl p-4 shadow-2xl relative overflow-hidden">
            <div className="text-xs text-amber-400 font-bold uppercase tracking-widest mb-4">
              AI Analist Paneli
            </div>
            <NewsAnalysis ticker={ticker} />
          </div>
        </section>

      </div>

      {/* FOOTER (Sayfa Altı Sabit Uyarı) */}
      <footer className="w-full border-t border-slate-800/50 mt-12 py-8 text-center text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center gap-4">
          {/* SPK Yasal Uyarı Özeti */}
          <p className="max-w-4xl leading-relaxed">
            Burada yer alan yatırım bilgi, yorum ve tavsiyeleri yatırım danışmanlığı kapsamında değildir.
            Tüm veriler 15 dakika gecikmeli olabilir ve sadece bilgilendirme amaçlıdır.
            Kesinlikle yatırım tavsiyesi değildir (YTD).
          </p>

          {/* Geliştirici İmzası */}
          <div className="mt-2 flex items-center gap-1.5 text-slate-400 text-sm">
            <span>© 2026 AlgoBIST.</span>
            <span>Designed & Coded by</span>
            <a
              href="https://muhammedcengiz.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal-400 hover:text-teal-300 hover:underline underline-offset-4 transition-all font-medium tracking-wide"
            >
              Muhammed Cengiz
            </a>
          </div>
        </div>
      </footer>

    </main>
  );
}
