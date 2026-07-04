import React, { useMemo, useState, useEffect } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { CATEGORY_CONFIG } from '../utils/categories';
import { GoogleGenerativeAI } from "@google/generative-ai";

function AIAnalysisView({ transactions = [] }) {
  const [insightText, setInsightText] = useState('');
  const [isGeneratingInsight, setIsGeneratingInsight] = useState(false);

  const parseAmount = (amountStr) => {
    if (!amountStr) return 0;
    const num = parseInt(amountStr.toString().replace(/[^0-9]/g, ''), 10);
    return amountStr.toString().includes('-') ? -num : num;
  };

  const { totalExpense, distribution } = useMemo(() => {
    const dist = {};
    let expense = 0;

    transactions.forEach(t => {
      const val = parseAmount(t.a);
      if (val < 0) {
        const absVal = Math.abs(val);
        const catKey = t.c || 'Default';
        dist[catKey] = (dist[catKey] || 0) + absVal;
        expense += absVal;
      }
    });

    const distArray = Object.keys(dist).map(key => {
      const config = CATEGORY_CONFIG[key] || CATEGORY_CONFIG.Default;
      return {
        name: key,
        amount: dist[key],
        percent: expense === 0 ? 0 : parseFloat(((dist[key] / expense) * 100).toFixed(1)),
        color: config.color || 'bg-slate-500',
        icon: config.icon
      };
    }).sort((a, b) => b.percent - a.percent);

    return { totalExpense: expense, distribution: distArray };
  }, [transactions]);

  useEffect(() => {
    const fetchInsight = async () => {
      if (transactions.length === 0 || totalExpense === 0) {
         setInsightText("Kamu belum punya catatan pengeluaran bulan ini. Bagus, pertahankan rekor hematmu atau mulai catat pengeluaranmu ya!");
         return;
      }

      setIsGeneratingInsight(true);
      try {
        const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
        if (!GEMINI_API_KEY) {
           setInsightText("Wah, belanjaanmu cukup tinggi bulan ini. Pastikan hanya membeli barang yang benar-benar dibutuhkan ya.");
           return;
        }

        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        // Menggunakan gemini-2.5-flash
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const topCategories = distribution.slice(0, 3).map(d => `${d.name}: Rp ${d.amount.toLocaleString('id-ID')} (${d.percent}%)`).join(", ");
        
        const prompt = `Anda adalah teman dan penasihat keuangan pintar untuk anak muda. 
        Total pengeluaranku bulan ini adalah Rp ${totalExpense.toLocaleString('id-ID')}.
        Pengeluaran terbesarku habis di: ${topCategories}.
        
        Berikan 1 sampai 2 kalimat (sangat singkat) komentar atau saran keuangan yang santai, gaul, memotivasi, lucu dan tidak kaku. 
        Jangan beri salam formal. Langsung ke intinya.`;

        const result = await model.generateContent(prompt);
        setInsightText(result.response.text().replace(/"/g, '').trim());
      } catch (error) {
        console.error("Gemini Error:", error);
        setInsightText("Duh, sistem AI lagi istirahat nih. Tapi inget ya, tetap kontrol pengeluaranmu bulan ini!");
      } finally {
        setIsGeneratingInsight(false);
      }
    };

    // Gunakan timeout agar tidak spam API saat transaksi berubah dengan cepat
    const timeoutId = setTimeout(() => {
      fetchInsight();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [totalExpense, distribution, transactions.length]);

  return (
    <div className="px-4 md:px-0 pb-20 w-full animate-fade-in-up opacity-0">
      
      {/* Insight Card */}
      <div className="bg-blue-50 border border-blue-100 rounded-3xl p-5 md:p-6 flex gap-4 md:gap-6 mb-8 items-start shadow-sm">
        <div className="w-12 h-12 md:w-14 md:h-14 bg-blue-600 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-600/30">
          <Sparkles size={24} className="text-white md:w-8 md:h-8" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm md:text-base font-bold text-blue-900 mb-1">Insight Cerdas</h3>
          {isGeneratingInsight ? (
            <div className="flex items-center gap-2 text-blue-600 mt-2">
              <Loader2 size={16} className="animate-spin" />
              <p className="text-xs md:text-sm font-medium animate-pulse">Membedah datamu dengan AI...</p>
            </div>
          ) : (
            <p className="text-xs md:text-sm text-blue-800/80 leading-relaxed font-medium">
              {insightText}
            </p>
          )}
        </div>
      </div>

      {/* Total Pengeluaran */}
      <div className="mb-8 bg-white dark:bg-[#0f172a] border border-slate-100 dark:border-white/5 rounded-[32px] p-6 md:p-8 shadow-sm">
        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 capitalize tracking-widest mb-2">Total Pengeluaran</p>
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">Rp {totalExpense.toLocaleString('id-ID')}</h1>
      </div>

      {/* Distribusi Kategori */}
      <div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 px-2">Distribusi Kategori</h3>
        <div className="bg-white dark:bg-[#0f172a] border border-slate-100 dark:border-white/5 shadow-sm rounded-[32px] p-6 md:p-8 space-y-6">
          
          {distribution.length === 0 ? (
            <p className="text-slate-500 dark:text-slate-400 text-sm text-center py-8">Belum ada data pengeluaran.</p>
          ) : (
            distribution.map((item, idx) => {
              const colors = ['bg-purple-500', 'bg-emerald-500', 'bg-teal-400', 'bg-rose-500', 'bg-blue-500', 'bg-yellow-500'];
              const barColor = colors[idx % colors.length];

              return (
                <div key={item.name} className="relative group">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 p-2 rounded-lg border border-slate-100 dark:border-white/5`}>
                        {React.cloneElement(item.icon, { size: 16 })}
                      </div>
                      <span className="font-bold text-sm text-slate-800 dark:text-slate-100">{item.name === 'Default' ? 'Lain-lain' : item.name}</span>
                    </div>
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Rp {item.amount.toLocaleString('id-ID')}</span>
                  </div>
                  
                  <div className="w-full bg-slate-100 dark:bg-slate-800/50 rounded-full h-3 overflow-hidden">
                    <div className={`h-full rounded-full ${barColor}`} style={{ width: `${item.percent}%` }}></div>
                  </div>
                  <div className="text-right text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-2">
                    {item.percent}%
                  </div>
                </div>
              );
            })
          )}

        </div>
      </div>

    </div>
  );
}

export default AIAnalysisView;
