import React from 'react';
import { Bot } from 'lucide-react';
import { DraggableFab } from './DraggableFab';

interface AsistenFloatProps {
  changeTab: (tab: string) => void;
  speakText: (text: string) => void;
}

export const AsistenFloat: React.FC<AsistenFloatProps> = ({ changeTab, speakText }) => {
  return (
    <DraggableFab
      storageKey="fab_asisten_v1"
      defaultPos={() => ({ left: 16, top: Math.max(0, window.innerHeight - 210) })}
      id="asisten-float-container"
      className="md:hidden"
    >
      <button
        onClick={() => {
          changeTab('asisten');
          speakText('Membuka Asisten Hijau');
        }}
        className="relative w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-[#1B4332] flex items-center justify-center border-2 border-white dark:border-[#1C1917] shadow-xl transition active:scale-95"
        aria-label="Asisten Hijau"
      >
        <span className="absolute inset-0 rounded-full bg-emerald-400/40 animate-ping" />
        <Bot className="w-6 h-6 text-white" />
      </button>
    </DraggableFab>
  );
};
