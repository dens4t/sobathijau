import React from 'react';
import { Leaf, FileText, Search, Map, Globe, Bot } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  changeTab: (tab: string) => void;
  speakText: (text: string) => void;
}

const ITEMS = [
  { key: 'beranda', label: 'Beranda', Icon: Leaf },
  { key: 'layanan', label: 'Layanan', Icon: FileText },
  { key: 'lacak', label: 'Lacak', Icon: Search },
  { key: 'peta', label: 'Peta', Icon: Map },
  { key: 'jejaring', label: 'Jejaring', Icon: Globe },
  { key: 'asisten', label: 'Asisten', Icon: Bot },
];

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, changeTab, speakText }) => {
  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-[#1C1917]/95 backdrop-blur-md border-t border-emerald-100/70 dark:border-stone-800 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      id="bottom-navigation-bar"
      aria-label="Navigasi utama"
    >
      <div className="grid grid-cols-6">
        {ITEMS.map(({ key, label, Icon }) => {
          const active = activeTab === key;
          return (
            <button
              key={key}
              onClick={() => {
                changeTab(key);
                speakText(`Membuka menu ${label}`);
              }}
              className={`flex flex-col items-center justify-center gap-0.5 py-2.5 text-[9px] font-bold transition select-none ${
                active
                  ? 'text-[#1B4332] dark:text-emerald-400'
                  : 'text-gray-400 dark:text-stone-500 active:text-[#2D6A4F]'
              }`}
              aria-current={active ? 'page' : undefined}
            >
              <span className={`p-1 rounded-xl transition ${active ? 'bg-[#E5F5EB] dark:bg-emerald-950' : ''}`}>
                <Icon className={`w-5 h-5 ${active ? 'text-emerald-700 dark:text-emerald-400' : 'text-gray-400 dark:text-stone-500'}`} />
              </span>
              <span className={active ? 'text-[#1B4332] dark:text-emerald-400' : ''}>{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
