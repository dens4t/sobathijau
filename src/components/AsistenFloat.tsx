import React from 'react';
import { Bot } from 'lucide-react';

interface AsistenFloatProps {
  changeTab: (tab: string) => void;
  speakText: (text: string) => void;
}

export const AsistenFloat: React.FC<AsistenFloatProps> = ({ changeTab, speakText }) => {
  return (
    <button
      onClick={() => {
        changeTab('asisten');
        speakText('Membuka Asisten Hijau');
      }}
      className="md:hidden fixed left-4 bottom-24 z-50 flex flex-col items-center gap-1 select-none group"
      aria-label="Asisten Hijau"
    >
      <span className="relative w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-[#1B4332] flex items-center justify-center border-2 border-white dark:border-[#1C1917] shadow-xl transition active:scale-95">
        <span className="absolute inset-0 rounded-full bg-emerald-400/40 animate-ping" />
        <Bot className="w-6 h-6 text-white" />
      </span>
      <span className="text-[9px] font-bold text-gray-400 dark:text-stone-500">Asisten</span>
    </button>
  );
};
