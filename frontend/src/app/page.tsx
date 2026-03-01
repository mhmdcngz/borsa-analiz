import Chart from '@/components/Chart';

export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-950 p-6 md:p-12 text-neutral-50 flex justify-center">
      <div className="w-full max-w-6xl">
        <header className="mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-teal-400 via-indigo-600 to-purple-500 bg-clip-text text-transparent">
            Borsa Analiz Paneli
          </h1>
          <p className="text-neutral-400 mt-3 text-lg">
            Türk Hava Yolları (THYAO.IS) - Son 6 Aylık Mum Grafik Analizi
          </p>
        </header>

        <section className="bg-neutral-900 ring-1 ring-white/10 rounded-2xl p-2 md:p-4 shadow-2xl">
          {/* Ticker olarak THYAO.IS geçiyoruz, Ajan 1 bu sembolü işleyecek */}
          <Chart ticker="THYAO.IS" />
        </section>
      </div>
    </main>
  );
}
