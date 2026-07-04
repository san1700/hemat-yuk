import React, { useState } from 'react';
import { Menu, Plus, ScanLine, Search, Bell, Download, RefreshCw, ChevronDown, Calendar } from 'lucide-react';

function Header({ user, activeMenu, setIsMobileMenuOpen, setIsManualModalOpen, setIsScanModalOpen, selectedMonth, setSelectedMonth, selectedYear, setSelectedYear }) {
  const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  const monthShortNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  // Extract user info
  const displayName = user?.displayName || user?.email?.split('@')[0] || 'User';
  const initials = displayName.substring(0, 2).toUpperCase();
  
  const getDaysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
  const dateRangeText = `1 ${monthShortNames[selectedMonth]}, ${selectedYear} - ${getDaysInMonth(selectedMonth, selectedYear)} ${monthShortNames[selectedMonth]}, ${selectedYear}`;

  return (
    <>
      {/* HEADER KHUSUS MOBILE (Muncul hanya di HP) */}
      <div className="md:hidden flex items-center justify-between bg-white dark:bg-[#0f172a] border-b border-slate-200 dark:border-white/10 p-4 sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-sm"><span className="text-lg font-bold font-serif">H</span></div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-none">HematYuk</h1>
        </div>
        <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:bg-slate-900/50 rounded-lg">
          <Menu size={24} />
        </button>
      </div>

      {/* HEADER UTAMA (Desktop & Tablet) */}
      <header className="mb-6 md:mb-8 pt-4 md:pt-8 px-4 md:px-8">
        
        {activeMenu === 'Dashboard' ? (
          <div className="flex flex-col gap-6">
            
            {/* 1. NEO-PAY STYLE WELCOME BANNER */}
            <div className="bg-blue-600 dark:bg-gradient-to-br dark:from-blue-900/60 dark:to-slate-900/80 dark:border dark:border-white/10 rounded-[24px] p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center text-white shadow-xl shadow-blue-600/20 dark:shadow-none w-full relative overflow-hidden animate-fade-in-up">
              
              {/* Decorative Background Elements (Glassmorphism blobs) */}
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500 dark:bg-blue-700/30 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
              <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-500 dark:bg-indigo-700/30 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>

              <div className="relative z-10 mb-6 md:mb-0">
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">Welcome, {displayName}!</h2>
                <p className="text-blue-100 text-xs md:text-sm max-w-md leading-relaxed font-medium">Pantau keuangan, kelola pengeluaran, dan capai target Anda dengan mudah.</p>
              </div>

              <div className="relative z-10 flex flex-wrap items-center gap-3 w-full md:w-auto">
                {/* Export/Refresh Actions */}
                <button className="w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95" title="Export Data">
                  <Download size={18} className="text-white" />
                </button>
                <button className="w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95" title="Refresh Dashboard">
                  <RefreshCw size={18} className="text-white" />
                </button>
                
                {/* Profile Chip */}
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-full p-1.5 flex items-center gap-3 pr-4 ml-auto md:ml-2 cursor-pointer hover:bg-white/20 transition-all hover:scale-105">
                  <div className="w-8 h-8 bg-white text-blue-600 font-bold rounded-full flex items-center justify-center text-xs shadow-inner">
                    {initials}
                  </div>
                  <div className="text-left hidden sm:block">
                    <p className="text-[11px] font-bold text-white leading-none tracking-wide">{displayName}</p>
                    <p className="text-[9px] text-blue-200 mt-0.5 max-w-[100px] truncate">{user?.email}</p>
                  </div>
                  <ChevronDown size={14} className="text-blue-200 ml-1 hidden sm:block" />
                </div>
              </div>
            </div>

            {/* 2. TOOLBAR BAWAHAN (Filters & Actions) */}
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 animate-fade-in-up delay-100">
              {/* Bulan & Tahun Filter (Pill Shape) */}
              <div className="relative">
                <div className="flex items-center gap-2 bg-white dark:bg-[#0f172a] px-4 py-2.5 rounded-full border border-slate-200 dark:border-white/10 shadow-sm text-slate-700 dark:text-slate-200">
                  <Calendar size={16} className="text-slate-700 dark:text-slate-200" />
                  <span className="text-xs font-medium tracking-wide">{dateRangeText}</span>
                </div>
              </div>
              
              {/* Actions & Search */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
                <div className="flex gap-2 w-full sm:w-auto">
                  <button onClick={() => setIsManualModalOpen(true)} className="flex-1 sm:flex-none justify-center bg-blue-600 dark:bg-blue-600/80 hover:bg-blue-700 dark:hover:bg-blue-600 text-white px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-600/20 dark:shadow-none flex items-center gap-2 font-bold text-xs capitalize tracking-wide">
                    <Plus size={16} /> Manual
                  </button>
                  <button onClick={() => setIsScanModalOpen(true)} className="flex-1 sm:flex-none justify-center bg-white dark:bg-[#0f172a] hover:bg-slate-50 dark:bg-slate-900/50 text-slate-700 dark:text-slate-200 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 flex items-center gap-2 font-bold shadow-sm text-xs capitalize tracking-wide">
                    <ScanLine size={16} /> Scan Nota
                  </button>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <div className="relative group flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                    <input type="text" placeholder="Cari transaksi..." className="w-full bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-xl py-2.5 pl-9 pr-4 text-xs font-medium outline-none focus:ring-2 focus:ring-blue-600/50 shadow-sm transition-all" />
                  </div>
                  <button className="bg-white dark:bg-[#0f172a] p-2.5 rounded-xl border border-slate-200 dark:border-white/10 relative text-slate-500 dark:text-slate-400 shadow-sm hover:bg-slate-50 dark:bg-slate-900/50 hover:text-blue-600 shrink-0 transition-colors">
                    <Bell size={18} />
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border border-white"></span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Header standar untuk halaman selain Dashboard
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{activeMenu}</h2>
            </div>
          </div>
        )}
      </header>
    </>
  );
}

export default Header;
