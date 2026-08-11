import React, { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Activity, ExternalLink, CheckCircle2, XCircle, Info, Loader2 } from 'lucide-react';
import { useStore } from './store/useStore';
import type { Submission } from './types';
import { nowSql, createTimeline } from './lib/timeline';
import { AccessibilityWidget } from './components/AccessibilityWidget';
import { LayananKami } from './components/LayananKami';
import { NewsFeed } from './components/NewsFeed';
import { BottomNav } from './components/BottomNav';
import { AsistenFloat } from './components/AsistenFloat';
import { TrackingSobat } from './components/TrackingSobat';
import { AsistenHijau } from './components/AsistenHijau';
import { PublicHeader } from './layouts/PublicHeader';
import { PublicFooter } from './layouts/PublicFooter';
import { AdminLayout } from './layouts/AdminLayout';

import { AdminLogin } from './components/AdminLogin';

// Lazy load heavy components
const EcoCarousel = React.lazy(() => import('./components/EcoCarousel').then(m => ({ default: m.EcoCarousel })));
const MapView = React.lazy(() => import('./components/MapView').then(m => ({ default: m.MapView })));

// Skeleton placeholder utk komponen lazy (carousel, peta)
const LoadingBlock: React.FC<{ label: string; height?: string }> = ({ label, height = 'h-64' }) => (
  <div className={`${height} rounded-2xl overflow-hidden relative border border-slate-100 dark:border-stone-800`}>
    <div className="absolute inset-0 skeleton-shimmer" />
    <div className="absolute inset-0 flex items-center justify-center gap-2 text-[10px] font-mono text-slate-400 dark:text-stone-500">
      <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
      {label}
    </div>
  </div>
);

