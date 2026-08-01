import React from 'react';
import { Leaf, FileText, Search, Map, Globe, Bot } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  changeTab: (tab: string) => void;
  speakText: (text: string) => void;
}

interface Item {
  key: string;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
}

const LEFT: Item[] = [
  { key: 'beranda', label: 'Beranda', Icon: Leaf },
  { key: 'lacak', label: 'Lacak', Icon: Search },
];

const CENTER: Item = { key: 'layanan', label: 'Layanan', Icon: FileText };

const RIGHT: Item[] = [
  { key: 'peta', label: 'Peta', Icon: Map },
  { key: 'jejaring', label: 'Jejaring', Icon: Globe },
  { key: 'asisten', label: 'Asisten', Icon: Bot },
];

const RegularButton: React.FC<{ item: Item; active: boolean; onClick: () => void }> = ({ item, active, onClick }) => {
  const { Icon } = item;
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-0.5 py-2.5 text-[9px] font-bold transition select-none ${
        active ? 'text-[#1B4332] dark:text-emerald-400' : 'text-gray-400 dark:text-stone-500 active:text-[#2D6A4F]'
      }`}
      aria-current={active ? 'page' : undefined}
    >
      <span className={`p-1 rounded-xl transition ${active ? 'bg-[#E5F5EB] dark:bg-emerald-950' : ''}`}>
        <Icon className={`w-5 h-5 ${active ? 'text-emerald-700 dark:text-emerald-400' : 'text-gray-400 dark:text-stone-500'}`} />
      </span>
      <span>{item.label}</span>
    </button>
  );
};

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, changeTab, speakText }) => {
  const open = (key: string, label: string) => {
    changeTab(key);
    speakText(`Membuka menu ${label}`);
  };

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-[#1C1917]/95 backdrop-blur-md border-t border-emerald-100/70 dark:border-stone-800 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      id="bottom-navigation-bar"
      aria-label="Navigasi utama"
    >
      <div className="relative">
        {/* Slot grid: 2 kiri, 1 kosong (di bawah FAB), 3 kanan */}
        <div className="grid grid-cols-6">
          {LEFT.map(item => (
            <RegularButton key={item.key} item={item} active={activeTab === item.key} onClick={() => open(item.key, item.label)} />
          ))}
          <div aria-hidden="true" />
          {RIGHT.map(item => (
            <RegularButton key={item.key} item={item} active={activeTab === item.key} onClick={() => open(item.key, item.label)} />
          ))}
        </div>

        {/* Center FAB — Layanan */}
        <button
          onClick={() => open(CENTER.key, CENTER.label)}
          className="absolute left-1/2 -translate-x-1/2 -top-8 flex flex-col items-center gap-0.5 select-none"
          aria-current={activeTab === CENTER.key ? 'page' : undefined}
          aria-label="Layanan"
        >
          <span
            className={`w-14 h-14 rounded-full flex items-center justify-center border-4 border-white dark:border-[#1C1917] shadow-lg transition active:scale-95 ${
              activeTab === CENTER.key
                ? 'bg-[#2D6A4F] text-emerald-200'
                : 'bg-[#1B4332] text-white'
            }`}
          >
            <CENTER.Icon className="w-7 h-7 text-emerald-100" />
          </span>
          <span className={`text-[9px] font-bold ${activeTab === CENTER.key ? 'text-[#1B4332] dark:text-emerald-400' : 'text-gray-400 dark:text-stone-500'}`}>
            {CENTER.label}
          </span>
        </button>
      </div>
    </nav>
  );
};
