import React from 'react';
import { 
  LayoutDashboard, BarChart3, Wallet, History, ShieldCheck, LogOut, X
} from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

function Sidebar({ user, activeMenu, setActiveMenu, isMobileMenuOpen, setIsMobileMenuOpen }) {
  const displayName = user?.displayName || user?.email?.split('@')[0] || 'User';
  const initials = displayName.substring(0, 2).toUpperCase();

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <>
      {/* OVERLAY UNTUK MENU MOBILE */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden backdrop-blur-sm" 
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* SIDEBAR RESPONSIVE */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col transform transition-transform duration-300 ease-in-out md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20"><span className="text-2xl font-bold font-serif">H</span></div>
            <div><h1 className="text-xl font-bold text-slate-900 leading-none tracking-tight">HematYuk</h1><p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Financial App</p></div>
          </div>
          {/* Tombol Tutup Sidebar Khusus HP */}
          <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-slate-400 hover:text-slate-600"><X size={20}/></button>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-6 overflow-y-auto">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 px-4">Menu</p>
          {[{ n: 'Dashboard', i: <LayoutDashboard size={18}/> }, { n: 'Transactions', i: <History size={18}/> }, { n: 'AI Analysis', i: <BarChart3 size={18}/> }, { n: 'Savings Goals', i: <Wallet size={18}/> }, { n: 'Security', i: <ShieldCheck size={18}/> }].map((item) => (
            <button key={item.n} onClick={() => { setActiveMenu(item.n); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${activeMenu === item.n ? 'bg-blue-50 text-blue-600 font-bold border border-blue-100' : 'hover:bg-slate-50 text-slate-600'}`}>{item.i} {item.n}</button>
          ))}
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all hover:bg-rose-50 text-rose-600 font-bold mt-8"><LogOut size={18} /> Logout</button>
        </nav>
        
        {/* BAGIAN PROFIL SIDEBAR DINAMIS */}
        <div className="p-6 border-t border-slate-100 flex items-center gap-3 mt-auto bg-slate-50">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xs border-2 border-blue-100 shadow-md shrink-0">
            {initials}
          </div>
          <div className="flex-1 text-left overflow-hidden">
            <p className="text-sm font-bold text-slate-800 leading-none truncate capitalize">{displayName}</p>
            <p className="text-[10px] text-slate-500 mt-1 font-medium truncate">Freelance Editor</p>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
