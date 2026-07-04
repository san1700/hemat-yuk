import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff, Mail, Key } from 'lucide-react';
import { auth } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, signInWithPopup, GoogleAuthProvider, sendPasswordResetEmail } from 'firebase/auth';

function AuthView({ setUser }) {
  const [authMode, setAuthMode] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [errorLogin, setErrorLogin] = useState('');
  const [resetEmail, setResetEmail] = useState('');

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

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900/50 items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-white dark:bg-[#0f172a] border border-slate-100 dark:border-white/5 rounded-[32px] p-6 md:p-10 shadow-xl">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-600/30 mb-4">
            <span className="text-3xl font-bold font-serif">H</span>
          </div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-widest capitalize text-center">
            {authMode === 'login' ? 'Login To HematIn' : authMode === 'register' ? 'Register New Account' : 'Reset Password'}
          </h1>
        </div>

        {errorLogin && (
          <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 mb-6 text-xs text-rose-500 text-center font-bold">
            {errorLogin}
          </div>
        )}

        {authMode === 'forgot' ? (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-6">Masukkan email Anda untuk menerima tautan reset password.</p>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
              <input value={resetEmail} onChange={e => setResetEmail(e.target.value)} required type="email" placeholder="Email Anda" className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:text-slate-500 outline-none focus:ring-2 focus:ring-blue-600/50 focus:border-blue-600 transition-all" />
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl mt-4 hover:bg-blue-700 transition-all capitalize tracking-widest text-xs shadow-lg shadow-blue-600/20">Kirim Link Reset</button>
            <div className="text-center mt-6">
              <button type="button" onClick={() => setAuthMode('login')} className="text-xs text-slate-500 dark:text-slate-400 hover:text-blue-600 transition-colors font-bold">Kembali ke Login</button>
            </div>
          </form>
        ) : authMode === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
              <input name="email" required type="email" placeholder="Email / Username" className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:text-slate-500 outline-none focus:ring-2 focus:ring-blue-600/50 focus:border-blue-600 transition-all" />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
              <input name="password" required type={showPassword ? "text" : "password"} placeholder="Password" className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-2xl py-4 pl-12 pr-12 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:text-slate-500 outline-none focus:ring-2 focus:ring-blue-600/50 focus:border-blue-600 transition-all" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-blue-600 transition-colors">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl mt-4 hover:bg-blue-700 transition-all capitalize tracking-widest text-xs shadow-lg shadow-blue-600/20">Login</button>

            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-slate-200"></div>
              <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">Or connect with:</span>
              <div className="flex-1 h-px bg-slate-200"></div>
            </div>

            <button type="button" onClick={handleGoogleLogin} className="w-full border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 font-bold py-3 rounded-2xl flex justify-center items-center gap-3 hover:bg-slate-50 dark:bg-slate-900/50 transition-all">
              <svg width="20" height="20" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                <path fill="none" d="M0 0h48v48H0z"/>
              </svg>
              Google
            </button>

            <div className="text-center mt-6 space-y-2 flex flex-col items-center">
              <button type="button" onClick={() => setAuthMode('forgot')} className="text-xs text-slate-500 dark:text-slate-400 hover:text-blue-600 transition-colors font-bold">Forgot Password?</button>
              <p className="text-xs text-slate-500 dark:text-slate-400">Need an account? <button type="button" onClick={() => setAuthMode('register')} className="text-blue-600 font-bold hover:underline">Register</button></p>
            </div>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
              <input name="fullName" required type="text" placeholder="Full Name" className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:text-slate-500 outline-none focus:ring-2 focus:ring-blue-600/50 focus:border-blue-600 transition-all" />
            </div>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
              <input name="email" required type="email" placeholder="Email" className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:text-slate-500 outline-none focus:ring-2 focus:ring-blue-600/50 focus:border-blue-600 transition-all" />
            </div>
            <div className="relative">
              <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
              <input name="password" required type={showPassword ? "text" : "password"} placeholder="Password" className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-2xl py-4 pl-12 pr-12 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:text-slate-500 outline-none focus:ring-2 focus:ring-blue-600/50 focus:border-blue-600 transition-all" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-blue-600 transition-colors">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
              <input name="confirmPassword" required type={showPassword ? "text" : "password"} placeholder="Confirm Password" className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:text-slate-500 outline-none focus:ring-2 focus:ring-blue-600/50 focus:border-blue-600 transition-all" />
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl mt-4 hover:bg-blue-700 transition-all capitalize tracking-widest text-xs shadow-lg shadow-blue-600/20">Sign Up</button>

            <div className="text-center mt-6">
              <p className="text-xs text-slate-500 dark:text-slate-400">Already have an account? <button type="button" onClick={() => setAuthMode('login')} className="text-blue-600 font-bold hover:underline">Login</button></p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default AuthView;
