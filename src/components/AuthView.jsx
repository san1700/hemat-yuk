import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff, Mail, Key } from 'lucide-react';
import { auth } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';

function AuthView({ setUser }) {
  const [authMode, setAuthMode] = useState('login'); 
  const [showPassword, setShowPassword] = useState(false);
  const [errorLogin, setErrorLogin] = useState('');

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

export default AuthView;
