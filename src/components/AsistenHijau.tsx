/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Volume2, Sparkles, AlertCircle, HelpCircle } from 'lucide-react';
import { api } from '../lib/api';
import { useStore } from '../store/useStore';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
}

interface AsistenHijauProps {
  ttsEnabled: boolean;
  onSpeak: (text: string) => void;
}

export const AsistenHijau: React.FC<AsistenHijauProps> = ({ ttsEnabled, onSpeak }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: 'Halo! Saya Asisten Hijau, asisten virtual layanan Dinas Lingkungan Hidup. Saya siap membantu Anda berkonsultasi mengenai perizinan SPPL, uji laboratorium, pengaduan pencemaran, atau pengajuan bibit tanaman. Apa yang ingin Anda tanyakan hari ini?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const quickQuestions = useStore(s => s.assistantQuestions);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    api.askAssistant(textToSend).then(({ text }) => {
      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);

      if (ttsEnabled) {
        onSpeak(text);
      }
    }).catch(() => {
      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: 'Maaf, saya tidak dapat menjawab saat ini. Silakan coba lagi sebentar lagi.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    });
  };

  return (
    <div className="bg-white dark:bg-stone-900 rounded-2xl border border-slate-100 dark:border-stone-800 shadow-xl overflow-hidden flex flex-col h-[520px]" id="asisten-hijau-container">
      {/* Bot Chat Header */}
      <div className="bg-[#1B4332] p-4 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-400">
            <Bot className="w-5.5 h-5.5 text-emerald-200" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="font-bold text-sm tracking-wide">Asisten Konsultasi Hijau</h4>
              <span className="flex h-2 w-2 rounded-full bg-green-400 animate-pulse"></span>
            </div>
            <p className="text-[10px] text-emerald-100 font-mono">Bantuan Pintar & Perizinan DLH (Respon Instan)</p>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-emerald-950/45 px-2.5 py-1 rounded-full text-[10px] border border-emerald-600 font-semibold" title="Bebas konsultasi apa saja">
          <Sparkles className="w-3 h-3 text-amber-300" />
          <span>Panduan Cerdas</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-emerald-50/20 dark:bg-stone-950/20 scrollbar-thin">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2 w-full ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'ai' && (
              <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-stone-800 flex items-center justify-center shrink-0 border border-emerald-200">
                <Bot className="w-4 h-4 text-emerald-800 dark:text-emerald-400" />
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs shadow-sm relative group ${
                msg.sender === 'user'
                  ? 'bg-emerald-700 text-white rounded-tr-none'
                  : 'bg-white dark:bg-stone-850 border border-slate-100 dark:border-stone-800 text-slate-800 dark:text-stone-200 rounded-tl-none'
              }`}
            >
              <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
              <div className="flex items-center justify-between mt-1 text-[9px] opacity-60">
                <span>{msg.timestamp}</span>
                {msg.sender === 'ai' && (
                  <button
                    onClick={() => onSpeak(msg.text)}
                    className="p-1 text-slate-400 hover:text-emerald-700 dark:hover:text-amber-400 rounded transition ml-2 opacity-0 group-hover:opacity-100 focus:opacity-100"
                    title="Bacakan teks ini"
                  >
                    <Volume2 className="w-3" />
                  </button>
                )}
              </div>
            </div>
            {msg.sender === 'user' && (
              <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-stone-800 flex items-center justify-center shrink-0 border border-slate-200">
                <User className="w-4 h-4 text-slate-600 dark:text-stone-400" />
              </div>
            )}
          </div>
        ))}
        {isTyping && (
          <div className="flex gap-2 justify-start">
            <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-stone-800 flex items-center justify-center shrink-0 border border-emerald-200">
              <Bot className="w-4 h-4 text-emerald-800 dark:text-emerald-400" />
            </div>
            <div className="bg-white dark:bg-stone-800 border border-slate-100 dark:border-stone-800 rounded-2xl rounded-tl-none px-4 py-3 flex gap-1.5 items-center">
              <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
          </div>
        )}
        <div ref={scrollRef}></div>
      </div>

      {/* Quick tags */}
      <div className="p-3 bg-white dark:bg-stone-900 border-t border-slate-100 dark:border-stone-850">
        <p className="text-[10px] text-slate-400 dark:text-stone-500 font-semibold mb-1.5 flex items-center gap-1">
          <HelpCircle className="w-3 h-3" /> Rekomendasi Pertanyaan:
        </p>
        <div className="flex flex-wrap gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {quickQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="text-[10px] bg-slate-50 hover:bg-emerald-50 dark:bg-stone-800 dark:hover:bg-emerald-950/45 dark:hover:text-emerald-200 border border-slate-200 dark:border-stone-700 hover:border-emerald-300 rounded-full px-2.5 py-1 text-slate-700 dark:text-stone-300 font-medium transition shrink-0 whitespace-nowrap"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(input);
        }}
        className="p-3 bg-slate-50 dark:bg-stone-950/40 border-t border-slate-100 dark:border-stone-850 flex gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Tanyakan berkas, izin SPPL, pohon, atau denda air limbah..."
          className="flex-1 px-4 py-2 text-xs rounded-xl bg-white dark:bg-stone-850 border border-slate-200 dark:border-stone-700 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800 dark:text-stone-200 placeholder-slate-400"
          id="chat-input-asisten"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="p-2 rounded-xl bg-[#1B4332] hover:bg-[#2D6A4F] text-white disabled:opacity-40 disabled:hover:bg-[#1B4332] transition"
          id="chat-send-btn"
          aria-label="Kirim Pesan"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
