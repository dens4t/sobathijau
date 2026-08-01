/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Accessibility, Volume2, VolumeX, Eye, ZoomIn, ZoomOut, RotateCcw, HelpCircle, Check, BookOpen } from 'lucide-react';
import { AccessibilitySettings } from '../types';

interface AccessibilityWidgetProps {
  settings: AccessibilitySettings;
  onChange: (settings: AccessibilitySettings) => void;
}

export const AccessibilityWidget: React.FC<AccessibilityWidgetProps> = ({ settings, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);

  // Auto-hide tooltip after 8 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTooltip(false);
    }, 8000);
    return () => clearTimeout(timer);
  }, []);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
    speakNotification(isOpen ? "Fitur aksesibilitas ditutup" : "Fitur aksesibilitas dibuka. Silakan sesuaikan tampilan.");
  };

  const speakNotification = (text: string) => {
    if (settings.textToSpeech && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'id-ID';
      window.speechSynthesis.speak(utterance);
    }
  };

  const updateSetting = <K extends keyof AccessibilitySettings>(key: K, value: AccessibilitySettings[K]) => {
    const newSettings = { ...settings, [key]: value };
    onChange(newSettings);

    // Speak setting changes if TTS is active
    if (key === 'textToSpeech') {
      if (value) {
        // Enable TTS first, then speak
        setTimeout(() => {
          if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance("Asisten Suara diaktifkan. Arahkan kursor atau sentuh elemen untuk membaca teks.");
            utterance.lang = 'id-ID';
            window.speechSynthesis.speak(utterance);
          }
        }, 50);
      } else {
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
        }
      }
    } else {
      let changeMessage = "";
      if (key === 'textSize') {
        changeMessage = `Ukuran teks diubah ke ${value === 'normal' ? 'normal' : value === 'large' ? 'besar' : 'sangat besar'}`;
      } else if (key === 'contrast') {
        changeMessage = `Mode kontras diubah ke ${value === 'normal' ? 'standar' : value === 'high' ? 'kontras tinggi' : 'skala abu-abu'}`;
      } else if (key === 'dyslexiaFont') {
        changeMessage = value ? "Membuka fon ramah disabilitas" : "Kembali ke fon standar";
      }
      speakNotification(changeMessage);
    }
  };

  const resetAll = () => {
    const defaultSet: AccessibilitySettings = {
      textSize: 'normal',
      contrast: 'normal',
      dyslexiaFont: false,
      textToSpeech: false,
      screenReaderActive: false
    };
    onChange(defaultSet);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    speakNotification("Semua pengaturan aksesibilitas telah diatur ulang ke standar.");
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans" id="accessibility-widget-container">
      {/* Tooltip Promo */}
      {showTooltip && !isOpen && (
        <div className="absolute right-16 bottom-2 mr-2 bg-emerald-900 text-white text-xs px-3 py-2 rounded-lg shadow-xl border border-emerald-700 w-48 text-right transition-all duration-300 animate-bounce">
          <p className="font-semibold">Ramah Disabilitas ♿</p>
          <p className="text-[10px] opacity-90 mt-0.5">Atur huruf, warna kontras tinggi, dan pembaca suara di sini.</p>
          <button 
            onClick={(e) => { e.stopPropagation(); setShowTooltip(false); }} 
            className="text-[10px] underline font-bold float-right mt-1 hover:text-emerald-200"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Floating Button */}
      <button
        id="btn-accessibility"
        onClick={toggleOpen}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all transform duration-300 ${
          isOpen 
            ? 'bg-amber-500 text-slate-900 rotate-90 scale-110' 
            : 'bg-emerald-700 text-white hover:bg-emerald-800 hover:scale-105'
        } focus:outline-none focus:ring-4 focus:ring-emerald-400 focus:ring-offset-2`}
        aria-label="Fitur Aksesibilitas"
        title="Fitur Aksesibilitas"
      >
        <Accessibility className="w-7 h-7" />
      </button>

      {/* Menu Modal */}
      {isOpen && (
        <div 
          className="absolute right-0 bottom-16 bg-white dark:bg-stone-900 p-5 rounded-2xl shadow-2xl border border-emerald-100 dark:border-stone-800 w-80 text-slate-800 dark:text-stone-100 transition-all transform duration-300 origin-bottom-right"
          id="accessibility-panel"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-stone-800 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <Accessibility className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
              <h3 className="font-bold text-sm text-emerald-950 dark:text-emerald-100">Fitur Aksesibilitas</h3>
            </div>
            <button
              onClick={resetAll}
              className="text-xs flex items-center gap-1 text-slate-500 hover:text-emerald-800 dark:hover:text-amber-400 transition"
              id="btn-reset-accessibility"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          </div>

          <div className="space-y-4 text-xs">
            {/* Font Size Adjuster */}
            <div>
              <p className="font-semibold text-slate-700 dark:text-stone-300 mb-2 flex items-center justify-between">
                <span>Ukuran Huruf</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 dark:bg-stone-800 dark:text-amber-400">
                  {settings.textSize === 'normal' ? 'Normal (100%)' : settings.textSize === 'large' ? 'Besar (115%)' : 'Sangat Besar (130%)'}
                </span>
              </p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => updateSetting('textSize', 'normal')}
                  className={`py-2 px-1 rounded-lg border text-center font-medium transition ${
                    settings.textSize === 'normal'
                      ? 'bg-emerald-700 text-white border-emerald-700'
                      : 'border-slate-200 dark:border-stone-700 hover:bg-slate-50 dark:hover:bg-stone-800'
                  }`}
                >
                  <ZoomOut className="w-3.5 h-3.5 mx-auto mb-1" />
                  Kecil
                </button>
                <button
                  onClick={() => updateSetting('textSize', 'large')}
                  className={`py-2 px-1 rounded-lg border text-center font-medium transition ${
                    settings.textSize === 'large'
                      ? 'bg-emerald-700 text-white border-emerald-700'
                      : 'border-slate-200 dark:border-stone-700 hover:bg-slate-50 dark:hover:bg-stone-800'
                  }`}
                >
                  <ZoomIn className="w-3.5 h-3.5 mx-auto mb-1" />
                  Besar
                </button>
                <button
                  onClick={() => updateSetting('textSize', 'extra-large')}
                  className={`py-2 px-1 rounded-lg border text-center font-bold transition ${
                    settings.textSize === 'extra-large'
                      ? 'bg-emerald-700 text-white border-emerald-700'
                      : 'border-slate-200 dark:border-stone-700 hover:bg-slate-50 dark:hover:bg-stone-800'
                  }`}
                >
                  <span className="block text-sm leading-none mb-1">A+</span>
                  Sangat Besar
                </button>
              </div>
            </div>

            {/* Colors and Contrast */}
            <div>
              <p className="font-semibold text-slate-700 dark:text-stone-300 mb-2 flex items-center justify-between">
                <span>Filter Warna & Kontras</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 dark:bg-stone-800 dark:text-amber-400">
                  {settings.contrast === 'normal' ? 'Warna Alami' : settings.contrast === 'high' ? 'Kontras Tinggi' : 'Skala Abu-abu'}
                </span>
              </p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => updateSetting('contrast', 'normal')}
                  className={`py-2 px-1 rounded-lg border text-center font-medium transition ${
                    settings.contrast === 'normal'
                      ? 'bg-emerald-700 text-white border-emerald-700'
                      : 'border-slate-200 dark:border-stone-700 hover:bg-slate-50 dark:hover:bg-stone-800'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5 mx-auto mb-1" />
                  Alami
                </button>
                <button
                  onClick={() => updateSetting('contrast', 'high')}
                  className={`py-2 px-1 rounded-lg border text-center font-medium transition ${
                    settings.contrast === 'high'
                      ? 'bg-emerald-700 text-white border-emerald-700'
                      : 'border-slate-200 dark:border-stone-700 hover:bg-indigo-50 dark:hover:bg-stone-800'
                  }`}
                >
                  <span className="block font-bold text-sm leading-none mb-1 text-amber-500">HI</span>
                  Kontras
                </button>
                <button
                  onClick={() => updateSetting('contrast', 'grayscale')}
                  className={`py-2 px-1 rounded-lg border text-center font-medium transition ${
                    settings.contrast === 'grayscale'
                      ? 'bg-emerald-700 text-white border-emerald-700'
                      : 'border-slate-200 dark:border-stone-700 hover:bg-slate-50 dark:hover:bg-stone-800'
                  }`}
                >
                  <span className="block text-slate-400 dark:text-stone-500 font-bold text-sm leading-none mb-1">G</span>
                  Monokrom
                </button>
              </div>
            </div>

            {/* Dyslexia Font Options */}
            <div>
              <button
                onClick={() => updateSetting('dyslexiaFont', !settings.dyslexiaFont)}
                className={`w-full flex items-center justify-between p-3 rounded-xl border transition text-left ${
                  settings.dyslexiaFont
                    ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-300 text-amber-900 dark:text-amber-300'
                    : 'border-slate-100 dark:border-stone-800 hover:bg-slate-50 dark:hover:bg-stone-800 text-slate-700 dark:text-stone-300'
                }`}
                id="btn-dyslexia"
              >
                <div className="flex items-center gap-2">
                  <BookOpen className={`w-4 h-4 ${settings.dyslexiaFont ? 'text-amber-600' : 'text-slate-400'}`} />
                  <div>
                    <p className="font-semibold text-xs leading-tight">Huruf Ramah Disabilitas</p>
                    <p className="text-[10px] text-slate-400 dark:text-stone-500 leading-none mt-0.5">Gunakan font khusus berbobot bawah</p>
                  </div>
                </div>
                {settings.dyslexiaFont && <Check className="w-4 h-4 text-amber-600 dark:text-amber-400" />}
              </button>
            </div>

            {/* Screen Reader Synthesizer TTS */}
            <div>
              <button
                onClick={() => updateSetting('textToSpeech', !settings.textToSpeech)}
                className={`w-full flex items-center justify-between p-3 rounded-xl border transition text-left ${
                  settings.textToSpeech
                    ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 text-emerald-900 dark:text-emerald-400'
                    : 'border-slate-100 dark:border-stone-800 hover:bg-slate-50 dark:hover:bg-stone-800 text-slate-700 dark:text-stone-300'
                }`}
                id="btn-tts"
              >
                <div className="flex items-center gap-2">
                  {settings.textToSpeech ? (
                    <Volume2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <VolumeX className="w-4 h-4 text-slate-400" />
                  )}
                  <div>
                    <p className="font-semibold text-xs leading-tight">Asisten Suara (Pembaca Layar)</p>
                    <p className="text-[10px] text-slate-400 dark:text-stone-500 leading-none mt-0.5">Mengeja teks otomatis pada sorotan kursor</p>
                  </div>
                </div>
                {settings.textToSpeech && <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
              </button>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-stone-800 text-[10px] text-slate-400 dark:text-stone-500 flex items-center gap-1.5 justify-center">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Sistem ramah tuna netra & disabilitas fisik</span>
          </div>
        </div>
      )}
    </div>
  );
};
