import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, onSnapshot, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { auth, db } from './firebase';

// Komponen
import AuthView from './components/AuthView';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import ManualInputModal from './components/ManualInputModal';
import ScanModal from './components/ScanModal';

const dataProyeksi = [
  { day: 1, aktual: 4.2, prediksi: 4.2 },
  { day: 7, aktual: 3.8, prediksi: 3.8 },
  { day: 12, aktual: 3.2, prediksi: 3.2 },
  { day: 15, prediksi: 2.8 },
  { day: 20, prediksi: 2.2 },
  { day: 25, prediksi: 1.8 },
  { day: 30, prediksi: 1.4 },
];

function App() {
  const [activeMenu, setActiveMenu] = useState('Dashboard');
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "transactions"), orderBy("createdAt", "desc"));
    const unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
      const transData = [];
      snapshot.forEach((document) => {
        transData.push({ id: document.id, ...document.data() });
      });
      setTransactions(transData);
    });
    return () => unsubscribeSnapshot();
  }, [user]);

  const parseAmount = (amountStr) => {
    if (!amountStr) return 0;
    const num = parseInt(amountStr.toString().replace(/[^0-9]/g, ''), 10);
    return amountStr.toString().includes('-') ? -num : num;
  };

  const initialBalance = 5000000;
  const totalTransactions = transactions.reduce((acc, curr) => acc + parseAmount(curr.a), 0);
  const currentBalance = initialBalance + totalTransactions;

  const calculateDistribution = () => {
    const dist = {};
    let totalExpense = 0;
    const colorMap = { 'Food': '#2563eb', 'Transport': '#60a5fa', 'Coffee': '#93c5fd', 'Snacks': '#bfdbfe', 'Edu': '#dbeafe', 'Lifestyle': '#1e3a8a' };

    transactions.forEach(t => {
      const val = parseAmount(t.a);
      if (val < 0) {
        const absVal = Math.abs(val);
        dist[t.c] = (dist[t.c] || 0) + absVal;
        totalExpense += absVal;
      }
    });

    if (totalExpense === 0) return [];
    return Object.keys(dist).map(key => ({
      name: key,
      value: parseFloat(((dist[key] / totalExpense) * 100).toFixed(1)),
      color: colorMap[key] || '#94a3b8'
    })).sort((a, b) => b.value - a.value);
  };
  
  const dynamicDistribusi = calculateDistribution();

  const handleDeleteTransaction = async (id) => {
    if (window.confirm("Yakin ingin menghapus transaksi ini?")) {
      try {
        await deleteDoc(doc(db, "transactions", id));
      } catch (error) {
        alert("Gagal menghapus data: " + error.message);
      }
    }
  };

  if (!user) {
    return <AuthView setUser={setUser} />;
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 text-slate-800" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      <Sidebar 
        user={user} 
        activeMenu={activeMenu} 
        setActiveMenu={setActiveMenu} 
        isMobileMenuOpen={isMobileMenuOpen} 
        setIsMobileMenuOpen={setIsMobileMenuOpen} 
      />

      <div className="flex-1 flex flex-col w-full min-h-screen md:ml-64">
        
        <Header 
          setIsMobileMenuOpen={setIsMobileMenuOpen} 
          setIsManualModalOpen={setIsManualModalOpen} 
          setIsScanModalOpen={setIsScanModalOpen} 
        />

        <main className="flex-1 p-4 md:p-8 overflow-y-auto relative">
          {activeMenu === 'Dashboard' && (
            <Dashboard 
              currentBalance={currentBalance}
              dataProyeksi={dataProyeksi}
              dynamicDistribusi={dynamicDistribusi}
              transactions={transactions}
              handleDeleteTransaction={handleDeleteTransaction}
            />
          )}
          {activeMenu !== 'Dashboard' && (
            <div className="flex items-center justify-center h-64 border-2 border-dashed border-slate-200 rounded-3xl">
              <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">View for {activeMenu} (Coming Soon)</p>
            </div>
          )}
        </main>
      </div>

      {isManualModalOpen && (
        <ManualInputModal setIsManualModalOpen={setIsManualModalOpen} />
      )}

      {isScanModalOpen && (
        <ScanModal setIsScanModalOpen={setIsScanModalOpen} />
      )}

    </div>
  );
}

export default App;