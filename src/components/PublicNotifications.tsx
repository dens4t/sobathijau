/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, Trash2, Calendar, FileText, ExternalLink, X, Inbox } from 'lucide-react';
import { AppNotification } from '../types';

interface PublicNotificationsProps {
  notifications: AppNotification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onClearAll: () => void;
  onSelectNotification: (submissionId: string) => void;
}

export const PublicNotifications: React.FC<PublicNotificationsProps> = ({
  notifications,
  onMarkRead,
  onMarkAllRead,
  onClearAll,
  onSelectNotification
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  const getStatusColorClass = (status: string) => {
    switch (status) {
      case 'SELESAI':
        return 'bg-green-500';
      case 'DITOLAK':
        return 'bg-red-500';
      case 'DIAJUKAN':
        return 'bg-blue-500';
      default:
        return 'bg-amber-500';
    }
  };

  return (
    <div className="relative" ref={dropdownRef} id="public-notifications-wrapper">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-xl border border-slate-200 dark:border-stone-800 hover:bg-slate-50 dark:hover:bg-stone-850 text-slate-600 dark:text-stone-300 transition duration-150 flex items-center justify-center cursor-pointer"
        title="Riwayat Notifikasi Berkas"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[9px] font-mono font-black h-[18px] w-[18px] rounded-full flex items-center justify-center shadow-lg animate-pulse border-2 border-white dark:border-stone-900">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2.5 w-80 sm:w-96 bg-white dark:bg-stone-900 rounded-2xl border border-emerald-100 dark:border-stone-800 shadow-xl z-50 overflow-hidden animate-fade-in text-left">
          {/* Header */}
          <div className="p-4 border-b border-slate-100 dark:border-stone-800 bg-slate-50/50 dark:bg-stone-950 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xs text-[#1B4332] dark:text-emerald-400 tracking-tight">Notifikasi Berkas</span>
              {unreadCount > 0 && (
                <span className="text-[10px] font-bold text-amber-800 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400 px-2 py-0.5 rounded-full font-mono">
                  {unreadCount} Baru
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {notifications.length > 0 && (
                <>
                  <button
                    onClick={onMarkAllRead}
                    className="text-[10px] font-bold text-emerald-800 dark:text-emerald-400 hover:underline transition"
                    title="Tandai semua pesan sudah dibaca"
                  >
                    Buka Semua
                  </button>
                  <span className="text-slate-300">|</span>
                  <button
                    onClick={onClearAll}
                    className="text-[10px] font-bold text-rose-600 dark:text-rose-400 hover:underline transition flex items-center gap-0.5"
                    title="Bersihkan semua histori"
                  >
                    Hapus
                  </button>
                </>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-stone-300 p-0.5"
                title="Tutup Panel"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* List panel */}
          <div className="divide-y divide-slate-50 dark:divide-stone-850 max-h-[320px] overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => {
                    onMarkRead(notif.id);
                    onSelectNotification(notif.submissionId);
                    setIsOpen(false);
                  }}
                  className={`p-4 flex gap-3 transition cursor-pointer relative group ${
                    notif.isRead 
                      ? 'bg-white hover:bg-slate-50/40 dark:bg-stone-900 dark:hover:bg-stone-850/30' 
                      : 'bg-emerald-50/20 hover:bg-[#E5F5EB]/30 dark:bg-emerald-950/10 dark:hover:bg-emerald-950/20'
                  }`}
                >
                  {/* Read status dot overlay if unread */}
                  {!notif.isRead && (
                    <span className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-emerald-600 dark:bg-emerald-500 rounded-full" />
                  )}

                  {/* Icon status dot and wire */}
                  <div className="mt-1 flex flex-col items-center shrink-0">
                    <span className={`w-2.5 h-2.5 rounded-full ${getStatusColorClass(notif.newStatus)}`} />
                    <div className="w-[1px] h-full bg-slate-100 dark:bg-stone-800 mt-1" />
                  </div>

                  {/* Main text content */}
                  <div className="space-y-1 flex-1 text-xs">
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="font-mono font-bold text-emerald-800 dark:text-emerald-400 text-[10px]">
                        {notif.submissionId}
                      </span>
                      <span className="text-[9px] text-slate-400 font-mono">
                        {notif.timestamp}
                      </span>
                    </div>
                    <p className={`text-[11px] leading-relaxed ${notif.isRead ? 'text-slate-600 dark:text-stone-400' : 'text-slate-900 dark:text-stone-100 font-semibold'}`}>
                      {notif.message}
                    </p>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[9px] text-slate-500 dark:text-stone-400 truncate max-w-[150px]" title={notif.applicantName}>
                        👤 {notif.applicantName}
                      </span>
                      <span className="text-[9px] text-emerald-800 dark:text-amber-400 font-bold flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                        Lacak Detail <ExternalLink className="w-2.5 h-2.5" />
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
                <Inbox className="w-8 h-8 text-slate-300 dark:text-stone-700" />
                <p className="text-xs font-semibold text-slate-500 dark:text-stone-400">Tidak ada pemberitahuan</p>
                <p className="text-[10px] text-slate-400 dark:text-stone-500 max-w-[200px] leading-relaxed">Semua riwayat perubahan berkas Anda di sistem akan masuk di panel notifikasi ini.</p>
              </div>
            )}
          </div>

          <div className="p-2.5 text-center bg-slate-50/50 dark:bg-stone-950 border-t border-slate-100 dark:border-stone-800 text-[9px] text-slate-450 dark:text-stone-500 font-mono uppercase tracking-tight">
            SobatHijau • Sistem Otomatisasi Publik
          </div>
        </div>
      )}
    </div>
  );
};
