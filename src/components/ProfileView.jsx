import React, { useState } from 'react';
import { 
  ShieldCheck, User, Wallet, Lock, Cloud, HelpCircle, LogOut, ChevronRight, 
  X, CheckCircle2, CreditCard, Loader2, Phone, Mail, ChevronDown, ChevronUp 
} from 'lucide-react';
import { signOut, updateProfile, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';

function ProfileView({ user }) {
  const [activeModal, setActiveModal] = useState(null); 

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'User';
  const initials = displayName.substring(0, 2).toUpperCase();

  // Modal States
  const [editName, setEditName] = useState(displayName);
  const [editBio, setEditBio] = useState("Creative Enthusiast");
  
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(true);
  const [isPinEnabled, setIsPinEnabled] = useState(false);

  const [isBackupLoading, setIsBackupLoading] = useState(false);
  const [backupSuccess, setBackupSuccess] = useState(false);

  const [activeFAQ, setActiveFAQ] = useState(null);

  const handleLogout = async () => {
    await signOut(auth);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: editName
        });
        setActiveModal(null);
        window.location.reload(); // Refresh to reflect changes easily
      }
    } catch (error) {
      alert('Gagal memperbarui profil: ' + error.message);
    }
  };

  const handleResetPassword = async () => {
    if (!user?.email) return;
    try {
      await sendPasswordResetEmail(auth, user.email);
      alert('Email reset password telah dikirim ke ' + user.email);
    } catch (error) {
      alert('Gagal mengirim email: ' + error.message);
    }
  };

  const handleBackup = () => {
    setIsBackupLoading(true);
    setBackupSuccess(false);
    setTimeout(() => {
      setIsBackupLoading(false);
      setBackupSuccess(true);
      setTimeout(() => {
        setBackupSuccess(false);
        setActiveModal(null);
      }, 2000);
    }, 2500);
  };

  const faqs = [
    { q: "Bagaimana cara membaca AI dari nota?", a: "Pergi ke halaman Dashboard lalu klik ikon 'Scan Nota' di bagian atas. Unggah foto nota Anda, dan AI akan otomatis membaca nominal serta kategorinya." },
    { q: "Apakah data saya aman?", a: "Sangat aman. Semua data Anda disimpan dalam database Firebase yang dienkripsi dan hanya dapat diakses oleh Anda sendiri." },
    { q: "Bagaimana cara mengubah target tabungan?", a: "Pergi ke halaman 'Savings Goals', lalu klik ikon pensil (edit) pada kotak target yang ingin Anda ubah angkanya." }
  ];

  const MenuItem = ({ icon: Icon, title, subtitle, isDestructive, onClick }) => (
    <button 
      onClick={onClick}
      className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:bg-slate-900/50 transition-all text-left group"
    >
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${isDestructive ? 'bg-rose-50 text-rose-500 group-hover:bg-rose-100' : 'bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600'}`}>
          <Icon size={20} />
        </div>
        <div>
          <h4 className={`text-sm font-bold ${isDestructive ? 'text-rose-600' : 'text-slate-800 dark:text-slate-100'}`}>{title}</h4>
          {subtitle && <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 capitalize tracking-widest mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <ChevronRight size={18} className="text-slate-300 group-hover:text-slate-400 dark:text-slate-500 group-hover:translate-x-1 transition-all" />
    </button>
  );

  return (
    <div className="px-4 md:px-0 pb-20 w-full animate-fade-in-up opacity-0">
      
      {/* Header Profile */}
      <div className="flex flex-col items-center justify-center mb-10 pt-4">
        <div className="relative mb-4">
          <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-3xl shadow-lg border-4 border-white">
            {initials}
          </div>
          <div className="absolute bottom-0 right-0 w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white text-white">
            <ShieldCheck size={14} />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{displayName}</h2>
        <p className="text-[10px] font-bold text-blue-600 capitalize tracking-[0.2em] mt-1">{editBio}</p>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">{user?.email}</p>
      </div>

      <div className="space-y-6 max-w-2xl mx-auto">
        {/* PENGATURAN AKUN */}
        <div>
          <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 capitalize tracking-[0.2em] mb-3 ml-4">Pengaturan Akun</h3>
          <div className="bg-white dark:bg-[#0f172a] border border-slate-100 dark:border-white/5 rounded-[32px] overflow-hidden shadow-sm divide-y divide-slate-50 dark:divide-white/5">
            <MenuItem icon={User} title="Edit Profil" subtitle="Ubah Nama dan Bio" onClick={() => setActiveModal('editProfile')} />
            <MenuItem icon={Wallet} title="Rekening & E-Wallet" subtitle="Kelola Metode Pembayaran" onClick={() => setActiveModal('wallet')} />
          </div>
        </div>

        {/* KEAMANAN */}
        <div>
          <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 capitalize tracking-[0.2em] mb-3 ml-4">Keamanan</h3>
          <div className="bg-white dark:bg-[#0f172a] border border-slate-100 dark:border-white/5 rounded-[32px] overflow-hidden shadow-sm divide-y divide-slate-50 dark:divide-white/5">
            <MenuItem icon={Lock} title="Keamanan & PIN" subtitle="Password, Biometrik, Face ID" onClick={() => setActiveModal('security')} />
            <MenuItem icon={Cloud} title="Backup Data" subtitle="Amankan Data Transaksi" onClick={() => setActiveModal('backup')} />
          </div>
        </div>

        {/* SISTEM */}
        <div>
          <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 capitalize tracking-[0.2em] mb-3 ml-4">Sistem</h3>
          <div className="bg-white dark:bg-[#0f172a] border border-slate-100 dark:border-white/5 rounded-[32px] overflow-hidden shadow-sm divide-y divide-slate-50 dark:divide-white/5">
            <MenuItem icon={HelpCircle} title="Bantuan & Dukungan" subtitle="FAQ dan Customer Service" onClick={() => setActiveModal('support')} />
            <MenuItem icon={LogOut} title="Keluar dari Aplikasi" isDestructive={true} onClick={handleLogout} />
          </div>
        </div>
      </div>

      {/* MODALS */}
      {activeModal && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-slate-900/50 backdrop-blur-sm p-0 md:p-4 animate-fade-in">
          <div className="bg-white dark:bg-[#0f172a] border border-slate-100 dark:border-white/5 w-full max-w-md rounded-t-[32px] md:rounded-[32px] p-6 shadow-2xl animate-fade-in-up max-h-[90vh] overflow-y-auto">
            
            {/* Header Modal Universal */}
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold capitalize tracking-tight text-slate-800 dark:text-slate-100">
                {activeModal === 'editProfile' && 'Edit Profil'}
                {activeModal === 'wallet' && 'Rekening & E-Wallet'}
                {activeModal === 'security' && 'Keamanan & PIN'}
                {activeModal === 'backup' && 'Backup Data'}
                {activeModal === 'support' && 'Bantuan'}
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/50 p-2 rounded-full"><X size={20} /></button>
            </div>

            {/* CONTENT: EDIT PROFILE */}
            {activeModal === 'editProfile' && (
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 capitalize tracking-widest mb-1 block">Nama Lengkap</label>
                  <input type="text" value={editName} onChange={e => setEditName(e.target.value)} required className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-2xl py-3 px-4 text-sm font-bold text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-600/50" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 capitalize tracking-widest mb-1 block">Bio Deskripsi</label>
                  <input type="text" value={editBio} onChange={e => setEditBio(e.target.value)} required className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-2xl py-3 px-4 text-sm font-bold text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-600/50" />
                </div>
                <div className="pt-4">
                  <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-2xl transition-all shadow-lg shadow-blue-600/20 text-sm capitalize tracking-widest">
                    Simpan Perubahan
                  </button>
                </div>
              </form>
            )}

            {/* CONTENT: WALLET */}
            {activeModal === 'wallet' && (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-white dark:bg-[#0f172a] p-2 rounded-xl text-blue-600"><CreditCard size={20} /></div>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-100 text-sm">BCA Utama</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold tracking-widest">**** **** 1234</p>
                    </div>
                  </div>
                  <span className="text-[9px] bg-blue-100 text-blue-700 font-bold px-2 py-1 rounded-md capitalize tracking-widest">Terhubung</span>
                </div>
                
                <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-white dark:bg-[#0f172a] p-2 rounded-xl text-emerald-500"><Wallet size={20} /></div>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-100 text-sm">GoPay</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold tracking-widest">0812 **** 9999</p>
                    </div>
                  </div>
                  <span className="text-[9px] bg-emerald-100 text-emerald-700 font-bold px-2 py-1 rounded-md capitalize tracking-widest">Terhubung</span>
                </div>

                <button className="w-full border-2 border-dashed border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 font-bold py-4 rounded-2xl text-sm hover:border-blue-300 hover:text-blue-600 transition-all hover:bg-blue-50 tracking-wide">
                  + Tambah Rekening / E-Wallet Baru
                </button>
              </div>
            )}

            {/* CONTENT: SECURITY */}
            {activeModal === 'security' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-white/5">
                  <div>
                    <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">Biometrik / Face ID</h4>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold mt-0.5">Login lebih cepat dan aman</p>
                  </div>
                  <button onClick={() => setIsBiometricEnabled(!isBiometricEnabled)} className={`w-12 h-6 rounded-full relative transition-colors ${isBiometricEnabled ? 'bg-blue-600' : 'bg-slate-300'}`}>
                    <div className={`w-5 h-5 bg-white dark:bg-[#0f172a] rounded-full absolute top-0.5 transition-transform ${isBiometricEnabled ? 'translate-x-6' : 'translate-x-0.5'}`}></div>
                  </button>
                </div>
                <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-white/5">
                  <div>
                    <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">PIN Transaksi</h4>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold mt-0.5">Minta PIN setiap menghapus data</p>
                  </div>
                  <button onClick={() => setIsPinEnabled(!isPinEnabled)} className={`w-12 h-6 rounded-full relative transition-colors ${isPinEnabled ? 'bg-blue-600' : 'bg-slate-300'}`}>
                    <div className={`w-5 h-5 bg-white dark:bg-[#0f172a] rounded-full absolute top-0.5 transition-transform ${isPinEnabled ? 'translate-x-6' : 'translate-x-0.5'}`}></div>
                  </button>
                </div>

                <div className="pt-4">
                  <button onClick={handleResetPassword} className="w-full bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold py-3.5 rounded-2xl transition-all text-sm capitalize tracking-widest">
                    Ubah Kata Sandi
                  </button>
                </div>
              </div>
            )}

            {/* CONTENT: BACKUP */}
            {activeModal === 'backup' && (
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Cloud size={40} />
                </div>
                <h4 className="font-bold text-slate-800 dark:text-slate-100 text-lg">Pencadangan Cloud</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                  Semua transaksi dan target tabungan Anda otomatis dicadangkan ke Google Cloud Firebase. Namun Anda bisa memaksakan sinkronisasi sekarang.
                </p>
                <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-white/5 text-xs text-slate-500 dark:text-slate-400 font-bold mt-4">
                  Terakhir dicadangkan: <span className="text-slate-800 dark:text-slate-100">Hari ini, 10:30 AM</span>
                </div>

                {backupSuccess ? (
                  <div className="bg-emerald-50 text-emerald-600 font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 mt-4 text-sm shadow-sm">
                    <CheckCircle2 size={18} /> Backup Berhasil
                  </div>
                ) : (
                  <button onClick={handleBackup} disabled={isBackupLoading} className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-2xl transition-all shadow-lg shadow-blue-600/20 text-sm capitalize tracking-widest flex items-center justify-center gap-2">
                    {isBackupLoading ? <><Loader2 size={18} className="animate-spin" /> Sedang Mencadangkan...</> : 'Cadangkan Sekarang'}
                  </button>
                )}
              </div>
            )}

            {/* CONTENT: SUPPORT */}
            {activeModal === 'support' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <button className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 transition-colors">
                    <Phone size={24} />
                    <span className="text-[10px] font-bold capitalize tracking-widest">WhatsApp</span>
                  </button>
                  <button className="bg-blue-50 text-blue-600 hover:bg-blue-100 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 transition-colors">
                    <Mail size={24} />
                    <span className="text-[10px] font-bold capitalize tracking-widest">Email</span>
                  </button>
                </div>
                
                <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm capitalize tracking-widest mb-3 text-left">FAQ (Sering Ditanyakan)</h4>
                <div className="space-y-2">
                  {faqs.map((faq, i) => (
                    <div key={i} className="border border-slate-100 dark:border-white/5 rounded-xl overflow-hidden">
                      <button onClick={() => setActiveFAQ(activeFAQ === i ? null : i)} className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:bg-slate-800/50 transition-colors text-left">
                        <span className="font-bold text-xs text-slate-800 dark:text-slate-100 pr-4 leading-relaxed">{faq.q}</span>
                        {activeFAQ === i ? <ChevronUp size={16} className="text-slate-500 dark:text-slate-400 shrink-0" /> : <ChevronDown size={16} className="text-slate-500 dark:text-slate-400 shrink-0" />}
                      </button>
                      {activeFAQ === i && (
                        <div className="p-4 bg-white dark:bg-[#0f172a] text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium border-t border-slate-50 text-left">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
          </div>
        </div>
      )}
      
    </div>
  );
}

export default ProfileView;
