import React from 'react';
import { ArrowUpRight, Trash2 } from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

function Dashboard({ currentBalance, dataProyeksi, dynamicDistribusi, transactions, handleDeleteTransaction }) {
  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 mb-8 px-4 md:px-0">
        <div className="lg:col-span-3 bg-white border border-slate-100 p-6 rounded-[24px] shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Saldo</p>
          <p className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight mb-2">Rp {currentBalance.toLocaleString('id-ID')}</p>
          <div className="flex items-center gap-2 text-[10px] font-bold text-blue-600 bg-blue-50 w-fit px-2 py-1 rounded-lg mb-6"><ArrowUpRight size={12} /> +12.4%</div>
          <div className="space-y-4 pt-4 border-t border-slate-100">
            {['BCA', 'Mandiri', 'GoPay'].map((bank, i) => (
              <div key={i} className="flex justify-between items-center"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-[10px] font-bold text-blue-600">{bank[0]}</div><p className="text-xs font-bold text-slate-700 leading-none">{bank}</p></div><p className="text-xs font-bold text-slate-900">Rp {i === 0 ? '2.450k' : '1.200k'}</p></div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-6 bg-white border border-slate-100 p-4 md:p-8 rounded-[24px] shadow-sm">
          <div className="h-[220px] w-full"><ResponsiveContainer width="100%" height="100%"><AreaChart data={dataProyeksi}><defs><linearGradient id="colorAktual" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/><stop offset="95%" stopColor="#2563eb" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" /><XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} /><Tooltip contentStyle={{backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', color: '#1e293b'}} /><Area type="monotone" dataKey="aktual" stroke="#2563eb" strokeWidth={3} fill="url(#colorAktual)" /><Area type="monotone" dataKey="prediksi" stroke="#94a3b8" strokeWidth={3} strokeDasharray="5 5" fill="transparent" /></AreaChart></ResponsiveContainer></div>
        </div>

        <div className="lg:col-span-3 bg-white border border-slate-100 p-6 rounded-[24px] shadow-sm flex flex-col justify-center">
          <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-4 tracking-widest text-center">AI Financial Score</h4>
          <div className="relative w-28 h-28 md:w-32 md:h-32 mx-auto mb-4"><svg className="w-full h-full transform -rotate-90"><circle cx="50%" cy="50%" r="45%" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100" /><circle cx="50%" cy="50%" r="45%" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="364.4" strokeDashoffset="72.8" className="text-blue-500" /></svg><div className="absolute inset-0 flex items-center justify-center"><span className="text-xl md:text-2xl font-bold text-slate-800">80%</span></div></div>
          <p className="text-[10px] text-center text-slate-500 px-2 md:px-4 leading-relaxed font-bold uppercase tracking-tighter">Kondisi keuanganmu sangat sehat bulan ini!</p>
        </div>
      </div>

      <div className="bg-white border border-slate-100 p-4 md:p-8 rounded-[32px] mb-8 shadow-sm mx-4 md:mx-0">
        <div className="flex justify-between items-center mb-6 md:mb-8"><h3 className="text-lg md:text-xl font-bold text-slate-900 uppercase tracking-tight">Transaksi Terakhir</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[500px]">
            <thead>
              <tr className="text-slate-500 text-[9px] font-bold uppercase tracking-[0.3em] border-b border-slate-100">
                <th className="pb-5 px-4">Deskripsi</th>
                <th className="pb-5">Kategori</th>
                <th className="pb-5">Bank</th>
                <th className="pb-5 text-right">Jumlah</th>
                <th className="pb-5 px-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {transactions.map((item, i) => (
                <tr key={item.id || i} className="hover:bg-slate-50 transition-all group">
                  <td className="py-4 md:py-5 px-4"><p className="text-xs md:text-sm font-bold text-slate-800 uppercase tracking-tight">{item.n}</p><p className="text-[9px] md:text-[10px] text-slate-400 font-bold mt-1 uppercase">Terbaru</p></td>
                  <td className="py-4 md:py-5"><span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-slate-500">{item.c}</span></td>
                  <td className="py-4 md:py-5 text-[10px] md:text-xs font-bold text-slate-500 uppercase">{item.b}</td>
                  <td className={`py-4 md:py-5 text-right font-bold text-xs md:text-sm ${item.a.includes('-') ? 'text-slate-800' : 'text-green-600'}`}>{item.a}</td>
                  <td className="py-4 md:py-5 px-4 text-right">
                    <button 
                      onClick={() => handleDeleteTransaction(item.id)}
                      className="text-slate-400 hover:text-rose-500 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all p-2"
                      title="Hapus Transaksi"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 pb-20 px-4 md:px-0">
        <div className="bg-white border border-slate-100 p-6 md:p-8 rounded-[32px] shadow-sm">
          <h3 className="text-base md:text-lg font-bold text-slate-900 uppercase tracking-tight mb-6 md:mb-8">Distribusi Kategori</h3>
          <div className="h-[180px] md:h-[200px]">
            {dynamicDistribusi.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={dynamicDistribusi} innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">{dynamicDistribusi.map((entry, index) => (<Cell key={index} fill={entry.color} stroke="transparent" />))}</Pie><Tooltip contentStyle={{backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', color: '#1e293b'}} /></PieChart></ResponsiveContainer>
            ) : <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs font-bold">Belum ada pengeluaran</div>}
          </div>
          <div className="grid grid-cols-2 gap-3 md:gap-4 mt-6">
            {dynamicDistribusi.map((item, i) => (
              <div key={i} className="flex justify-between items-center text-[9px] md:text-[10px] font-bold uppercase tracking-wider"><div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{backgroundColor: item.color}}></div><span className="text-slate-500 truncate max-w-[60px] md:max-w-[80px]">{item.name}</span></div><span className="text-slate-700">{item.value}%</span></div>
            ))}
          </div>
        </div>
        <div className="bg-white border border-slate-100 p-6 md:p-8 rounded-[32px] shadow-sm">
          <h3 className="text-base md:text-lg font-bold text-slate-900 uppercase tracking-tight mb-6 md:mb-8">Savings Goals</h3>
          <div className="space-y-6">
            {[{ n: 'Laptop Baru', p: '40%', c: 'bg-blue-600' }, { n: 'KKN Trip', p: '75%', c: 'bg-sky-400' }].map((goal, i) => (
              <div key={i}><div className="flex justify-between items-center mb-3"><p className="text-[10px] md:text-xs font-bold text-slate-700 uppercase tracking-tight">{goal.n}</p><p className="text-[10px] md:text-xs font-bold text-slate-900">{goal.p}</p></div><div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden"><div className={`${goal.c} h-full rounded-full`} style={{width: goal.p}}></div></div></div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default Dashboard;
