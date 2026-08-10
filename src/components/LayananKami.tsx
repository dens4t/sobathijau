/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import * as LucideIcons from 'lucide-react';
import { ServiceTemplate, Submission } from '../types';

interface LayananKamiProps {
  services: ServiceTemplate[];
  onSubmitForm: (service: ServiceTemplate, data: Record<string, any>) => void;
  onSpeak: (text: string) => void;
}

export const LayananKami: React.FC<LayananKamiProps> = ({ services, onSubmitForm, onSpeak }) => {
  const [selectedService, setSelectedService] = useState<ServiceTemplate | null>(null);
  const [externalService, setExternalService] = useState<ServiceTemplate | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [submittedCode, setSubmittedCode] = useState<string | null>(null);

  // Unggah lampiran nyata ke server (metadata tersimpan di formData.lampiran).
  const [uploadMeta, setUploadMeta] = useState<{ id: string; name: string; size: number; type: string } | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const categories = ['ALL', ...new Set(services.map(s => s.category).filter(Boolean))];

  const filteredServices = services.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'ALL' || s.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const selectService = (service: ServiceTemplate) => {
    if (service.externalUrl) {
      // Layanan redirect: tampilkan penjelasan dulu sebelum pindah ke situs eksternal.
      setExternalService(service);
      setSelectedService(null);
      setFormData({});
      setUploadMeta(null);
      setUploadProgress(null);
      setSubmittedCode(null);
      onSpeak(`Membuka informasi layanan ${service.name}. Anda akan diarahkan ke situs eksternal.`);
      return;
    }
    setSelectedService(service);
    setFormData({});
    setUploadMeta(null);
    setUploadProgress(null);
    setSubmittedCode(null);
    onSpeak(`Membuka formulir permohonan ${service.name}. Silakan isi data secara lengkap.`);
  };

  const handleInputChange = (fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleCheckboxChange = (fieldId: string, option: string, isChecked: boolean) => {
    const currentList = Array.isArray(formData[fieldId]) ? [...formData[fieldId]] : [];
    if (isChecked) {
      currentList.push(option);
    } else {
      const idx = currentList.indexOf(option);
      if (idx > -1) currentList.splice(idx, 1);
    }
    handleInputChange(fieldId, currentList);
  };

  const handleFileUpload = (file: File) => {
    setUploadProgress(0);
    setUploadMeta(null);
    onSpeak(`Mengunggah dokumen ${file.name}`);
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/uploads');
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) setUploadProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      setUploadProgress(null);
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const meta = JSON.parse(xhr.responseText);
          setUploadMeta(meta);
          onSpeak(`Dokumen ${meta.name} sukses diunggah!`);
        } catch {
          setUploadMeta(null);
        }
      } else {
        setUploadMeta(null);
        onSpeak('Gagal mengunggah berkas');
      }
    };
    xhr.onerror = () => {
      setUploadProgress(null);
      setUploadMeta(null);
    };
    const fd = new FormData();
    fd.append('file', file);
    xhr.send(fd);
  };

  const fmtSize = (bytes: number) => bytes >= 1048576
    ? (bytes / 1048576).toFixed(1) + ' MB'
    : Math.max(1, Math.round(bytes / 1024)) + ' KB';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Secondary local verification of required dynamic inputs
    const missingFields: string[] = [];
    selectedService?.fields.forEach(field => {
      if (field.required) {
        if (field.type === 'checkbox_group') {
          if (!formData[field.id] || formData[field.id].length === 0) {
            missingFields.push(field.label);
          }
        } else {
          if (!formData[field.id] || !formData[field.id].toString().trim()) {
            missingFields.push(field.label);
          }
        }
      }
    });

    if (missingFields.length > 0) {
      alert(`Mohon lengkapi kolom isian wajib berikut:\n- ${missingFields.join('\n- ')}`);
      onSpeak("Silakan isi semua kolom bertanda bintang merah");
      return;
    }

    // Generate random tracking code
    const randNum = Math.floor(10000 + Math.random() * 90000);
    const code = `SH-2026-${randNum}`;

    // Enrich form output with standard required applicant/contact if not defined in custom
    const applicantName = formData['nama_pemohon'] || formData['nama_organisasi'] || formData['nama_instansi'] || formData['nama_pelapor'] || 'Pemohon Sobat Hijau';

    // Pack details and submit to root handler
    onSubmitForm(selectedService!, {
      ...formData,
      ...(uploadMeta ? { lampiran: uploadMeta } : {}),
      __applicantName: applicantName,
      __code: code
    });

    setSubmittedCode(code);
    onSpeak(`Terima kasih! Permohonan ${selectedService?.name} berhasil dikirimkan. Kode pelacakan Anda adalah ${code.split('').join(' ')}. Silakan simpan kode ini untuk melacak status berkas.`);
  };

  // Helper renderer to load Lucide Icons dynamically
  const renderIcon = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName];
    if (IconComponent) {
      return <IconComponent className="w-5 h-5 text-emerald-800 dark:text-emerald-400" />;
    }
    return <LucideIcons.FileText className="w-5 h-5 text-emerald-800 dark:text-emerald-400" />;
  };

  return (
    <div className="space-y-6" id="layanan-kami-container">
      {externalService ? (
        // Layanan redirect: penjelasan dulu, lalu pindah ke situs eksternal.
        <div className="bg-white dark:bg-stone-900 p-6 md:p-8 rounded-2xl border border-slate-100 dark:border-stone-800 shadow-md w-full max-w-3xl mx-auto text-left" id="external-service-panel">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-stone-800 pb-4 mb-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => { setExternalService(null); onSpeak('Kembali ke daftar layanan'); }}
                className="p-1 px-2.5 rounded-lg border border-slate-200 text-slate-600 dark:border-stone-700 dark:text-stone-400 text-xs hover:bg-slate-50 font-bold"
              >
                ← Kembali
              </button>
              <div className="text-left">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">{externalService.name}</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">{externalService.category}</p>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-stone-800 flex items-center justify-center border border-emerald-100 dark:border-stone-700">
              {renderIcon(externalService.icon)}
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-xs text-slate-600 dark:text-stone-300 leading-relaxed">{externalService.description}</p>

            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xl p-4 flex items-start gap-3">
              <LucideIcons.Info className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
                <p className="font-bold mb-1">Informasi sebelum lanjut</p>
                <p>{externalService.externalNote || 'Layanan ini dilayani melalui situs eksternal mitra. Anda akan diarahkan ke halaman resmi untuk membuat permohonan.'}</p>
              </div>
            </div>

            <div className="bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 rounded-xl p-4 text-[11px] text-indigo-900 dark:text-indigo-200 flex items-start gap-2.5">
              <LucideIcons.ExternalLink className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
              <span>
                Anda akan meninggalkan Sobat Hijau menuju{' '}
                <span className="font-mono font-bold">
                  {(() => { try { return new URL(externalService.externalUrl!).hostname; } catch { return externalService.externalUrl; } })()}
                </span>
                . Pastikan Anda berada di situs resmi sebelum mengisi data.
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <a
                href={externalService.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 bg-[#1B4332] hover:bg-[#2D6A4F] text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-2"
              >
                <LucideIcons.ExternalLink className="w-4 h-4" />
                Lanjut ke situs resmi
              </a>
              <button
                onClick={() => { setExternalService(null); onSpeak('Kembali ke daftar layanan'); }}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-stone-800 text-slate-700 dark:text-stone-300 font-bold rounded-xl text-xs transition"
              >
                Kembali ke daftar layanan
              </button>
            </div>
          </div>
        </div>
      ) : !selectedService ? (
        // Grid View of All Services with Category and Search Filter
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between" id="filter-panel">
            {/* Search */}
            <div className="relative w-full md:max-w-xs">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari layanan (uji lab, SPPL...)"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-emerald-100 dark:border-stone-800 bg-[#F9FBFA] text-slate-800 dark:bg-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-[#1B4332]"
                id="search-services-input"
              />
              <LucideIcons.Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>

            {/* Categories scroll menu */}
            <div className="flex overflow-x-auto gap-1 w-full md:w-auto pb-1 scrollbar-none" id="categories-tabs">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => {
                    setActiveCategory(cat);
                    onSpeak(`Menampilkan kategori ${cat === 'ALL' ? 'semua layanan' : cat}`);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap shrink-0 ${
                    activeCategory === cat 
                      ? 'bg-emerald-850 text-white shadow-sm'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-600 dark:bg-stone-900 dark:text-stone-300 dark:hover:bg-stone-800'
                  }`}
                >
                  {cat === 'ALL' ? 'Semua Kategori' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Grid of service cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="services-cards-grid">
            {filteredServices.map(service => (
              <div
                key={service.id}
                onClick={() => selectService(service)}
                className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-slate-100 dark:border-stone-850 shadow-sm cursor-pointer card-hover text-left flex gap-4 pointer-events-auto"
                id={`service-card-${service.id}`}
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-stone-800 flex items-center justify-center shrink-0 border border-emerald-100 dark:border-stone-800">
                  {renderIcon(service.icon)}
                </div>
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 dark:bg-stone-850 dark:text-emerald-400 uppercase tracking-wider font-mono">
                      {service.category}
                    </span>
                    {service.isCustom && (
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 dark:bg-stone-850 dark:text-amber-400 uppercase tracking-wider font-mono flex items-center gap-0.5">
                        <LucideIcons.Sparkles className="w-2.5 h-2.5 text-amber-600" />
                        Custom
                      </span>
                    )}
                    {service.externalUrl && (
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 dark:bg-stone-850 dark:text-indigo-400 uppercase tracking-wider font-mono flex items-center gap-0.5">
                        <LucideIcons.ExternalLink className="w-2.5 h-2.5" />
                        Situs Eksternal
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-emerald-700 truncate">
                    {service.name}
                  </h4>
                  <p className="text-[10px] text-slate-400 dark:text-stone-500 line-clamp-2 leading-relaxed">
                    {service.description}
                  </p>
                </div>
              </div>
            ))}

            {filteredServices.length === 0 && (
              <div className="col-span-full text-center py-12 text-slate-400 bg-slate-50 dark:bg-stone-900 border border-dashed rounded-2xl">
                <LucideIcons.Inbox className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs">Layanan tidak ditemukan.</p>
                <p className="text-[10px] opacity-80">Gunakan kata kunci atau rubah menu kategori di atas.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        // Dynamic Form Filler Template
        <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-slate-100 dark:border-stone-850 shadow-md w-full max-w-full md:max-w-4xl lg:max-w-5xl xl:max-w-7xl mx-auto" id="dynamic-form-container">
          {/* Form Header */}
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-stone-800 pb-4 mb-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setSelectedService(null);
                  onSpeak("Kembali ke daftar layanan");
                }}
                className="p-1 px-2.5 rounded-lg border border-slate-200 text-slate-600 dark:border-stone-700 dark:text-stone-400 text-xs hover:bg-slate-50 font-bold"
                id="btn-back-to-services"
              >
                ← Kembali
              </button>
              <div className="text-left">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">ISI DATA {selectedService.name.toUpperCase()}</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Formulir Pendaftaran Berkas Digital Dinas Lingkungan Hidup</p>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-stone-800 flex items-center justify-center border border-emerald-100 dark:border-stone-800">
              {renderIcon(selectedService.icon)}
            </div>
          </div>

          {/* Submission Finished Dialog Box */}
          {submittedCode ? (
            <div className="text-center py-8 space-y-4" id="success-submit-box">
              <div className="w-14 h-14 rounded-full bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-300 flex items-center justify-center mx-auto border border-green-200">
                <LucideIcons.CheckCircle className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h5 className="font-black text-sm text-slate-800 dark:text-stone-100">Permohonan Terkirim Sukses!</h5>
                <p className="text-xs text-slate-500 dark:text-stone-400">Tim pengawas lapangan DLH akan melakukan evaluasi kelengkapan berkas Anda.</p>
              </div>

              {/* Box of the tracking code code */}
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 dark:bg-stone-850 dark:border-stone-800 max-w-sm mx-auto font-mono">
                <p className="text-[10px] text-slate-400 dark:text-stone-500 uppercase font-bold tracking-wider mb-1">KODE REKOR PELACAKAN (SALIN KODE INI)</p>
                <p className="text-lg font-black text-emerald-950 dark:text-amber-400 tracking-widest">{submittedCode}</p>
                <p className="text-[9px] text-slate-400 mt-2">Dapat digunakan pada menu 'Lacak Permohonan' untuk memantau kemajuan berkas Anda.</p>
              </div>

              <div className="flex gap-2 justify-center pt-3">
                <button
                  onClick={() => {
                    setSelectedService(null);
                    onSpeak("Kembali ke daftar layanan");
                  }}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-lg transition"
                >
                  Selesai
                </button>
              </div>
            </div>
          ) : (
            // The Actual Dynamic Form Render
            <form onSubmit={handleSubmit} className="space-y-5 text-left">
              {/* Alert guidance */}
              <div className="p-3 bg-emerald-50/40 border border-emerald-100 rounded-xl flex items-start gap-2 text-[10px] text-emerald-900 leading-normal dark:bg-stone-850 dark:border-stone-800 dark:text-emerald-300">
                <LucideIcons.HelpCircle className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5 dark:text-emerald-400" />
                <span>Format isian ini bersifat dinamis dan disesuaikan otomatis dengan variabel kebutuhan analisis dampak lingkungan ({selectedService.name}). Silakan input data secara valid.</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                {selectedService.fields.map((field) => (
                  <div key={field.id} className={`space-y-1.5 ${field.type === 'textarea' || field.type === 'checkbox_group' ? 'md:col-span-2' : ''}`}>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-stone-300 flex items-center justify-between" htmlFor={`field-id-${field.id}`}>
                      <span>
                        {field.label} {field.required && <span className="text-rose-500 font-bold">*</span>}
                      </span>
                      {field.required && <span className="text-[9px] text-rose-500 font-bold font-mono">Wajib Diisi</span>}
                    </label>

                    {/* Render based on field type */}
                    {field.type === 'text' && (
                      <input
                        id={`field-id-${field.id}`}
                        type="text"
                        required={field.required}
                        placeholder={field.placeholder || 'Silakan ketik...'}
                        value={formData[field.id] || ''}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-emerald-100 dark:border-stone-700 bg-[#F9FBFA] hover:border-emerald-300 focus:bg-white text-slate-800 dark:bg-stone-850 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-[#2D6A4F]"
                      />
                    )}

                    {field.type === 'number' && (
                      <input
                        id={`field-id-${field.id}`}
                        type="number"
                        required={field.required}
                        placeholder={field.placeholder || 'Ketik nominal angka...'}
                        value={formData[field.id] || ''}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-emerald-100 dark:border-stone-700 bg-[#F9FBFA] hover:border-emerald-300 focus:bg-white text-slate-800 dark:bg-stone-850 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-[#2D6A4F]"
                      />
                    )}

                    {field.type === 'date' && (
                      <input
                        id={`field-id-${field.id}`}
                        type="date"
                        required={field.required}
                        value={formData[field.id] || ''}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-emerald-100 dark:border-stone-700 bg-[#F9FBFA] hover:border-emerald-300 focus:bg-white text-slate-800 dark:bg-stone-850 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-[#2D6A4F]"
                      />
                    )}

                    {field.type === 'textarea' && (
                      <textarea
                        id={`field-id-${field.id}`}
                        required={field.required}
                        placeholder={field.placeholder || 'Tuliskan deskripsi selengkapnya...'}
                        rows={4}
                        value={formData[field.id] || ''}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-emerald-100 dark:border-stone-700 bg-[#F9FBFA] hover:border-emerald-300 focus:bg-white text-slate-800 dark:bg-stone-850 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-[#2D6A4F] resize-none"
                      />
                    )}

                    {field.type === 'select' && (
                      <select
                        id={`field-id-${field.id}`}
                        required={field.required}
                        value={formData[field.id] || ''}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-emerald-100 dark:border-stone-700 bg-[#F9FBFA] text-slate-800 dark:bg-stone-850 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-[#2D6A4F]"
                      >
                        <option value="">-- Pilih Opsi --</option>
                        {field.options?.map((opt, oIdx) => (
                          <option key={oIdx} value={opt}>{opt}</option>
                        ))}
                      </select>
                    )}

                    {field.type === 'checkbox_group' && (
                      <div className="space-y-1.5 p-3 rounded-xl bg-[#F9FBFA] dark:bg-stone-850 border border-emerald-105 dark:border-stone-800">
                        {field.options?.map((opt, oIdx) => (
                          <label key={oIdx} className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 dark:text-stone-300">
                            <input
                              type="checkbox"
                              checked={Array.isArray(formData[field.id]) && formData[field.id].includes(opt)}
                              onChange={(e) => handleCheckboxChange(field.id, opt, e.target.checked)}
                              className="rounded text-emerald-700 focus:ring-emerald-500 h-4 w-4 border-slate-300 bg-white"
                            />
                            <span>{opt}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Unggah Lampiran — nyata, tersimpan di server */}
              <div className="space-y-1.5 border-t border-slate-100 dark:border-stone-800 pt-5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-stone-300" htmlFor="real-file-uploader">
                  Unggah Dokumen Lampiran Tambahan (PDF/KTP/Sertifikat Lahan)
                </label>
                <div className="p-5 border-2 border-dashed border-emerald-100 dark:border-stone-800 rounded-2xl text-center bg-[#F9FBFA] dark:bg-stone-850 text-xs">
                  {uploadProgress !== null ? (
                    <div className="space-y-1.5">
                      <p className="text-[10px] text-slate-400 animate-pulse">Mengunggah berkas... {uploadProgress}%</p>
                      <div className="w-40 h-1.5 bg-slate-200 rounded-full mx-auto overflow-hidden">
                        <div className="h-full bg-emerald-600 rounded-full transition-all" style={{ width: `${uploadProgress}%` }}></div>
                      </div>
                    </div>
                  ) : uploadMeta ? (
                    <div className="flex items-center justify-center gap-2.5 flex-wrap">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-stone-800 border border-emerald-200 dark:border-stone-700 text-emerald-800 dark:text-emerald-300 font-bold">
                        <LucideIcons.FileText className="w-4 h-4" />
                        {uploadMeta.name}
                        <span className="text-[9px] font-mono text-emerald-600 dark:text-emerald-400">({fmtSize(uploadMeta.size)})</span>
                      </span>
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <LucideIcons.Check className="w-3.5 h-3.5" /> Berhasil Diunggah
                      </span>
                      <button
                        type="button"
                        onClick={() => setUploadMeta(null)}
                        className="p-1 rounded-md text-rose-500 hover:bg-rose-50 transition" aria-label="Hapus lampiran"
                      >
                        <LucideIcons.Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <p className="font-semibold text-slate-500">Pilih berkas dari perangkat Anda</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Maksimal 5MB. Format PDF, PNG, JPEG, DOC/DOCX</p>
                      <input
                        type="file"
                        id="real-file-uploader"
                        accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file);
                          e.target.value = '';
                        }}
                        className="hidden"
                      />
                      <label
                        htmlFor="real-file-uploader"
                        className="mt-3 inline-block px-3.5 py-1.5 bg-white dark:bg-stone-900 border border-slate-200 dark:border-stone-700 text-[10px] rounded-lg text-slate-600 hover:bg-slate-50 font-bold transition cursor-pointer"
                      >
                        Pilih Berkas Lampiran
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Trigger btn */}
              <div className="pt-4 flex justify-end gap-3 border-t border-slate-150 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedService(null);
                    onSpeak("Membatalkan berkas");
                  }}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 dark:border-stone-700 text-slate-700 dark:text-stone-300 text-xs font-bold rounded-xl transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition flex items-center gap-1"
                  id="btn-submit-form"
                >
                  <LucideIcons.Send className="w-3.5 h-3.5" />
                  Kirim Permohonan Berkas
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
};
