import React from 'react';
import { LayoutDashboard, History, BarChart3, Wallet, User } from 'lucide-react';

function BottomNav({ activeMenu, setActiveMenu }) {
  const navItems = [
    { n: 'Dashboard', i: <LayoutDashboard size={22} /> },
    { n: 'Transactions', i: <History size={22} /> },
    { n: 'AI Analysis', i: <BarChart3 size={22} /> },
    { n: 'Savings Goals', i: <Wallet size={22} /> },
    { n: 'Profil', i: <User size={22} /> },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-[#0f172a] border-t border-slate-200 dark:border-white/10 flex justify-around items-center px-2 py-1 z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]" style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}>
      {navItems.map((item) => {
        const isActive = activeMenu === item.n;
        return (
          <button
            key={item.n}
            onClick={() => setActiveMenu(item.n)}
            className={`flex flex-col items-center justify-center w-full p-2 rounded-xl transition-all ${
              isActive 
                ? 'text-blue-600 dark:text-blue-400 font-bold' 
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            <div className={`${isActive ? 'bg-blue-100 dark:bg-blue-900/30 p-1 rounded-lg mb-1' : 'mb-1'}`}>
              {item.i}
            </div>
            <span className="text-[10px] leading-none whitespace-nowrap tracking-wide">
              {item.n === 'Transactions' ? 'Histori' : item.n === 'Savings Goals' ? 'Tabungan' : item.n}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default BottomNav;
