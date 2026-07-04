import React, { useState } from 'react';
import { Target, Plus, X, Pencil, Trash2 } from 'lucide-react';
import { collection, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';

function SavingsView({ savingsGoals, user }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [goalToDelete, setGoalToDelete] = useState(null);
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState('');

  const [nabungModalGoal, setNabungModalGoal] = useState(null);
  const [nabungAmount, setNabungAmount] = useState('');

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

  const handleAddGoal = async (e) => {
    e.preventDefault();
    if (!newGoalName || !newGoalTarget) return;
    try {
      if (editingGoal) {
        await updateDoc(doc(db, "savings", editingGoal.id), {
          name: newGoalName,
          target: `Rp ${newGoalTarget}`
        });
      } else {
        await addDoc(collection(db, "savings"), {
          userId: user.uid,
          name: newGoalName,
          target: `Rp ${newGoalTarget}`,
          current: 'Rp 0',
          color: 'bg-blue-600',
          createdAt: new Date().toISOString()
        });
      }
      setIsModalOpen(false);
      setEditingGoal(null);
      setNewGoalName('');
      setNewGoalTarget('');
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
    setIsModalOpen(true);
  };

  const openEditModal = (goal) => {
    setEditingGoal(goal);
    setNewGoalName(goal.name);
    setNewGoalTarget(parseAmount(goal.target).toLocaleString('id-ID'));
    setIsModalOpen(true);
  };

  return (
    <div className="px-4 md:px-0 pb-20">
      <div className="flex justify-between items-center mb-6 animate-fade-in-up opacity-0">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Savings Goals</h2>
        <button onClick={openAddModal} className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 p-2.5 rounded-xl hover:bg-slate-50 dark:bg-slate-900/50 transition-all flex items-center gap-2 font-medium text-sm shadow-sm">
          <Plus size={18} /> Tambah Target
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {!savingsGoals || savingsGoals.length === 0 ? (
           <div className="col-span-full text-center text-slate-400 dark:text-slate-500 font-bold py-10 bg-white dark:bg-[#0f172a] border border-slate-100 dark:border-white/5 rounded-3xl">Belum ada target tabungan. Ayo buat target pertamamu!</div>
        ) : savingsGoals.map((goal) => {
          const targetNum = parseAmount(goal.target);
          const currentNum = parseAmount(goal.current);
          const percent = targetNum > 0 ? Math.min(100, Math.round((currentNum / targetNum) * 100)) : 0;
          return (
          <div key={goal.id} className="bg-white dark:bg-[#0f172a] border border-slate-100 dark:border-white/5 p-6 rounded-[24px] shadow-sm flex flex-col animate-fade-in-up hover:-translate-y-1 transition-transform group">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-white/5 flex items-center justify-center text-slate-600 dark:text-slate-300 shrink-0">
                  <Target size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm capitalize tracking-tight">{goal.name}</h3>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold tracking-widest mt-0.5">Target: {goal.target}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all">
                <button onClick={() => openEditModal(goal)} className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                  <Pencil size={14} />
                </button>
                <button onClick={() => setGoalToDelete(goal.id)} className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            
            <div className="mt-auto pt-4 border-t border-slate-50">
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
        )})}
      </div>

      {/* MODAL TAMBAH/EDIT TARGET */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-[#0f172a] border border-slate-100 dark:border-white/5 w-full max-w-sm rounded-[32px] p-6 shadow-2xl animate-fade-in-up">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold capitalize tracking-tight">{editingGoal ? 'Edit Target' : 'Target Baru'}</h3>
              <button onClick={() => { setIsModalOpen(false); setEditingGoal(null); }} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:text-slate-300"><X size={24} /></button>
            </div>
            <form onSubmit={handleAddGoal} className="space-y-4">
              <input value={newGoalName} onChange={e => setNewGoalName(e.target.value)} required placeholder="Nama Target (misal: Beli Laptop)" className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-2xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-blue-600/50" />
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 font-bold">Rp</span>
                <input type="text" value={newGoalTarget} onChange={handleTargetChange} required placeholder="Jumlah Target" className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-blue-600/50" />
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
                <h3 className="text-lg font-bold capitalize tracking-tight">Nabung</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Untuk: {nabungModalGoal.name}</p>
              </div>
              <button onClick={() => setNabungModalGoal(null)} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:text-slate-300"><X size={24} /></button>
            </div>
            <form onSubmit={submitNabung} className="space-y-4">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 font-bold">Rp</span>
                <input type="text" value={nabungAmount} onChange={handleNabungAmountChange} required placeholder="Nominal yang disisihkan" className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-blue-600/50" autoFocus />
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