export default function App() {
  const {
    initStore, isInitialized, services, submissions, locations, categories, networkLinks,
    addSubmission, activityLogs, refreshActivityLogs, carouselSlides, siteMetrics, accessibility
  } = useStore();

  const [portal, setPortal] = useState<'guest' | 'admin'>('guest');
  const [activeTab, setActiveTab] = useState<string>('beranda');
  const [adminSubTab, setAdminSubTab] = useState<'dashboard' | 'kelola' | 'rancang' | 'layanan' | 'peta' | 'kategori' | 'jejaring' | 'template' | 'metrics' | 'rekap'>('dashboard');
  const [trackSearchCode, setTrackSearchCode] = useState<string>('');
  const [isActivityLogModalOpen, setIsActivityLogModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  
  const [toasts, setToasts] = useState<{ id: string; message: string; type: 'success' | 'info' | 'error' }[]>([]);
  const addToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4500);
  };

  const goAdmin = (sub: 'dashboard' | 'kelola' | 'rancang' | 'layanan' | 'peta' | 'kategori' | 'jejaring' | 'template' | 'metrics' | 'rekap') => {
    if (sessionStorage.getItem('sh_admin_auth') !== 'authenticated') {
      navigateTo('/admin/login');
      return;
    }
    navigateTo(`/admin/${sub}`);
  };
  const goGuest = (tab: string) => { navigateTo(`/${tab === 'beranda' ? '' : tab}`); };

  const handleAdminLogin = () => {
    sessionStorage.setItem('sh_admin_auth', 'authenticated');
    setIsAuthenticated(true);
    navigateTo('/admin/dashboard');
    addToast('Selamat datang, Administrator DLH!', 'success');
  };

  const handleAdminLogout = () => {
    sessionStorage.removeItem('sh_admin_auth');
    sessionStorage.removeItem('sh_admin_token');
    setIsAuthenticated(false);
    navigateTo('/admin/login');
    addToast('Anda telah keluar dari panel admin.', 'info');
  };

  const navigateTo = (path: string) => {
    window.history.pushState(null, '', path);
    dispatchEvent(new PopStateEvent('popstate'));
  };

  useEffect(() => {
    // Terapkan pengaturan aksesibilitas ke DOM (kelas CSS di index.css).
    const el = document.documentElement;
    el.classList.toggle('size-large', accessibility.textSize === 'large');
    el.classList.toggle('size-extra-large', accessibility.textSize === 'extra-large');
    el.classList.toggle('dyslexic-font', accessibility.dyslexiaFont);
    el.classList.toggle('contrast-high-mode', accessibility.contrast === 'high');
    el.classList.toggle('grayscale', accessibility.contrast === 'grayscale');
  }, [accessibility]);

  useEffect(() => {
    // Muat pengaturan aksesibilitas tersimpan (localStorage hanya di-write di store).
    const saved = localStorage.getItem('sh_accessibility_v1');
    if (saved) {
      try {
        useStore.getState().updateAccessibility(JSON.parse(saved));
      } catch {
        localStorage.removeItem('sh_accessibility_v1');
      }
    }
  }, []);

  useEffect(() => {
    // Saat masuk portal admin: muat data berkas penuh (NIK/kontak) via endpoint ber-token.
    if (portal === 'admin') {
      useStore.getState().loadFullSubmissions().catch(() => {});
    }
  }, [portal]);

  useEffect(() => {
    initStore().catch(() => addToast('Server tidak aktif. Data tidak dapat dimuat. Muat ulang setelah server menyala.', 'info'));
  }, [initStore]);

  useEffect(() => {
    // Check stored auth on mount
    const stored = sessionStorage.getItem('sh_admin_auth');
    if (stored === 'authenticated') {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    const readPath = () => {
      const pathname = window.location.pathname;
      setCurrentPath(pathname);
      const path = pathname.replace(/^\//, '').split('/');
      const page = path[0] || 'beranda';
      const sub = path[1] || '';
      const isAuth = sessionStorage.getItem('sh_admin_auth') === 'authenticated';
      if (page === 'admin') {
        if (sub === 'login') {
          if (isAuth) {
            navigateTo('/admin/dashboard');
            return;
          }
          setPortal('guest');
          setActiveTab('beranda');
          return;
        }
        if (!isAuth) {
          navigateTo('/admin/login');
          return;
        }
        setPortal('admin');
        setIsAuthenticated(true);
        if (sub === 'dashboard' || sub === 'rancang' || sub === 'kelola' || sub === 'layanan' || sub === 'peta' || sub === 'kategori' || sub === 'jejaring' || sub === 'template' || sub === 'metrics' || sub === 'rekap') setAdminSubTab(sub as any);
        else setAdminSubTab('dashboard');
      } else {
        const valid = ['beranda', 'layanan', 'lacak', 'asisten', 'peta', 'jejaring', ''];
        setPortal('guest');
        setActiveTab(valid.includes(page) ? page || 'beranda' : 'beranda');
      }
    };
    // Daftarkan listener DULU agar navigateTo() dari dalam readPath() mount
    // (mis. /admin/login saat sudah login) tetap tertangkap popstate-nya.
    window.addEventListener('popstate', readPath);
    readPath();
    return () => window.removeEventListener('popstate', readPath);
  }, []);

  const speakText = (text: string) => {
    const tts = useStore.getState().accessibility.textToSpeech;
    if (tts && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'id-ID';
      utterance.rate = 1.0;
      utterance.pitch = 1.2;
      window.speechSynthesis.speak(utterance);
    }
  };

  const changeTab = (tabName: string) => {
    goGuest(tabName);
    let tabIndo = "";
    if (tabName === 'beranda') tabIndo = "Beranda Utama";
    else if (tabName === 'layanan') tabIndo = "Formulir Layanan Kami";
    else if (tabName === 'lacak') tabIndo = "Lacak Berkas Permohonan";
    else if (tabName === 'asisten') tabIndo = "Chat Asisten Cerdas";
    else if (tabName === 'peta') tabIndo = "Peta Sebaran TPS, TPA dan Bank Sampah";
    else if (tabName === 'jejaring') tabIndo = "Jejaring DLH";
    speakText(`Membuka tab ${tabIndo}`);
  };

  const routeToTracking = (code: string) => {
    setTrackSearchCode(code);
    goGuest('lacak');
    addToast(`Melacak kemajuan berkas dengan kode: ${code}`, 'info');
  };

  if (!isInitialized) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#081C15] via-[#0D2E21] to-[#081C15] relative overflow-hidden">
      {/* partikel dekoratif */}
      <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-emerald-500/10 blur-3xl animate-pulse" />
      <div className="absolute -bottom-32 -right-20 w-96 h-96 rounded-full bg-teal-400/10 blur-3xl animate-pulse [animation-delay:1s]" />
      <div className="absolute top-1/3 right-1/4 w-16 h-16 rounded-full bg-emerald-400/20 blur-2xl animate-float-y" />

      <div className="text-center space-y-5 relative z-10 px-6">
        {/* Logo dengan cincin berputar */}
        <div className="relative w-24 h-36 mx-auto">
          <div className="absolute -inset-4 rounded-[36px] border-2 border-dashed border-emerald-400/30 animate-spin-slow" />
          <div className="absolute -inset-1.5 rounded-[30px] border border-emerald-300/20 animate-spin-slower" />
          <div className="absolute inset-0 rounded-[26px] bg-emerald-400/15 blur-xl animate-pulse" />
          <img
            src="/logo.png"
            alt="Logo Sobat Hijau"
            className="relative w-24 h-36 object-contain rounded-2xl shadow-2xl shadow-emerald-500/30 animate-float-y"
          />
        </div>

        <div>
          <h2 className="text-2xl font-black tracking-tight text-white">
            Sobat <span className="text-emerald-400">Hijau</span>
          </h2>
          <p className="text-[10px] text-emerald-100/50 font-mono uppercase tracking-[0.2em] mt-1">Dinas Lingkungan Hidup Kota Pontianak</p>
        </div>

        {/* progress dots */}
        <div className="flex items-center justify-center gap-1.5 pt-1">
          {[0, 1, 2, 3, 4].map(i => (
            <span
              key={i}
              className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce"
              style={{ animationDelay: `${i * 0.12}s` }}
            />
          ))}
        </div>
        <p className="text-[10px] text-emerald-100/40 font-mono">Memuat sistem pelayanan DLH...</p>
      </div>
    </div>
  );

  return (
    <div className={portal === 'admin' ? "min-h-screen bg-stone-100 dark:bg-stone-950 flex transition-colors duration-300 relative text-[#081C15] dark:text-stone-100" : "min-h-screen bg-stone-50 dark:bg-stone-950 flex flex-col transition-colors duration-300 relative text-[#081C15] dark:text-stone-100"}>
      
      {/* Toasts */}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2.5 max-w-sm w-[calc(100%-2rem)] sm:w-96 pointer-events-none items-end">
        <AnimatePresence>
          {toasts.map(toast => {
            const cfg = toast.type === 'success'
              ? { icon: CheckCircle2, ring: 'bg-emerald-50 text-emerald-700', bar: 'bg-emerald-500' }
              : toast.type === 'error'
                ? { icon: XCircle, ring: 'bg-rose-50 text-rose-600', bar: 'bg-rose-500' }
                : { icon: Info, ring: 'bg-indigo-50 text-indigo-600', bar: 'bg-indigo-500' };
            const Icon = cfg.icon;
            return (
              <motion.div
                key={toast.id}
                layout
                initial={{ opacity: 0, x: 48, scale: 0.96 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 48, scale: 0.96 }}
                transition={{ type: 'spring', duration: 0.35, bounce: 0.2 }}
                className="pointer-events-auto relative w-full overflow-hidden rounded-2xl border border-slate-200/80 dark:border-stone-700 bg-white/95 dark:bg-stone-900 shadow-xl backdrop-blur-sm"
                role="status"
              >
                <div className="flex items-start gap-3 p-3.5 pr-3">
                  <span className={`mt-0.5 shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${cfg.ring}`}>
                    <Icon className="w-5 h-5" />
                  </span>
                  <p className="flex-1 text-xs font-semibold text-slate-800 dark:text-stone-100 leading-relaxed pt-1.5">{toast.message}</p>
                  <button
                    onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                    className="shrink-0 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-stone-800 transition"
                    aria-label="Tutup notifikasi"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="h-1 w-full bg-slate-100 dark:bg-stone-800">
                  <div className={`h-full ${cfg.bar} toast-progress`} />
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <AccessibilityWidget settings={useStore.getState().accessibility} onChange={useStore.getState().updateAccessibility} />

      {/* Admin Activity Modal */}
      <AnimatePresence>
        {isActivityLogModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-sans">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsActivityLogModalOpen(false)} className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, y: 15, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.95, y: 15, opacity: 0 }} className="bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200/60 w-full max-w-lg overflow-hidden relative z-10 flex flex-col max-h-[85vh]">
              <div className="p-6 border-b flex items-center justify-between bg-gradient-to-r from-emerald-950/20 to-transparent">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-650"><Activity className="w-5 h-5 animate-pulse" /></div>
                  <div><h3 className="text-sm font-extrabold uppercase">Catatan Log Aktivitas Admin</h3><p className="text-[10px] text-stone-400 font-mono">SOBATHIJAU SECURITY AUDIT</p></div>
                </div>
                <button onClick={() => setIsActivityLogModalOpen(false)} className="p-1.5 rounded-xl hover:bg-stone-100 transition"><X className="w-4 h-4" /></button>
              </div>
              <div className="p-6 overflow-y-auto space-y-4 flex-1">
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 text-[11px] text-amber-800 flex items-start gap-2.5">
                  <span className="text-amber-500 text-sm mt-0.5 leading-none">⚠️</span>
                  <div><span className="font-bold">Keamanan & Audit:</span> Aktivitas ini direkam dalam sistem audit log terpusat DLH Pontianak.</div>
                </div>
                <div className="space-y-3">
                  {activityLogs.map(log => (
                    <div key={log.id} className="p-3.5 rounded-2xl border bg-stone-50/50 flex items-start gap-3">
                      <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${log.iconType === 'success' ? 'bg-emerald-500 animate-pulse' : 'bg-blue-400'}`} />
                      <div className="flex-1 space-y-1">
                        <p className="text-xs font-semibold">{log.action}</p>
                        <p className="text-[9px] text-stone-400 font-mono">{log.timestamp} WIB</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-4 bg-stone-50 border-t flex items-center justify-between text-[11px]">
                <span className="text-stone-400 font-mono text-[9px]">TOTAL LOGS: {activityLogs.length} REC</span>
                <button onClick={() => { refreshActivityLogs(); addToast('Log aktivitas diperbarui.', 'info'); }} className="text-stone-500 hover:text-emerald-500 font-bold transition">Segarkan Log</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {currentPath.startsWith('/admin/login') && sessionStorage.getItem('sh_admin_auth') !== 'authenticated' ? (
        <AdminLogin onLogin={handleAdminLogin} />
      ) : portal === 'admin' ? (
        <AdminLayout adminSubTab={adminSubTab} goAdmin={goAdmin} goGuest={goGuest} speakText={speakText} routeToTracking={routeToTracking} addToast={addToast} onLogout={handleAdminLogout} onOpenActivityLog={() => setIsActivityLogModalOpen(true)} />
      ) : (
        <div className="flex flex-col flex-1 w-full">
          <PublicHeader activeTab={activeTab} changeTab={changeTab} goAdmin={goAdmin} speakText={speakText} setTrackSearchCode={setTrackSearchCode} addToast={addToast} />

          <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full transition-colors duration-300">
            <AnimatePresence mode="wait">
              <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                
                {activeTab === 'beranda' && (
                  <div className="space-y-8 animate-fade-in">
                    {/* Hero Section */}
                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-center bg-white border p-6 md:p-8 rounded-2xl shadow-sm text-left">
                      <div className="xl:col-span-7 space-y-4">
                        <h2 className="text-xl md:text-3xl font-bold text-[#1B4332] leading-tight">Pelayanan Responsif, <br /><span className="text-[#2D6A4F]">Bebas Hambatan & Terbuka</span> Untuk Semua</h2>
                        <p className="text-xs text-slate-500 leading-relaxed">Sobat Hijau adalah portal pelayanan publik Dinas Lingkungan Hidup Kabupaten/Kota Pontianak. Didesain secara khusus untuk memenuhi standar kegunaan tertinggi demi melayani pengurusan SPPL mikro, pengaduan lingkungan hidup, serta permintaan bibit tanaman penghijauan dengan andal dan transparan.</p>
                        <div className="flex flex-wrap gap-2 pt-3">
                          <button onClick={() => changeTab('layanan')} className="px-5 py-2.5 bg-[#1B4332] hover:bg-[#2D6A4F] text-white font-bold rounded-xl text-xs transition">Ajukan Permohonan Baru</button>
                          <button onClick={() => changeTab('lacak')} className="px-5 py-2.5 bg-slate-50 hover:bg-slate-100 text-[#1B4332] font-bold rounded-xl text-xs border transition">Lacak Kemajuan Berkas</button>
                        </div>
                      </div>
                      <div className="lg:col-span-12 xl:col-span-5 relative w-full space-y-4">
                        <div className="bg-emerald-50 rounded-2xl border p-5 flex flex-col justify-between text-left shadow-sm">
                          <h3 className="text-[10px] font-extrabold text-slate-500 uppercase">INDEKS KUALITAS LINGKUNGAN HIDUP KOTA PONTIANAK</h3>
                          <div className="flex items-baseline gap-2 mt-2">
                            <span className="text-3xl md:text-4xl font-black text-[#1B4332] font-mono">{(siteMetrics.find(m => m.key === 'iklh') || { value: '—' }).value}</span>
                            <span className="text-[9px] font-bold text-emerald-800 bg-[#E5F5EB] px-2 py-0.5 rounded-full font-mono">{(siteMetrics.find(m => m.key === 'iklh') || { label: '—' }).label}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Suspense fallback={<LoadingBlock label="Memuat sorotan layanan..." />}>
                      <EcoCarousel slides={carouselSlides} />
                    </Suspense>

                    <Suspense fallback={<LoadingBlock label="Menyiapkan peta interaktif..." />}>
                      <MapView locations={locations} categories={categories} />
                    </Suspense>

                    <NewsFeed />
                  </div>
                )}

                {activeTab === 'layanan' && (
                  <LayananKami services={services} onSubmitForm={(service, data) => {
                    const { __code, __applicantName, ...formOnly } = data as Record<string, unknown>;
                    const now = nowSql();
                    const newSub: Submission = {
                      id: String(__code),
                      serviceId: service.id,
                      serviceName: service.name,
                      applicantName: String(__applicantName),
                      status: 'DIAJUKAN',
                      formData: formOnly,
                      submittedAt: now,
                      timeline: createTimeline(now)
                    };
                    addSubmission(newSub);
                    addToast(`Permohonan ${service.name} berhasil dikirim! Kode: ${__code}`, 'success');
                    speakText(`Permohonan ${service.name} berhasil dikirim. Kode pelacakan ${__code}`);
                  }} onSpeak={speakText} />
                )}

                {activeTab === 'lacak' && (
                  <TrackingSobat submissions={submissions} initialSearchCode={trackSearchCode} onSpeak={speakText} />
                )}

                {activeTab === 'asisten' && (
                  <AsistenHijau ttsEnabled={useStore.getState().accessibility.textToSpeech} onSpeak={speakText} />
                )}

                {activeTab === 'peta' && (
                  <Suspense fallback={<LoadingBlock label="Menyiapkan peta interaktif..." />}>
                    <MapView locations={locations} categories={categories} />
                  </Suspense>
                )}

                {activeTab === 'jejaring' && (
                  <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
                    <div className="bg-white border p-6 md:p-8 rounded-2xl shadow-sm">
                      <h3 className="text-lg font-black tracking-tight text-[#1B4332] mb-2">Jejaring DLH Kota Pontianak</h3>
                      <p className="text-xs text-slate-500 mb-6 max-w-lg">
                        Portal dan layanan resmi terintegrasi dalam lingkungan Dinas Lingkungan Hidup Kota Pontianak.
                      </p>
                      <div className="grid gap-4">
                        {networkLinks.map(link => (
                          <a
                            key={link.id}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-center justify-between p-5 rounded-xl border border-slate-200 hover:border-emerald-300 bg-slate-50 hover:bg-emerald-50/50 transition text-left"
                          >
                            <div>
                              <p className="text-sm font-bold text-slate-800 group-hover:text-[#1B4332] transition">{link.title}</p>
                              <p className="text-[11px] text-slate-500 mt-0.5">{link.description || link.url}</p>
                            </div>
                            <ExternalLink className="w-5 h-5 text-slate-300 group-hover:text-emerald-700 shrink-0 transition" />
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                
              </motion.div>
            </AnimatePresence>
          </main>

          <PublicFooter changeTab={changeTab} />

          <BottomNav activeTab={activeTab} changeTab={changeTab} speakText={speakText} />
          <AsistenFloat changeTab={changeTab} speakText={speakText} />
          <div className="h-24 md:hidden" />
        </div>
      )}
    </div>
  );
}