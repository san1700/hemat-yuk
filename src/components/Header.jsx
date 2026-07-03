import React from 'react';
import { Menu, Plus, ScanLine, Search, Bell } from 'lucide-react';

function Header({ setIsMobileMenuOpen, setIsManualModalOpen, setIsScanModalOpen }) {
  // Tanggal Hari Ini
  const today = new Date().toLocaleDateString('id-ID', {
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric'
  });

  return (
    <>
      {/* HEADER KHUSUS MOBILE (Muncul hanya di HP) */}
      <div className="md:hidden flex items-center justify-between bg-white border-b border-slate-200 p-4 sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-sm"><span className="text-lg font-bold font-serif">H</span></div>
          <h1 className="text-lg font-bold text-slate-900 leading-none">HematYuk</h1>
        </div>
        <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-slate-600 hover:bg-slate-50 rounded-lg">
          <Menu size={24} />
        </button>
      </div>

      {/* HEADER DASHBOARD (Desktop & Tablet) */}
      <header className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-6 md:mb-8 mt-4 md:mt-0 px-4 md:px-0">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard</h2>
          <p className="text-slate-500 text-sm font-medium flex items-center gap-2 mt-1">📅 {today}</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          <div className="flex gap-2 w-full sm:w-auto">
            <button onClick={() => setIsManualModalOpen(true)} className="flex-1 sm:flex-none justify-center bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-xl transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2 font-medium">
              <Plus size={18} /> Manual
            </button>
            <button onClick={() => setIsScanModalOpen(true)} className="flex-1 sm:flex-none justify-center bg-white hover:bg-slate-50 text-slate-700 p-2.5 rounded-xl border border-slate-200 flex items-center gap-2 font-medium shadow-sm">
              <ScanLine size={18} /> Scan Nota
            </button>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative group flex-1">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input type="text" placeholder="Cari transaksi..." className="w-full bg-white border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-blue-600/50 shadow-sm" />
            </div>
            <button className="bg-white p-2.5 rounded-xl border border-slate-200 relative text-slate-500 shadow-sm hover:bg-slate-50 shrink-0">
              <Bell size={20} />
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-rose-500 rounded-full"></span>
            </button>
          </div>
        </div>
      </header>
    </>
  );
}

export default Header;
