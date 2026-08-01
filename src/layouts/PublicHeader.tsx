import React from 'react';
import { Leaf, Search, FileText, Bot, Globe, Map } from 'lucide-react';
import { PublicNotifications } from '../components/PublicNotifications';
import { useStore } from '../store/useStore';

interface PublicHeaderProps {
  activeTab: string;
  changeTab: (tab: string) => void;
  goAdmin: (sub: 'kelola' | 'rancang' | 'layanan' | 'peta' | 'jejaring') => void;
  speakText: (text: string) => void;
  setTrackSearchCode: (code: string) => void;
  addToast: (msg: string, type: 'success' | 'info' | 'error') => void;
}

export const PublicHeader: React.FC<PublicHeaderProps> = ({ activeTab, changeTab, goAdmin, speakText, setTrackSearchCode, addToast }) => {
  const { accessibility, updateAccessibility, notifications, markNotificationRead, markAllNotificationsRead, clearNotifications } = useStore();

  return (
    <>
      <div className="bg-[#1B4332] text-[#D8E2DC] px-4 md:px-8 py-2.5 flex flex-col sm:flex-row justify-between items-center gap-2 text-[0.72rem] font-medium border-b border-emerald-900 w-full min-h-max" id="top-accessibility-helper-bar">
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1.5">
          <span className="flex items-center gap-1.5 whitespace-nowrap">
            <span className={`w-2 h-2 rounded-full ${accessibility.contrast === 'high' ? 'bg-amber-400' : 'bg-emerald-400'}`}></span>
            Kontras: <strong className="uppercase">{accessibility.contrast === 'high' ? 'Tinggi' : accessibility.contrast === 'grayscale' ? 'Monokrom' : 'Alami'}</strong>
          </span>
          <span className="flex items-center gap-1.5 whitespace-nowrap">
            <span className={`w-2 h-2 rounded-full ${accessibility.textToSpeech ? 'bg-emerald-400' : 'bg-stone-500'}`}></span>
            Asisten Suara: <strong className="uppercase">{accessibility.textToSpeech ? 'Aktif' : 'Mati'}</strong>
          </span>
          {accessibility.dyslexiaFont && (
            <span className="flex items-center gap-1.5 whitespace-nowrap">
              <span>Font: <strong>DYSLEXIA</strong></span>
            </span>
          )}
        </div>
        <div className="flex gap-1.5 mt-1 sm:mt-0 items-center justify-center">
          <button onClick={() => updateAccessibility({ textSize: 'normal' })} className={`px-2 py-0.5 rounded text-[0.68rem] border transition ${accessibility.textSize === 'normal' ? 'bg-[#2D6A4F] text-white border-emerald-400 font-extrabold' : 'border-emerald-700/60 hover:bg-emerald-850'}`}>A-</button>
          <button onClick={() => updateAccessibility({ textSize: 'large' })} className={`px-2 py-0.5 rounded text-[0.68rem] font-extrabold border transition ${accessibility.textSize === 'large' ? 'bg-[#2D6A4F] text-white border-emerald-400 font-black' : 'border-emerald-700/60 hover:bg-emerald-850'}`}>A</button>
          <button onClick={() => updateAccessibility({ textSize: 'extra-large' })} className={`px-2 py-0.5 rounded text-[0.68rem] font-black border transition ${accessibility.textSize === 'extra-large' ? 'bg-[#2D6A4F] text-white border-emerald-400' : 'border-emerald-700/60 hover:bg-emerald-850'}`}>A+</button>
        </div>
      </div>

      <header className="bg-white dark:bg-stone-900 border-b border-emerald-150 dark:border-stone-850 py-4 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4.5 text-left">
            <img src="https://upload.wikimedia.org/wikipedia/commons/0/02/Seal_of_Pontianak.svg" alt="Logo Pemkot Pontianak" className="w-14 h-14 md:w-16 md:h-16 object-contain shrink-0" referrerPolicy="no-referrer" />
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-[#1B4332] text-[#D8E2DC] font-black text-[9px] px-2 py-0.5 rounded-full font-mono uppercase tracking-widest">DLH PORTAL</span>
                <span className="text-[10px] text-[#2D6A4F] dark:text-emerald-400 font-mono tracking-wider font-bold">Pemerintah Kota Pontianak</span>
              </div>
              <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-[#1B4332] dark:text-emerald-400 mt-1 leading-tight" id="web-logo-title">SobatHijau <span className="font-normal text-emerald-600">DLH</span></h1>
              <p className="text-gray-400 dark:text-stone-500 text-[10px] uppercase font-bold tracking-widest mt-0.5">Sistem Pelayanan Online Terpadu Dinas Lingkungan Hidup</p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs text-right pl-0 md:pl-6 h-10 border-t md:border-t-0 md:border-l border-emerald-100 dark:border-stone-800 pt-3 md:pt-0 justify-between md:justify-end">
            <div className="hidden lg:block">
              <p className="text-[#2D6A4F] dark:text-emerald-400 text-[9px] font-mono tracking-widest uppercase font-bold">Email Unit Kerja</p>
              <p className="font-bold text-[#1B4332] dark:text-stone-200 mt-0.5 hover:text-[#2D6A4F] transition">dlh@pontianak.go.id</p>
            </div>
            <div className="hidden lg:block font-mono">
              <p className="text-[#2D6A4F] dark:text-emerald-400 text-[9px] tracking-widest uppercase font-bold">Jam Kerja Dinas</p>
              <p className="font-bold text-slate-700 dark:text-stone-300 mt-0.5">Senin-Jum'at: 7am-16pm</p>
            </div>
            <div>
              <button onClick={() => { goAdmin('kelola'); speakText("Beralih ke Portal Administrasi"); }} className="px-4 py-2 bg-[#E5F5EB] hover:bg-[#1B4332] dark:bg-stone-800 hover:text-white text-[#1B4332] dark:text-emerald-300 border border-emerald-200 dark:border-stone-700 text-xs font-bold rounded-xl transition flex items-center gap-1 shadow-sm">
                <span>Akses Admin 🔐</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <nav className="bg-[#FFFFFF]/95 dark:bg-[#1C1917]/95 border-b border-emerald-100/60 dark:border-stone-850 backdrop-blur-md sticky top-0 z-40 shadow-sm transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between gap-4" id="main-navigation-menu">
          <div className="grid grid-cols-5 md:flex md:space-x-1 py-1 w-full md:w-auto">
            <button onClick={() => changeTab('beranda')} className={`py-3 md:px-4 text-[10px] sm:text-xs font-bold transition flex flex-col md:flex-row items-center justify-center gap-1 md:gap-1.5 whitespace-nowrap border-b-2 ${activeTab === 'beranda' ? 'border-[#1B4332] text-[#1B4332] dark:border-emerald-400 dark:text-emerald-400 font-extrabold' : 'border-transparent text-gray-500 dark:text-stone-400 hover:text-[#1B4332] dark:hover:text-amber-400'}`}>
              <Leaf className="w-3.5 h-3.5 md:w-4 md:h-4 text-emerald-700 dark:text-emerald-400" />
              <span>Beranda</span>
            </button>
            <button onClick={() => changeTab('layanan')} className={`py-3 md:px-4 text-[10px] sm:text-xs font-bold transition flex flex-col md:flex-row items-center justify-center gap-1 md:gap-1.5 whitespace-nowrap border-b-2 ${activeTab === 'layanan' ? 'border-[#1B4332] text-[#1B4332] dark:border-emerald-400 dark:text-emerald-400 font-extrabold' : 'border-transparent text-gray-500 dark:text-stone-400 hover:text-[#1B4332] dark:hover:text-amber-400'}`}>
              <FileText className="w-3.5 h-3.5 md:w-4 md:h-4 text-emerald-700 dark:text-emerald-400" />
              <span>Layanan</span>
            </button>
            <button onClick={() => changeTab('lacak')} className={`py-3 md:px-4 text-[10px] sm:text-xs font-bold transition flex flex-col md:flex-row items-center justify-center gap-1 md:gap-1.5 whitespace-nowrap border-b-2 ${activeTab === 'lacak' ? 'border-[#1B4332] text-[#1B4332] dark:border-emerald-400 dark:text-emerald-400 font-extrabold' : 'border-transparent text-gray-500 dark:text-stone-400 hover:text-[#1B4332] dark:hover:text-amber-400'}`}>
              <Search className="w-3.5 h-3.5 md:w-4 md:h-4 text-emerald-700 dark:text-emerald-400" />
              <span>Lacak</span>
            </button>
            <button onClick={() => changeTab('peta')} className={`py-3 md:px-4 text-[10px] sm:text-xs font-bold transition flex flex-col md:flex-row items-center justify-center gap-1 md:gap-1.5 whitespace-nowrap border-b-2 ${activeTab === 'peta' ? 'border-[#1B4332] text-[#1B4332] dark:border-emerald-400 dark:text-emerald-400 font-extrabold' : 'border-transparent text-gray-500 dark:text-stone-400 hover:text-[#1B4332] dark:hover:text-amber-400'}`}>
              <Map className="w-3.5 h-3.5 md:w-4 md:h-4 text-emerald-700 dark:text-emerald-400" />
              <span>Peta</span>
            </button>
            <button onClick={() => changeTab('jejaring')} className={`py-3 md:px-4 text-[10px] sm:text-xs font-bold transition flex flex-col md:flex-row items-center justify-center gap-1 md:gap-1.5 whitespace-nowrap border-b-2 ${activeTab === 'jejaring' ? 'border-[#1B4332] text-[#1B4332] dark:border-emerald-400 dark:text-emerald-400 font-extrabold' : 'border-transparent text-gray-500 dark:text-stone-400 hover:text-[#1B4332] dark:hover:text-amber-400'}`}>
              <Globe className="w-3.5 h-3.5 md:w-4 md:h-4 text-emerald-700 dark:text-emerald-400" />
              <span>Jejaring</span>
            </button>
            <button onClick={() => changeTab('asisten')} className={`py-3 md:px-4 text-[10px] sm:text-xs font-bold transition flex flex-col md:flex-row items-center justify-center gap-1 md:gap-1.5 whitespace-nowrap border-b-2 ${activeTab === 'asisten' ? 'border-[#1B4332] text-[#1B4332] dark:border-emerald-400 dark:text-emerald-400 font-extrabold' : 'border-transparent text-gray-500 dark:text-stone-400 hover:text-[#1B4332] dark:hover:text-amber-400'}`}>
              <Bot className="w-3.5 h-3.5 md:w-4 md:h-4 text-emerald-700 dark:text-emerald-400" />
              <span>Asisten</span>
            </button>
          </div>
          <div className="flex items-center py-1.5">
            <PublicNotifications
              notifications={notifications}
              onMarkRead={markNotificationRead}
              onMarkAllRead={markAllNotificationsRead}
              onClearAll={clearNotifications}
              onSelectNotification={(id) => { changeTab('lacak'); setTrackSearchCode(id); }}
            />
          </div>
        </div>
      </nav>
    </>
  );
};