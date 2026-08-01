import React from 'react';
import { useStore } from '../store/useStore';
import { AdminPanel } from '../components/AdminPanel';
import { ServiceManager } from '../components/ServiceManager';
import { FormCreator } from '../components/FormCreator';
import { LocationManager } from '../components/LocationManager';
import { CategoryManager } from '../components/CategoryManager';
import { NetworkLinkManager } from '../components/NetworkLinkManager';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, PanelLeftClose, PanelLeftOpen, LogOut } from 'lucide-react';
import { AdminSidebar } from './AdminSidebar';

interface AdminLayoutProps {
  adminSubTab: 'kelola' | 'rancang' | 'layanan' | 'peta' | 'kategori' | 'jejaring';
  goAdmin: (sub: 'kelola' | 'rancang' | 'layanan' | 'peta' | 'kategori' | 'jejaring') => void;
  goGuest: (tab: string) => void;
  speakText: (text: string) => void;
  routeToTracking: (code: string) => void;
  addToast: (msg: string, type: 'success' | 'info' | 'error') => void;
  onLogout: () => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ adminSubTab, goAdmin, goGuest, speakText, routeToTracking, addToast, onLogout }) => {
  const { 
    services, submissions, locations, categories,
    updateSubmissionStatus, deleteSubmission,
    addService, updateService, deleteService,
    addLocation, updateLocation, deleteLocation,
    addCategory, updateCategory, deleteCategory,
  } = useStore();

  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);

  return (
    <div className="flex w-full h-screen overflow-hidden text-[#081C15] dark:text-stone-100 bg-stone-100 dark:bg-stone-950 transition-colors duration-300">
      
      {/* Mobile overlay backdrop */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 md:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      <AdminSidebar 
        adminSubTab={adminSubTab} 
        goAdmin={goAdmin} 
        goGuest={goGuest} 
        speakText={speakText} 
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        isCollapsed={isSidebarCollapsed}
      />

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="bg-white dark:bg-stone-900 border-b border-stone-200/55 dark:border-stone-850 px-4 md:px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            {/* Mobile: hamburger */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 -ml-1 rounded-xl text-[#081C15] dark:text-stone-100 hover:bg-slate-100 dark:hover:bg-stone-800 md:hidden transition"
            >
              <Menu className="w-5 h-5" />
            </button>
            {/* Desktop: collapse toggle */}
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="p-2 -ml-1 rounded-xl text-stone-400 hover:text-[#1B4332] dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-stone-800 transition hidden md:flex"
              title={isSidebarCollapsed ? 'Buka sidebar' : 'Tutup sidebar'}
            >
              {isSidebarCollapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
            </button>
            <div className="text-left">
              <h1 className="text-xs sm:text-sm font-bold text-[#1B4332] dark:text-stone-100 flex items-center gap-2 uppercase tracking-wide">
                {adminSubTab === 'kelola' ? '📋 Manajemen Berkas & Dokumen Publik' : adminSubTab === 'layanan' ? '📦 Kelola Semua Layanan Terdaftar' : adminSubTab === 'peta' ? '🗺️ Kelola Peta Sebaran Titik' : adminSubTab === 'kategori' ? '🏷️ Kelola Kategori Peta' : adminSubTab === 'jejaring' ? '🌐 Kelola Jejaring DLH' : '🛠️ Design Studio & Custom Form Creator'}
              </h1>
              <p className="text-[11px] text-slate-400 dark:text-stone-500 mt-1 hidden sm:block">
                {adminSubTab === 'kelola' 
                  ? 'Tinjau, perbarui status timeline, atau kelola berkas administrasi pemohon.'
                  : adminSubTab === 'layanan'
                  ? 'Edit nama, kategori, deskripsi, atau hapus layanan yang sudah terdaftar.'
                  : adminSubTab === 'peta'
                  ? 'Atur lokasi TPS, TPA, dan Bank Sampah pada peta interaktif.'
                  : adminSubTab === 'kategori'
                  ? 'Buat dan kelola kategori titik peta beserta deskripsi informatifnya.'
                  : adminSubTab === 'jejaring'
                  ? 'Kelola tautan website resmi terintegrasi DLH Kota Pontianak.'
                  : 'Design parameter masukan input, syarat administrasi, dan jenis layanan baru.'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[10px] text-emerald-800 bg-emerald-50 dark:bg-stone-850 dark:text-emerald-300 px-3 py-1 rounded-full font-bold font-mono">
              🟢 ADMINISTRATOR ONLINE
            </span>
            <button
              onClick={onLogout}
              className="text-[10px] font-bold text-rose-500/70 hover:text-rose-400 bg-rose-500/5 hover:bg-rose-500/10 px-3 py-1.5 rounded-xl border border-rose-500/10 hover:border-rose-500/20 transition flex items-center gap-1.5"
              title="Keluar dari panel admin"
            >
              <LogOut className="w-3 h-3" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </header>

        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          <div id="admin-breadcrumbs" className="mb-6 flex items-center gap-2 text-[10px] sm:text-[11px] text-stone-500 dark:text-stone-400 font-medium select-none">
            <span onClick={() => { goGuest('beranda'); speakText("Kembali ke portal utama"); }} className="hover:text-[#1B4332] dark:hover:text-emerald-400 transition cursor-pointer font-bold">
              SobatHijau
            </span>
            <span className="text-stone-300 dark:text-stone-700">/</span>
            <span onClick={() => { goAdmin('kelola'); speakText("Membuka halaman kelola berkas masuk"); }} className="hover:text-[#1B4332] dark:hover:text-emerald-400 transition cursor-pointer font-bold">
              Panel Admin
            </span>
            <span className="text-stone-300 dark:text-stone-700">/</span>
            <span className="text-emerald-650 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-900/40">
              {adminSubTab === 'kelola' ? 'Kelola Berkas Masuk' : adminSubTab === 'layanan' ? 'Kelola Semua Layanan' : adminSubTab === 'peta' ? 'Kelola Peta Sebaran' : adminSubTab === 'kategori' ? 'Kelola Kategori Peta' : adminSubTab === 'jejaring' ? 'Kelola Jejaring DLH' : 'Rancang Layanan Baru'}
            </span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={adminSubTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.22, ease: "easeInOut" }}
            >
              {adminSubTab === 'kelola' ? (
                <AdminPanel 
                  submissions={submissions}
                  onUpdateStatus={async (id, status, note) => {
                    try {
                      await updateSubmissionStatus(id, status, note);
                    } catch (e) {
                      addToast('Status tersimpan lokal; server SQLite belum aktif.', 'info');
                    }
                  }}
                  onDeleteSubmission={async (id) => {
                    const confirmDel = window.confirm(`Apakah Anda yakin ingin menghapus permohonan dengan kode ${id}?`);
                    if (!confirmDel) return;
                    try { await deleteSubmission(id); } catch (e) { addToast('Data terhapus lokal; server SQLite belum aktif.', 'info'); }
                  }}
                  onSpeak={speakText}
                />
              ) : adminSubTab === 'layanan' ? (
                <ServiceManager
                  services={services}
                  onUpdate={async (updated) => {
                    try { await updateService(updated); addToast(`Layanan "${updated.name}" berhasil diperbarui.`, 'success'); }
                    catch (e) { addToast('Perubahan layanan tersimpan lokal.', 'info'); }
                  }}
                  onDelete={async (id) => {
                    try { await deleteService(id); addToast('Layanan berhasil dihapus.', 'info'); }
                    catch (e) { addToast('Layanan terhapus lokal.', 'info'); }
                  }}
                  onSpeak={speakText}
                />
              ) : adminSubTab === 'peta' ? (
                <LocationManager
                  locations={locations}
                  categories={categories}
                  onAdd={addLocation}
                  onUpdate={updateLocation}
                  onDelete={deleteLocation}
                  addToast={addToast}
                  speakText={speakText}
                />
              ) : adminSubTab === 'kategori' ? (
                <CategoryManager
                  categories={categories}
                  onAdd={addCategory}
                  onUpdate={updateCategory}
                  onDelete={deleteCategory}
                  addToast={addToast}
                />
              ) : adminSubTab === 'jejaring' ? (
                <NetworkLinkManager onSpeak={speakText} />
              ) : (
                <FormCreator 
                  onSave={async (newService) => {
                    try { await addService(newService); } catch (e) { addToast('Layanan tersimpan lokal; server SQLite belum aktif.', 'info'); }
                    goAdmin('layanan');
                    speakText("Formulir sukses terdaftar di portal pelayanan!");
                  }} 
                  onSpeak={speakText}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        <footer className="bg-white dark:bg-stone-900 border-t border-stone-200/55 dark:border-stone-850 py-4 px-8 text-center text-[10px] text-slate-400 font-mono">
          PANEL ADMINISTRATOR SOBAT HIJAU DINAS LINGKUNGAN HIDUP KOTA PONTIANAK | © 2026 BASELINE
        </footer>
      </div>
    </div>
  );
};