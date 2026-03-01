"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";

interface NewsAnalysisProps {
    ticker: string;
}

export default function NewsAnalysis({ ticker }: NewsAnalysisProps) {
    const [summary, setSummary] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAnalysis = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`http://localhost:8000/api/analysis/${ticker}`);
                if (!response.ok) {
                    throw new Error("Özet alınamadı.");
                }
                const data = await response.json();
                setSummary(data.summary);
            } catch (err: any) {
                setError(err.message || "Bir hata oluştu.");
            } finally {
                setLoading(false);
            }
        };

        fetchAnalysis();
    }, [ticker]);

    const formattedText = (summary || "")
        .replace(/###/g, '\n\n###')
        .replace(/\* \*\*/g, '\n* **')
        .replace(/ \*(?=\s)/g, '\n\n*');

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
                            {formattedText}
                        </ReactMarkdown>
                    </div>
                )}
            </div>
        </div>
    );
}
