import React from 'react';
import {
  LayoutDashboard, BarChart3, Wallet, History, ShieldCheck, LogOut, X, User, Sun, Moon
} from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

function Sidebar({ user, activeMenu, setActiveMenu, isMobileMenuOpen, setIsMobileMenuOpen, theme, setTheme }) {
  const displayName = user?.displayName || user?.email?.split('@')[0] || 'User';
  const initials = displayName.substring(0, 2).toUpperCase();

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <>
      {/* OVERLAY UNTUK MENU MOBILE */}
      {/* SIDEBAR RESPONSIVE */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0a1930] border-r border-white/10 hidden md:flex flex-col`}>
        <div className="p-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20"><span className="text-2xl font-bold font-serif">H</span></div>
            <div>
              <h1 className="text-xl font-bold text-white leading-none tracking-tight">HematYuk</h1>
              <p className="text-[10px] text-blue-300 font-bold capitalize mt-1">Financial App</p>
            </div>
          </div>
          {/* Tombol Tutup Sidebar Khusus HP */}
          <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-slate-400 hover:text-white"><X size={20} /></button>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-6 overflow-y-auto">
          <p className="text-[10px] font-bold text-blue-300/70 capitalize tracking-widest mb-4 px-4">Menu</p>
          {[{ n: 'Dashboard', i: <LayoutDashboard size={18} /> }, { n: 'Transactions', i: <History size={18} /> }, { n: 'AI Analysis', i: <BarChart3 size={18} /> }, { n: 'Savings Goals', i: <Wallet size={18} /> }, { n: 'Profil', i: <User size={18} /> }].map((item) => (
            <button key={item.n} onClick={() => { setActiveMenu(item.n); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${activeMenu === item.n ? 'bg-white/10 backdrop-blur-md border border-white/10 text-white font-bold shadow-lg' : 'hover:bg-white/5 text-blue-100/70 hover:text-white'}`}>{item.i} {item.n}</button>
          ))}
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all hover:bg-rose-500/10 text-rose-400 font-bold mt-8"><LogOut size={18} /> Logout</button>
        </nav>

        {/* BAGIAN TEMA & PROFIL SIDEBAR DINAMIS */}
        <div className="p-4 border-t border-white/10 bg-white/5 flex flex-col gap-4">
          {/* Toggle Tema */}
          <div className="flex items-center justify-between bg-[#061021] rounded-xl p-1.5">
            <button 
              onClick={() => setTheme('light')}
              className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-xs font-bold transition-all ${theme === 'light' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <Sun size={14} /> Terang
            </button>
            <button 
              onClick={() => setTheme('dark')}
              className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-xs font-bold transition-all ${theme === 'dark' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <Moon size={14} /> Gelap
            </button>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xs border-2 border-white/20 shadow-md shrink-0">
              {initials}
            </div>
            <div className="flex-1 text-left overflow-hidden">
              <p className="text-sm font-bold text-white leading-none truncate capitalize">{displayName}</p>
              <p className="text-[10px] text-blue-300 mt-1 font-medium truncate">Freelance Editor</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
