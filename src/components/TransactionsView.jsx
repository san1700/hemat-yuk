import React, { useState } from 'react';
import { Trash2, Edit3 } from 'lucide-react';
import { CATEGORY_CONFIG } from '../utils/categories';

function TransactionsView({ transactions, handleDeleteTransaction, handleEditTransaction }) {
  const [filter, setFilter] = useState('Semua'); // 'Semua', 'Keluar', 'Masuk'

  const filteredTransactions = transactions.filter(item => {
    const isExpense = item.a.includes('-');
    if (filter === 'Keluar') return isExpense;
    if (filter === 'Masuk') return !isExpense;
    return true; // 'Semua'
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
      return `${date.getDate()} ${monthNames[date.getMonth()]}`;
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="px-4 md:px-0 pb-20 w-full animate-fade-in-up opacity-0">
      
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mb-1">Riwayat</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Pantau semua arus kas kamu di sini.</p>
      </div>

      {/* Tabs Filter */}
      <div className="flex bg-slate-100 dark:bg-slate-800/50 p-1 rounded-xl w-full max-w-sm mb-6">
        {['Semua', 'Keluar', 'Masuk'].map(tab => (
          <button 
            key={tab}
            onClick={() => setFilter(tab)}
            className={`flex-1 py-2 text-[10px] md:text-xs font-bold capitalize tracking-widest rounded-lg transition-all ${filter === tab ? 'bg-white dark:bg-[#0f172a] text-slate-800 dark:text-slate-100 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-200'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Transactions List */}
      <div className="space-y-4">
        {filteredTransactions.length === 0 ? (
          <div className="text-center text-slate-400 dark:text-slate-500 font-medium text-sm py-10 bg-white dark:bg-[#0f172a] border border-slate-100 dark:border-white/5 rounded-3xl">
            Belum ada riwayat transaksi.
          </div>
        ) : (
          filteredTransactions.map((item, i) => {
            const isExpense = item.a.includes('-');
            const catConfig = CATEGORY_CONFIG[item.c] || CATEGORY_CONFIG.Default;
            
            return (
              <div key={item.id || i} className="flex justify-between items-center bg-white dark:bg-[#0f172a] border border-slate-100 dark:border-white/5 p-4 md:p-5 rounded-[24px] shadow-sm hover:shadow-md transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-blue-50 text-blue-600 border border-blue-100">
                    {catConfig.icon}
                  </div>
                  <div>
                    <h4 className="text-sm md:text-base font-bold text-slate-800 dark:text-slate-100 leading-tight">{item.n}</h4>
                    <p className="text-[9px] md:text-[10px] text-slate-400 dark:text-slate-500 font-bold capitalize tracking-widest mt-1">
                      {item.c} • {item.b} • {formatDate(item.tanggal || item.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-sm md:text-base font-bold ${isExpense ? 'text-slate-800 dark:text-slate-100' : 'text-blue-600'}`}>
                    {item.a}
                  </span>
                  <div className="flex gap-1">
                    <button 
                      onClick={() => handleEditTransaction(item)} 
                      className="text-slate-300 hover:text-blue-500 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all p-2 bg-slate-50 dark:bg-slate-900/50 rounded-lg hover:bg-blue-50"
                      title="Edit"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDeleteTransaction(item.id)} 
                      className="text-slate-300 hover:text-rose-500 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all p-2 bg-slate-50 dark:bg-slate-900/50 rounded-lg hover:bg-rose-50"
                      title="Hapus"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}

export default TransactionsView;
