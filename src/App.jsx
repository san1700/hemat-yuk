import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, BarChart3, Wallet, History, Layers, ShieldCheck,
  Bell, User, Settings, Search, MoreHorizontal, Plus, Download, 
  Printer, ArrowUpRight, ArrowDownLeft, RefreshCw, FileText, 
  Smartphone, CreditCard, ScanLine, Filter, Shield, Lock, Eye, EyeOff, Key, X, Camera, LogOut, Mail, Image as ImageIcon, Calendar, Utensils, Bus, ShoppingBag, Coffee, Trash2, Menu
} from 'lucide-react';

import { 
  XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';

// Import Firebase
import { auth, db } from './firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile } from 'firebase/auth';
import { collection, addDoc, onSnapshot, query, orderBy, doc, deleteDoc } from 'firebase/firestore';

// Import Gemini AI
import { GoogleGenerativeAI } from "@google/generative-ai";

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
  const [isScanning, setIsScanning] = useState(false); 
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // State Menu HP
  
  const [authMode, setAuthMode] = useState('login'); 
  const [showPassword, setShowPassword] = useState(false);

  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [errorLogin, setErrorLogin] = useState('');

  // ==========================================
  // KONFIGURASI GEMINI API
  // ==========================================
  const GEMINI_API_KEY = "AIzaSyC-a0-eE7iAbaizhRfQGgYLRR4RlT0D_Bo"; 
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

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

  // FUNGSI LOGIN
  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorLogin('');
    const formData = new FormData(e.target);
    try {
      await signInWithEmailAndPassword(auth, formData.get('email'), formData.get('password'));
    } catch (error) {
      setErrorLogin('Email atau password salah. Sila periksa kembali.');
    }
  };

  // FUNGSI REGISTER
  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorLogin('');
    const formData = new FormData(e.target);
    const fullName = formData.get('fullName');
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');

    if (password !== confirmPassword) {
      setErrorLogin('Konfirmasi password tidak cocok!');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.get('email'), password);
      await updateProfile(userCredential.user, {
        displayName: fullName
      });
      setUser({ ...userCredential.user, displayName: fullName });
    } catch (error) {
      setErrorLogin('Gagal mendaftar. Pastikan email valid & password min. 6 karakter.');
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  // FUNGSI INPUT MANUAL
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

  // FUNGSI SCAN NOTA 
  const handleScanNota = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsScanning(true);

    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64Data = reader.result.split(',')[1];
        
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `Analisis gambar struk belanja ini. Ekstrak data menjadi JSON. Wajib persis seperti format ini: {"item": "Nama Toko atau Barang", "category": "Food", "amount": 105000}. Pilihan kategori: Food, Transport, Lifestyle, Edu, Snacks, Coffee. Nominal amount berupa angka bulat saja tanpa titik atau koma.`;

        const imagePart = {
          inlineData: {
            data: base64Data,
            mimeType: file.type
          }
        };

        const result = await model.generateContent([prompt, imagePart]);
        const responseText = result.response.text();

        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error("AI tidak membalas dengan format JSON yang valid.");
        }

        const data = JSON.parse(jsonMatch[0]);

        await addDoc(collection(db, "transactions"), {
          n: data.item || 'Transaksi AI Scan',
          c: data.category || 'Lifestyle',
          b: 'BCA', 
          a: `-Rp ${parseInt(data.amount || 0).toLocaleString('id-ID')}`,
          sc: 'text-rose-500',
          createdAt: new Date().toISOString()
        });

        setIsScanModalOpen(false);
        setIsScanning(false);
        alert(`Berhasil! Nota diekstrak murni oleh AI: ${data.item} - Rp ${parseInt(data.amount).toLocaleString('id-ID')}`);

      } catch (error) {
        alert(`Gagal memproses nota: ${error.message}`);
        setIsScanning(false);
      }
    };
    
    reader.readAsDataURL(file);
  };

  // FUNGSI HAPUS TRANSAKSI
  const handleDeleteTransaction = async (id) => {
    if (window.confirm("Yakin ingin menghapus transaksi ini?")) {
      try {
        await deleteDoc(doc(db, "transactions", id));
      } catch (error) {
        alert("Gagal menghapus data: " + error.message);
      }
    }
  };

  // ==========================================
  // VIEW 1: AUTHENTICATION (LOGIN / REGISTER)
  // ==========================================
  if (!user) {
    return (
      <div className="flex min-h-screen bg-slate-50 items-center justify-center p-4 font-sans">
        <div className="w-full max-w-md bg-white border border-slate-100 rounded-[32px] p-6 md:p-10 shadow-xl">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-600/30 mb-4">
              <span className="text-3xl font-bold font-serif">H</span>
            </div>
            <h1 className="text-xl font-bold text-slate-800 tracking-widest uppercase text-center">
              {authMode === 'login' ? 'Login To HematIn' : 'Register New Account'}
            </h1>
          </div>
          
          {errorLogin && (
            <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 mb-6 text-xs text-rose-500 text-center font-bold">
              {errorLogin}
            </div>
          )}

          {authMode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input name="email" required type="email" placeholder="Email / Username" className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-600/50 focus:border-blue-600 transition-all" />
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input name="password" required type={showPassword ? "text" : "password"} placeholder="Password" className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-12 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-600/50 focus:border-blue-600 transition-all" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors">
                  {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                </button>
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl mt-4 hover:bg-blue-700 transition-all uppercase tracking-widest text-xs shadow-lg shadow-blue-600/20">Login</button>
              
              <div className="flex items-center gap-4 my-6">
                <div className="flex-1 h-px bg-slate-200"></div>
                <span className="text-xs text-slate-400 font-medium">Or connect with:</span>
                <div className="flex-1 h-px bg-slate-200"></div>
              </div>
              
              <button type="button" className="w-full border border-slate-200 text-slate-600 font-bold py-3 rounded-2xl flex justify-center items-center gap-3 hover:bg-slate-50 transition-all">
                <div className="w-5 h-5 bg-white border border-slate-200 text-slate-800 font-bold flex items-center justify-center rounded-full text-xs">G</div> Google
              </button>

              <div className="text-center mt-6 space-y-2">
                <a href="#" className="text-xs text-slate-500 hover:text-blue-600 block transition-colors">Forgot Password?</a>
                <p className="text-xs text-slate-500">Need an account? <button type="button" onClick={() => setAuthMode('register')} className="text-blue-600 font-bold hover:underline">Register</button></p>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input name="fullName" required type="text" placeholder="Full Name" className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-600/50 focus:border-blue-600 transition-all" />
              </div>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input name="email" required type="email" placeholder="Email" className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-600/50 focus:border-blue-600 transition-all" />
              </div>
              <div className="relative">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input name="password" required type={showPassword ? "text" : "password"} placeholder="Password" className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-12 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-600/50 focus:border-blue-600 transition-all" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors">
                  {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input name="confirmPassword" required type={showPassword ? "text" : "password"} placeholder="Confirm Password" className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-600/50 focus:border-blue-600 transition-all" />
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl mt-4 hover:bg-blue-700 transition-all uppercase tracking-widest text-xs shadow-lg shadow-blue-600/20">Sign Up</button>
              
              <div className="text-center mt-6">
                <p className="text-xs text-slate-500">Already have an account? <button type="button" onClick={() => setAuthMode('login')} className="text-blue-600 font-bold hover:underline">Login</button></p>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: DASHBOARD MAIN (RESPONSIVE)
  // ==========================================
  
  const displayName = user?.displayName || user?.email?.split('@')[0] || 'User';
  const initials = displayName.substring(0, 2).toUpperCase();

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 text-slate-800" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      
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

      {/* MAIN CONTENT WRAPPER */}
      <div className="flex-1 flex flex-col w-full min-h-screen md:ml-64">
        
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

        <main className="flex-1 p-4 md:p-8 overflow-y-auto relative">
          
          {/* HEADER DASHBOARD */}
          <header className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-6 md:mb-8">
            <div><h2 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard</h2><p className="text-slate-500 text-sm font-medium flex items-center gap-2 mt-1">📅 Minggu, 17 Mei 2026</p></div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
              <div className="flex gap-2 w-full sm:w-auto">
                <button onClick={() => setIsManualModalOpen(true)} className="flex-1 sm:flex-none justify-center bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-xl transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2 font-medium"><Plus size={18} /> Manual</button>
                <button onClick={() => setIsScanModalOpen(true)} className="flex-1 sm:flex-none justify-center bg-white hover:bg-slate-50 text-slate-700 p-2.5 rounded-xl border border-slate-200 flex items-center gap-2 font-medium shadow-sm"><ScanLine size={18} /> Scan Nota</button>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <div className="relative group flex-1">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input type="text" placeholder="Cari transaksi..." className="w-full bg-white border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-blue-600/50 shadow-sm" />
                </div>
                <button className="bg-white p-2.5 rounded-xl border border-slate-200 relative text-slate-500 shadow-sm hover:bg-slate-50 shrink-0"><Bell size={20} /><span className="absolute top-2 right-2.5 w-2 h-2 bg-rose-500 rounded-full"></span></button>
              </div>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 mb-8">
            <div className="lg:col-span-3 bg-white border border-slate-100 p-6 rounded-[24px] shadow-sm">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Saldo</p>
              <p className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight mb-2">Rp {currentBalance.toLocaleString('id-ID')}</p>
              <div className="flex items-center gap-2 text-[10px] font-bold text-blue-600 bg-blue-50 w-fit px-2 py-1 rounded-lg mb-6"><ArrowUpRight size={12} /> +12.4%</div>
              <div className="space-y-4 pt-4 border-t border-slate-100">
                {['BCA', 'Mandiri', 'GoPay'].map((bank, i) => (
                  <div key={i} className="flex justify-between items-center"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-[10px] font-bold text-blue-600">{bank[0]}</div><p className="text-xs font-bold text-slate-700 leading-none">{bank}</p></div><p className="text-xs font-bold text-slate-900">Rp {i === 0 ? '2.450k' : '1.200k'}</p></div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-6 bg-white border border-slate-100 p-4 md:p-8 rounded-[24px] shadow-sm">
              <div className="h-[220px] w-full"><ResponsiveContainer width="100%" height="100%"><AreaChart data={dataProyeksi}><defs><linearGradient id="colorAktual" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/><stop offset="95%" stopColor="#2563eb" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" /><XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} /><Tooltip contentStyle={{backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', color: '#1e293b'}} /><Area type="monotone" dataKey="aktual" stroke="#2563eb" strokeWidth={3} fill="url(#colorAktual)" /><Area type="monotone" dataKey="prediksi" stroke="#94a3b8" strokeWidth={3} strokeDasharray="5 5" fill="transparent" /></AreaChart></ResponsiveContainer></div>
            </div>

            <div className="lg:col-span-3 bg-white border border-slate-100 p-6 rounded-[24px] shadow-sm flex flex-col justify-center">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-4 tracking-widest text-center">AI Financial Score</h4>
              <div className="relative w-28 h-28 md:w-32 md:h-32 mx-auto mb-4"><svg className="w-full h-full transform -rotate-90"><circle cx="50%" cy="50%" r="45%" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100" /><circle cx="50%" cy="50%" r="45%" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="364.4" strokeDashoffset="72.8" className="text-blue-500" /></svg><div className="absolute inset-0 flex items-center justify-center"><span className="text-xl md:text-2xl font-bold text-slate-800">80%</span></div></div>
              <p className="text-[10px] text-center text-slate-500 px-2 md:px-4 leading-relaxed font-bold uppercase tracking-tighter">Kondisi keuanganmu sangat sehat bulan ini!</p>
            </div>
          </div>

          <div className="bg-white border border-slate-100 p-4 md:p-8 rounded-[32px] mb-8 shadow-sm">
            <div className="flex justify-between items-center mb-6 md:mb-8"><h3 className="text-lg md:text-xl font-bold text-slate-900 uppercase tracking-tight">Transaksi Terakhir</h3></div>
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[500px]">
                <thead>
                  <tr className="text-slate-500 text-[9px] font-bold uppercase tracking-[0.3em] border-b border-slate-100">
                    <th className="pb-5 px-4">Deskripsi</th>
                    <th className="pb-5">Kategori</th>
                    <th className="pb-5">Bank</th>
                    <th className="pb-5 text-right">Jumlah</th>
                    <th className="pb-5 px-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {transactions.map((item, i) => (
                    <tr key={item.id || i} className="hover:bg-slate-50 transition-all group">
                      <td className="py-4 md:py-5 px-4"><p className="text-xs md:text-sm font-bold text-slate-800 uppercase tracking-tight">{item.n}</p><p className="text-[9px] md:text-[10px] text-slate-400 font-bold mt-1 uppercase">Terbaru</p></td>
                      <td className="py-4 md:py-5"><span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-slate-500">{item.c}</span></td>
                      <td className="py-4 md:py-5 text-[10px] md:text-xs font-bold text-slate-500 uppercase">{item.b}</td>
                      <td className={`py-4 md:py-5 text-right font-bold text-xs md:text-sm ${item.a.includes('-') ? 'text-slate-800' : 'text-green-600'}`}>{item.a}</td>
                      <td className="py-4 md:py-5 px-4 text-right">
                        <button 
                          onClick={() => handleDeleteTransaction(item.id)}
                          className="text-slate-400 hover:text-rose-500 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all p-2"
                          title="Hapus Transaksi"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 pb-20">
            <div className="bg-white border border-slate-100 p-6 md:p-8 rounded-[32px] shadow-sm">
              <h3 className="text-base md:text-lg font-bold text-slate-900 uppercase tracking-tight mb-6 md:mb-8">Distribusi Kategori</h3>
              <div className="h-[180px] md:h-[200px]">
                {dynamicDistribusi.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={dynamicDistribusi} innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">{dynamicDistribusi.map((entry, index) => (<Cell key={index} fill={entry.color} stroke="transparent" />))}</Pie><Tooltip contentStyle={{backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', color: '#1e293b'}} /></PieChart></ResponsiveContainer>
                ) : <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs font-bold">Belum ada pengeluaran</div>}
              </div>
              <div className="grid grid-cols-2 gap-3 md:gap-4 mt-6">
                {dynamicDistribusi.map((item, i) => (
                  <div key={i} className="flex justify-between items-center text-[9px] md:text-[10px] font-bold uppercase tracking-wider"><div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{backgroundColor: item.color}}></div><span className="text-slate-500 truncate max-w-[60px] md:max-w-[80px]">{item.name}</span></div><span className="text-slate-700">{item.value}%</span></div>
                ))}
              </div>
            </div>
            <div className="bg-white border border-slate-100 p-6 md:p-8 rounded-[32px] shadow-sm">
              <h3 className="text-base md:text-lg font-bold text-slate-900 uppercase tracking-tight mb-6 md:mb-8">Savings Goals</h3>
              <div className="space-y-6">
                {[{ n: 'Laptop Baru', p: '40%', c: 'bg-blue-600' }, { n: 'KKN Trip', p: '75%', c: 'bg-sky-400' }].map((goal, i) => (
                  <div key={i}><div className="flex justify-between items-center mb-3"><p className="text-[10px] md:text-xs font-bold text-slate-700 uppercase tracking-tight">{goal.n}</p><p className="text-[10px] md:text-xs font-bold text-slate-900">{goal.p}</p></div><div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden"><div className={`${goal.c} h-full rounded-full`} style={{width: goal.p}}></div></div></div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* MODAL INPUT MANUAL */}
      {isManualModalOpen && (
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
      )}

      {/* MODAL SCAN AI */}
      {isScanModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-slate-900/50 backdrop-blur-sm p-0 md:p-4">
          <div className="bg-white border border-slate-100 w-full max-w-md rounded-t-[32px] md:rounded-[32px] p-6 md:p-8 text-center text-slate-800 shadow-2xl animate-in slide-in-from-bottom md:slide-in-from-bottom-0 md:zoom-in duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg md:text-xl font-bold uppercase tracking-tight">Ambil Foto Nota</h3>
              <button onClick={() => setIsScanModalOpen(false)} disabled={isScanning} className="text-slate-400 hover:text-slate-600 p-2"><X size={24}/></button>
            </div>
            
            {isScanning ? (
              <div className="border-2 border-dashed border-blue-500 rounded-[32px] p-10 md:p-12 flex flex-col items-center gap-4 bg-blue-50 my-4">
                <RefreshCw className="animate-spin text-blue-600" size={40} />
                <p className="font-bold text-blue-600 uppercase tracking-widest text-xs animate-pulse">Memproses AI...</p>
              </div>
            ) : (
              <div className="space-y-4 mb-4">
                <label className="border border-slate-200 rounded-2xl p-5 md:p-6 flex flex-col items-center gap-3 bg-slate-50 hover:bg-blue-50 hover:border-blue-200 transition-all cursor-pointer">
                  <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleScanNota} />
                  <Camera size={32} className="text-blue-600"/>
                  <p className="font-bold text-slate-700 uppercase tracking-widest text-[10px] md:text-xs">Ambil Foto Baru</p>
                </label>
                
                <label className="border border-slate-200 rounded-2xl p-5 md:p-6 flex flex-col items-center gap-3 bg-slate-50 hover:bg-blue-50 hover:border-blue-200 transition-all cursor-pointer">
                  <input type="file" accept="image/*" className="hidden" onChange={handleScanNota} />
                  <ImageIcon size={32} className="text-sky-500"/>
                  <p className="font-bold text-slate-700 uppercase tracking-widest text-[10px] md:text-xs">Impor Dari Galeri</p>
                </label>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

export default App;