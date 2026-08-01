/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Search, ChevronRight, CheckCircle2, Circle, AlertCircle, FileText, Download, Briefcase, Calendar, ShieldCheck, Clock, QrCode } from 'lucide-react';
import { Submission } from '../types';

interface TrackingSobatProps {
  submissions: Submission[];
  initialSearchCode?: string;
  readonly?: boolean;
  onSpeak: (text: string) => void;
}

export const TrackingSobat: React.FC<TrackingSobatProps> = ({ submissions, initialSearchCode = '', readonly = false, onSpeak }) => {
  const [searchCode, setSearchCode] = useState(initialSearchCode);
  const [foundSubmission, setFoundSubmission] = useState<Submission | null>(() => {
    if (initialSearchCode) {
      return submissions.find(s => s.id.toLowerCase() === initialSearchCode.toLowerCase()) || null;
    }
    return null;
  });
  const [errorMsg, setErrorMsg] = useState('');

  React.useEffect(() => {
    if (initialSearchCode) {
      setSearchCode(initialSearchCode);
      const result = submissions.find(s => s.id.toLowerCase() === initialSearchCode.toLowerCase());
      setFoundSubmission(result || null);
      if (result) {
        setErrorMsg('');
      }
    }
  }, [initialSearchCode, submissions]);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchCode.trim()) {
      setErrorMsg('Masukkan kode pelacakan terlebih dahulu.');
      return;
    }

    const cleanedCode = searchCode.trim().toUpperCase();
    const result = submissions.find(s => s.id === cleanedCode || s.id.toLowerCase() === cleanedCode.toLowerCase());

    if (result) {
      setFoundSubmission(result);
      setErrorMsg('');
      onSpeak(`Berkas ditemukan! Atas nama ${result.applicantName} dengan layanan ${result.serviceName}. Status berkas saat ini adalah ${result.status.replace('_', ' ')}.`);
    } else {
      setFoundSubmission(null);
      setErrorMsg(`Format kode salah atau berkas "${searchCode}" tidak ditemukan. Silakan cek kembali atau coba salin dari riwayat permohonan.`);
      onSpeak(`Maaf, berkas tidak ditemukan.`);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SELESAI':
        return <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-300">SELESAI</span>;
      case 'DITOLAK':
        return <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300">DITOLAK</span>;
      case 'DIAJUKAN':
        return <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300">DIAJUKAN</span>;
      default:
        return <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">DALAM PROSES</span>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto" id="tracking-component-container">
      {/* Search Jumbotron — hidden in readonly/view-only mode */}
      {!readonly && (
        <div className="bg-white dark:bg-stone-900 p-8 rounded-2xl border border-emerald-100 dark:border-stone-800 text-slate-850 shadow-sm text-center mb-8">
        <h3 className="text-lg font-bold text-[#1B4332] dark:text-emerald-400 tracking-tight mb-2">Lacak Kemajuan Berkas Permohonan Pelayanan DLH</h3>
        <p className="text-xs text-slate-500 dark:text-stone-400 max-w-lg mx-auto mb-6">
          Masukkan Kode Pelacakan Sobat Hijau yang Anda dapatkan saat pengiriman formulir elektronik (Contoh: SH-2026-08123 atau SH-2026-04981).
        </p>

        <form onSubmit={handleSearch} className="max-w-md mx-auto flex gap-2">
          <input
            type="text"
            value={searchCode}
            onChange={(e) => setSearchCode(e.target.value)}
            placeholder="Ketik Kode: SH-2026-XXXXX"
            className="flex-1 px-4 py-3 text-xs font-semibold uppercase tracking-wider rounded-xl bg-[#F9FBFA] hover:bg-slate-50 dark:bg-stone-850 border border-emerald-100 dark:border-stone-700 text-[#1B4332] dark:text-stone-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#2D6A4F] transition"
            id="tracking-search-input"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-[#1B4332] hover:bg-[#2D6A4F] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition shadow-sm"
            id="btn-search-tracking"
          >
            <Search className="w-4 h-4" />
            Cari
          </button>
        </form>

        {errorMsg && (
          <p className="text-xs text-rose-700 font-medium mt-3 bg-rose-50/50 p-2 rounded-lg border border-rose-100 max-w-md mx-auto dark:bg-stone-850 dark:text-rose-400">
            {errorMsg}
          </p>
        )}

        {/* Quick links to sample codes */}
        <div className="mt-5 flex justify-center items-center gap-2 text-[10px] text-gray-400">
          <span className="font-semibold">Rekomendasi Uji Coba Lacak:</span>
          {submissions.slice(0, 3).map(sub => (
            <button
              key={sub.id}
              onClick={() => {
                setSearchCode(sub.id);
                setFoundSubmission(sub);
                setErrorMsg('');
                onSpeak(`Memuat berkas tes ${sub.id}`);
              }}
              className="px-2 py-1 rounded bg-[#E5F5EB] hover:bg-emerald-100 text-[#1B4332] dark:bg-stone-800 dark:text-stone-300 border border-emerald-100 dark:border-stone-700 font-mono font-bold transition"
            >
              {sub.id}
            </button>
          ))}
        </div>
      </div>
      )}

      {/* Details visualization if found */}
      {foundSubmission ? (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8" id="tracking-result-panel">
          {/* Timeline on Left */}
          <div className="md:col-span-7 bg-white dark:bg-stone-900 p-6 rounded-2xl border border-slate-100 dark:border-stone-800 shadow-sm">
            <h4 className="text-xs font-bold text-slate-800 dark:text-stone-200 mb-6 uppercase tracking-wider">
              Timeline Status Berkas
            </h4>

            {/* Vertical timeline */}
            <div className="relative pl-6 space-y-6 border-l-2 border-slate-100 dark:border-stone-800 ml-3">
              {foundSubmission.timeline.map((step, idx) => {
                const isActive = step.isCompleted;
                const nextStep = foundSubmission.timeline[idx + 1];
                const isCurrent = step.isCompleted && (!nextStep || !nextStep.isCompleted);
                
                return (
                  <div key={idx} className="relative">
                    {/* Circle mark */}
                    <div className="absolute -left-[31px] top-0.5 bg-white dark:bg-stone-900 p-0.5 rounded-full z-10">
                      {isActive ? (
                        <CheckCircle2 className={`w-5 h-5 ${isCurrent ? 'text-amber-500 animate-pulse' : 'text-emerald-700'}`} />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-300 dark:text-stone-700" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-baseline justify-between gap-2">
                        <h5 className={`font-bold text-xs leading-tight ${
                          isCurrent 
                            ? 'text-amber-600 dark:text-amber-400' 
                            : isActive 
                            ? 'text-slate-800 dark:text-stone-100' 
                            : 'text-slate-400'
                        }`}>
                          {step.title}
                        </h5>
                        <span className="text-[10px] font-mono text-slate-400 shrink-0">
                          {step.updatedAt}
                        </span>
                      </div>
                      <p className={`text-[11px] mt-1 ${isActive ? 'text-slate-600 dark:text-stone-400' : 'text-slate-400'}`}>
                        {step.description}
                      </p>

                      {/* Display custom official comments/notes */}
                      {idx === 4 && foundSubmission.status === 'SELESAI' && (
                        <div className="mt-3 p-3 rounded-lg bg-green-50 border border-green-200 text-[11px] text-green-900 dark:bg-green-950/20 dark:border-green-800 dark:text-green-300">
                          <p className="font-bold mb-1 flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-green-700 dark:text-green-400" />
                            Dokumen Rekomendasi Terverifikasi Digital
                          </p>
                          <p className="opacity-90">Sertifikat kelayakan atau izin Anda telah dikeluarkan resmi oleh Kepala Dinas Lingkungan Hidup.</p>
                          <button
                            onClick={() => {
                              onSpeak("Mengunduh salinan berkas rekomendasi DLH");
                              alert(`Mengunduh Berkas SPPL/Rekomendasi Digital: \nNomor: SH/DLH-${foundSubmission.id}\nLayanan: ${foundSubmission.serviceName}\nPemohon: ${foundSubmission.applicantName}`);
                            }}
                            className="mt-2 text-xs flex items-center gap-1 text-emerald-800 hover:text-emerald-950 dark:text-amber-400 font-bold underline"
                          >
                            <Download className="w-3.5 h-3.5" />
                            Unduh Surat Keputusan / SPPL Digital
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form details in right panel */}
          <div className="md:col-span-5 space-y-6">
            {/* Meta status card */}
            <div className="bg-slate-50 dark:bg-stone-900 border border-slate-100 dark:border-stone-850 p-5 rounded-2xl">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-[9px] font-mono text-slate-400 uppercase block tracking-wider">KODE BERKAS</span>
                  <div className="font-mono font-bold text-slate-800 dark:text-white flex items-center gap-1.5 mt-0.5">
                    <FileText className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                    <span>{foundSubmission.id}</span>
                  </div>
                </div>
                {getStatusBadge(foundSubmission.status)}
              </div>

              <div className="space-y-2 text-xs border-t border-slate-200 dark:border-stone-800 pt-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Pemohon:</span>
                  <span className="font-bold text-slate-800 dark:text-stone-200 text-right">{foundSubmission.applicantName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Layanan:</span>
                  <span className="font-bold text-slate-800 dark:text-stone-200 text-right">{foundSubmission.serviceName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Tgl Kirim:</span>
                  <span className="font-mono text-slate-800 dark:text-stone-300">{foundSubmission.submittedAt}</span>
                </div>
              </div>
            </div>

            {/* QR Code Scan Card */}
            <div className="bg-white dark:bg-stone-900 border border-emerald-100 dark:border-stone-800 p-5 rounded-2xl flex flex-col items-center text-center space-y-3 shadow-sm" id="qr-code-tracking-card">
              <div className="flex items-center gap-1.5 self-start text-[#1B4332] dark:text-emerald-400 font-bold text-xs uppercase tracking-wider pb-2 border-b border-emerald-50/60 dark:border-stone-800 w-full text-left">
                <QrCode className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                <span>QR Code Pelacakan Seluler</span>
              </div>
              <p className="text-[10px] text-slate-450 dark:text-stone-400 text-left leading-relaxed">
                Pindai kode QR unik ini dengan kamera ponsel Anda untuk langsung membuka dan melacak status berkas ini tanpa mengetik manual.
              </p>
              <div className="p-3 bg-white rounded-xl border border-slate-100 dark:border-stone-800 shadow-inner inline-flex items-center justify-center">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(`${window.location.origin}${window.location.pathname}?lacak=${foundSubmission.id}`)}&color=065f46&bgcolor=ffffff`}
                  alt={`QR Code Lacak ${foundSubmission.id}`}
                  className="w-36 h-36 border border-slate-105 rounded select-none"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="text-[10px] font-mono select-all bg-slate-50 dark:bg-stone-950 px-2.5 py-1.5 rounded-lg text-slate-500 dark:text-stone-300 break-all w-full leading-normal border border-slate-150 dark:border-stone-850">
                {`${window.location.origin}${window.location.pathname}?lacak=${foundSubmission.id}`}
              </div>
            </div>

            {/* Dynamic Submission Responses details */}
            <div className="bg-white dark:bg-stone-900 border border-slate-100 dark:border-stone-800 p-5 rounded-2xl">
              <h5 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-3 pb-2 border-b border-slate-100 dark:border-stone-800">
                Rincian Formulir Permohonan
              </h5>

              <div className="space-y-3.5">
                {Object.entries(foundSubmission.formData).map(([key, value]) => {
                  const labelFormatted = key
                    .replace(/_/g, ' ')
                    .replace(/\b\w/g, c => c.toUpperCase());
                  
                  return (
                    <div key={key} className="text-xs">
                      <p className="text-slate-400 text-[10px] font-medium">{labelFormatted}</p>
                      
                      {Array.isArray(value) ? (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {value.map((item, iNum) => (
                            <span key={iNum} className="px-2 py-0.5 rounded text-[10px] bg-emerald-50 text-emerald-800 dark:bg-stone-800 dark:text-emerald-300 font-medium">
                              {item}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="font-semibold text-slate-800 mt-0.5 dark:text-stone-200 break-words">
                          {value?.toString() || '-'}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center p-12 bg-white dark:bg-stone-900 border border-slate-100 dark:border-stone-850 rounded-2xl shadow-sm text-slate-400">
          <Clock className="w-10 h-10 mx-auto text-slate-300 dark:text-stone-700 mb-2" />
          <p className="text-xs font-medium">Tidak ada rincian berkas yang dimuat.</p>
          <p className="text-[10px] mt-1 max-w-xs mx-auto">Silakan cari kode di atas atau pilih salah satu kode tes cepat untuk melihat visualisasi status permohonan.</p>
        </div>
      )}
    </div>
  );
};
