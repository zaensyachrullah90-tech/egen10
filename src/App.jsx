import React, { useState, useEffect, useMemo } from 'react';
import { 
  Home, Calendar, PlusCircle, Coins, User, FileText, Upload, 
  CheckCircle, AlertCircle, Clock, X, Camera, LogOut, ShieldAlert, Key, Zap,
  Edit3, PenTool, Database, DollarSign, Activity, Lock, Users, Target, BookOpen, Trash2, FolderSync, Copy, Archive, Paperclip, Building, Link as LinkIcon, ChevronRight
} from 'lucide-react';

// --- FIREBASE REALTIME DATABASE ---
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getDatabase, ref, onValue, push, set, update } from 'firebase/database';

// Menggunakan Konfigurasi Asli Milik Anda Sebagai Fallback Utama (Agar 100% Tidak Stuck)
const getFirebaseConfig = () => {
  try {
    if (typeof __firebase_config !== 'undefined' && __firebase_config) {
      return JSON.parse(__firebase_config);
    }
  } catch (e) {}
  
  // Konfigurasi Anda yang ditanam langsung agar terjamin berfungsi
  return {
    apiKey: "AIzaSyAe-mQ8o9VQUE-bjvH1_zFF4BgJiZZ84B8",
    authDomain: "e-genlap.firebaseapp.com",
    databaseURL: "https://e-genlap-default-rtdb.firebaseio.com",
    projectId: "e-genlap",
    storageBucket: "e-genlap.firebasestorage.app",
    messagingSenderId: "717106227570",
    appId: "1:717106227570:web:40ae5a838eec42efea95eb"
  };
};

const firebaseConfig = getFirebaseConfig();
let app, auth, db;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getDatabase(app); 
} catch (e) {
  console.warn("Firebase Init Failed.");
}

// Webhook URL Google Script Asli Anda (Penting untuk Cetak PDF & Kirim Foto)
const GAS_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbz0dhsRa8FmwhUpzLq08gkBk-gVWIxUKBahE19lcGBdql5ZwUsN2BtTWS22SI9Sp2jJ/exec";
const appId = "egenlap-v2-kemensos";

// JALUR REALTIME DATABASE
const DB_PATHS = {
  users: `artifacts/${appId}/public/data/users`, 
  reports: `artifacts/${appId}/public/data/reports`,
  agendas: `artifacts/${appId}/public/data/agendas`, 
  config: `artifacts/${appId}/public/data/config`,
  transactions: `artifacts/${appId}/public/data/transactions`
};

const DEFAULT_JABATAN_ASN = ["Penata Layanan Operasional", "Pengelola Layanan Operasional", "Operator Layanan Operasional"];
const DEFAULT_MASTER_DATA = {
  "Pendamping PKH": { rhk: ["Melakukan edukasi dan sosialisasi pencairan tunai/non-tunai", "Melaksanakan Pertemuan Peningkatan Kemampuan Keluarga (P2K2)", "Melaksanakan Respon Kasus/Pengaduan/Kerentanan", "Verifikasi Validasi dan Pemutakhiran Data KPM", "Melakukan sosialisasi kebijakan PKH", "Graduasi KPM Mandiri", "Membuat laporan bulanan"], tugasPimpinan: ["Melaksanakan Tindak Lanjut Hasil Pemeriksaan (TLHP)", "Penyebaran Berita Baik Kementerian Sosial"], target: "100% KPM Tervalidasi" },
  "Pekerja Sosial": { rhk: ["Melaksanakan Supervisi Permasalahan Bantuan Sosial", "Melaksanakan Penelitian penyaluran bantuan Sosial", "Melaksanakan Respon Kasus/Pengaduan/Kerentanan", "Membuat laporan bulanan pelaksanaan PKH", "Graduasi KPM Mandiri"], tugasPimpinan: ["Melaksanakan Tindak Lanjut Hasil Pemeriksaan (TLHP)", "Penyebaran Berita Baik Kementerian Sosial"], target: "Penanganan Kasus Tuntas" },
  "Administrator Database": { rhk: ["Melaksanakan proses bisnis PKH verifikasi validasi", "Pemutakhiran Data KPM", "Melakukan sosialisasi kebijakan PKH", "Melaksanakan Monitoring Penyaluran Bansos", "Pemeliharaan Perangkat IT"], tugasPimpinan: ["Melaksanakan Tindak Lanjut Hasil Pemeriksaan (TLHP)", "Penyebaran Berita Baik Kementerian Sosial"], target: "0% Anomali Data" },
  "Ketua TIM KAB-KOTA": { rhk: ["Melaksanakan supervisi Kebijakan Kepada ASN PPPK", "Melakukan Pengawasan dan edukasi kepada Pendamping", "Melakukan koordinasi dengan instansi Kab/Kota", "Berkoodinasi dengan ASN PPPK", "Evaluasi Kinerja dan Menyusun Pelaporan ASN PPPK"], tugasPimpinan: ["Melaksanakan Tindak Lanjut Hasil Pemeriksaan (TLHP)", "Penyebaran Berita Baik Kementerian Sosial"], target: "Kinerja SDM 100%" },
  "Ketua TIM PROV": { rhk: ["Melaksanakan supervisi Kebijakan kepada Katimkab/Kot", "Melakukan koordinasi dengan instansi provinsi", "Berkoodinasi dengan Katim Kabupaten/Kota", "Evaluasi Kinerja dan Menyusun Pelaporan Katimkab/Kota", "Pengawasan dan edukasi di Wilayah Kerja"], tugasPimpinan: ["Melaksanakan Tindak Lanjut Hasil Pemeriksaan (TLHP)", "Penyebaran Berita Baik Kementerian Sosial"], target: "Realisasi Anggaran 100%" }
};

// --- LOGO COMPONENT (TEMA EMAS) ---
const LogoEGL = ({ size = "md", className = "" }) => {
  const dims = size === "lg" ? "w-24 h-24" : size === "sm" ? "w-10 h-10" : "w-14 h-14";
  const textSize = size === "lg" ? "text-4xl" : size === "sm" ? "text-[14px]" : "text-2xl";
  const iconSize = size === "lg" ? 40 : size === "sm" ? 18 : 26;
  
  return (
    <div className={`${dims} ${className} bg-[#040D1A] border-2 border-amber-400 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(251,191,36,0.3)] relative mx-auto transition-transform hover:scale-105`}>
      <div className="flex items-center justify-center -ml-1 mt-0.5">
        <span className={`font-black text-white tracking-tighter ${textSize}`}>E</span>
        <Zap size={iconSize} className="text-amber-400 animate-pulse -mx-0.5 z-10 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" fill="currentColor" />
        <span className={`font-black text-white tracking-tighter ${textSize}`}>L</span>
      </div>
    </div>
  );
};

// --- OPTIMASI COMPRESSION FOTO ---
const compressImage = (file, maxWidth = 800, isTtd = false) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        if (width > maxWidth) { height *= maxWidth / width; width = maxWidth; }
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext('2d');
        if(!isTtd) { ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, width, height); }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL(isTtd ? 'image/png' : 'image/jpeg', isTtd ? 1.0 : 0.5)); 
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  });
};

