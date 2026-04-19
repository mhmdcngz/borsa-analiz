"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";

interface NewsAnalysisProps {
    ticker: string;
    persona: string;
}

interface Sentiment {
    score: number;
    label: "Pozitif" | "Negatif" | "Nötr";
}

export default function NewsAnalysis({ ticker, persona }: NewsAnalysisProps) {
    const [summary, setSummary] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [sentiment, setSentiment] = useState<Sentiment | null>(null);

    useEffect(() => {
        const controller = new AbortController();

        const fetchAnalysis = async () => {
            setLoading(true);
            setError(null);
            setSummary(null);
            setSentiment(null);

            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://algobist.onrender.com";
                const response = await fetch(
                    `${apiUrl}/api/analysis/${ticker}?persona=${persona}`,
                    { signal: controller.signal }
                );

                if (!response.ok) throw new Error("Özet alınamadı.");
                if (!response.body) throw new Error("Stream desteklenmiyor.");

                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                let buffer = "";

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split("\n");
                    buffer = lines.pop() ?? "";

                    for (const line of lines) {
                        if (!line.startsWith("data: ")) continue;
                        const jsonStr = line.slice(6).trim();
                        if (!jsonStr) continue;

                        try {
                            const event = JSON.parse(jsonStr);
                            if (event.type === "sentiment") {
                                setSentiment({ score: event.score, label: event.label });
                                setLoading(false);
                            } else if (event.type === "chunk") {
                                setLoading(false);
                                setSummary(prev => (prev ?? "") + event.text);
                            } else if (event.type === "error") {
                                setError(event.message ?? "Bir hata oluştu.");
                                setLoading(false);
                            }
                        } catch {
                            // malformed JSON chunk — skip
                        }
                    }
                }
            } catch (err: unknown) {
                if ((err as Error).name === "AbortError") return;
                setError((err as Error).message || "Bir hata oluştu.");
                setLoading(false);
            }
        };

        fetchAnalysis();
        return () => controller.abort();
    }, [ticker, persona]);

    const sentimentColor = {
        Pozitif: { bg: "bg-green-500/10", border: "border-green-500/30", text: "text-green-400", bar: "bg-green-500" },
        Negatif: { bg: "bg-red-500/10", border: "border-red-500/30", text: "text-red-400", bar: "bg-red-500" },
        Nötr: { bg: "bg-yellow-500/10", border: "border-yellow-500/30", text: "text-yellow-400", bar: "bg-yellow-500" },
    };
    const sc = sentiment ? (sentimentColor[sentiment.label] ?? sentimentColor["Nötr"]) : null;

    return (
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-xl relative overflow-hidden group hover:border-teal-500/50 transition-colors duration-500">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-400 via-indigo-500 to-purple-600 opacity-70 group-hover:opacity-100 transition-opacity"></div>

            <div className="flex items-center space-x-3 mb-4">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-lg">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                </div>
                <h2 className="text-xl font-bold text-white tracking-wide">Yapay Zeka Hisse Yorumu</h2>
            </div>

            {/* Sentiment Badge */}
            {sentiment && sc && (
                <div className={`flex items-center gap-3 mb-5 px-3 py-2 rounded-lg border ${sc.bg} ${sc.border}`}>
                    <span className="text-xs font-bold uppercase text-slate-400 whitespace-nowrap">Haber Duygusu</span>
                    <span className={`text-sm font-bold ${sc.text} whitespace-nowrap`}>{sentiment.label}</span>
                    <div className="flex-1 bg-slate-700/60 rounded-full h-2">
                        <div
                            className={`h-2 rounded-full transition-all duration-700 ${sc.bar}`}
                            style={{ width: `${sentiment.score}%` }}
                        />
                    </div>
                    <span className="text-xs text-slate-400 font-mono whitespace-nowrap">{sentiment.score}/100</span>
                </div>
            )}

            <div className="text-neutral-300 leading-relaxed text-[15px]">
                {loading ? (
                    <div className="flex items-center space-x-2 animate-pulse">
                        <div className="w-2 h-2 bg-teal-400 rounded-full"></div>
                        <div className="w-2 h-2 bg-indigo-400 rounded-full animation-delay-200"></div>
                        <div className="w-2 h-2 bg-purple-400 rounded-full animation-delay-400"></div>
                        <span className="text-neutral-500 ml-2">Yapay zeka analiz ediyor...</span>
                    </div>
                ) : error ? (
                    <div className="text-red-400 bg-red-400/10 p-3 rounded-lg border border-red-500/20">
                        {error}
                    </div>
                ) : (
                    <div className="block w-full text-slate-300 leading-relaxed space-y-2
                        [&>h3]:text-teal-400 [&>h3]:font-bold [&>h3]:text-lg [&>h3]:mt-6 [&>h3]:mb-2 [&>h3]:block
                        [&>ul]:block [&>ul]:list-disc [&>ul]:ml-5 [&>ul]:my-4 [&>ul>li]:pl-1 [&>ul>li]:mb-2
                        [&>p]:block [&>p]:mb-3
                        [&>strong]:text-teal-300">
                        <ReactMarkdown>
                            {(summary ?? "")
                                .replace(/###/g, '\n\n###')
                                .replace(/\* \*\*/g, '\n* **')
                                .replace(/ \*(?=\s)/g, '\n\n*')}
                        </ReactMarkdown>
                        {summary && <span className="inline-block w-1.5 h-4 bg-teal-400 animate-pulse ml-0.5 align-middle" />}
                    </div>
                )}
            </div>
        </div>
    );
}
