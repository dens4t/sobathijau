import React from 'react';
import { ExternalLink } from 'lucide-react';
import { useStore } from '../store/useStore';

export const PublicFooter: React.FC<{ changeTab: (tab: string) => void }> = ({ changeTab }) => {
  const { networkLinks } = useStore();
  return (
    <footer className="bg-white dark:bg-stone-900 border-t border-emerald-100 dark:border-stone-800 py-6 px-8 mt-12 transition-colors duration-300 text-xs text-slate-500">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start justify-between gap-8">
        <div className="space-y-1.5 text-left max-w-xs">
          <div className="flex items-center gap-2 text-[#1B4332] dark:text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-[#2D6A4F]"></span>
            <span className="font-bold tracking-wide">Sobat Hijau DLH Kota Pontianak</span>
          </div>
          <p className="text-gray-400 dark:text-stone-500 leading-relaxed text-[11px]">
            Inovasi sistem perizinan mandiri & pengawasan lingkungan berkelanjutan.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-[10px] font-bold text-slate-600 dark:text-stone-400 uppercase tracking-wider">Jejaring DLH</p>
          {networkLinks.map(link => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-[11px] text-slate-500 hover:text-emerald-700 dark:hover:text-emerald-400 font-semibold transition"
            >
              {link.title} <ExternalLink className="w-3 h-3" />
            </a>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-[11px]">
          <a href="#about" onClick={(e) => { e.preventDefault(); changeTab('beranda'); }} className="hover:text-[#1B4332] dark:hover:text-emerald-400 font-semibold transition">Hubungi Pengawas</a>
          <span className="text-slate-200 hidden sm:inline">|</span>
          <a href="#about" onClick={(e) => { e.preventDefault(); changeTab('asisten'); }} className="hover:text-[#1B4332] dark:hover:text-emerald-400 font-semibold transition">Edukasi UU Lingkungan</a>
          <span className="text-slate-200 hidden sm:inline">|</span>
          <p className="text-gray-400 dark:text-stone-500">© 2026 DLH Pontianak</p>
        </div>
      </div>
    </footer>
  );
};