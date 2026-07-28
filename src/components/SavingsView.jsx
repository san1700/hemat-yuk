import React, { useState, useMemo } from 'react';
import { Target, Plus, X, Pencil, Trash2, Flame, Trophy, Calendar, AlertTriangle, Brain, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { collection, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { calculateAHPPriority } from '../utils/ahpCalculator';

function SavingsView({ savingsGoals, user, monthlyIncome, monthlyExpense }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [goalToDelete, setGoalToDelete] = useState(null);
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState('');
  const [newGoalUrgency, setNewGoalUrgency] = useState('primer');
  const [newGoalDeadline, setNewGoalDeadline] = useState('');

  const [nabungModalGoal, setNabungModalGoal] = useState(null);
  const [nabungAmount, setNabungAmount] = useState('');
  const [showAhpDetail, setShowAhpDetail] = useState(false);

  const parseAmount = (val) => parseInt(val.toString().replace(/[^0-9]/g, '') || '0', 10);

  const handleTargetChange = (e) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    if (!raw) setNewGoalTarget('');
    else setNewGoalTarget(parseInt(raw, 10).toLocaleString('id-ID'));
  };

  const handleNabungAmountChange = (e) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    if (!raw) setNabungAmount('');
    else setNabungAmount(parseInt(raw, 10).toLocaleString('id-ID'));
  };

  // ============================================================
  // AHP CALCULATION
  // ============================================================
  const ahpResult = useMemo(() => {
    return calculateAHPPriority(savingsGoals);
  }, [savingsGoals]);

  // Map ranked goals by ID for quick lookup
  const rankedGoalMap = useMemo(() => {
    const map = {};
    ahpResult.rankedGoals.forEach(g => { map[g.id] = g; });
    return map;
  }, [ahpResult]);

  const topPriorityGoal = ahpResult.rankedGoals.find(g => g.isTopPriority);
  const monthlySurplus = (monthlyIncome || 0) - (monthlyExpense || 0);

  // ============================================================
  // CRUD HANDLERS
  // ============================================================
  const handleAddGoal = async (e) => {
    e.preventDefault();
    if (!newGoalName || !newGoalTarget) return;
    try {
      if (editingGoal) {
        await updateDoc(doc(db, "savings", editingGoal.id), {
          name: newGoalName,
          target: `Rp ${newGoalTarget}`,
          urgency: newGoalUrgency,
          deadline: newGoalDeadline || null,
        });
      } else {
        await addDoc(collection(db, "savings"), {
          userId: user.uid,
          name: newGoalName,
          target: `Rp ${newGoalTarget}`,
          current: 'Rp 0',
          color: 'bg-blue-600',
          urgency: newGoalUrgency,
          deadline: newGoalDeadline || null,
          createdAt: new Date().toISOString()
        });
      }
      setIsModalOpen(false);
      setEditingGoal(null);
      setNewGoalName('');
      setNewGoalTarget('');
      setNewGoalUrgency('primer');
      setNewGoalDeadline('');
    } catch (err) {
      alert("Gagal menyimpan target: " + err.message);
    }
  };

  const handleDeleteGoal = async () => {
    if (!goalToDelete) return;
    try {
      await deleteDoc(doc(db, "savings", goalToDelete));
      setGoalToDelete(null);
    } catch (err) {
      alert("Gagal menghapus target: " + err.message);
    }
  };

  const submitNabung = async (e) => {
    e.preventDefault();
    if (!nabungModalGoal || !nabungAmount) return;
    const amount = parseAmount(nabungAmount);
    if (amount <= 0) return;

    const currentTotal = parseAmount(nabungModalGoal.current) + amount;
    
    try {
      await updateDoc(doc(db, "savings", nabungModalGoal.id), {
        current: `Rp ${currentTotal.toLocaleString('id-ID')}`
      });
      setNabungModalGoal(null);
      setNabungAmount('');
    } catch (err) {
      alert("Gagal menabung: " + err.message);
    }
  };

  const openAddModal = () => {
    setEditingGoal(null);
    setNewGoalName('');
    setNewGoalTarget('');
    setNewGoalUrgency('primer');
    setNewGoalDeadline('');
    setIsModalOpen(true);
  };

  const openEditModal = (goal) => {
    setEditingGoal(goal);
    setNewGoalName(goal.name);
    setNewGoalTarget(parseAmount(goal.target).toLocaleString('id-ID'));
    setNewGoalUrgency(goal.urgency || 'sekunder');
    setNewGoalDeadline(goal.deadline || '');
    setIsModalOpen(true);
  };

  // ============================================================
  // HELPER: Priority Badge
  // ============================================================
  const PriorityBadge = ({ goal }) => {
    const ranked = rankedGoalMap[goal.id];
    if (!ranked || savingsGoals.length < 2) return null;

    if (ranked.isTopPriority) {
      return (
        <div className="flex items-center gap-1.5 bg-gradient-to-r from-orange-500 to-rose-500 text-white text-[9px] font-bold px-2.5 py-1 rounded-full animate-pulse shadow-lg shadow-orange-500/30">
          <Flame size={12} />
          <span className="tracking-wider">PRIORITAS UTAMA</span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-[9px] font-bold px-2 py-1 rounded-full">
        <Trophy size={10} />
        <span className="tracking-wider">#{ranked.ahpRank}</span>
      </div>
    );
  };

  // Format deadline to human readable
  const formatDeadline = (deadline) => {
    if (!deadline) return null;
    const d = new Date(deadline);
    const today = new Date();
    const diffDays = Math.ceil((d - today) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { text: 'Lewat deadline', color: 'text-rose-500' };
    if (diffDays === 0) return { text: 'Hari ini!', color: 'text-rose-500' };
    if (diffDays <= 7) return { text: `${diffDays} hari lagi`, color: 'text-amber-500' };
    if (diffDays <= 30) return { text: `${diffDays} hari lagi`, color: 'text-blue-500' };
    const months = Math.floor(diffDays / 30);
    return { text: `${months} bulan lagi`, color: 'text-slate-400 dark:text-slate-500' };
  };

  return (
    <div className="px-4 md:px-0 pb-20">
      <div className="flex justify-end items-center mb-6 animate-fade-in-up opacity-0">
        <button onClick={openAddModal} className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 p-2.5 rounded-xl hover:bg-slate-50 dark:bg-slate-900/50 transition-all flex items-center gap-2 font-medium text-sm shadow-sm">
          <Plus size={18} /> Tambah Target
        </button>
      </div>

      {/* AHP INSIGHT PANEL */}
      {savingsGoals && savingsGoals.length >= 2 && topPriorityGoal && (
        <div className="mb-6 animate-fade-in-up opacity-0">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-900/60 dark:to-indigo-900/60 dark:border dark:border-white/10 rounded-[20px] p-5 shadow-xl shadow-blue-600/15 dark:shadow-none relative overflow-hidden">
            {/* Decorative */}
            <div className="absolute -top-8 -right-8 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
            <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-white/5 rounded-full blur-xl"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center">
                  <Brain size={16} className="text-white" />
                </div>
                <span className="text-[10px] font-bold text-blue-200 tracking-[0.2em] uppercase">Rekomendasi AI (AHP)</span>
              </div>
              
              <p className="text-white text-sm font-bold leading-relaxed mb-1">
                Alokasikan sisa uang ke: <span className="text-amber-300">"{topPriorityGoal.name}"</span>
              </p>
              <p className="text-blue-200 text-xs leading-relaxed">
                {monthlySurplus > 0 
                  ? `Sisa uang bulan ini: Rp ${monthlySurplus.toLocaleString('id-ID')} — Sistem menyarankan untuk memprioritaskan target ini berdasarkan urgensi, nominal, dan deadline.`
                  : 'Berdasarkan analisis urgensi, nominal target, dan deadline — target ini memiliki bobot prioritas tertinggi.'
                }
              </p>

              {/* Collapsible AHP Detail */}
              <button 
                onClick={() => setShowAhpDetail(!showAhpDetail)}
                className="mt-3 flex items-center gap-1.5 text-[10px] font-bold text-blue-200 hover:text-white transition-colors tracking-wider uppercase"
              >
                <Info size={12} />
                Detail Bobot AHP
                {showAhpDetail ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </button>

              {showAhpDetail && (
                <div className="mt-3 pt-3 border-t border-white/10 grid grid-cols-3 gap-3 animate-fade-in">
                  <div className="text-center">
                    <p className="text-[9px] text-blue-200 font-bold tracking-widest uppercase mb-1">Urgensi</p>
                    <p className="text-white font-bold text-lg">{(ahpResult.weights.urgensi * 100).toFixed(0)}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[9px] text-blue-200 font-bold tracking-widest uppercase mb-1">Nominal</p>
                    <p className="text-white font-bold text-lg">{(ahpResult.weights.nominal * 100).toFixed(0)}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[9px] text-blue-200 font-bold tracking-widest uppercase mb-1">Deadline</p>
                    <p className="text-white font-bold text-lg">{(ahpResult.weights.deadline * 100).toFixed(0)}%</p>
                  </div>
                  <div className="col-span-3 mt-1">
                    <p className="text-[9px] text-blue-200/70 font-bold text-center">
                      Consistency Ratio: {ahpResult.consistency.CR.toFixed(4)} {ahpResult.consistency.isConsistent ? '✅ Konsisten' : '⚠️ Tidak Konsisten'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SAVINGS GOALS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {!savingsGoals || savingsGoals.length === 0 ? (
           <div className="col-span-full text-center text-slate-400 dark:text-slate-500 font-bold py-10 bg-white dark:bg-[#0f172a] border border-slate-100 dark:border-white/5 rounded-3xl">Belum ada target tabungan. Ayo buat target pertamamu!</div>
        ) : savingsGoals.map((goal) => {
          const targetNum = parseAmount(goal.target);
          const currentNum = parseAmount(goal.current);
          const percent = targetNum > 0 ? Math.min(100, Math.round((currentNum / targetNum) * 100)) : 0;
          const ranked = rankedGoalMap[goal.id];
          const isTop = ranked?.isTopPriority && savingsGoals.length >= 2;
          const deadlineInfo = formatDeadline(goal.deadline);

          return (
          <div 
            key={goal.id} 
            className={`bg-white dark:bg-[#0f172a] border p-6 rounded-[24px] shadow-sm flex flex-col animate-fade-in-up hover:-translate-y-1 transition-all group ${
              isTop 
                ? 'border-orange-200 dark:border-orange-500/20 ring-2 ring-orange-500/10 shadow-lg shadow-orange-500/5' 
                : 'border-slate-100 dark:border-white/5'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  isTop 
                    ? 'bg-gradient-to-br from-orange-500 to-rose-500 text-white shadow-lg shadow-orange-500/20'
                    : 'bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-white/5 text-slate-600 dark:text-slate-300'
                }`}>
                  {isTop ? <Flame size={20} /> : <Target size={20} />}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm capitalize tracking-tight truncate">{goal.name}</h3>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold tracking-widest mt-0.5">Target: {goal.target}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all shrink-0">
                <button onClick={() => openEditModal(goal)} className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                  <Pencil size={14} />
                </button>
                <button onClick={() => setGoalToDelete(goal.id)} className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {/* Priority Badge & Metadata Row */}
            <div className="flex items-center gap-2 flex-wrap mb-4">
              <PriorityBadge goal={goal} />
              
              {/* Urgency Badge */}
              <div className={`text-[9px] font-bold px-2 py-1 rounded-full tracking-wider ${
                goal.urgency === 'primer' 
                  ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' 
                  : 'bg-slate-50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500'
              }`}>
                {goal.urgency === 'primer' ? '● KEBUTUHAN' : '○ KEINGINAN'}
              </div>

              {/* Deadline Badge */}
              {deadlineInfo && (
                <div className={`flex items-center gap-1 text-[9px] font-bold ${deadlineInfo.color}`}>
                  <Calendar size={10} />
                  {deadlineInfo.text}
                </div>
              )}
            </div>

            {/* AHP Score Bar (for ranked goals) */}
            {ranked && savingsGoals.length >= 2 && (
              <div className="mb-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 tracking-widest uppercase">Skor AHP</span>
                  <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">{(ranked.ahpScore * 100).toFixed(1)}</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800/50 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${
                      isTop ? 'bg-gradient-to-r from-orange-500 to-rose-500' : 'bg-slate-300 dark:bg-slate-600'
                    }`} 
                    style={{ width: `${Math.min(100, ranked.ahpScore * 100)}%` }}
                  ></div>
                </div>
              </div>
            )}
            
            <div className="mt-auto pt-4 border-t border-slate-50 dark:border-white/5">
              <div className="flex justify-between items-end mb-2">
                <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{goal.current}</p>
                <p className="text-xs font-bold text-slate-900 dark:text-white">{percent}%</p>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800/50 h-2.5 rounded-full overflow-hidden mb-5">
                <div className={`${goal.color || 'bg-blue-600'} h-full rounded-full transition-all duration-1000`} style={{ width: `${percent}%` }}></div>
              </div>
              <button onClick={() => { setNabungModalGoal(goal); setNabungAmount(''); }} className="w-full text-[10px] md:text-xs font-bold text-blue-600 bg-blue-50 py-2.5 rounded-xl transition-all hover:bg-blue-100 capitalize tracking-widest">
                Tambah Tabungan
              </button>
            </div>
          </div>
        );})}
      </div>

      {/* MODAL TAMBAH/EDIT TARGET */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-[#0f172a] border border-slate-100 dark:border-white/5 w-full max-w-sm rounded-[32px] p-6 shadow-2xl animate-fade-in-up max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold capitalize tracking-tight text-slate-900 dark:text-white">{editingGoal ? 'Edit Target' : 'Target Baru'}</h3>
              <button onClick={() => { setIsModalOpen(false); setEditingGoal(null); }} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:text-slate-300"><X size={24} /></button>
            </div>
            <form onSubmit={handleAddGoal} className="space-y-4">
              <input value={newGoalName} onChange={e => setNewGoalName(e.target.value)} required placeholder="Nama Target (misal: Beli Laptop)" className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-2xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-blue-600/50 text-slate-800 dark:text-slate-100 placeholder:text-slate-400" />
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 font-bold">Rp</span>
                <input type="text" value={newGoalTarget} onChange={handleTargetChange} required placeholder="Jumlah Target" className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-blue-600/50 text-slate-800 dark:text-slate-100 placeholder:text-slate-400" />
              </div>

              {/* FIELD BARU: Tingkat Urgensi */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 capitalize tracking-widest px-1 mb-2 block">Tingkat Urgensi</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewGoalUrgency('primer')}
                    className={`py-3 rounded-xl text-xs font-bold transition-all border ${
                      newGoalUrgency === 'primer'
                        ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    🎯 Kebutuhan
                    <span className="block text-[9px] font-medium mt-0.5 opacity-70">Primer / Urgent</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewGoalUrgency('sekunder')}
                    className={`py-3 rounded-xl text-xs font-bold transition-all border ${
                      newGoalUrgency === 'sekunder'
                        ? 'bg-violet-50 dark:bg-violet-900/20 border-violet-300 dark:border-violet-500/30 text-violet-600 dark:text-violet-400 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    ✨ Keinginan
                    <span className="block text-[9px] font-medium mt-0.5 opacity-70">Sekunder / Nice-to-have</span>
                  </button>
                </div>
              </div>

              {/* FIELD BARU: Deadline */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 capitalize tracking-widest px-1 mb-2 block">Tenggat Waktu (Opsional)</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={16} />
                  <input 
                    type="date" 
                    value={newGoalDeadline} 
                    onChange={e => setNewGoalDeadline(e.target.value)} 
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-blue-600/50 text-slate-800 dark:text-slate-100" 
                  />
                </div>
              </div>

              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-2xl transition-all shadow-lg shadow-blue-600/20 text-sm capitalize tracking-widest">
                Simpan Target
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL NABUNG */}
      {nabungModalGoal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-[#0f172a] border border-slate-100 dark:border-white/5 w-full max-w-sm rounded-[32px] p-6 shadow-2xl animate-fade-in-up">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-bold capitalize tracking-tight text-slate-900 dark:text-white">Nabung</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Untuk: {nabungModalGoal.name}</p>
              </div>
              <button onClick={() => setNabungModalGoal(null)} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:text-slate-300"><X size={24} /></button>
            </div>
            <form onSubmit={submitNabung} className="space-y-4">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 font-bold">Rp</span>
                <input type="text" value={nabungAmount} onChange={handleNabungAmountChange} required placeholder="Nominal yang disisihkan" className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-blue-600/50 text-slate-800 dark:text-slate-100 placeholder:text-slate-400" autoFocus />
              </div>
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-2xl transition-all shadow-lg shadow-blue-600/20 text-sm capitalize tracking-widest">
                Tambahkan Uang
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI HAPUS */}
      {goalToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-[#0f172a] border border-slate-100 dark:border-white/5 w-full max-w-sm rounded-[32px] p-6 shadow-2xl animate-fade-in-up text-center">
            <div className="w-16 h-16 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 tracking-tight">Hapus Target?</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">Tindakan ini tidak bisa dibatalkan. Target tabungan akan dihapus secara permanen.</p>
            <div className="flex gap-3">
              <button onClick={() => setGoalToDelete(null)} className="flex-1 py-3 rounded-2xl font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200 transition-colors text-sm capitalize tracking-widest">
                Batal
              </button>
              <button onClick={handleDeleteGoal} className="flex-1 py-3 rounded-2xl font-bold text-white bg-rose-500 hover:bg-rose-600 transition-colors shadow-lg shadow-rose-500/20 text-sm capitalize tracking-widest">
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SavingsView;
