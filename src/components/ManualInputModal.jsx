import React from 'react';
import { X, Utensils, Bus, ShoppingBag, Coffee, FileText, Calendar } from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';

function ManualInputModal({ setIsManualModalOpen }) {
  const handleSaveManual = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const amount = formData.get('amount');
    
    try {
      await addDoc(collection(db, "transactions"), {
        n: formData.get('item'),
        c: formData.get('category'),
        b: 'BCA', 
        a: `-Rp ${parseInt(amount || 0).toLocaleString('id-ID')}`,
        sc: 'text-rose-500',
        keterangan: formData.get('keterangan') || '',
        tanggal: formData.get('tanggal') || new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString()
      });
      setIsManualModalOpen(false);
    } catch (error) {
      console.error("Gagal menyimpan transaksi:", error);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-slate-900/50 backdrop-blur-sm p-0 md:p-4">
      <div className="bg-white border border-slate-100 w-full max-w-md rounded-t-[32px] md:rounded-[32px] p-6 md:p-8 shadow-2xl animate-in slide-in-from-bottom md:slide-in-from-bottom-0 md:zoom-in duration-300 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6 text-slate-900"><h3 className="text-lg md:text-xl font-bold uppercase tracking-tight">Tambah Manual</h3><button onClick={() => setIsManualModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-2"><X size={24}/></button></div>
        <form onSubmit={handleSaveManual} className="space-y-4">
          
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase px-1">Pilih Kategori</label>
            <div className="grid grid-cols-4 gap-2 mb-2">
              {[{n: 'Food', i: <Utensils size={18}/>}, {n: 'Transport', i: <Bus size={18}/>}, {n: 'Shopping', i: <ShoppingBag size={18}/>}, {n: 'Coffee', i: <Coffee size={18}/>}].map(cat => (
                <label key={cat.n} className="cursor-pointer">
                  <input type="radio" name="category" value={cat.n} className="peer sr-only" required />
                  <div className="flex flex-col items-center justify-center bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-500 peer-checked:bg-blue-50 peer-checked:border-blue-500 peer-checked:text-blue-600 transition-all text-center">
                    {cat.i}
                    <span className="text-[8px] md:text-[9px] font-bold uppercase mt-1 truncate w-full">{cat.n}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="relative">
            <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input name="item" required placeholder="Nama Transaksi" className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-600/50" />
          </div>
          
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">Rp</span>
            <input name="amount" required type="number" placeholder="Jumlah Total" className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-600/50" />
          </div>

          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input name="tanggal" type="date" className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-600/50" />
          </div>

          <textarea name="keterangan" placeholder="Keterangan / Catatan" rows="2" className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-600/50 resize-none"></textarea>

          <button type="submit" className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl mt-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20">Simpan Transaksi</button>
        </form>
      </div>
    </div>
  );
}

export default ManualInputModal;
