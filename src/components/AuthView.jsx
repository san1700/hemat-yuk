import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff, Mail, Key, ShieldCheck, BarChart3, Zap } from 'lucide-react';
import { auth } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, signInWithPopup, GoogleAuthProvider, sendPasswordResetEmail } from 'firebase/auth';

function AuthView({ setUser }) {
  const [authMode, setAuthMode] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [errorLogin, setErrorLogin] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErrorLogin('');
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      alert('Email reset password telah dikirim ke ' + resetEmail);
      setAuthMode('login');
      setResetEmail('');
    } catch (error) {
      setErrorLogin('Gagal mengirim email: ' + error.message);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorLogin('');
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      setUser(userCredential.user);
    } catch (error) {
      console.error(error);
      setErrorLogin('Gagal login: ' + error.message);
    }
  };

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

  const features = [
    { icon: <ShieldCheck className="text-indigo-500" size={24} />, title: 'Aman & Terpercaya', desc: 'Data kamu aman dengan enkripsi tingkat tinggi' },
    { icon: <BarChart3 className="text-emerald-500" size={24} />, title: 'Laporan Lengkap', desc: 'Pantau keuanganmu dengan grafik yang mudah dipahami' },
    { icon: <Zap className="text-amber-500" size={24} />, title: 'Mudah & Cepat', desc: 'Catat transaksi dalam hitungan detik' },
    { icon: <Lock className="text-rose-500" size={24} />, title: 'Privasi Terjaga', desc: 'Privasi kamu adalah prioritas utama kami' }
  ];

  return (
    <div className="min-h-screen bg-[#f8f9fc] dark:bg-slate-900 flex flex-col justify-center items-center p-4 md:p-8 font-sans">
      
      {/* MAIN CARD */}
      <div className="max-w-[1000px] w-full bg-white dark:bg-[#0f172a] rounded-[2rem] shadow-2xl flex flex-col md:flex-row overflow-hidden border border-slate-100 dark:border-white/5 relative z-10">
        
        {/* LEFT SIDE (Illustration) - Hidden on small screens */}
        <div className="hidden md:flex md:w-1/2 bg-indigo-50/50 dark:bg-indigo-900/10 p-10 flex-col relative overflow-hidden justify-between">
          {/* Decorative Blobs */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-200/40 dark:bg-indigo-600/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-200/40 dark:bg-purple-600/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 translate-x-1/3 translate-y-1/3"></div>

          {/* Logo Section */}
          <div className="flex items-center gap-3 relative z-10 mb-8">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
              <span className="text-2xl font-bold font-serif">H</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800 dark:text-white leading-none">HematYuk</h1>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Kelola keuanganmu dengan lebih cerdas</p>
            </div>
          </div>
          
          {/* Illustration Container */}
          <div className="flex-1 flex items-center justify-center relative z-10 w-full my-4">
            <div className="bg-indigo-100/50 dark:bg-indigo-500/10 w-[85%] aspect-square rounded-[3rem] flex items-center justify-center p-4 backdrop-blur-sm shadow-inner">
              <img src="/wallet-illustration.png" alt="Wallet Illustration" className="w-[90%] h-[90%] object-contain animate-fade-in-up" />
            </div>
          </div>
          
          <div></div> {/* Spacer */}
        </div>

        {/* RIGHT SIDE (Form) */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          
          {/* Mobile Logo (Visible only on mobile) */}
          <div className="md:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md">
              <span className="text-xl font-bold font-serif">H</span>
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-800 dark:text-white leading-none">HematYuk</h1>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              {authMode === 'login' ? 'Selamat Datang Kembali! 👋' : authMode === 'register' ? 'Buat Akun Baru ✨' : 'Reset Password'}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              {authMode === 'login' ? 'Masuk untuk melanjutkan ke akun HematYuk kamu' : authMode === 'register' ? 'Daftar untuk mulai mengelola keuanganmu' : 'Masukkan email kamu untuk mereset kata sandi'}
            </p>
          </div>

          {errorLogin && (
            <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 mb-6 text-xs text-rose-500 text-center font-bold">
              {errorLogin}
            </div>
          )}

          {authMode === 'forgot' ? (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input value={resetEmail} onChange={e => setResetEmail(e.target.value)} required type="email" placeholder="Masukkan email kamu" className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all" />
                </div>
              </div>
              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl mt-4 transition-all shadow-lg shadow-indigo-600/20">Kirim Link Reset</button>
              <div className="text-center mt-6">
                <button type="button" onClick={() => setAuthMode('login')} className="text-xs text-slate-500 hover:text-indigo-600 font-bold transition-colors">Kembali ke Login</button>
              </div>
            </form>
          ) : authMode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input name="email" required type="email" placeholder="Masukkan email kamu" className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input name="password" required type={showPassword ? "text" : "password"} placeholder="Masukkan password" className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-xl py-3.5 pl-11 pr-11 text-sm outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              
              <div className="flex justify-between items-center py-2">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${rememberMe ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 bg-white group-hover:border-indigo-500'}`}>
                    {rememberMe && <Check size={12} strokeWidth={4} />}
                  </div>
                  <input type="checkbox" className="hidden" checked={rememberMe} onChange={() => setRememberMe(!rememberMe)} />
                  <span className="text-xs text-slate-600 font-medium">Ingat saya</span>
                </label>
                <button type="button" onClick={() => setAuthMode('forgot')} className="text-xs text-indigo-600 font-bold hover:underline">Lupa password?</button>
              </div>

              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-600/20">Masuk</button>

              <div className="flex items-center gap-4 my-6">
                <div className="flex-1 h-px bg-slate-200 dark:bg-white/10"></div>
                <span className="text-xs text-slate-400 font-medium">atau masuk dengan</span>
                <div className="flex-1 h-px bg-slate-200 dark:bg-white/10"></div>
              </div>

              <button type="button" onClick={handleGoogleLogin} className="w-full border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 font-bold py-3 rounded-xl flex justify-center items-center gap-3 hover:bg-slate-50 dark:bg-slate-900/50 transition-all">
                <svg width="20" height="20" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                  <path fill="none" d="M0 0h48v48H0z"/>
                </svg>
                Masuk dengan Google
              </button>

              <div className="text-center mt-6">
                <p className="text-xs text-slate-500">Belum punya akun? <button type="button" onClick={() => setAuthMode('register')} className="text-indigo-600 font-bold hover:underline">Daftar sekarang</button></p>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Nama Lengkap</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input name="fullName" required type="text" placeholder="Masukkan nama kamu" className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input name="email" required type="email" placeholder="Masukkan email kamu" className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Password</label>
                <div className="relative">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input name="password" required type={showPassword ? "text" : "password"} placeholder="Buat password (min 6 char)" className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-xl py-3.5 pl-11 pr-11 text-sm outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Konfirmasi Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input name="confirmPassword" required type={showPassword ? "text" : "password"} placeholder="Ulangi password" className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all" />
                </div>
              </div>
              
              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl mt-2 transition-all shadow-lg shadow-indigo-600/20">Daftar Sekarang</button>

              <div className="text-center mt-6">
                <p className="text-xs text-slate-500">Sudah punya akun? <button type="button" onClick={() => setAuthMode('login')} className="text-indigo-600 font-bold hover:underline">Masuk</button></p>
              </div>
            </form>
          )}
        </div>
      </div>
      
      {/* FEATURES BOTTOM (Matches reference image) */}
      <div className="max-w-[1000px] w-full mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 px-4 pb-10">
         {features.map((f, i) => (
           <div key={i} className="flex gap-4 items-start">
             <div className="p-2.5 bg-white dark:bg-[#0f172a] rounded-xl shadow-sm border border-slate-100 dark:border-white/5 shrink-0">
               {f.icon}
             </div>
             <div>
               <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-1">{f.title}</h4>
               <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{f.desc}</p>
             </div>
           </div>
         ))}
      </div>
    </div>
  );
}

export default AuthView;
