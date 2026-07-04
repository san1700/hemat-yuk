import React, { useState } from 'react';
import { ArrowUpRight, Trash2 } from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Legend } from 'recharts';

function Dashboard({ currentBalance, monthlyIncome, monthlyExpense, monthlyBudget, setMonthlyBudget, dynamicDistribusi, transactions, allTransactions, selectedMonth, selectedYear, setActiveMenu, handleDeleteTransaction }) {
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [tempBudget, setTempBudget] = useState(monthlyBudget.toString());
  const [chartFilter, setChartFilter] = useState('Bulanan'); // Harian, Mingguan, Bulanan, Tahunan

  const budgetPercentage = monthlyBudget > 0 ? (monthlyExpense / monthlyBudget) * 100 : 0;
  const isOverBudget = budgetPercentage > 100;
  const cappedPercentage = Math.min(budgetPercentage, 100);

  const parseAmount = (amountStr) => {
    const isExpense = amountStr.includes('-');
    const val = parseInt(amountStr.toString().replace(/[^0-9]/g, ''), 10) || 0;
    return isExpense ? -val : val;
  };

  // Generate Chart Data based on selected filter
  const generateChartData = () => {
    let data = [];
    
    if (chartFilter === 'Harian') {
      const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
      for (let day = 1; day <= daysInMonth; day++) {
        let inc = 0, exp = 0;
        transactions.forEach(t => {
          const d = new Date(t.tanggal || t.createdAt);
          if (d.getDate() === day) {
            const val = parseAmount(t.a);
            if (val < 0) exp += Math.abs(val);
            else inc += val;
          }
        });
        
        // Don't render future days if current month
        if (selectedMonth === new Date().getMonth() && selectedYear === new Date().getFullYear() && day > new Date().getDate()) break;
        
        data.push({ name: day.toString(), Pemasukan: inc, Pengeluaran: exp });
      }
    } else if (chartFilter === 'Mingguan') {
      const weeks = [0, 0, 0, 0, 0];
      const incWeeks = [0, 0, 0, 0, 0];
      transactions.forEach(t => {
        const d = new Date(t.tanggal || t.createdAt);
        const weekIdx = Math.floor((d.getDate() - 1) / 7);
        if (weekIdx >= 0 && weekIdx < 5) {
          const val = parseAmount(t.a);
          if (val < 0) weeks[weekIdx] += Math.abs(val);
          else incWeeks[weekIdx] += val;
        }
      });
      for (let i = 0; i < 5; i++) {
        data.push({ name: `M${i + 1}`, Pemasukan: incWeeks[i], Pengeluaran: weeks[i] });
      }
    } else if (chartFilter === 'Bulanan') {
      const monthsStr = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"];
      const incMonths = Array(12).fill(0);
      const expMonths = Array(12).fill(0);
      
      (allTransactions || []).forEach(t => {
        const d = new Date(t.tanggal || t.createdAt);
        if (d.getFullYear() === selectedYear) {
          const val = parseAmount(t.a);
          if (val < 0) expMonths[d.getMonth()] += Math.abs(val);
          else incMonths[d.getMonth()] += val;
        }
      });
      
      for (let i = 0; i < 12; i++) {
        data.push({ name: monthsStr[i], Pemasukan: incMonths[i], Pengeluaran: expMonths[i] });
      }
    } else if (chartFilter === 'Tahunan') {
      const currentY = selectedYear;
      const years = [currentY - 4, currentY - 3, currentY - 2, currentY - 1, currentY];
      const incYears = Array(5).fill(0);
      const expYears = Array(5).fill(0);
      
      (allTransactions || []).forEach(t => {
        const d = new Date(t.tanggal || t.createdAt);
        const yearIdx = years.indexOf(d.getFullYear());
        if (yearIdx !== -1) {
          const val = parseAmount(t.a);
          if (val < 0) expYears[yearIdx] += Math.abs(val);
          else incYears[yearIdx] += val;
        }
      });
      
      for (let i = 0; i < 5; i++) {
        data.push({ name: years[i].toString(), Pemasukan: incYears[i], Pengeluaran: expYears[i] });
      }
    }
    
    return data;
  };

  const chartData = generateChartData();

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 mb-8 px-4 md:px-0">
        <div className="lg:col-span-3 bg-blue-600 dark:bg-gradient-to-br dark:from-blue-900/60 dark:to-slate-900/80 dark:border dark:border-white/10 rounded-[24px] p-6 shadow-xl shadow-blue-600/20 dark:shadow-none animate-fade-in-up opacity-0 relative overflow-hidden">
          {/* Decorative Blob */}
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-500 dark:bg-blue-700/30 rounded-full mix-blend-multiply filter blur-xl opacity-60"></div>
          <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-indigo-500 dark:bg-indigo-700/30 rounded-full mix-blend-multiply filter blur-xl opacity-60"></div>
          
          <div className="relative z-10">
            <p className="text-[10px] font-bold text-blue-200 capitalize tracking-widest mb-1">Total Saldo</p>
            <p className="text-2xl md:text-3xl font-bold text-white tracking-tight mb-2">Rp {currentBalance.toLocaleString('id-ID')}</p>
          </div>

          <div className="space-y-4 pt-4 border-t border-white/20 mt-6 relative z-10">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-blue-200 capitalize tracking-wider">Masuk (Bulan Ini)</span>
              <span className="text-xs font-bold text-emerald-300">+Rp {monthlyIncome.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-blue-200 capitalize tracking-wider">Keluar (Bulan Ini)</span>
              <span className="text-xs font-bold text-rose-300">-Rp {monthlyExpense.toLocaleString('id-ID')}</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-6 bg-white dark:bg-[#0f172a] border border-slate-100 dark:border-white/5 p-5 md:p-6 rounded-[24px] shadow-sm animate-fade-in-up opacity-0 delay-100 flex flex-col">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 tracking-tight capitalize">Savings & Expenditure</h3>
            <div className="flex bg-slate-50 dark:bg-slate-900/50 p-1 rounded-xl border border-slate-100 dark:border-white/5 shadow-inner w-full sm:w-auto overflow-x-auto">
              {['Harian', 'Mingguan', 'Bulanan', 'Tahunan'].map(f => (
                <button 
                  key={f}
                  onClick={() => setChartFilter(f)}
                  className={`flex-1 sm:flex-none px-3 py-1.5 text-[10px] md:text-[11px] font-bold rounded-lg transition-all whitespace-nowrap ${chartFilter === f ? 'bg-white dark:bg-[#0f172a] text-blue-600 shadow-sm border border-slate-100 dark:border-white/5' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:text-slate-300'}`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 w-full min-h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:opacity-10" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} tickFormatter={(val) => val >= 1000000 ? `${(val/1000000).toFixed(0)}M` : val >= 1000 ? `${(val/1000).toFixed(0)}k` : val} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '16px', color: '#1e293b', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)', padding: '12px' }}
                  itemStyle={{ fontSize: '11px', fontWeight: 'bold' }}
                  labelStyle={{ fontSize: '10px', color: '#64748b', marginBottom: '4px', textTransform: 'capitalize', letterSpacing: '0.05em' }}
                  formatter={(value) => [`Rp ${value.toLocaleString('id-ID')}`, undefined]}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingTop: '15px' }} />
                <Area type="monotone" dataKey="Pemasukan" name="Income" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" activeDot={{ r: 6, fill: '#2563eb', stroke: '#fff', strokeWidth: 2 }} />
                <Area type="monotone" dataKey="Pengeluaran" name="Expenditure" stroke="#94a3b8" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" activeDot={{ r: 6, fill: '#94a3b8', stroke: '#fff', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-3 bg-white dark:bg-[#0f172a] border border-slate-100 dark:border-white/5 p-6 rounded-[24px] shadow-sm flex flex-col justify-center animate-fade-in-up opacity-0 delay-200">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 capitalize tracking-widest">Anggaran Bulanan</h4>
            <button onClick={() => {
              setTempBudget(monthlyBudget.toString());
              setIsBudgetModalOpen(true);
            }} className="text-[9px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md hover:bg-blue-100">Set</button>
          </div>
          <div className="relative w-24 h-24 md:w-28 md:h-28 mx-auto mb-4">
            <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
              <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100" />
              <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="282.7" strokeDashoffset={282.7 - (282.7 * cappedPercentage) / 100} className={isOverBudget ? "text-rose-500" : "text-blue-500"} style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }} />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <span className={`text-lg md:text-xl font-bold ${isOverBudget ? 'text-rose-500' : 'text-slate-800 dark:text-slate-100'}`}>{cappedPercentage.toFixed(0)}%</span>
            </div>
          </div>
          <p className="text-[10px] text-center text-slate-500 dark:text-slate-400 px-2 leading-relaxed font-bold capitalize tracking-tighter">
            Terpakai: Rp {monthlyExpense.toLocaleString('id-ID')}
            <br /><span className="text-[8px] opacity-70">dari Rp {monthlyBudget.toLocaleString('id-ID')}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 pb-20 px-4 md:px-0">
        
        {/* TRANSAKSI TERAKHIR (Sebelah Kiri) */}
        <div className="lg:col-span-8 bg-white dark:bg-[#0f172a] border border-slate-100 dark:border-white/5 p-5 md:p-8 rounded-[32px] shadow-sm animate-fade-in-up opacity-0 delay-300">
          <div className="flex justify-between items-center mb-6 md:mb-8">
            <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white capitalize tracking-tight">Transaksi Terakhir</h3>
            <button 
              onClick={() => setActiveMenu('Transactions')}
              className="text-[10px] md:text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
            >
              View All <ArrowUpRight size={14} />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[400px]">
              <thead>
                <tr className="text-slate-500 dark:text-slate-400 text-[9px] font-bold capitalize tracking-[0.3em] border-b border-slate-100 dark:border-white/5">
                  <th className="pb-4 px-4">Deskripsi</th>
                  <th className="pb-4">Kategori</th>
                  <th className="pb-4 text-right">Jumlah</th>
                  <th className="pb-4 px-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-white/5">
                {transactions.slice(0, 5).map((item, i) => (
                  <tr key={item.id || i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group">
                    <td className="py-4 px-4">
                      <p className="text-xs md:text-sm font-bold text-slate-800 dark:text-slate-100 capitalize tracking-tight">{item.n}</p>
                      <p className="text-[9px] md:text-[10px] text-slate-400 dark:text-slate-500 font-bold mt-1 capitalize">{item.b}</p>
                    </td>
                    <td className="py-4">
                      <span className="text-[9px] md:text-[10px] font-bold capitalize tracking-widest text-slate-500 dark:text-slate-400">{item.c}</span>
                    </td>
                    <td className={`py-4 text-right font-bold text-xs md:text-sm ${item.a.includes('-') ? 'text-slate-800 dark:text-slate-100' : 'text-blue-600'}`}>
                      {item.a}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => handleDeleteTransaction(item.id)}
                        className="text-slate-400 dark:text-slate-500 hover:text-rose-500 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all p-2"
                        title="Hapus Transaksi"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {transactions.length === 0 && (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-xs text-slate-400 dark:text-slate-500 font-bold">Belum ada transaksi</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* DISTRIBUSI KATEGORI (Sebelah Kanan) */}
        <div className="lg:col-span-4 bg-blue-600 dark:bg-gradient-to-br dark:from-blue-900/60 dark:to-slate-900/80 border-none dark:border dark:border-white/10 p-6 md:p-8 rounded-[32px] shadow-xl shadow-blue-600/20 dark:shadow-none animate-fade-in-up opacity-0 delay-400 relative overflow-hidden flex flex-col">
          {/* Decorative Blobs to match Total Saldo */}
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-500 dark:bg-blue-700/30 rounded-full mix-blend-multiply filter blur-xl opacity-60"></div>
          
          <h3 className="text-base md:text-lg font-bold text-white capitalize tracking-tight mb-4 relative z-10">Distribusi Kategori</h3>
          
          <div className="h-[180px] w-full mt-2 relative z-10">
            {dynamicDistribusi.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dynamicDistribusi} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCategory" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff" className="opacity-10" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#bfdbfe', fontSize: 10, fontWeight: 600 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#bfdbfe', fontSize: 10 }} tickFormatter={(val) => `${val}%`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '16px', color: '#1e293b', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)', padding: '12px' }}
                    itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                    labelStyle={{ fontSize: '10px', color: '#64748b', marginBottom: '4px', textTransform: 'capitalize', letterSpacing: '0.05em' }}
                    formatter={(value) => [`${value.toFixed(1)}%`, 'Porsi']}
                  />
                  <Area type="monotone" dataKey="value" name="Porsi" stroke="#38bdf8" strokeWidth={3} fillOpacity={1} fill="url(#colorCategory)" activeDot={{ r: 6, fill: '#38bdf8', stroke: '#fff', strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full min-h-[150px] flex items-center justify-center text-blue-200 text-xs font-bold">Belum ada pengeluaran</div>
            )}
          </div>

          {/* Rincian Nominal */}
          {dynamicDistribusi.length > 0 && (
            <div className="mt-6 pt-5 border-t border-white/10 grid grid-cols-2 gap-y-4 gap-x-2 relative z-10">
              {dynamicDistribusi.map((item, i) => (
                <div key={i} className="flex flex-col">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: item.color }}></div>
                    <span className="text-[10px] text-blue-100 font-bold capitalize tracking-wider truncate">{item.name}</span>
                  </div>
                  <span className="text-xs md:text-sm font-bold text-white pl-4">Rp {item.amount.toLocaleString('id-ID')}</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {isBudgetModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-[#0f172a] border border-slate-100 dark:border-white/5 w-full max-w-sm rounded-[32px] p-6 shadow-2xl animate-fade-in-up text-center">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 tracking-tight">Atur Anggaran Bulanan</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">Masukkan batas pengeluaran bulanan Anda (Rp).</p>
            <div className="relative mb-6">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 font-bold text-xl">Rp</span>
              <input
                type="text"
                value={tempBudget}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^0-9]/g, '');
                  if (!raw) setTempBudget('');
                  else setTempBudget(parseInt(raw, 10).toLocaleString('id-ID'));
                }}
                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-2xl py-4 pl-14 pr-4 text-left text-xl font-bold text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-600/50 focus:border-blue-600 transition-all"
              />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setIsBudgetModalOpen(false)} className="flex-1 py-3 rounded-2xl font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200 transition-colors text-sm capitalize tracking-widest">
                Batal
              </button>
              <button onClick={() => {
                const parsed = parseInt(tempBudget.replace(/[^0-9]/g, ''), 10);
                if (!isNaN(parsed) && parsed > 0) {
                  setMonthlyBudget(parsed);
                }
                setIsBudgetModalOpen(false);
              }} className="flex-1 py-3 rounded-2xl font-bold text-white bg-blue-600 dark:bg-blue-600/80 hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors shadow-lg shadow-blue-600/20 dark:shadow-none text-sm capitalize tracking-widest">
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Dashboard;