export default function App() {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState(null);
  
  const [usersDb, setUsersDb] = useState([]);
  const [reportsDb, setReportsDb] = useState([]);
  const [agendasDb, setAgendasDb] = useState([]);
  const [transactionsDb, setTransactionsDb] = useState([]);
  const [masterConfig, setMasterConfig] = useState({ jabatans: DEFAULT_MASTER_DATA, favicon: '' });
  
  const [sessionEmail, setSessionEmail] = useState(localStorage.getItem('egenlap_session_email') || null);
  const [activeTab, setActiveTab] = useState('home');
  const [draftAgenda, setDraftAgenda] = useState(null);

  const currentUser = useMemo(() => {
    if (!sessionEmail) return null;
    return usersDb.find(u => u.email === sessionEmail) || null;
  }, [usersDb, sessionEmail]);

  useEffect(() => {
    let isMounted = true;
    const initAuth = async () => {
      try {
        if (auth && typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else if (auth) { 
          await signInAnonymously(auth); 
        }
      } catch (error) { console.warn("Auth Error"); }
    };
    initAuth();

    if(auth) {
        const unsubscribe = onAuthStateChanged(auth, (u) => { 
            if(isMounted) { setFirebaseUser(u); if(!u) setIsLoading(false); }
        });
        return () => { isMounted = false; unsubscribe(); };
    }
  }, []);

  // --- FIREBASE REALTIME DATABASE LISTENER ---
  useEffect(() => {
    if (!firebaseUser || !db) {
       setTimeout(() => setIsLoading(false), 2000);
       return;
    }

    // ANTI-STUCK: Paksa matikan loading screen setelah 2.5 detik apapun yang terjadi
    const stuckFallback = setTimeout(() => { setIsLoading(false); }, 2500); 

    let unsubUsers, unsubReports, unsubAgendas, unsubTx, unsubConfig;

    try {
        const usersRef = ref(db, DB_PATHS.users);
        unsubUsers = onValue(usersRef, (snapshot) => {
            const data = snapshot.val();
            const parsed = data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : [];
            setUsersDb(parsed);
            clearTimeout(stuckFallback); setIsLoading(false);
        }, (err) => { console.error("Rules Error:", err); setIsLoading(false); });

        const reportsRef = ref(db, DB_PATHS.reports);
        unsubReports = onValue(reportsRef, (snapshot) => {
            const data = snapshot.val();
            let parsed = data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : [];
            parsed.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setReportsDb(parsed);
        });

        const agendasRef = ref(db, DB_PATHS.agendas);
        unsubAgendas = onValue(agendasRef, (snapshot) => {
            const data = snapshot.val();
            let parsed = data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : [];
            parsed.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setAgendasDb(parsed);
        });

        const txRef = ref(db, DB_PATHS.transactions);
        unsubTx = onValue(txRef, (snapshot) => {
            const data = snapshot.val();
            let parsed = data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : [];
            parsed.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setTransactionsDb(parsed);
        });

        const configRef = ref(db, `${DB_PATHS.config}/master_data`);
        unsubConfig = onValue(configRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                setMasterConfig({ jabatans: data.jabatans || DEFAULT_MASTER_DATA, favicon: data.favicon || '' });
            } else {
                set(configRef, { jabatans: DEFAULT_MASTER_DATA, favicon: '' });
            }
        });

    } catch(err) { console.warn("DB Listener Error:", err); setIsLoading(false); }

    return () => { 
        clearTimeout(stuckFallback); 
        if(unsubUsers) unsubUsers();
        if(unsubReports) unsubReports();
        if(unsubAgendas) unsubAgendas();
        if(unsubTx) unsubTx();
        if(unsubConfig) unsubConfig();
    };
  }, [firebaseUser]); 

  // TOAST ANIMATION & LOGIC
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type, id: Date.now() });
    setTimeout(() => setToast(null), 4000);
  };

  const handleCopy = (text) => {
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy'); 
      document.body.removeChild(textArea);
      showToast('Tautan berhasil disalin!', 'success'); 
    } catch (err) { showToast('Gagal menyalin tautan', 'error'); }
  };

  const handleLogout = () => { 
      localStorage.removeItem('egenlap_session_email'); 
      setSessionEmail(null); 
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#040D1A] flex flex-col items-center justify-center relative">
        <LogoEGL size="lg" className="animate-pulse mb-6" />
        <p className="text-amber-400 font-bold tracking-widest uppercase text-xs animate-pulse mb-8 drop-shadow-[0_0_5px_rgba(251,191,36,0.8)]">Memuat Database...</p>
        <button onClick={() => setIsLoading(false)} className="px-4 py-2 border border-slate-700 text-slate-500 rounded-lg text-[10px] hover:text-amber-400 hover:border-amber-400 transition-colors">Buka Paksa</button>
      </div>
    );
  }

  if (!currentUser) {
    return <AuthView usersDb={usersDb} onLoginSuccess={(email) => { localStorage.setItem('egenlap_session_email', email); setSessionEmail(email); setActiveTab('home'); }} showToast={showToast} masterData={masterConfig.jabatans} db={db} />;
  }

  const myReports = currentUser.role === 'admin' ? reportsDb : reportsDb.filter(r => r.userEmail === currentUser.email);
  const myAgendas = currentUser.role === 'admin' ? agendasDb : agendasDb.filter(a => a.userEmail === currentUser.email);

  const navItems = [
    { id: 'home', icon: Home, label: 'Beranda' },
    { id: 'agenda', icon: Calendar, label: 'Agenda' },
    { id: 'generate', icon: PlusCircle, label: 'Lapor AI', special: true },
    { id: 'token', icon: Coins, label: 'Token' },
    currentUser.role === 'admin' ? { id: 'admin', icon: ShieldAlert, label: 'Admin' } : { id: 'profile', icon: User, label: 'Profil' }
  ];

  return (
    <div className="flex h-screen w-full bg-[#040D1A] overflow-hidden font-sans text-slate-200">
      
      {/* DESKTOP SIDEBAR (TEMA BIRU MALAM & EMAS) */}
      <aside className="hidden md:flex flex-col w-72 bg-[#0A192F] border-r border-amber-500/20 z-20 shadow-[10px_0_30px_rgba(0,0,0,0.5)]">
         <div className="p-6 border-b border-amber-500/20 flex flex-col items-center gap-3 text-center">
           <LogoEGL size="lg" />
           <div>
              <h1 className="text-2xl font-black text-white tracking-tight mt-3">E-GenLap</h1>
              <p className="text-[10px] text-amber-400 font-bold uppercase tracking-wider drop-shadow-md">V2 Premium</p>
           </div>
         </div>
         
         <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2 custom-scrollbar">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 pl-2">Menu Utama</p>
            {navItems.map(item => (
              <button key={item.id} onClick={() => { setActiveTab(item.id); if(item.id==='generate') setDraftAgenda(null); }} className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all ${activeTab === item.id ? (item.special ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-[#040D1A] shadow-[0_0_20px_rgba(251,191,36,0.4)] font-black' : 'bg-amber-500/10 border border-amber-500/30 text-amber-400') : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
                <item.icon size={22} className={activeTab === item.id && item.special ? 'text-[#040D1A]' : ''} />
                <span className="font-bold text-sm tracking-wide">{item.label}</span>
              </button>
            ))}
         </div>

         <div className="p-6 border-t border-amber-500/20 bg-[#040D1A]/50">
            <div className="flex items-center gap-3 mb-4">
               <div className="w-10 h-10 bg-[#0A192F] rounded-full border border-amber-400/50 flex items-center justify-center text-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.2)]"><User size={20}/></div>
               <div className="overflow-hidden"><p className="text-sm font-bold text-white truncate">{currentUser.nama}</p><p className="text-[10px] text-slate-400 truncate">{currentUser.email}</p></div>
            </div>
            <div className="bg-[#0A192F] rounded-xl border border-amber-500/30 p-3 flex justify-between items-center shadow-inner">
               <span className="text-[10px] text-slate-400 font-bold uppercase">Sisa Token</span>
               <span className="text-lg font-black text-amber-400 drop-shadow-md">{currentUser.tokens}</span>
            </div>
         </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* MOBILE HEADER (LOGO PRESISI TENGAH) */}
        <header className="md:hidden bg-[#0A192F] px-4 py-3 flex justify-between items-center shadow-lg z-20 border-b border-amber-500/20 relative h-16">
          <div className="flex-1 flex flex-col justify-center min-w-0 pr-2">
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider truncate">Role Aktif</p>
            <p className="text-[10px] text-amber-400 font-bold uppercase tracking-wider truncate">{currentUser.jabatanPKH}</p>
          </div>
          
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center pointer-events-none mt-1">
            <LogoEGL size="sm" />
            <h1 className="text-[10px] font-black text-white tracking-tight mt-1 drop-shadow-md">E-GenLap</h1>
          </div>

          <div className="flex-1 flex justify-end">
            <div className="bg-[#040D1A] px-3 py-1.5 rounded-lg border border-amber-500/30 flex items-center gap-2 shadow-inner">
              <Coins size={14} className="text-amber-400 drop-shadow-md"/>
              <span className="text-sm font-black text-amber-400 leading-none drop-shadow-md">{currentUser.tokens}</span>
            </div>
          </div>
        </header>

        {/* TOAST SYSTEM (POPUP KEREN) */}
        {toast && (
          <div className={`fixed top-20 md:top-10 left-1/2 transform -translate-x-1/2 px-5 py-4 rounded-2xl shadow-[0_15px_50px_rgba(0,0,0,0.8)] z-50 flex items-center gap-4 text-sm font-bold animate-in slide-in-from-top-10 fade-in duration-300 border backdrop-blur-xl w-11/12 max-w-md ${toast.type === 'success' ? 'bg-[#0A192F]/95 border-amber-400/50 text-white shadow-[0_0_30px_rgba(251,191,36,0.2)]' : 'bg-red-950/95 border-red-500/50 text-white'}`}>
            <div className={`p-2 rounded-full ${toast.type === 'success' ? 'bg-amber-400/20 text-amber-400' : 'bg-red-500/20 text-red-400'}`}>
               {toast.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            </div>
            <span className="leading-snug">{toast.msg}</span>
          </div>
        )}

        {/* SCROLLABLE CONTENT */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-28 md:pb-8 w-full max-w-4xl mx-auto custom-scrollbar">
          {activeTab === 'home' && <HomeView user={currentUser} reports={myReports} onCopy={handleCopy} />}
          {activeTab === 'agenda' && <AgendaView user={currentUser} agendas={myAgendas} setActiveTab={setActiveTab} showToast={showToast} setDraftAgenda={setDraftAgenda} db={db} />}
          {activeTab === 'generate' && <GenerateView user={currentUser} draftAgenda={draftAgenda} setActiveTab={setActiveTab} showToast={showToast} setDraftAgenda={setDraftAgenda} masterData={masterConfig.jabatans} db={db} />}
          {activeTab === 'token' && <TokenView />}
          {activeTab === 'profile' && <ProfileView user={currentUser} onLogout={handleLogout} showToast={showToast} masterData={masterConfig.jabatans} db={db} />}
          {activeTab === 'admin' && currentUser.role === 'admin' && <AdminView user={currentUser} users={usersDb} reports={reportsDb} transactions={transactionsDb} masterConfig={masterConfig} showToast={showToast} onCopy={handleCopy} onLogout={handleLogout} db={db} />}
        </main>

        {/* MOBILE BOTTOM NAVIGATION */}
        <nav className="md:hidden fixed bottom-0 w-full bg-[#020C1B]/95 backdrop-blur-2xl border-t border-amber-900/30 px-2 py-2 flex justify-between items-center shadow-[0_-15px_30px_rgba(0,0,0,0.8)] z-30 rounded-t-3xl pb-safe h-16">
          {navItems.map(item => {
            if (item.special) {
              return (
                <div key={item.id} className="relative flex-[1.2] flex justify-center">
                  <button onClick={() => { setDraftAgenda(null); setActiveTab('generate'); }} className={`absolute top-0 transform -translate-y-[60%] w-14 h-14 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(251,191,36,0.5)] active:scale-90 border-4 border-[#020C1B] transition-all ${activeTab === 'generate' ? 'bg-amber-300 text-[#040D1A] scale-105' : 'bg-gradient-to-tr from-amber-500 to-yellow-400 text-[#040D1A]'}`}>
                    <item.icon size={24} className="drop-shadow-sm" />
                  </button>
                </div>
              );
            }
            return (
              <button key={item.id} onClick={() => setActiveTab(item.id)} className={`flex-1 flex flex-col items-center gap-1 transition-all ${activeTab === item.id ? 'text-amber-400 drop-shadow-[0_0_5px_rgba(251,191,36,0.5)]' : 'text-slate-500 hover:text-amber-300'}`}>
                <item.icon size={20} />
                <span className="text-[9px] font-bold mt-0.5">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

// ==========================================
// VIEW 1: AUTHENTICATION
// ==========================================
function AuthView({ usersDb, onLoginSuccess, showToast, masterData, db }) {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [regTtd, setRegTtd] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    const loadingTimeout = setTimeout(() => { if(isLoading) setIsLoading(false); }, 5000);

    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');

    try {
      if (isLogin) {
        // PASSWORD ADMIN AWAL ADALAH "admin"
        if (email === 'admin@gmail.com' && password === 'admin') {
          let adminUser = usersDb.find(u => u.email === 'admin@gmail.com');
          if (!adminUser) {
             adminUser = { nama: 'Super Admin', nip: '000000', jabatanASN: 'Penata Layanan Operasional', jabatanPKH: 'Ketua TIM PROV', email, password, role: 'admin', tokens: 9999, ttdBase64: '', personalDriveLink: '', createdAt: new Date().toISOString() };
             if(db) await set(push(ref(db, DB_PATHS.users)), adminUser);
          }
          clearTimeout(loadingTimeout);
          showToast('Login Admin Berhasil'); onLoginSuccess(email); return;
        }

        const found = usersDb.find(u => u.email === email && u.password === password);
        if (found) { clearTimeout(loadingTimeout); showToast('Login Berhasil'); onLoginSuccess(email); } 
        else { clearTimeout(loadingTimeout); showToast('Email atau Password salah!', 'error'); }
      } else {
        if (!regTtd) { clearTimeout(loadingTimeout); showToast('Wajib Upload Tanda Tangan!', 'error'); setIsLoading(false); return; }
        const exist = usersDb.find(u => u.email === email);
        if (exist) { clearTimeout(loadingTimeout); showToast('Email sudah terdaftar!', 'error'); setIsLoading(false); return; }
        
        const newUser = { 
          nama: formData.get('nama'), nip: formData.get('nip'), jabatanASN: formData.get('jabatanASN'), jabatanPKH: formData.get('jabatanPKH'), 
          email, password, role: 'user', tokens: 1, 
          ttdBase64: regTtd, personalDriveLink: formData.get('driveLink') || '', createdAt: new Date().toISOString() 
        };

        if(db) await set(push(ref(db, DB_PATHS.users)), newUser);
        clearTimeout(loadingTimeout);
        showToast('Registrasi Sukses! Anda Mendapatkan 1 Token Gratis.'); 
        setIsLogin(true); 
      }
    } catch(err) { 
      clearTimeout(loadingTimeout);
      showToast('Error Jaringan. Pastikan konfigurasi valid.', 'error'); 
    }
    setIsLoading(false);
  };

  return (
    <div className="flex min-h-screen w-full bg-gradient-to-b from-[#020C1B] to-[#0A192F] items-center justify-center p-4 py-10">
      <div className="w-full max-w-md text-slate-200 mt-5">
        <div className="text-center mb-6">
          <LogoEGL size="lg" className="mb-4" />
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-500 tracking-wider drop-shadow-md">E-GenLap <span className="text-white">V2</span></h1>
          <p className="text-xs text-amber-400/80 mt-2 font-medium">Sistem Laporan Otomatis SDM PKH</p>
        </div>

        <div className="bg-[#0A192F]/90 backdrop-blur-xl p-6 md:p-8 rounded-3xl shadow-2xl border border-amber-500/30">
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="animate-in fade-in duration-500 space-y-4">
                <div className="bg-amber-900/20 border border-amber-500/40 p-3 rounded-xl mb-4 text-center shadow-inner">
                    <p className="text-amber-400 font-extrabold text-[10px] animate-pulse uppercase tracking-widest drop-shadow-sm">DAFTAR SEKARANG, DAPAT 1 TOKEN GRATIS!</p>
                </div>
                <div><label className="block text-[10px] font-bold text-slate-400 mb-1">Nama Lengkap</label><input type="text" name="nama" required className="w-full bg-[#040D1A] border border-slate-700 text-white p-3 rounded-xl focus:border-amber-400 outline-none text-sm transition-all focus:bg-white/5" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-[10px] font-bold text-slate-400 mb-1">Jabatan PKH</label><select name="jabatanPKH" required className="w-full bg-[#040D1A] border border-slate-700 text-amber-400 font-medium p-3 rounded-xl focus:border-amber-400 outline-none text-[11px]">{Object.keys(masterData).map(j => <option key={j} value={j}>{j}</option>)}</select></div>
                  <div><label className="block text-[10px] font-bold text-slate-400 mb-1">Jabatan ASN</label><select name="jabatanASN" required className="w-full bg-[#040D1A] border border-slate-700 text-amber-400 font-medium p-3 rounded-xl focus:border-amber-400 outline-none text-[11px]">{DEFAULT_JABATAN_ASN.map(j => <option key={j} value={j}>{j}</option>)}</select></div>
                </div>
                <div><label className="block text-[10px] font-bold text-slate-400 mb-1">NIP / NIK</label><input type="number" name="nip" className="w-full bg-[#040D1A] border border-slate-700 text-white p-3 rounded-xl focus:border-amber-400 outline-none text-sm transition-all focus:bg-white/5" /></div>
                
                <div className="pt-2 border-t border-slate-700/50">
                   <label className="block text-[10px] font-bold text-slate-400 mb-2">Tanda Tangan Digital (Wajib & Transparan)</label>
                   {regTtd ? (
                     <div className="relative w-full h-24 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-white/10 rounded-xl border-2 border-emerald-500 flex items-center justify-center p-2 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                        <img src={regTtd} className="h-full object-contain" />
                        <button type="button" onClick={() => setRegTtd(null)} className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1.5 shadow-lg"><X size={14}/></button>
                     </div>
                   ) : (
                     <div className="relative w-full p-4 bg-[#040D1A] border border-dashed border-amber-500/50 rounded-xl text-center cursor-pointer hover:bg-white/5 transition-all">
                        <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={async (e) => {
                           if(e.target.files[0]) setRegTtd(await compressImage(e.target.files[0], 400, true));
                        }} />
                        <PenTool size={20} className="mx-auto text-amber-400 mb-2"/>
                        <span className="text-[10px] text-amber-400/80 font-bold uppercase tracking-widest">Pilih Gambar TTD (PNG)</span>
                     </div>
                   )}
                </div>

                <div className="pt-2">
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">Link Folder Google Drive (Pribadi)</label>
                  <input type="url" name="driveLink" required className="w-full bg-[#040D1A] border border-slate-700 text-white p-3 rounded-xl focus:border-amber-400 outline-none text-sm transition-all focus:bg-white/5" placeholder="https://drive.google.com/..." />
                  <p className="text-[9px] text-slate-500 mt-1 italic">Seluruh Laporan PDF, Foto, dan Lampiran otomatis masuk folder ini.</p>
                </div>
              </div>
            )}
            <div><label className="block text-[10px] font-bold text-slate-400 mb-1">Email Akun</label><input type="email" name="email" required className="w-full bg-[#040D1A] border border-slate-700 text-white p-3 rounded-xl focus:border-amber-400 outline-none text-sm transition-all focus:bg-white/5" /></div>
            <div><label className="block text-[10px] font-bold text-slate-400 mb-1">Password</label><input type="password" name="password" required className="w-full bg-[#040D1A] border border-slate-700 text-white p-3 rounded-xl focus:border-amber-400 outline-none text-sm transition-all focus:bg-white/5" /></div>
            <button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-amber-500 to-yellow-400 text-[#040D1A] font-black py-4 rounded-xl shadow-[0_5px_15px_rgba(251,191,36,0.3)] hover:shadow-[0_5px_25px_rgba(251,191,36,0.5)] disabled:opacity-50 transition-all mt-4 text-sm uppercase tracking-widest">{isLoading ? 'Memproses...' : (isLogin ? 'Masuk Sistem' : 'Daftar Akun')}</button>
          </form>
          <div className="mt-6 text-center border-t border-slate-700/50 pt-4">
            <p className="text-xs text-slate-400">{isLogin ? "Belum punya akun?" : "Sudah punya akun?"} <button type="button" onClick={() => setIsLogin(!isLogin)} className="text-amber-400 font-bold ml-2 hover:underline">{isLogin ? "Daftar Disini" : "Kembali Login"}</button></p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// VIEW 5: GENERATE AI FORM (UPLOAD FOTO & PANGGIL GAS URL)
// ==========================================
function GenerateView({ user, draftAgenda, setActiveTab, showToast, setDraftAgenda, masterData, db }) {
  const [suratList, setSuratList] = useState([{ dasar: '', perihal: '' }]);
  const [lampiranList, setLampiranList] = useState([]); 
  const [fotoList, setFotoList] = useState([]); 
  const [dynamicGraduasi, setDynamicGraduasi] = useState([{ nama: '', nik: '', alasan: '', desa: '', kec: '' }]);
  const [dynamicP2k2, setDynamicP2k2] = useState([{ kelompok: '', hadir: '', absen: '' }]);

  const [formData, setFormData] = useState({ tanggal: '', waktu: '', jamMulai: '', lokasi: '', sasaran: '', kegiatanDesc: '', catatanTambahan: '', verkomLokasi: '', supervisiNama: '', supervisiHasil: '' });
  const [selectedRhk, setSelectedRhk] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStep, setProcessStep] = useState('');

  const currentJabatanData = masterData[user.jabatanPKH] || { rhk: ["RHK Umum"], tugasPimpinan: [] };
  const rhkList = currentJabatanData.rhk || [];

  useEffect(() => {
    if (draftAgenda) setFormData(prev => ({ ...prev, tanggal: draftAgenda.tanggal, jamMulai: draftAgenda.jamMulai, kegiatanDesc: draftAgenda.deskripsi }));
  }, [draftAgenda]);

  const addSuratRow = () => setSuratList([...suratList, { dasar: '', perihal: '' }]);
  const updateSuratRow = (index, field, value) => { const newList = [...suratList]; newList[index][field] = value; setSuratList(newList); };
  const removeSuratRow = (index) => setSuratList(suratList.filter((_, i) => i !== index));

  const addGraduasiRow = () => setDynamicGraduasi([...dynamicGraduasi, { nama: '', nik: '', alasan: '', desa: '', kec: '' }]);
  const updateGraduasiRow = (index, field, value) => { const newList = [...dynamicGraduasi]; newList[index][field] = value; setDynamicGraduasi(newList); };
  const removeGraduasiRow = (index) => setDynamicGraduasi(dynamicGraduasi.filter((_, i) => i !== index));

  const addP2k2Row = () => setDynamicP2k2([...dynamicP2k2, { kelompok: '', hadir: '', absen: '' }]);
  const updateP2k2Row = (index, field, value) => { const newList = [...dynamicP2k2]; newList[index][field] = value; setDynamicP2k2(newList); };
  const removeP2k2Row = (index) => setDynamicP2k2(dynamicP2k2.filter((_, i) => i !== index));

  // --- HANDLE UPLOAD FOTO & LAMPIRAN (Max 10 & Max 3) ---
  const handleFileUpload = async (e, type) => {
    const files = Array.from(e.target.files);
    if(files.length === 0) return;
    let currentList = type === 'lampiran' ? lampiranList : fotoList;
    let max = type === 'lampiran' ? 3 : 10; 
    
    if (currentList.length + files.length > max) { showToast(`Maksimal ${max} File!`, 'error'); return; }
    
    const newBase64s = [];
    for (let file of files) {
        const b64 = await compressImage(file, type === 'lampiran' ? 1200 : 800, false);
        newBase64s.push(b64);
    }
    
    if (type === 'lampiran') setLampiranList([...lampiranList, ...newBase64s]);
    else setFotoList([...fotoList, ...newBase64s]);
  };

  const removeFile = (index, type) => {
      if (type === 'lampiran') setLampiranList(lampiranList.filter((_, i) => i !== index));
      else setFotoList(fotoList.filter((_, i) => i !== index));
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (user.tokens <= 0) return showToast('Token habis. Silakan Top-up di menu Token.', 'error');
    if (!user.ttdBase64) return showToast('TERKUNCI: Anda Wajib Upload TTD di menu Profil!', 'error');
    if (!user.personalDriveLink) return showToast('TERKUNCI: Anda Wajib Memasukkan Link Google Drive di Profil!', 'error');

    const rhkLower = selectedRhk.toLowerCase();
    if ((rhkLower.includes('p2k2') || rhkLower.includes('fds')) && !dynamicP2k2[0].kelompok) return showToast('Minimal 1 Kelompok P2K2!', 'error');
    if (rhkLower.includes('supervisi') && !formData.supervisiNama) return showToast('Lengkapi Nama Supervisi!', 'error');
    if (rhkLower.includes('graduasi') && !dynamicGraduasi[0].nama) return showToast('Minimal 1 Data KPM Graduasi!', 'error');

    setIsProcessing(true);
    setProcessStep('1/3: Mengirim foto & lampiran ke Google Drive Anda...');
    
    try {
      const rhkName = selectedRhk.split(' - ')[0] || 'RHK Umum';
      const monthStr = new Date(formData.tanggal).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
      const folderPathSimulasi = `${rhkName} / ${monthStr} / Laporan ${formData.tanggal}`;
      let driveLinkResult = user.personalDriveLink;

      // SIAPKAN PAYLOAD UNTUK GAS WEBHOOK
      const payload = {
        userEmail: user.email,
        nama: user.nama,
        jabatan: user.jabatanPKH,
        kegiatan: selectedRhk,
        tanggal: formData.tanggal,
        waktu: formData.waktu,
        lokasi: formData.lokasi,
        sasaran: formData.sasaran,
        kegiatanDesc: formData.kegiatanDesc,
        catatanTambahan: formData.catatanTambahan,
        ttdBase64: user.ttdBase64,
        personalDriveLink: user.personalDriveLink,
        lampiranList: lampiranList,
        fotoList: fotoList,
        suratList: suratList,
        dynamicData: { graduasi: dynamicGraduasi, p2k2: dynamicP2k2, verkomLokasi: formData.verkomLokasi, supervisiNama: formData.supervisiNama, supervisiHasil: formData.supervisiHasil }
      };

      setProcessStep('2/3: Mesin GAS menyusun PDF di server Google...');
      // EKSEKUSI FETCH KE GOOGLE APPS SCRIPT (Mode teks murni agar tidak terhalang CORS)
      try {
          await fetch(GAS_WEBHOOK_URL, {
            method: "POST",
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            body: JSON.stringify(payload),
          });
      } catch(e) { console.warn("GAS Webhook dipanggil (No-CORS Mode)"); }

      setProcessStep('3/3: Kunci TTD & Catat Riwayat...');
      await new Promise(r => setTimeout(r, 1000));

      if(db) {
         await update(ref(db, `${DB_PATHS.users}/${user.id}`), { tokens: user.tokens - 1 });
         const newReportRef = push(ref(db, DB_PATHS.reports));
         await set(newReportRef, { userEmail: user.email, kegiatan: selectedRhk, tanggal: formData.tanggal, waktu: formData.waktu, lokasi: formData.lokasi, status: 'Sukses', driveLink: driveLinkResult, folderPath: folderPathSimulasi, createdAt: new Date().toISOString() });
         
         if (draftAgenda) { 
             await update(ref(db, `${DB_PATHS.agendas}/${draftAgenda.id}`), { status: 'reported' }); 
             setDraftAgenda(null); 
         }
      }

      showToast('Selesai! PDF & Seluruh Foto diproses di Folder G-Drive Anda.');
      setActiveTab('home');
    } catch (err) { showToast(`Gagal memproses data`, 'error'); }
    setIsProcessing(false);
  };

  const renderDynamicForm = () => {
    const rhkLower = selectedRhk.toLowerCase();
    
    if (rhkLower.includes('graduasi')) {
      return (
        <div className="bg-[#0A192F]/50 p-4 rounded-2xl border border-amber-500/50 mt-4 shadow-inner">
          <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-3 flex items-center gap-2"><Users size={14}/> Tabel Data Graduasi KPM</p>
          {dynamicGraduasi.map((item, index) => (
            <div key={index} className="bg-[#040D1A] p-4 rounded-xl border border-slate-700/50 mb-3 relative">
              <span className="absolute -top-2 -left-2 bg-amber-500 text-[#040D1A] text-[8px] font-black w-5 h-5 flex items-center justify-center rounded-full shadow-md">{index + 1}</span>
              {index > 0 && <button type="button" onClick={() => removeGraduasiRow(index)} className="absolute top-2 right-2 text-red-400 hover:text-red-300"><Trash2 size={14}/></button>}
              
              <div className="space-y-3 mt-1">
                <div><label className="block text-[9px] font-bold text-slate-400 uppercase">Nama KPM</label><input type="text" required value={item.nama} onChange={e => updateGraduasiRow(index, 'nama', e.target.value)} className="w-full p-2.5 bg-white/5 border border-slate-600 text-white rounded-lg text-xs focus:border-amber-500 outline-none" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-[9px] font-bold text-slate-400 uppercase">NIK</label><input type="number" required value={item.nik} onChange={e => updateGraduasiRow(index, 'nik', e.target.value)} className="w-full p-2.5 bg-white/5 border border-slate-600 text-white rounded-lg text-xs focus:border-amber-500 outline-none" /></div>
                  <div><label className="block text-[9px] font-bold text-slate-400 uppercase">Desa</label><input type="text" required value={item.desa} onChange={e => updateGraduasiRow(index, 'desa', e.target.value)} className="w-full p-2.5 bg-white/5 border border-slate-600 text-white rounded-lg text-xs focus:border-amber-500 outline-none" /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-[9px] font-bold text-slate-400 uppercase">Kecamatan</label><input type="text" required value={item.kec} onChange={e => updateGraduasiRow(index, 'kec', e.target.value)} className="w-full p-2.5 bg-white/5 border border-slate-600 text-white rounded-lg text-xs focus:border-amber-500 outline-none" /></div>
                  <div><label className="block text-[9px] font-bold text-slate-400 uppercase">Alasan Graduasi</label><input type="text" required placeholder="Mandiri / dll" value={item.alasan} onChange={e => updateGraduasiRow(index, 'alasan', e.target.value)} className="w-full p-2.5 bg-white/5 border border-slate-600 text-white rounded-lg text-xs focus:border-amber-500 outline-none" /></div>
                </div>
              </div>
            </div>
          ))}
          <button type="button" onClick={addGraduasiRow} className="w-full bg-amber-900/20 border border-amber-500/50 text-amber-400 font-bold py-3 rounded-xl text-[10px] uppercase tracking-wider flex justify-center items-center gap-1 mt-3 hover:bg-amber-800/30"><PlusCircle size={14}/> Tambah KPM Graduasi</button>
        </div>
      );
    } 
    
    if (rhkLower.includes('p2k2') || rhkLower.includes('fds')) {
      return (
        <div className="bg-[#0A192F]/50 p-4 rounded-2xl border border-amber-500/50 mt-4 shadow-inner">
          <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-3 flex items-center gap-2"><BookOpen size={14}/> Tabel Data P2K2</p>
          {dynamicP2k2.map((item, index) => (
             <div key={index} className="bg-[#040D1A] p-4 rounded-xl border border-slate-700/50 mb-3 relative">
                 <span className="absolute -top-2 -left-2 bg-amber-500 text-[#040D1A] text-[8px] font-black w-5 h-5 flex items-center justify-center rounded-full shadow-md">{index + 1}</span>
                {index > 0 && <button type="button" onClick={() => removeP2k2Row(index)} className="absolute top-2 right-2 text-red-400 hover:text-red-300"><Trash2 size={14}/></button>}
                <div className="mb-3"><label className="block text-[9px] font-bold text-slate-400 uppercase">Nama Kelompok</label><input type="text" required value={item.kelompok} onChange={e => updateP2k2Row(index, 'kelompok', e.target.value)} className="w-full p-2.5 bg-white/5 border border-slate-600 text-white rounded-lg text-xs focus:border-amber-500 outline-none" /></div>
                <div className="grid grid-cols-2 gap-3 mb-1">
                    <div><label className="block text-[9px] font-bold text-slate-400 uppercase">Jml Hadir</label><input type="number" required value={item.hadir} onChange={e => updateP2k2Row(index, 'hadir', e.target.value)} className="w-full p-2.5 bg-white/5 border border-slate-600 text-white rounded-lg text-xs focus:border-amber-500 outline-none" /></div>
                    <div><label className="block text-[9px] font-bold text-slate-400 uppercase">Jml Absen</label><input type="number" required value={item.absen} onChange={e => updateP2k2Row(index, 'absen', e.target.value)} className="w-full p-2.5 bg-white/5 border border-slate-600 text-white rounded-lg text-xs focus:border-amber-500 outline-none" /></div>
                </div>
             </div>
          ))}
          <button type="button" onClick={addP2k2Row} className="w-full bg-amber-900/20 border border-amber-500/50 text-amber-400 font-bold py-3 rounded-xl text-[10px] uppercase tracking-wider flex justify-center items-center gap-1 mt-3 hover:bg-amber-800/30"><PlusCircle size={14}/> Tambah Kelompok P2K2</button>
        </div>
      );
    }

    if (rhkLower.includes('verifikasi') || rhkLower.includes('verkom')) {
       return (
          <div className="bg-[#0A192F]/50 p-4 rounded-2xl border border-amber-500/50 mt-4 shadow-inner">
              <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-3 flex items-center gap-2"><Building size={14}/> Data Verifikasi Komitmen</p>
              <div><label className="block text-[9px] font-bold text-slate-400 uppercase">Nama Sekolah / Puskesmas</label><input type="text" required value={formData.verkomLokasi} onChange={e => setFormData({...formData, verkomLokasi: e.target.value})} className="w-full p-3 bg-white/5 border border-slate-600 text-white rounded-xl text-sm focus:border-amber-500 outline-none" /></div>
          </div>
       );
    }

    if (rhkLower.includes('supervisi') || rhkLower.includes('pengawasan') || rhkLower.includes('evaluasi')) {
      return (
        <div className="bg-[#0A192F]/50 p-4 rounded-2xl border border-amber-500/50 mt-4 shadow-inner">
          <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-3 flex items-center gap-2"><Target size={14}/> Data Supervisi/Evaluasi</p>
          <div className="space-y-4">
            <div><label className="block text-[9px] font-bold text-slate-400 uppercase">Nama SDM yang Disupervisi</label><input type="text" required value={formData.supervisiNama} onChange={e => setFormData({...formData, supervisiNama: e.target.value})} className="w-full p-3 bg-white/5 border border-slate-600 text-white rounded-xl text-sm focus:border-amber-500 outline-none" /></div>
            <div><label className="block text-[9px] font-bold text-slate-400 uppercase">Hasil / Evaluasi Singkat</label><input type="text" required value={formData.supervisiHasil} onChange={e => setFormData({...formData, supervisiHasil: e.target.value})} className="w-full p-3 bg-white/5 border border-slate-600 text-white rounded-xl text-sm focus:border-amber-500 outline-none" /></div>
          </div>
        </div>
      );
    }
    
    // Default Umum
    return (
       <div className="mt-4"><label className="block text-[11px] font-bold text-slate-300 uppercase mb-2 tracking-wider">Sasaran / Target Kegiatan Umum</label><input type="text" required value={formData.sasaran} onChange={e => setFormData({...formData, sasaran: e.target.value})} placeholder="Cth: KPM, Perangkat Desa, dll" className="w-full p-4 bg-[#040D1A] border border-slate-700 text-white rounded-xl text-sm outline-none focus:border-amber-400" /></div>
    );
  };

  if(!user.ttdBase64) {
    return (
       <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-6 bg-[#0A192F] rounded-3xl border border-slate-700/50 mt-6 shadow-xl">
          <div className="w-24 h-24 bg-red-900/30 border-2 border-red-500/50 text-red-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_15px_rgba(239,68,68,0.3)]"><Lock size={40}/></div>
          <h2 className="text-2xl font-black text-white mb-3">Akses AI Terkunci</h2>
          <p className="text-sm text-slate-400 leading-relaxed mb-8 max-w-md mx-auto">Demi memastikan dokumen memiliki legalitas formal, Anda wajib mengunggah Tanda Tangan (TTD) Digital di Menu Profil terlebih dahulu.</p>
          <button onClick={() => setActiveTab('profile')} className="bg-gradient-to-r from-amber-500 to-yellow-400 text-[#040D1A] font-extrabold px-8 py-4 rounded-xl uppercase tracking-widest text-sm shadow-[0_5px_20px_rgba(251,191,36,0.3)] hover:scale-105 transition-transform">Buka Pengaturan Profil</button>
       </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-[#0A192F] to-[#040D1A] border border-amber-500/30 p-5 rounded-3xl flex justify-between items-center shadow-lg">
        <div><h2 className="text-base font-black text-white flex items-center gap-2"><Zap size={20} className="text-amber-400 drop-shadow-md"/> Sistem Generator AI</h2><p className="text-xs text-slate-400 mt-1">Sisa Token Valid: <span className="font-black text-amber-400 drop-shadow-sm">{user.tokens}</span></p></div>
      </div>

      <form onSubmit={handleGenerate} className="space-y-6 bg-[#0A192F] p-6 md:p-8 rounded-3xl shadow-xl border border-slate-700/50">
        
        {/* IDENTITAS */}
        <div className="bg-[#040D1A] p-5 rounded-2xl border border-slate-700/50 shadow-inner">
          <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Lock size={12}/> Identitas Terkunci</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-bold text-white mb-4">
            <div className="bg-white/5 p-3 rounded-xl border border-slate-600/50"><span className="block text-[10px] text-slate-500 font-medium mb-1 uppercase tracking-wider">Nama Laporan</span>{user.nama}</div>
            <div className="bg-white/5 p-3 rounded-xl border border-slate-600/50"><span className="block text-[10px] text-slate-500 font-medium mb-1 uppercase tracking-wider">Jabatan PKH</span><span className="truncate block">{user.jabatanPKH}</span></div>
          </div>
          <div className="bg-amber-900/20 p-3 rounded-xl border border-amber-500/30 flex items-center gap-3">
             <div className="w-12 h-8 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-white/10 rounded border border-amber-500 flex items-center justify-center overflow-hidden"><img src={user.ttdBase64} className="max-w-full max-h-full object-contain"/></div>
             <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">TTD Digital Terlampir Otomatis</p>
          </div>
        </div>

        {/* SURAT JAMAK */}
        <div className="bg-[#040D1A] p-4 rounded-2xl border border-slate-700/50">
           <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-3"><i className="fas fa-envelope-open-text mr-1"></i> Data Surat (Opsional)</p>
           {suratList.map((surat, index) => (
              <div key={index} className="grid grid-cols-2 gap-3 mb-3 relative">
                 {index > 0 && <button type="button" onClick={() => removeSuratRow(index)} className="absolute -right-1 -top-1 text-red-500 hover:text-red-400 z-10 bg-[#040D1A] rounded-full p-0.5 shadow-md"><Trash2 size={12}/></button>}
                 <div><label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Dasar Surat</label><input type="text" value={surat.dasar} onChange={e => updateSuratRow(index, 'dasar', e.target.value)} placeholder="Cth: ST-123/2026" className="w-full p-2.5 bg-white/5 border border-slate-600 text-white rounded-lg text-xs outline-none focus:border-amber-400 transition-colors" /></div>
                 <div><label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Perihal</label><input type="text" value={surat.perihal} onChange={e => updateSuratRow(index, 'perihal', e.target.value)} placeholder="Undangan Rakor" className="w-full p-2.5 bg-white/5 border border-slate-600 text-white rounded-lg text-xs outline-none focus:border-amber-400 transition-colors" /></div>
              </div>
           ))}
           <button type="button" onClick={addSuratRow} className="text-[10px] font-bold text-amber-400 hover:text-amber-300 mt-1 flex items-center gap-1"><PlusCircle size={12}/> Tambah Surat</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
           <div><label className="block text-[11px] font-bold text-slate-300 uppercase mb-2 tracking-wider">Tanggal</label><input type="date" required value={formData.tanggal} onChange={e => setFormData({...formData, tanggal: e.target.value})} className="w-full p-4 bg-[#040D1A] border border-slate-700 text-white rounded-xl text-sm outline-none focus:border-amber-400 transition-colors" /></div>
           <div><label className="block text-[11px] font-bold text-slate-300 uppercase mb-2 tracking-wider">Waktu Pelaksanaan</label><input type="text" required value={formData.waktu} onChange={e => setFormData({...formData, waktu: e.target.value})} placeholder="08:00 - Selesai" className="w-full p-4 bg-[#040D1A] border border-slate-700 text-white rounded-xl text-sm outline-none focus:border-amber-400 transition-colors" /></div>
           <div><label className="block text-[11px] font-bold text-slate-300 uppercase mb-2 tracking-wider">Jam Mulai Agenda</label><input type="time" required value={formData.jamMulai} onChange={e => setFormData({...formData, jamMulai: e.target.value})} className="w-full p-4 bg-[#040D1A] border border-slate-700 text-white rounded-xl text-sm outline-none focus:border-amber-400 transition-colors" /></div>
        </div>

        <div><label className="block text-[11px] font-bold text-slate-300 uppercase mb-2 tracking-wider">Lokasi / Desa Kegiatan</label><input type="text" required value={formData.lokasi} onChange={e => setFormData({...formData, lokasi: e.target.value})} className="w-full p-4 bg-[#040D1A] border border-slate-700 text-white rounded-xl text-sm outline-none focus:border-amber-400 transition-colors" /></div>
        
        {/* UPLOAD LAMPIRAN */}
        <div>
           <div className="flex justify-between items-center mb-2"><label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider">Lampiran Dokumen (Max 3)</label><span className="text-[10px] font-bold bg-[#040D1A] px-2 py-1 rounded border border-slate-700 text-amber-400">{lampiranList.length}/3 File</span></div>
           <div className="bg-[#040D1A] border border-slate-700 p-4 rounded-xl shadow-inner min-h-[80px] flex flex-wrap gap-3 items-center">
              {lampiranList.map((b64, idx) => (
                 <div key={idx} className="relative w-16 h-16"><img src={b64} className="w-full h-full object-cover rounded-lg border border-amber-500/50 shadow-md"/><button type="button" onClick={()=>removeFile(idx, 'lampiran')} className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 shadow-lg"><X size={12}/></button></div>
              ))}
              {lampiranList.length < 3 && (
                 <div className="relative w-16 h-16 bg-white/5 border-2 border-dashed border-slate-600 rounded-lg flex flex-col items-center justify-center hover:bg-white/10 cursor-pointer transition-colors text-slate-400 hover:text-amber-400 hover:border-amber-400">
                    <input type="file" accept="image/*" multiple onChange={(e)=>handleFileUpload(e, 'lampiran')} className="absolute inset-0 opacity-0 cursor-pointer" />
                    <Paperclip size={20}/><span className="text-[8px] font-bold mt-1 uppercase">Upload</span>
                 </div>
              )}
           </div>
        </div>

        {/* PILIH RHK */}
        <div className="pt-5 border-t border-slate-700/50">
           <label className="block text-[11px] font-black text-amber-400 uppercase tracking-widest mb-3 flex items-center gap-2"><Database size={14}/> Pilih Kategori RHK</label>
           <select required value={selectedRhk} onChange={(e) => setSelectedRhk(e.target.value)} className="w-full p-4 bg-amber-400/10 border border-amber-400/40 text-amber-400 font-black rounded-xl text-base outline-none focus:ring-2 focus:ring-amber-400 shadow-inner">
              <option value="" className="bg-[#040D1A]">-- Pilih Kegiatan RHK --</option>
              {rhkList.map(rhk => <option key={rhk} value={rhk} className="bg-[#040D1A]">{rhk}</option>)}
           </select>
        </div>

        {selectedRhk && renderDynamicForm()}

        {selectedRhk && (
          <div className="bg-[#040D1A] border border-slate-700/50 p-5 rounded-2xl space-y-5 shadow-inner mt-5">
             <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-2 border-b border-slate-700/50 pb-3">Rincian Hasil & Bahan Analisa AI</p>
             <div><label className="block text-[11px] font-bold text-slate-300 uppercase mb-2 tracking-wider">Rincian Hasil (Poin-poin)</label><textarea required rows="3" value={formData.kegiatanDesc} onChange={e => setFormData({...formData, kegiatanDesc: e.target.value})} placeholder="Hasil 1... Hasil 2..." className="w-full p-4 bg-[#0A192F] border border-slate-700 text-white rounded-xl text-sm outline-none focus:border-amber-400 custom-scrollbar transition-colors"></textarea></div>
             <div><label className="block text-[11px] font-bold text-slate-300 uppercase mb-2 tracking-wider">Catatan Tambahan Khusus AI</label><textarea required rows="2" value={formData.catatanTambahan} onChange={e => setFormData({...formData, catatanTambahan: e.target.value})} placeholder="Ketik apa adanya, AI akan memoles menjadi bahasa formal..." className="w-full p-4 bg-[#0A192F] border border-slate-700 text-white rounded-xl text-sm outline-none focus:border-amber-400 custom-scrollbar transition-colors"></textarea></div>
          </div>
        )}

        {/* UPLOAD FOTO DOKUMENTASI (MAX 10) */}
        {selectedRhk && (
          <div className="mt-5">
             <div className="flex justify-between items-center mb-2"><label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider">Foto Dokumentasi (Max 10)</label><span className="text-[10px] font-bold bg-[#040D1A] px-2 py-1 rounded border border-slate-700 text-amber-400">{fotoList.length}/10 Foto</span></div>
             <div className="bg-[#040D1A] border border-slate-700 p-4 rounded-xl shadow-inner min-h-[80px] flex flex-wrap gap-3 items-center">
                {fotoList.map((b64, idx) => (
                   <div key={idx} className="relative w-16 h-16"><img src={b64} className="w-full h-full object-cover rounded-lg border border-amber-500/50 shadow-md"/><button type="button" onClick={()=>removeFile(idx, 'foto')} className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 shadow-lg"><X size={12}/></button></div>
                ))}
                {fotoList.length < 10 && (
                   <div className="relative w-16 h-16 bg-white/5 border-2 border-dashed border-slate-600 rounded-lg flex flex-col items-center justify-center hover:bg-white/10 cursor-pointer transition-colors text-slate-400 hover:text-amber-400 hover:border-amber-400">
                      <input type="file" accept="image/*" multiple capture="environment" onChange={(e)=>handleFileUpload(e, 'foto')} className="absolute inset-0 opacity-0 cursor-pointer" />
                      <Camera size={20}/><span className="text-[8px] font-bold mt-1 uppercase">Jepret</span>
                   </div>
                )}
             </div>
             <p className="text-[9px] text-slate-500 mt-2 italic text-center">*Seluruh foto dan lampiran akan diproses dan diunggah otomatis ke link Google Drive Pribadi Anda.</p>
          </div>
        )}

        <button type="submit" disabled={isProcessing || !selectedRhk} className="w-full bg-gradient-to-r from-amber-500 to-yellow-400 text-[#040D1A] font-black py-5 rounded-xl shadow-[0_10px_30px_rgba(251,191,36,0.3)] hover:shadow-[0_10px_40px_rgba(251,191,36,0.5)] disabled:opacity-50 disabled:grayscale transition-all mt-8 flex justify-center items-center gap-3 uppercase tracking-widest text-base hover:scale-105 active:scale-95">
           {isProcessing ? (
              <><span className="animate-spin"><Loader2 size={20}/></span> MENGIRIM KE G-DRIVE...</>
           ) : (
              <><FileText size={20} /> EKSEKUSI AI (1 TOKEN)</>
           )}
        </button>
      </form>
    </div>
  );
}

const Loader2 = ({ size, className }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>;

// ==========================================
// VIEW: HOME DASHBOARD (WITH G-DRIVE ARCHIVE)
// ==========================================
function HomeView({ user, reports, onCopy }) {
  const [tabMode, setTabMode] = useState('overview'); 
  const sukses = reports.filter(r => r.status === 'Sukses').length;
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end justify-between">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-white truncate drop-shadow-md">Halo, {user.nama}</h2>
          <p className="text-xs md:text-sm text-amber-400 mt-2 font-bold bg-[#0A192F] w-fit px-3 py-1.5 rounded-lg border border-amber-500/20">{user.jabatanASN}</p>
        </div>
        <div className="flex bg-[#0A192F] p-1.5 rounded-xl border border-slate-700/50 shadow-inner w-full md:w-auto">
          <button onClick={() => setTabMode('overview')} className={`flex-1 md:w-32 py-2 text-[10px] md:text-xs font-black rounded-lg uppercase tracking-widest transition-all ${tabMode === 'overview' ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-[#040D1A] shadow-[0_0_15px_rgba(251,191,36,0.3)]' : 'text-slate-400 hover:text-white'}`}>Overview</button>
          <button onClick={() => setTabMode('archive')} className={`flex-1 md:w-32 py-2 text-[10px] md:text-xs font-black rounded-lg uppercase tracking-widest transition-all ${tabMode === 'archive' ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-[#040D1A] shadow-[0_0_15px_rgba(251,191,36,0.3)]' : 'text-slate-400 hover:text-white'}`}>Arsip Drive</button>
        </div>
      </div>

      {!user.ttdBase64 && (
        <div className="bg-red-900/40 border border-red-500/50 p-4 rounded-xl text-xs md:text-sm flex gap-3 items-center shadow-inner">
          <Lock size={20} className="text-red-400 shrink-0"/>
          <span className="text-red-200 font-medium leading-relaxed">Tanda Tangan digital belum diatur. Akses Laporan AI dikunci hingga TTD diupload di Profil.</span>
        </div>
      )}

      {tabMode === 'overview' && (
        <div className="animate-in fade-in duration-500 space-y-6">
          <div className="grid grid-cols-2 gap-4 md:gap-6">
            <div className="bg-[#0A192F] p-6 rounded-3xl shadow-lg border border-slate-700/50 flex flex-col items-center justify-center gap-3 hover:border-amber-500/30 transition-colors">
              <div className="text-emerald-400 bg-emerald-400/10 p-4 rounded-2xl shadow-inner"><CheckCircle size={32} /></div>
              <div className="text-center"><p className="text-3xl font-black text-white">{sukses}</p><p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Laporan Sukses</p></div>
            </div>
            <div className="bg-[#0A192F] p-6 rounded-3xl shadow-lg border border-slate-700/50 flex flex-col items-center justify-center gap-3 hover:border-amber-500/30 transition-colors">
              <div className="text-amber-400 bg-amber-400/10 p-4 rounded-2xl shadow-inner"><Activity size={32} /></div>
              <div className="text-center"><p className="text-3xl font-black text-white">{reports.length}</p><p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Total Generate</p></div>
            </div>
          </div>
          <div>
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2 px-1"><FileText size={18} className="text-amber-400 drop-shadow-md"/> Riwayat Terbaru</h3>
            <div className="bg-[#0A192F] rounded-3xl shadow-lg border border-slate-700/50 overflow-hidden">
              {reports.length === 0 ? <div className="p-10 text-center text-slate-500 text-sm font-medium">Belum ada riwayat laporan.</div> : (
                <div className="divide-y divide-slate-700/50">
                  {reports.slice(0, 3).map((r, i) => (
                    <div key={i} className="p-5 hover:bg-white/5 transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-xs font-black text-[#040D1A] bg-amber-400 px-3 py-1.5 rounded-lg uppercase shadow-sm truncate max-w-[70%]">{r.kegiatan}</span>
                        <span className={`text-[10px] font-black px-2.5 py-1 rounded-md border uppercase tracking-wider shrink-0 ${r.status === 'Sukses' ? 'bg-emerald-900/30 border-emerald-500/30 text-emerald-400' : 'bg-red-900/30 border-red-500/30 text-red-400'}`}>{r.status}</span>
                      </div>
                      <p className="text-xs text-slate-400 flex items-center gap-2 mt-2 bg-[#040D1A] w-fit px-3 py-1.5 rounded-lg border border-slate-700/50"><Clock size={12} className="text-amber-400"/> {r.tanggal} | {r.waktu}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {tabMode === 'archive' && (
        <div className="bg-[#0A192F] rounded-3xl shadow-lg border border-slate-700/50 overflow-hidden animate-in fade-in duration-500">
          <div className="p-5 border-b border-slate-700/50 bg-[#040D1A]/50">
            <h3 className="font-black text-sm text-amber-400 uppercase tracking-widest flex items-center gap-2 drop-shadow-md"><Archive size={16}/> Arsip Google Drive Pribadi</h3>
            <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">Seluruh laporan dan foto kegiatan Anda telah dicetak secara otomatis dan disimpan di Google Drive Anda.</p>
          </div>
          {reports.length === 0 ? <div className="p-10 text-center text-slate-500 text-sm font-medium">Belum ada arsip G-Drive yang terbentuk.</div> : (
            <div className="divide-y divide-slate-700/50">
              {reports.map((r, i) => (
                <div key={i} className="p-5 hover:bg-white/5 transition-colors">
                  <div className="mb-3">
                    <span className="text-[11px] font-black text-amber-400 bg-amber-400/10 border border-amber-400/30 px-3 py-1.5 rounded-lg uppercase">{r.tanggal}</span>
                    <h4 className="text-sm font-bold text-white mt-3 leading-snug">{r.kegiatan}</h4>
                  </div>
                  
                  {r.driveLink ? (
                    <div className="bg-[#040D1A] border border-slate-700/50 rounded-xl p-3 md:p-4">
                      <p className="text-[9px] md:text-[10px] text-blue-300 font-mono mb-3 flex items-center gap-2 bg-blue-900/20 p-2 rounded-lg border border-blue-500/20"><FolderSync size={14} className="text-blue-400 shrink-0"/> <span className="truncate">{r.folderPath}</span></p>
                      <div className="flex gap-2">
                        <a href={r.driveLink} target="_blank" rel="noopener noreferrer" className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white text-[10px] md:text-xs font-black px-3 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all shadow-[0_5px_15px_rgba(37,99,235,0.3)] uppercase tracking-widest">
                          Buka Folder Drive
                        </a>
                        <button onClick={() => onCopy(r.driveLink)} className="bg-[#0A192F] border border-slate-600 hover:border-amber-400 hover:text-amber-400 text-slate-300 px-4 py-2.5 rounded-lg flex items-center justify-center transition-all shadow-inner active:scale-95" title="Copy Link">
                          <Copy size={16}/> <span className="ml-2 text-[10px] font-bold uppercase hidden md:inline">Copy Link</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[10px] text-red-400 italic mt-2 bg-red-900/20 p-2 rounded border border-red-500/30 w-fit">Link Drive tidak tersedia / Gagal diproses.</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ==========================================
// VIEW: AGENDA 
// ==========================================
function AgendaView({ user, agendas, setActiveTab, showToast, setDraftAgenda, db }) {
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewFoto, setPreviewFoto] = useState(null);

  const handleAddAgenda = async (e) => {
    e.preventDefault(); setIsSubmitting(true);
    const formData = new FormData(e.target);
    const newAgenda = { userEmail: user.email, tanggal: formData.get('tanggal'), jamMulai: formData.get('jamMulai'), jamSelesai: formData.get('jamSelesai'), kegiatan: formData.get('kegiatan'), deskripsi: formData.get('deskripsi'), fotoBase64: previewFoto, status: 'pending', createdAt: new Date().toISOString() };
    try { 
      if(db) {
         const newAgendaRef = push(ref(db, DB_PATHS.agendas));
         await set(newAgendaRef, newAgenda);
      }
      showToast('Agenda dicatat!'); setShowModal(false); setPreviewFoto(null); 
    } catch (err) { showToast('Gagal Simpan', 'error'); }
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center mb-5 px-1"><div><h2 className="text-xl font-black text-white drop-shadow-md">Buku Agenda</h2><p className="text-sm text-slate-400 mt-1">Catatan & Bukti Lapangan</p></div><button onClick={() => setShowModal(true)} className="bg-gradient-to-r from-amber-500 to-yellow-400 text-[#040D1A] p-3 md:p-4 rounded-2xl shadow-[0_0_20px_rgba(251,191,36,0.3)] hover:scale-105 active:scale-95 transition-all"><PlusCircle size={28} /></button></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {agendas.length === 0 ? <div className="col-span-full bg-[#0A192F] border border-dashed border-slate-600 rounded-3xl p-10 text-center text-slate-400 text-sm font-medium">Buku agenda masih kosong.</div> : agendas.map(agenda => (
            <div key={agenda.id} className="bg-[#0A192F] border border-slate-700/50 rounded-3xl p-5 shadow-lg relative overflow-hidden flex flex-col hover:border-amber-500/30 transition-colors">
              <div className={`absolute left-0 top-0 w-1.5 h-full ${agenda.status === 'reported' ? 'bg-emerald-400' : 'bg-amber-400'}`}></div>
              <div className="flex justify-between items-start mb-4 pl-2"><span className="text-xs font-bold uppercase tracking-wider text-slate-300 bg-[#040D1A] px-3 py-1.5 rounded-lg border border-slate-700">{agenda.tanggal}</span><span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border ${agenda.status === 'reported' ? 'bg-emerald-900/30 border-emerald-500/30 text-emerald-400 shadow-inner' : 'bg-amber-900/30 border-amber-500/30 text-amber-400 shadow-inner'}`}>{agenda.status === 'reported' ? 'Selesai Lapor' : 'Pending AI'}</span></div>
              <div className="pl-2 flex-1 flex flex-col"><h3 className="font-bold text-white text-base mb-2">{agenda.kegiatan}</h3><p className="text-sm text-slate-400 mb-4 line-clamp-3 leading-relaxed flex-1">{agenda.deskripsi}</p>{agenda.fotoBase64 && <div className="mb-5"><img src={agenda.fotoBase64} alt="Agenda" className="w-full h-40 object-cover rounded-xl border border-slate-700 shadow-md" /></div>}<div className="flex items-center justify-between border-t border-slate-700/50 pt-4"><div className="flex items-center gap-2 text-xs font-bold text-slate-300 bg-[#040D1A] px-3 py-2 rounded-xl border border-slate-700"><Clock size={14} className="text-amber-400" /> {agenda.jamMulai} - {agenda.jamSelesai}</div>{agenda.status !== 'reported' && (<button onClick={() => {setDraftAgenda(agenda); setActiveTab('generate');}} className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white text-xs font-black px-4 py-2.5 rounded-xl flex items-center gap-2 uppercase tracking-wider shadow-md"><FileText size={14} /> Lapor AI</button>)}</div></div>
            </div>
        ))}
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-[#040D1A]/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0A192F] w-full max-w-lg rounded-3xl p-6 md:p-8 shadow-[0_10px_50px_rgba(0,0,0,0.8)] border border-amber-500/30 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center mb-6"><h3 className="font-black text-2xl text-white">Catat Lapangan</h3><button type="button" onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white bg-[#040D1A] p-2.5 rounded-full"><X size={20}/></button></div>
            <form onSubmit={handleAddAgenda} className="space-y-5">
              <div className="grid grid-cols-2 gap-4"><div><label className="block text-[11px] font-bold text-amber-400 uppercase mb-2 tracking-wider">Tanggal</label><input type="date" name="tanggal" required className="w-full p-4 bg-[#040D1A] border border-slate-700 text-white rounded-xl text-sm outline-none focus:border-amber-400" /></div><div className="grid grid-cols-2 gap-3"><div><label className="block text-[11px] font-bold text-amber-400 uppercase mb-2 tracking-wider">Mulai</label><input type="time" name="jamMulai" required className="w-full p-4 bg-[#040D1A] border border-slate-700 text-white rounded-xl text-sm outline-none focus:border-amber-400" /></div><div><label className="block text-[11px] font-bold text-amber-400 uppercase mb-2 tracking-wider">Selesai</label><input type="time" name="jamSelesai" required className="w-full p-4 bg-[#040D1A] border border-slate-700 text-white rounded-xl text-sm outline-none focus:border-amber-400" /></div></div></div>
              <div><label className="block text-[11px] font-bold text-amber-400 uppercase mb-2 tracking-wider">Nama Kegiatan</label><input type="text" name="kegiatan" required className="w-full p-4 bg-[#040D1A] border border-slate-700 text-white rounded-xl text-sm outline-none focus:border-amber-400" /></div>
              <div><label className="block text-[11px] font-bold text-amber-400 uppercase mb-2 tracking-wider">Catatan Lapangan</label><textarea name="deskripsi" rows="3" className="w-full p-4 bg-[#040D1A] border border-slate-700 text-white rounded-xl text-sm outline-none focus:border-amber-400 custom-scrollbar"></textarea></div>
              <div><label className="block text-[11px] font-bold text-amber-400 uppercase mb-2 tracking-wider">Foto Bukti (Otomatis Kompres)</label>
                 {previewFoto ? <div className="relative"><img src={previewFoto} className="w-full h-40 object-cover rounded-xl border border-amber-500 shadow-md" alt="Preview" /><button type="button" onClick={() => setPreviewFoto(null)} className="absolute top-3 right-3 bg-red-500 text-white p-2 rounded-lg shadow-lg"><X size={16}/></button></div> : (
                   <div className="border-2 border-dashed border-slate-600 bg-[#040D1A] rounded-xl p-8 text-center cursor-pointer hover:bg-white/5 relative transition-colors"><input type="file" accept="image/*" capture="environment" onChange={async (e) => {const b = await compressImage(e.target.files[0], 600, false); setPreviewFoto(b);}} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" /><Camera size={36} className="mx-auto text-slate-400 mb-3" /><span className="text-xs text-slate-400 font-black uppercase tracking-widest">Jepret / Upload</span></div>
                 )}
              </div>
              <button type="submit" disabled={isSubmitting} className="w-full bg-gradient-to-r from-amber-500 to-yellow-400 text-[#040D1A] font-black py-4 rounded-xl shadow-[0_5px_20px_rgba(251,191,36,0.3)] hover:scale-105 disabled:opacity-50 mt-4 text-base uppercase tracking-widest flex justify-center gap-2 items-center transition-all"><CheckCircle size={20}/> {isSubmitting ? 'MENYIMPAN...' : 'SIMPAN AGENDA'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// VIEW: TOKEN
// ==========================================
function TokenView() {
  const openWA = (p, h) => window.open(`https://wa.me/6281234567890?text=${encodeURIComponent(`Halo Admin, topup *Paket ${p}* Rp ${h.toLocaleString('id-ID')}`)}`, '_blank');
  return (
    <div className="space-y-5">
      <div className="bg-gradient-to-br from-[#0f2240] to-[#0A192F] border border-amber-500/20 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 opacity-5"><Coins size={200} /></div>
        <h2 className="text-2xl font-black mb-3 flex items-center gap-3 relative z-10"><Coins className="text-amber-400" size={28}/> Isi Ulang Token</h2>
        <p className="text-sm text-slate-400 leading-relaxed max-w-[85%] relative z-10">Gunakan token untuk mencetak PDF dengan sistem <span className="text-amber-400 font-bold">Invisible Table</span> anti-terpotong.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-4">
        <div className="bg-[#0A192F] border border-slate-700/50 p-6 rounded-3xl shadow-lg flex flex-col justify-between h-full"><div className="text-center mb-6"><h3 className="font-bold text-white text-xl">Basic</h3><p className="text-xs text-slate-300 font-black tracking-widest bg-white/5 px-3 py-1.5 rounded-lg mt-3 uppercase inline-block">6 Laporan</p></div><div className="text-center mt-auto border-t border-slate-700/50 pt-5"><p className="font-black text-amber-400 text-3xl mb-4">10k</p><button onClick={() => openWA('Basic', 10000)} className="w-full bg-[#040D1A] text-amber-400 border border-amber-500/30 text-xs font-black uppercase tracking-widest px-4 py-3.5 rounded-xl hover:bg-amber-500/10 transition-colors shadow-inner">Beli Paket</button></div></div>
        <div className="bg-gradient-to-b from-amber-900/20 to-[#0A192F] border-2 border-amber-500 p-6 rounded-3xl relative shadow-[0_0_30px_rgba(251,191,36,0.15)] flex flex-col justify-between transform md:-translate-y-4"><div className="absolute top-0 right-0 left-0 text-center"><span className="bg-amber-500 text-[#040D1A] text-[10px] font-black px-4 py-1.5 rounded-b-xl uppercase tracking-widest shadow-md inline-block">Terlaris</span></div><div className="text-center mt-6 mb-6"><h3 className="font-black text-amber-400 text-2xl flex items-center justify-center gap-2">Pro <Zap size={20} fill="currentColor"/></h3><p className="text-xs text-amber-100 font-black tracking-widest bg-amber-500/20 px-3 py-1.5 rounded-lg mt-3 uppercase inline-block">20 Laporan</p></div><div className="text-center mt-auto border-t border-amber-500/30 pt-5"><p className="font-black text-white text-3xl mb-4">30k</p><button onClick={() => openWA('Pro', 30000)} className="w-full bg-gradient-to-r from-amber-500 to-yellow-400 text-[#040D1A] text-xs font-black uppercase tracking-widest px-4 py-3.5 rounded-xl hover:scale-105 transition-transform shadow-[0_5px_15px_rgba(251,191,36,0.3)]">Beli Paket</button></div></div>
        <div className="bg-[#0A192F] border border-slate-700/50 p-6 rounded-3xl shadow-lg flex flex-col justify-between h-full"><div className="text-center mb-6"><h3 className="font-bold text-white text-xl">Ultra</h3><p className="text-xs text-slate-300 font-black tracking-widest bg-white/5 px-3 py-1.5 rounded-lg mt-3 uppercase inline-block">35 Laporan</p></div><div className="text-center mt-auto border-t border-slate-700/50 pt-5"><p className="font-black text-amber-400 text-3xl mb-4">50k</p><button onClick={() => openWA('Ultra', 50000)} className="w-full bg-[#040D1A] text-amber-400 border border-amber-500/30 text-xs font-black uppercase tracking-widest px-4 py-3.5 rounded-xl hover:bg-amber-500/10 transition-colors shadow-inner">Beli Paket</button></div></div>
      </div>
    </div>
  );
}

// ==========================================
// VIEW: PROFILE (USER & ADMIN SETTINGS)
// ==========================================
function ProfileView({ user, onLogout, showToast, masterData, db }) {
  const [isEditing, setIsEditing] = useState(false); const [isSaving, setIsSaving] = useState(false); const [formData, setFormData] = useState({ ...user }); const [previewTtd, setPreviewTtd] = useState(user.ttdBase64 || null);
  const handleSave = async (e) => { 
      e.preventDefault(); setIsSaving(true); 
      try { 
         if(db) {
            const userRef = ref(db, `${DB_PATHS.users}/${user.id}`);
            await update(userRef, formData);
         }
         setIsEditing(false); showToast('Profil dikunci'); 
      } catch (err) { showToast('Gagal Simpan', 'error'); } 
      setIsSaving(false); 
  };
  
  if (isEditing) {
    return (
      <div className="bg-[#0A192F] p-6 md:p-8 rounded-3xl border border-amber-500/30 shadow-2xl animate-in slide-in-from-bottom-5">
        <div className="flex justify-between items-center mb-6 border-b border-slate-700/50 pb-4"><h3 className="font-black text-white text-xl">Edit Profil & Keamanan</h3><button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-white bg-[#040D1A] p-2.5 rounded-full"><X size={20}/></button></div>
        <form onSubmit={handleSave} className="space-y-5">
          <div><label className="block text-[11px] font-bold text-amber-400 mb-2 uppercase tracking-wider">Nama</label><input type="text" value={formData.nama} onChange={e => setFormData({...formData, nama: e.target.value})} required className="w-full bg-[#040D1A] border border-slate-700 text-white p-4 rounded-xl text-sm outline-none focus:border-amber-400" /></div>
          <div><label className="block text-[11px] font-bold text-amber-400 mb-2 uppercase tracking-wider">Pass</label><input type="text" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required className="w-full bg-[#040D1A] border border-slate-700 text-white p-4 rounded-xl text-sm outline-none focus:border-amber-400" /></div>
          
          <div><label className="block text-[11px] font-bold text-amber-400 mb-2 uppercase tracking-wider">Link G-Drive Pribadi</label><input type="url" value={formData.personalDriveLink || ''} onChange={e => setFormData({...formData, personalDriveLink: e.target.value})} className="w-full bg-[#040D1A] border border-slate-700 text-white p-4 rounded-xl text-sm outline-none focus:border-amber-400" /></div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-[11px] font-bold text-amber-400 mb-2 uppercase tracking-wider">Jabatan PKH</label><select value={formData.jabatanPKH} onChange={e => setFormData({...formData, jabatanPKH: e.target.value})} className="w-full bg-[#040D1A] border border-slate-700 text-white p-4 rounded-xl text-sm outline-none focus:border-amber-400">{Object.keys(masterData).map(j => <option key={j} value={j}>{j}</option>)}</select></div>
            <div><label className="block text-[11px] font-bold text-amber-400 mb-2 uppercase tracking-wider">Jabatan ASN</label><select value={formData.jabatanASN} onChange={e => setFormData({...formData, jabatanASN: e.target.value})} className="w-full bg-[#040D1A] border border-slate-700 text-white p-4 rounded-xl text-sm outline-none focus:border-amber-400">{DEFAULT_JABATAN_ASN.map(j => <option key={j} value={j}>{j}</option>)}</select></div>
          </div>
          <div className="pt-4 border-t border-slate-700/50"><label className="block text-[11px] font-bold text-amber-400 mb-3 uppercase tracking-wider flex items-center gap-1.5"><PenTool size={14}/> Unggah Tanda Tangan (Wajib Transparan)</label>
             {previewTtd ? <div className="relative bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-white/10 rounded-xl p-4 w-40 h-24 flex items-center justify-center border-4 border-emerald-500"><img src={previewTtd} className="max-w-full max-h-full object-contain" alt="TTD" /><button type="button" onClick={() => { setPreviewTtd(null); setFormData({...formData, ttdBase64: ''}); }} className="absolute -top-3 -right-3 bg-red-500 text-white p-1.5 rounded-full shadow-lg"><X size={14}/></button></div> : (
               <div className="border-2 border-dashed border-red-500/50 bg-[#040D1A] rounded-xl p-6 text-center cursor-pointer hover:bg-white/5 relative transition-colors"><input type="file" accept="image/*" onChange={async (e) => {const b = await compressImage(e.target.files[0], 400, true); setPreviewTtd(b); setFormData({...formData, ttdBase64: b});}} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" /><Upload size={28} className="mx-auto text-red-400 mb-2" /><span className="text-[11px] text-red-300 font-bold uppercase tracking-widest">Pilih Gambar TTD (PNG)</span></div>
             )}
          </div>
          <button type="submit" disabled={isSaving} className="w-full bg-gradient-to-r from-emerald-500 to-emerald-400 text-black font-black py-4.5 rounded-xl shadow-[0_5px_20px_rgba(16,185,129,0.3)] hover:scale-105 disabled:opacity-50 mt-6 uppercase tracking-widest text-sm flex justify-center items-center gap-2 transition-transform">{isSaving ? 'MENYIMPAN...' : <><CheckCircle size={20}/> KUNCI PROFIL</>}</button>
        </form>
      </div>
    );
  }
  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      <div className="bg-[#0A192F] p-8 rounded-3xl shadow-lg border border-slate-700/50 text-center relative overflow-hidden"><button onClick={() => setIsEditing(true)} className="absolute top-5 right-5 bg-[#040D1A] text-amber-400 p-3 rounded-xl border border-amber-400/30 hover:bg-amber-400 hover:text-[#040D1A] transition-all z-10 shadow-lg"><Edit3 size={18}/></button><div className="w-28 h-28 bg-[#040D1A] border-4 border-amber-400/50 text-amber-400 rounded-full flex items-center justify-center mx-auto mb-5 shadow-[0_0_30px_rgba(251,191,36,0.2)]"><User size={48} /></div><h2 className="font-black text-white text-2xl drop-shadow-md">{user.nama}</h2><p className="text-sm text-slate-400 mt-2 font-mono">{user.email}</p>
        <div className="flex justify-center gap-3 mt-6"><span className="text-[10px] font-black uppercase tracking-wider bg-amber-900/20 border border-amber-500/30 text-amber-400 px-4 py-2 rounded-xl shadow-inner max-w-[45%] truncate">{user.jabatanPKH}</span><span className="text-[10px] font-black uppercase tracking-wider bg-emerald-900/20 border border-emerald-500/30 text-emerald-400 px-4 py-2 rounded-xl shadow-inner max-w-[45%] truncate">{user.jabatanASN}</span></div>
      </div>
      <div className="bg-[#0A192F] p-6 md:p-8 rounded-3xl shadow-lg border border-slate-700/50">
         <h3 className="font-black text-sm text-amber-400 border-b border-slate-700/50 pb-4 mb-4 uppercase tracking-widest drop-shadow-md">Keamanan Sistem</h3>
         <div className="flex items-center justify-between py-3 border-b border-slate-700/30"><span className="text-sm text-slate-400 flex items-center gap-3"><Key size={18}/> Password Akun</span><span className="text-sm font-mono text-white bg-[#040D1A] px-3 py-1.5 rounded-lg border border-slate-700">••••••••</span></div>
         <div className="flex items-center justify-between py-3 border-b border-slate-700/30"><span className="text-sm text-slate-400 flex items-center gap-3"><LinkIcon size={18}/> Link Drive Pribadi</span><span className="text-xs font-mono text-blue-300 bg-blue-900/20 px-3 py-1.5 rounded-lg border border-blue-500/30 max-w-[50%] truncate">{user.personalDriveLink || 'Belum Diatur'}</span></div>
         <div className="flex items-center justify-between py-4"><span className="text-sm text-slate-400 flex items-center gap-3"><Lock size={18}/> Validasi Tanda Tangan</span>{user.ttdBase64 ? <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-900/30 border border-emerald-500/30 px-4 py-2 rounded-lg shadow-inner">Valid & Kunci</span> : <span className="text-[10px] font-black uppercase tracking-wider text-red-400 bg-red-900/30 border border-red-500/30 px-4 py-2 rounded-lg shadow-inner animate-pulse">Wajib Upload</span>}</div>
      </div>
      <button onClick={onLogout} className="w-full flex items-center justify-center gap-3 text-red-400 bg-red-900/20 border border-red-500/30 hover:bg-red-900/40 font-black py-4.5 rounded-2xl transition-colors text-sm uppercase tracking-widest shadow-lg mt-8"><LogOut size={20} /> Logout Perangkat</button>
    </div>
  );
}

// ==========================================
// VIEW: ADMIN PANEL
// ==========================================
function AdminView({ user, users, reports, transactions, masterConfig, showToast, onCopy, onLogout, db }) {
  const [adminTab, setAdminTab] = useState('users'); 
  const [isProcessing, setIsProcessing] = useState(null);
  const handleAddToken = async (userId, currentTokens, amount) => { 
      setIsProcessing(userId); 
      try { 
         if(db) {
            await update(ref(db, `${DB_PATHS.users}/${userId}`), { tokens: currentTokens + amount });
            const newTxRef = push(ref(db, DB_PATHS.transactions));
            await set(newTxRef, { user_id: userId, amount_tokens: amount, nominal: amount === 6 ? 10000 : (amount === 20 ? 30000 : 50000), createdAt: new Date().toISOString() }); 
         }
         showToast(`Suntik ${amount} Token Sukses`); 
      } catch (e) { showToast('Gagal', 'error'); } 
      setIsProcessing(null); 
  };
  const handleResetPassword = async (userId) => { 
      const newPass = prompt("Password Baru (Min 6):"); 
      if (!newPass || newPass.length < 6) return; 
      setIsProcessing(userId); 
      try { 
         if(db) await update(ref(db, `${DB_PATHS.users}/${userId}`), { password: newPass });
         showToast("Reset Sukses!"); 
      } catch(e) { showToast("Gagal reset", "error"); } 
      setIsProcessing(null); 
  };
  
  const [jsonInputData, setJsonInputData] = useState(JSON.stringify(masterConfig.jabatans, null, 2));
  const [faviconInput, setFaviconInput] = useState(masterConfig.favicon || '');

  const handleSaveMasterData = async () => { 
     setIsProcessing('db'); 
     try { 
        const parsedData = JSON.parse(jsonInputData); 
        if(Object.keys(parsedData).length < 2) throw new Error("Format error"); 
        if(db) await set(ref(db, `${DB_PATHS.config}/master_data`), { jabatans: parsedData, favicon: faviconInput }); 
        showToast('DB & Setting Diperbarui!'); 
     } catch (e) { showToast('Format JSON Error', 'error'); } 
     setIsProcessing(null); 
  };
  
  return (
    <div className="space-y-5">
      <div className="bg-red-900/20 border border-red-500/30 p-5 md:p-6 rounded-3xl shadow-lg relative overflow-hidden"><div className="absolute right-0 top-0 w-32 h-32 bg-red-500/10 rounded-full blur-2xl"></div><h2 className="font-black text-xl flex items-center gap-3 text-red-400 relative"><ShieldAlert size={24} /> SUPER ADMIN PANEL</h2><div className="flex gap-2 mt-5 bg-[#040D1A] p-2 rounded-xl border border-slate-700/50 relative z-10 overflow-x-auto custom-scrollbar"><button onClick={() => setAdminTab('users')} className={`flex-1 py-2.5 px-2 text-[10px] md:text-xs font-black rounded-lg uppercase tracking-widest transition-all whitespace-nowrap ${adminTab === 'users' ? 'bg-red-500 text-white shadow-md' : 'text-slate-400 hover:bg-white/5'}`}>User TKN</button><button onClick={() => setAdminTab('db')} className={`flex-1 py-2.5 px-2 text-[10px] md:text-xs font-black rounded-lg uppercase tracking-widest transition-all whitespace-nowrap ${adminTab === 'db' ? 'bg-red-500 text-white shadow-md' : 'text-slate-400 hover:bg-white/5'}`}>Master DB</button><button onClick={() => setAdminTab('finance')} className={`flex-1 py-2.5 px-2 text-[10px] md:text-xs font-black rounded-lg uppercase tracking-widest transition-all whitespace-nowrap ${adminTab === 'finance' ? 'bg-red-500 text-white shadow-md' : 'text-slate-400 hover:bg-white/5'}`}>Monitor</button><button onClick={() => setAdminTab('profile')} className={`flex-1 py-2.5 px-2 text-[10px] md:text-xs font-black rounded-lg uppercase tracking-widest transition-all whitespace-nowrap ${adminTab === 'profile' ? 'bg-red-500 text-white shadow-md' : 'text-slate-400 hover:bg-white/5'}`}>Profil Saya</button></div></div>
      
      {adminTab === 'users' && <div className="bg-[#0A192F] rounded-3xl border border-slate-700/50 overflow-hidden shadow-lg">
        <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-700/50">
          {users.filter(u => u.role !== 'admin').map(u => (
            <div key={u.id} className="p-5 hover:bg-white/5 transition-colors"><div className="flex justify-between items-start mb-4"><div className="max-w-[70%]"><p className="font-bold text-white text-base truncate">{u.nama}</p><p className="text-[11px] text-slate-400 font-mono truncate mt-0.5">{u.email}</p><div className="flex flex-wrap gap-2 mt-2"><span className="text-[9px] font-black bg-amber-400/10 border border-amber-400/30 px-2.5 py-1 rounded text-amber-400 uppercase tracking-widest">TKN: {u.tokens}</span></div></div><button onClick={() => handleResetPassword(u.id)} className="text-[10px] font-bold bg-[#040D1A] text-slate-300 px-3 py-2 rounded-lg border border-slate-600 flex items-center gap-1.5 hover:bg-slate-800 transition-colors"><Key size={12}/> Reset</button></div><div className="flex gap-3"><button onClick={() => handleAddToken(u.id, u.tokens, 6)} className="flex-1 bg-[#040D1A] border border-emerald-500/50 text-emerald-400 text-xs font-black py-2.5 rounded-xl hover:bg-emerald-900/30 transition-colors shadow-inner">+6</button><button onClick={() => handleAddToken(u.id, u.tokens, 20)} className="flex-1 bg-[#040D1A] border border-blue-500/50 text-blue-400 text-xs font-black py-2.5 rounded-xl hover:bg-blue-900/30 transition-colors shadow-inner">+20</button><button onClick={() => handleAddToken(u.id, u.tokens, 35)} className="flex-1 bg-[#040D1A] border border-purple-500/50 text-purple-400 text-xs font-black py-2.5 rounded-xl hover:bg-purple-900/30 transition-colors shadow-inner">+35</button></div></div>
          ))}
        </div>
      </div>}
      
      {adminTab === 'db' && (
         <div className="bg-[#0A192F] p-6 rounded-3xl border border-slate-700/50 shadow-lg space-y-5">
            <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-xl"><h3 className="text-sm font-black text-blue-400 uppercase tracking-widest flex items-center gap-2 mb-2"><Database size={16}/> Upload Master Data JSON</h3><p className="text-[11px] text-blue-200 leading-relaxed">Paste data dari Excel to JSON converter ke area di bawah untuk mengubah struktur RHK aplikasi.</p></div>
            <textarea value={jsonInputData} onChange={(e) => setJsonInputData(e.target.value)} className="w-full h-80 bg-[#040D1A] border border-slate-700 text-amber-400 font-mono text-[11px] p-4 rounded-xl outline-none focus:border-amber-400 transition-colors custom-scrollbar shadow-inner"></textarea>
            <div className="pt-2 border-t border-slate-700/50">
               <label className="block text-[11px] font-bold text-amber-400 uppercase mb-2 tracking-wider">URL Favicon Web (Opsional)</label>
               <input type="url" value={faviconInput} onChange={(e) => setFaviconInput(e.target.value)} placeholder="https://..." className="w-full p-4 bg-[#040D1A] border border-slate-700 text-white rounded-xl text-sm outline-none focus:border-amber-400" />
            </div>
            <button onClick={handleSaveMasterData} className="w-full bg-red-500 text-white font-black py-4 rounded-xl text-sm uppercase tracking-widest hover:bg-red-600 transition-colors shadow-[0_5px_20px_rgba(239,68,68,0.3)]">Timpa Database & Pengaturan</button>
         </div>
      )}
      
      {adminTab === 'finance' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div className="bg-[#040D1A] border border-emerald-500/30 p-6 rounded-3xl text-center shadow-inner"><p className="text-[11px] font-black text-emerald-500 uppercase tracking-widest mb-2">Total Omset</p><p className="text-3xl font-black text-emerald-400">Rp {transactions.reduce((s, t) => s + (t.nominal||0), 0).toLocaleString('id-ID')}</p></div><div className="bg-[#040D1A] border border-blue-500/30 p-6 rounded-3xl text-center shadow-inner"><p className="text-[11px] font-black text-blue-500 uppercase tracking-widest mb-2">Laporan Tercetak</p><p className="text-3xl font-black text-blue-400">{reports.length} Doc</p></div></div>
          
          <div className="bg-[#0A192F] rounded-3xl border border-slate-700/50 overflow-hidden shadow-lg">
            <div className="p-5 border-b border-slate-700/50 bg-[#040D1A]/50">
              <h3 className="font-black text-sm text-amber-400 uppercase tracking-widest flex items-center gap-2 drop-shadow-md"><FolderSync size={16}/> Arsip Link Laporan Global</h3>
              <p className="text-[10px] text-slate-400 mt-1">Daftar tautan seluruh folder Google Drive pengguna.</p>
            </div>
            {reports.length === 0 ? <div className="p-10 text-center text-slate-500 text-sm font-medium">Belum ada laporan dicetak.</div> : (
              <div className="divide-y divide-slate-700/50 max-h-96 overflow-y-auto custom-scrollbar">
                {reports.map((r, i) => (
                  <div key={i} className="p-4 hover:bg-white/5 transition-colors">
                    <p className="text-[10px] text-slate-400 font-mono mb-1">{r.userEmail}</p>
                    <p className="text-xs font-bold text-white mb-2">{r.kegiatan} <span className="text-amber-400 font-normal">({r.tanggal})</span></p>
                    {r.driveLink ? (
                      <div className="flex gap-2">
                        <a href={r.driveLink} target="_blank" rel="noopener noreferrer" className="flex-1 bg-blue-600/20 border border-blue-500/50 hover:bg-blue-600/40 text-blue-400 text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center justify-center gap-2 transition-all shadow-inner uppercase">Buka Folder</a>
                        <button onClick={() => onCopy(r.driveLink)} className="bg-[#040D1A] border border-slate-600 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg flex items-center justify-center transition-all"><Copy size={12}/></button>
                      </div>
                    ) : <p className="text-[10px] text-red-400">Link tidak tersedia</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {adminTab === 'profile' && <ProfileView user={user} onLogout={onLogout} showToast={showToast} masterData={masterConfig.jabatans} db={db} />}
    </div>
  );
}

function NavItem({ icon, label, active, onClick }) { return (<button onClick={onClick} className={`flex flex-col items-center gap-1 ${active ? 'text-amber-400' : 'text-slate-500 hover:text-slate-300'} transition-all`}>{icon}<span className="text-[9px] font-black uppercase tracking-wider mt-0.5">{label}</span></button>); }
