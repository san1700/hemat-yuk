import React, { useState } from 'react';
import { X, FileText, Calendar } from 'lucide-react';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { CATEGORY_CONFIG } from '../utils/categories';

function ManualInputModal({ user, editingTransaction, setIsManualModalOpen }) {
  const [txType, setTxType] = useState(
    editingTransaction
      ? (editingTransaction.a.includes('-') ? 'pengeluaran' : 'pemasukan')
      : 'pengeluaran'
  );

  const getRawAmount = (a) => {
    if (!a) return '';
    return parseInt(a.toString().replace(/[^0-9]/g, ''), 10);
  };

  const [displayAmount, setDisplayAmount] = useState(
    editingTransaction ? getRawAmount(editingTransaction.a).toLocaleString('id-ID') : ''
  );

  const handleAmountChange = (e) => {
    const rawValue = e.target.value.replace(/[^0-9]/g, '');
    if (!rawValue) {
      setDisplayAmount('');
      return;
    }
    setDisplayAmount(parseInt(rawValue, 10).toLocaleString('id-ID'));
  };

  const handleSaveManual = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const amountStr = formData.get('amount');
    const rawNumber = amountStr.replace(/[^0-9]/g, '');
    const parsedAmount = parseInt(rawNumber || '0', 10).toLocaleString('id-ID');
    const isExpense = txType === 'pengeluaran';

    try {
      const txData = {
        userId: user.uid,
        n: formData.get('item'),
        c: formData.get('category'),
        b: 'BCA',
        a: isExpense ? `-Rp ${parsedAmount}` : `+Rp ${parsedAmount}`,
        sc: isExpense ? 'text-rose-500' : 'text-emerald-500',
        keterangan: formData.get('keterangan') || '',
        tanggal: formData.get('tanggal') || new Date().toISOString().split('T')[0],
      };

      if (editingTransaction && editingTransaction.id) {
        await updateDoc(doc(db, "transactions", editingTransaction.id), txData);
      } else {
        txData.createdAt = new Date().toISOString();
        await addDoc(collection(db, "transactions"), txData);
      }
      setIsManualModalOpen(false);
    } catch (error) {
      console.error("Gagal menyimpan transaksi:", error);
    }
  };

  const availableCategories = ['Food', 'Transport', 'Shopping', 'Coffee', 'Edu', 'Lifestyle', 'Snacks', 'Default'];

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-slate-900/50 backdrop-blur-sm p-0 md:p-4 animate-fade-in">
      <div className="bg-white dark:bg-[#0f172a] border border-slate-100 dark:border-white/5 w-full max-w-md rounded-t-[32px] md:rounded-[32px] p-6 md:p-8 shadow-2xl animate-fade-in-up max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6 text-slate-900 dark:text-white">
          <h3 className="text-lg md:text-xl font-bold capitalize tracking-tight">
            {editingTransaction ? (editingTransaction.id ? 'Edit Transaksi' : 'Konfirmasi AI Scan') : 'Tambah Manual'}
          </h3>
          <button onClick={() => setIsManualModalOpen(false)} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:text-slate-300 p-2"><X size={24} /></button>
        </div>

        <div className="flex bg-slate-100 dark:bg-slate-800/50 p-1 rounded-xl mb-6">
          <button
            type="button"
            onClick={() => setTxType('pengeluaran')}
            className={`flex-1 py-2 text-[10px] md:text-xs font-bold capitalize tracking-widest rounded-lg transition-all ${txType === 'pengeluaran' ? 'bg-white dark:bg-[#0f172a] text-rose-500 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-200'}`}
          >
            Pengeluaran
          </button>
          <button
            type="button"
            onClick={() => setTxType('pemasukan')}
            className={`flex-1 py-2 text-[10px] md:text-xs font-bold capitalize tracking-widest rounded-lg transition-all ${txType === 'pemasukan' ? 'bg-white dark:bg-[#0f172a] text-emerald-500 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-200'}`}
          >
            Pemasukan
          </button>
        </div>

        <form onSubmit={handleSaveManual} className="space-y-4">

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 capitalize px-1">Pilih Kategori</label>
            <div className="grid grid-cols-4 gap-2 mb-2">
              {availableCategories.map(catKey => {
                const cat = CATEGORY_CONFIG[catKey];
                return (
                  <label key={catKey} className="cursor-pointer">
                    <input type="radio" name="category" value={catKey} defaultChecked={editingTransaction ? editingTransaction.c === catKey : catKey === 'Food'} className="peer sr-only" required />
                    <div className="flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-slate-500 dark:text-slate-400 peer-checked:bg-blue-50 peer-checked:border-blue-500 peer-checked:text-blue-600 transition-all text-center">
                      {cat.icon}
                      <span className="text-[8px] md:text-[9px] font-bold capitalize mt-1 truncate w-full">{cat.label}</span>
                    </div>
                  </label>
                )
              })}
            </div>
          </div>

          <div className="relative">
            <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
            <input name="item" required defaultValue={editingTransaction?.n || ''} placeholder="Nama Transaksi" className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:text-slate-500 outline-none focus:ring-2 focus:ring-blue-600/50" />
          </div>

          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 font-bold">Rp</span>
            <input 
              name="amount" 
              required 
              type="text" 
              value={displayAmount}
              onChange={handleAmountChange}
              placeholder="Jumlah Total" 
              className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:text-slate-500 outline-none focus:ring-2 focus:ring-blue-600/50" 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
              <input name="tanggal" type="date" defaultValue={editingTransaction?.tanggal || new Date().toISOString().split('T')[0]} required className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:text-slate-500 outline-none focus:ring-2 focus:ring-blue-600/50" />
            </div>
            <div className="relative">
              <input name="keterangan" defaultValue={editingTransaction?.keterangan || ''} placeholder="Catatan (Opsional)" className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-2xl py-3 px-4 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:text-slate-500 outline-none focus:ring-2 focus:ring-blue-600/50" />
            </div>
          </div>

          <button type="submit" className="w-full bg-blue-600 dark:bg-blue-600/80 hover:bg-blue-700 dark:hover:bg-blue-600 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-600/20 dark:shadow-none text-sm mt-4 capitalize tracking-widest">
            Simpan Transaksi
          </button>
        </form>
      </div>
    </div>
  );
}

export default ManualInputModal;
