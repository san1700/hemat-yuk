import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, onSnapshot, query, where, deleteDoc, doc } from 'firebase/firestore';
import { auth, db } from './firebase';

// Komponen
import AuthView from './components/AuthView';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import ManualInputModal from './components/ManualInputModal';
import ScanModal from './components/ScanModal';
import TransactionsView from './components/TransactionsView';
import AIAnalysisView from './components/AIAnalysisView';
import SavingsView from './components/SavingsView';
import ProfileView from './components/ProfileView';
import BottomNav from './components/BottomNav';

// Utils
import { CATEGORY_CONFIG } from './utils/categories';

// Removed hardcoded dataProyeksi

function App() {
  const [activeMenu, setActiveMenu] = useState('Dashboard');
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [ocrResult, setOcrResult] = useState(null);
  
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [savingsGoals, setSavingsGoals] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [monthlyBudget, setMonthlyBudget] = useState(() => parseInt(localStorage.getItem('hematYuk_budget') || '3000000', 10));
  const [theme, setTheme] = useState(() => localStorage.getItem('hematYuk_theme') || 'light');

  useEffect(() => {
    localStorage.setItem('hematYuk_budget', monthlyBudget.toString());
  }, [monthlyBudget]);

  useEffect(() => {
    localStorage.setItem('hematYuk_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const [transactionToDelete, setTransactionToDelete] = useState(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "transactions"), where("userId", "==", user.uid));
    const unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
      const transData = [];
      snapshot.forEach(doc => transData.push({ id: doc.id, ...doc.data() }));
      transData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setTransactions(transData);
    });

    const qSavings = query(collection(db, "savings"), where("userId", "==", user.uid));
    const unsubscribeSavings = onSnapshot(qSavings, (snapshot) => {
      const sg = [];
      snapshot.forEach(doc => sg.push({ id: doc.id, ...doc.data() }));
      setSavingsGoals(sg);
    });

    return () => { unsubscribeSnapshot(); unsubscribeSavings(); };
  }, [user]);

  const parseAmount = (amountStr) => {
    const isExpense = amountStr.includes('-');
    const val = parseInt(amountStr.toString().replace(/[^0-9]/g, ''), 10) || 0;
    return isExpense ? -val : val;
  };

  const initialBalance = 0;
  const totalTransactions = transactions.reduce((acc, curr) => acc + parseAmount(curr.a), 0);
  const currentBalance = initialBalance + totalTransactions;

  const activeTransactions = transactions.filter(t => {
    const dStr = t.tanggal || t.createdAt;
    if (!dStr) return false;
    const d = new Date(dStr);
    return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
  });

  let monthlyIncome = 0;
  let monthlyExpense = 0;
  activeTransactions.forEach(t => {
    const val = parseAmount(t.a);
    if (val < 0) monthlyExpense += Math.abs(val);
    else monthlyIncome += val;
  });

  const calculateDistribution = () => {
    const dist = {};
    let totalExpense = 0;
    activeTransactions.forEach(t => {
      const val = parseAmount(t.a);
      if (val < 0) {
        const absVal = Math.abs(val);
        dist[t.c] = (dist[t.c] || 0) + absVal;
        totalExpense += absVal;
      }
    });

    if (totalExpense === 0) return [];

    return Object.keys(dist).map(category => ({
      name: category,
      value: (dist[category] / totalExpense) * 100,
      amount: dist[category],
      color: CATEGORY_CONFIG[category]?.color || '#94a3b8'
    }));
  };
  
  const dynamicDistribusi = calculateDistribution();

  // Hitung grafik pengeluaran kumulatif harian
  const dynamicProyeksi = [];
  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  let cumulativeExpense = 0;
  
  const isCurrentMonthYear = selectedMonth === new Date().getMonth() && selectedYear === new Date().getFullYear();
  const todayDate = new Date().getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    let dayExpense = 0;
    activeTransactions.forEach(t => {
      const d = new Date(t.tanggal || t.createdAt);
      if (d.getDate() === day) {
        const val = parseAmount(t.a);
        if (val < 0) dayExpense += Math.abs(val);
      }
    });
    cumulativeExpense += dayExpense;

    if (isCurrentMonthYear && day > todayDate) {
       // Jangan render garis untuk masa depan di bulan berjalan
       break; 
    }
    
    dynamicProyeksi.push({
      day: day,
      aktual: cumulativeExpense
    });
  }

  const confirmDeleteTransaction = async () => {
    if (!transactionToDelete) return;
    try {
      await deleteDoc(doc(db, "transactions", transactionToDelete));
      setTransactionToDelete(null);
    } catch (error) {
      console.error("Gagal menghapus transaksi:", error);
    }
  };

  const handleDeleteTransaction = (id) => {
    setTransactionToDelete(id);
  };

  const handleEditTransaction = (item) => {
    setEditingTransaction(item);
    setIsManualModalOpen(true);
  };

  const handleScanSuccess = (aiData) => {
    setIsScanModalOpen(false);
    const prepopulatedTx = {
       n: aiData.item || 'Transaksi AI Scan',
       c: aiData.category || 'Lifestyle',
       b: 'BCA',
       a: `-Rp ${parseInt(aiData.amount || 0).toLocaleString('id-ID')}`,
       sc: 'text-rose-500',
       tanggal: new Date().toISOString().split('T')[0],
       keterangan: 'Hasil Scan AI'
    };
    setEditingTransaction(prepopulatedTx);
    setIsManualModalOpen(true);
  };

  if (!user) {
    return <AuthView setUser={setUser} />;
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      <Sidebar 
        user={user} 
        activeMenu={activeMenu} 
        setActiveMenu={setActiveMenu} 
        isMobileMenuOpen={isMobileMenuOpen} 
        setIsMobileMenuOpen={setIsMobileMenuOpen} 
        theme={theme}
        setTheme={setTheme}
      />

      <div className="flex-1 flex flex-col w-full min-h-screen md:ml-64">
        
        <Header 
          user={user}
          activeMenu={activeMenu}
          setIsMobileMenuOpen={setIsMobileMenuOpen} 
          setIsManualModalOpen={() => { setEditingTransaction(null); setIsManualModalOpen(true); }} 
          setIsScanModalOpen={setIsScanModalOpen} 
          selectedMonth={selectedMonth}
          setSelectedMonth={setSelectedMonth}
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
        />

        <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8 overflow-y-auto relative">
          {activeMenu === 'Dashboard' && (
            <Dashboard 
              currentBalance={currentBalance}
              monthlyIncome={monthlyIncome}
              monthlyExpense={monthlyExpense}
              monthlyBudget={monthlyBudget}
              setMonthlyBudget={setMonthlyBudget}
              dynamicDistribusi={dynamicDistribusi}
              transactions={activeTransactions}
              allTransactions={transactions}
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
              setActiveMenu={setActiveMenu}
              handleDeleteTransaction={handleDeleteTransaction}
            />
          )}
          {activeMenu === 'Transactions' && (
            <TransactionsView 
              transactions={activeTransactions} 
              handleDeleteTransaction={handleDeleteTransaction} 
              handleEditTransaction={handleEditTransaction}
            />
          )}
          {activeMenu === 'AI Analysis' && (
            <AIAnalysisView transactions={activeTransactions} />
          )}
          {activeMenu === 'Savings Goals' && (
            <SavingsView savingsGoals={savingsGoals} user={user} />
          )}
          {activeMenu === 'Profil' && (
            <ProfileView user={user} theme={theme} setTheme={setTheme} />
          )}
        </main>
      </div>

      {/* MODAL SCAN NOTA */}
      {isScanModalOpen && (
        <ScanModal
          user={user}
          setIsScanModalOpen={setIsScanModalOpen}
          onScanSuccess={handleScanSuccess}
        />
      )}

      {/* MODAL REVIEW OCR / TAMBAH MANUAL */}
      {isManualModalOpen && (
        <ManualInputModal
          user={user}
          editingTransaction={editingTransaction}
          setIsManualModalOpen={setIsManualModalOpen}
          initialOcrResult={ocrResult}
          onClose={() => {
            setIsManualModalOpen(false);
            setOcrResult(null);
            setEditingTransaction(null);
          }}
        />
      )}

      {/* MODAL KONFIRMASI HAPUS TRANSAKSI */}
      {transactionToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/10 w-full max-w-sm rounded-[32px] p-6 shadow-2xl animate-fade-in-up text-center">
            <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/30 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 tracking-tight">Hapus Transaksi?</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">Tindakan ini tidak bisa dibatalkan. Riwayat transaksi ini akan dihapus secara permanen.</p>
            <div className="flex gap-3">
              <button onClick={() => setTransactionToDelete(null)} className="flex-1 py-3 rounded-2xl font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-sm uppercase tracking-widest">
                Batal
              </button>
              <button onClick={confirmDeleteTransaction} className="flex-1 py-3 rounded-2xl font-bold text-white bg-rose-500 hover:bg-rose-600 transition-colors shadow-lg shadow-rose-500/20 text-sm uppercase tracking-widest">
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BOTTOM NAVIGATION (Mobile Only) */}
      <BottomNav activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
    </div>
  );
}

export default App;