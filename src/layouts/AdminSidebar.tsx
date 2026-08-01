import React, { useState, useRef, useEffect } from 'react';
import { Search, Activity, Plus, FolderOpen, FolderSync, Settings, LogOut, HelpCircle, X, Map, Globe, Layers } from 'lucide-react';
import { useStore } from '../store/useStore';

interface AdminSidebarProps {
  adminSubTab: 'kelola' | 'rancang' | 'layanan' | 'peta' | 'kategori' | 'jejaring';
  goAdmin: (sub: 'kelola' | 'rancang' | 'layanan' | 'peta' | 'kategori' | 'jejaring') => void;
  goGuest: (tab: string) => void;
  speakText: (text: string) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  isCollapsed: boolean;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ adminSubTab, goAdmin, goGuest, speakText, isSidebarOpen, setIsSidebarOpen, isCollapsed }) => {
  const { submissions, refreshActivityLogs } = useStore();
  const [sidebarSearchQuery, setSidebarSearchQuery] = useState('');
  const sidebarSearchInputRef = useRef<HTMLInputElement | null>(null);

  const showKelolaBerkas = "Kelola Berkas Masuk".toLowerCase().includes(sidebarSearchQuery.toLowerCase());
  const showRancangLayanan = "Rancang Layanan Baru".toLowerCase().includes(sidebarSearchQuery.toLowerCase());
  const showKelolalLayanan = "Kelola Semua Layanan".toLowerCase().includes(sidebarSearchQuery.toLowerCase());
  const showKelolaPeta = "Kelola Peta".toLowerCase().includes(sidebarSearchQuery.toLowerCase());
  const showKelolaKategori = "Kelola Kategori".toLowerCase().includes(sidebarSearchQuery.toLowerCase());
  const showJejaring = "Kelola Jejaring".toLowerCase().includes(sidebarSearchQuery.toLowerCase());
  const showKembaliWebsite = "Kembali ke Website".toLowerCase().includes(sidebarSearchQuery.toLowerCase());

  const pendingCount = submissions.filter(s => s.status === 'DIAJUKAN' || s.status === 'VERIFIKASI_ADMIN').length;

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSidebarOpen(true);
        setTimeout(() => sidebarSearchInputRef.current?.focus(), 50);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [setIsSidebarOpen]);

  const navigate = (fn: () => void) => { fn(); setIsSidebarOpen(false); };

  // Shared icon-only collapsed layout
  const collapsedItem = (icon: React.ReactNode, label: string, onClick: () => void, active: boolean, badge?: number) => (
    <button
      key={label}
      onClick={onClick}
      title={label}
      className={`relative w-10 h-10 mx-auto rounded-xl flex items-center justify-center transition-all ${
        active
          ? 'bg-gradient-to-br from-[#1B4332] via-[#113C2B] to-[#0D2E21] text-white border border-emerald-500/40 shadow-md'
          : 'text-stone-400 hover:text-white hover:bg-[#113C2B]/60 border border-transparent hover:border-[#1B4332]/40'
      }`}
    >
      {icon}
      {badge !== undefined && badge > 0 && (
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-[#081C15] text-[8px] font-black rounded-full flex items-center justify-center animate-pulse shadow-sm">
          {badge}
        </span>
      )}
    </button>
  );

  return (
    <aside
      className={`fixed md:sticky top-0 bottom-0 left-0 z-50 h-screen bg-[#081C15] text-stone-100 flex flex-col shrink-0 border-r border-[#1B4332]/40 transition-all duration-300 shadow-2xl md:shadow-none
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        ${isCollapsed ? 'md:w-16' : 'md:w-64'}
      `}
    >
      {/* ── Header ── */}
      <div className={`p-5 border-b border-[#1B4332]/30 flex flex-col items-center gap-2 relative shrink-0 ${isCollapsed ? 'md:p-3' : ''}`}>
        <button onClick={() => setIsSidebarOpen(false)} className="absolute top-4 right-4 p-1.5 rounded-lg text-stone-400 hover:text-white bg-white/10 md:hidden">
          <X className="w-4 h-4" />
        </button>
        <div className={`rounded-full bg-emerald-900/50 flex items-center justify-center ${isCollapsed ? 'md:w-8 md:h-8' : 'w-12 h-12'}`}>
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/0/02/Seal_of_Pontianak.svg"
            alt="Logo"
            className={`object-contain ${isCollapsed ? 'md:w-5 md:h-5' : 'w-8 h-8'}`}
            referrerPolicy="no-referrer"
          />
        </div>
        {!isCollapsed && (
          <>
            <h2 className="text-sm font-bold tracking-tight text-emerald-400">SobatHijau <span className="text-white font-normal">DLH</span></h2>
            <p className="text-[9px] text-stone-400 uppercase font-mono tracking-widest">Admin Portal</p>
          </>
        )}
      </div>

      <div className={`flex-1 overflow-y-auto scrollbar-hide py-4 space-y-4 ${isCollapsed ? 'md:px-1.5' : 'px-3'}`}>
        {/* Search — only when expanded */}
        {!isCollapsed && (
          <div className="relative font-sans">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#2D6A4F]" />
            <input
              ref={sidebarSearchInputRef}
              type="text"
              className="w-full bg-[#05130E]/90 border border-[#1B4332]/50 rounded-lg pl-8 pr-3 py-1.5 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-emerald-500 transition-all font-medium"
              placeholder="Cari Menu... (Ctrl+K)"
              value={sidebarSearchQuery}
              onChange={(e) => setSidebarSearchQuery(e.target.value)}
            />
          </div>
        )}

        {/* Quick actions */}
        {!sidebarSearchQuery && (
          isCollapsed ? (
            <div className="flex flex-col items-center gap-2">
              {collapsedItem(<Plus className="w-4 h-4" />, 'Buat Layanan', () => navigate(() => goAdmin('rancang')), false)}
              {collapsedItem(<Activity className="w-4 h-4" />, 'Log Aktivitas', refreshActivityLogs, false)}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => navigate(() => goAdmin('rancang'))} className="flex flex-col items-center p-2 rounded-xl bg-gradient-to-b from-[#113124]/90 to-[#0A1F16]/95 border border-[#1B4332]/60 hover:border-emerald-500/50 hover:text-emerald-400 transition-all text-center gap-1">
                <Plus className="w-4 h-4" /><span className="text-[9px] font-bold">Buat Layanan</span>
              </button>
              <button onClick={refreshActivityLogs} className="flex flex-col items-center p-2 rounded-xl bg-gradient-to-b from-[#113124]/90 to-[#0A1F16]/95 border border-[#1B4332]/60 hover:border-emerald-500/50 hover:text-emerald-400 transition-all text-center gap-1">
                <Activity className="w-4 h-4" /><span className="text-[9px] font-bold">Log Aktivitas</span>
              </button>
            </div>
          )
        )}

        {/* ── Menu Utama ── */}
        {(showKelolaBerkas || showRancangLayanan || showKelolalLayanan || showJejaring) && (
          <div className="space-y-1 mt-4">
            {!isCollapsed && (
              <div className="px-3 mb-2.5 flex items-center gap-2">
                <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-stone-400/12">
                  <FolderOpen className="w-3.5 h-3.5 text-stone-300" />
                </div>
                <span className="text-[11px] font-bold text-stone-200 tracking-tight">Menu Utama</span>
                <div className="flex-1 h-px bg-gradient-to-r from-stone-400/25 to-transparent" />
              </div>
            )}
            {showKelolaBerkas && (isCollapsed
              ? collapsedItem(<FolderOpen className="w-4 h-4" />, 'Berkas Masuk', () => navigate(() => goAdmin('kelola')), adminSubTab === 'kelola', pendingCount)
              : <SidebarItem active={adminSubTab === 'kelola'} onClick={() => navigate(() => goAdmin('kelola'))} icon={<FolderOpen className="w-4 h-4" />} label="Berkas Masuk" badge={pendingCount > 0 ? pendingCount : undefined} />
            )}
            {showKelolalLayanan && (isCollapsed
              ? collapsedItem(<FolderSync className="w-4 h-4" />, 'Semua Layanan', () => navigate(() => goAdmin('layanan')), adminSubTab === 'layanan')
              : <SidebarItem active={adminSubTab === 'layanan'} onClick={() => navigate(() => goAdmin('layanan'))} icon={<FolderSync className="w-4 h-4" />} label="Semua Layanan" />
            )}
            {showRancangLayanan && (isCollapsed
              ? collapsedItem(<Settings className="w-4 h-4" />, 'Rancang Layanan', () => navigate(() => goAdmin('rancang')), adminSubTab === 'rancang')
              : <SidebarItem active={adminSubTab === 'rancang'} onClick={() => navigate(() => goAdmin('rancang'))} icon={<Settings className="w-4 h-4" />} label="Rancang Layanan" />
            )}
            {showJejaring && (isCollapsed
              ? collapsedItem(<Globe className="w-4 h-4" />, 'Kelola Jejaring', () => navigate(() => goAdmin('jejaring')), adminSubTab === 'jejaring')
              : <SidebarItem active={adminSubTab === 'jejaring'} onClick={() => navigate(() => goAdmin('jejaring'))} icon={<Globe className="w-4 h-4" />} label="Kelola Jejaring" />
            )}
          </div>
        )}

        {/* ── Grup Manajemen Peta ── */}
        {(showKelolaPeta || showKelolaKategori) && (
          <div className="space-y-1">
            {isCollapsed ? (
              <div className="flex flex-col items-center gap-2 pt-2 border-t border-white/8">
                {showKelolaPeta && collapsedItem(<Map className="w-4 h-4" />, 'Kelola Peta', () => navigate(() => goAdmin('peta')), adminSubTab === 'peta')}
                {showKelolaKategori && collapsedItem(<Layers className="w-4 h-4" />, 'Kelola Kategori', () => navigate(() => goAdmin('kategori')), adminSubTab === 'kategori')}
              </div>
            ) : (
              <div className="space-y-0.5 mt-4">
                <div className="px-3 mb-2.5 flex items-center gap-2">
                  <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-emerald-500/12">
                    <Map className="w-3.5 h-3.5 text-emerald-300" />
                  </div>
                  <span className="text-[11px] font-bold text-emerald-200 tracking-tight">Manajemen Peta</span>
                  <div className="flex-1 h-px bg-gradient-to-r from-emerald-400/25 to-transparent" />
                </div>
                {showKelolaPeta && <SidebarItem active={adminSubTab === 'peta'} onClick={() => navigate(() => goAdmin('peta'))} icon={<Map className="w-4 h-4" />} label="Kelola Peta" />}
                {showKelolaKategori && <SidebarItem active={adminSubTab === 'kategori'} onClick={() => navigate(() => goAdmin('kategori'))} icon={<Layers className="w-4 h-4" />} label="Kelola Kategori" />}
              </div>
            )}
          </div>
        )}

        {showKembaliWebsite && (isCollapsed
          ? <div className="mt-6 flex flex-col items-center">{collapsedItem(<LogOut className="w-4 h-4" />, 'Kembali ke Website', () => navigate(() => goGuest('beranda')), false)}</div>
          : (
            <div className="pt-2 mt-2 border-t border-white/6 space-y-0.5">
              <div className="px-3 mb-2.5 flex items-center gap-2">
                <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-rose-500/12">
                  <LogOut className="w-3.5 h-3.5 text-rose-300" />
                </div>
                <span className="text-[11px] font-bold text-rose-200 tracking-tight">Portal Publik</span>
                <div className="flex-1 h-px bg-gradient-to-r from-rose-400/25 to-transparent" />
              </div>
              <button onClick={() => navigate(() => goGuest('beranda'))} className="w-full px-3 py-2.5 transition-all flex items-center gap-2.5 text-left rounded-xl text-xs font-semibold text-rose-300 hover:bg-rose-950/40">
                <LogOut className="w-4 h-4 shrink-0" /><span className="truncate">Kembali ke Website</span>
              </button>
            </div>
          )
        )}

        {(!showKelolaBerkas && !showRancangLayanan && !showKelolalLayanan && !showKelolaPeta && !showKelolaKategori && !showJejaring && !showKembaliWebsite) && !isCollapsed && (
          <div className="py-8 text-center text-stone-500 text-xs">
            <HelpCircle className="w-6 h-6 text-stone-600 mx-auto mb-2 opacity-60" />
            <p>Tidak ditemukan</p>
          </div>
        )}
      </div>
    </aside>
  );
};

const SidebarItem: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string; badge?: number }> = ({ active, onClick, icon, label, badge }) => (
  <button type="button" onClick={onClick} className={`w-full px-3 py-2.5 transition-all hover:scale-105 active:scale-95 flex items-center justify-between text-left border-l-4 text-xs ${active ? 'bg-gradient-to-r from-[#1B4332] via-[#113C2B] to-[#0D2E21] text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_2px_4px_rgba(0,0,0,0.3)] border-l-emerald-400 pl-2 rounded-r-xl rounded-l-none font-bold' : 'text-stone-300 hover:bg-gradient-to-r hover:from-[#113C2B]/85 hover:to-[#0D2E21]/40 hover:text-white border-l-transparent hover:border-l-emerald-500/60 pl-2 rounded-xl font-bold hover:shadow-[inset_0_1px_2px_rgba(255,255,255,0.06),0_2px_4px_rgba(0,0,0,0.25)]'}`}>
    <div className="flex items-center gap-2.5 min-w-0">{icon}<span className="truncate">{label}</span></div>
    {badge !== undefined && <span className="bg-amber-500 text-[#081C15] text-[9px] px-1.5 py-0.5 rounded-full font-black animate-pulse shadow-sm shrink-0">{badge}</span>}
  </button>
);