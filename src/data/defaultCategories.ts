import type { GeoCategory } from '../types';

export const defaultCategories: GeoCategory[] = [
  {
    id: 'cat-tps',
    name: 'TPS & TPA',
    shortDesc: 'Tempat Pembuangan Sementara dan Akhir',
    description: `<div class="space-y-3">
      <p class="text-sm">Kota Pontianak memiliki <strong class="text-emerald-700">6 TPS (Tempat Pembuangan Sementara)</strong> dan <strong class="text-red-700">1 TPA (Tempat Pemrosesan Akhir)</strong> yang dikelola oleh Dinas Lingkungan Hidup. Sistem pengelolaan sampah di Pontianak menerapkan konsep <em>reduce-reuse-recycle</em> (3R) yang melibatkan partisipasi aktif masyarakat.</p>
      <div class="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2">
        <h4 class="font-bold text-xs uppercase tracking-wider text-amber-800">🕐 Jam Operasional</h4>
        <div class="grid grid-cols-2 gap-2 text-xs">
          <div class="bg-white rounded-lg p-2">
            <span class="font-bold text-slate-700">TPS Reguler</span>
            <p class="text-slate-500">06.00 - 18.00 WIB</p>
          </div>
          <div class="bg-white rounded-lg p-2">
            <span class="font-bold text-slate-700">TPA Batu Layang</span>
            <p class="text-slate-500">06.00 - 16.00 WIB</p>
          </div>
          <div class="bg-white rounded-lg p-2">
            <span class="font-bold text-slate-700">Pengangkutan</span>
            <p class="text-slate-500">2 ritase/hari</p>
          </div>
          <div class="bg-white rounded-lg p-2">
            <span class="font-bold text-slate-700">Hari Libur</span>
            <p class="text-slate-500">Tetap beroperasi</p>
          </div>
        </div>
      </div>
      <p class="text-xs text-slate-500 mt-2">Kapasitas total TPA Batu Layang mencapai 50 ton/hari dengan sistem controlled landfill yang ramah lingkungan.</p>
    </div>`,
    iconName: 'Trash2',
    color: '#DC2626',
    markerColor: '#DC2626',
    order: 1,
    createdAt: '2026-01-01 08:00',
    updatedAt: '2026-06-01 08:00',
  },
  {
    id: 'cat-bank-sampah',
    name: 'Bank Sampah',
    shortDesc: 'Pusat daur ulang dan tabungan sampah berbasis komunitas',
    description: `<div class="space-y-3">
      <p class="text-sm">Gerakan Bank Sampah di Kota Pontianak dimulai sejak <strong class="text-emerald-700">tahun 2017</strong> sebagai inisiatif DLH bersama komunitas peduli lingkungan. Konsepnya sederhana: <em>masyarakat menabung sampah — mendapatkan manfaat ekonomi.</em></p>
      <div class="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-2">
        <h4 class="font-bold text-xs uppercase tracking-wider text-emerald-800">📋 Cara Menabung</h4>
        <ol class="list-decimal list-inside text-xs space-y-1 text-slate-700">
          <li>Pilah sampah anorganik di rumah (plastik, kertas, logam)</li>
          <li>Setorkan ke Bank Sampah terdekat setiap hari Sabtu</li>
          <li>Petugas akan menimbang dan mencatat di buku tabungan</li>
          <li>Saldo dapat dicairkan atau ditukar sembako</li>
        </ol>
      </div>
      <div class="bg-white border rounded-xl p-3 text-xs space-y-1">
        <p><span class="font-bold text-emerald-700">💡 Fakta:</span> Hingga 2026, Bank Sampah di Pontianak telah berhasil mengurangi <strong class="font-bold">~12 ton sampah</strong> per bulan dan melibatkan lebih dari <strong class="font-bold">2.000 nasabah aktif</strong>.</p>
      </div>
      <p class="text-xs text-slate-500">Setiap Bank Sampah memiliki jadwal operasional masing-masing. Hubungi pengelola terdekat untuk informasi lebih lanjut.</p>
    </div>`,
    iconName: 'Recycle',
    color: '#16A34A',
    markerColor: '#16A34A',
    order: 2,
    createdAt: '2026-01-01 08:00',
    updatedAt: '2026-06-01 08:00',
  },
  {
    id: 'cat-taman',
    name: 'Taman & Ruang Hijau',
    shortDesc: 'Paru-paru kota dan ruang terbuka hijau publik',
    description: `<div class="space-y-3">
      <p class="text-sm">Pontianak memiliki <strong class="text-emerald-700">30+ taman kota dan Ruang Terbuka Hijau (RTH)</strong> yang tersebar di 6 kecamatan. Taman-taman ini berfungsi sebagai paru-paru kota, area resapan air, dan ruang rekreasi publik.</p>
      <div class="grid grid-cols-2 gap-2 text-xs">
        <div class="bg-green-50 rounded-xl p-3 border border-green-200">
          <span class="font-bold text-green-800">🕐 Jam Buka</span>
          <p class="text-slate-600 mt-1">06.00 - 21.00 WIB</p>
        </div>
        <div class="bg-green-50 rounded-xl p-3 border border-green-200">
          <span class="font-bold text-green-800">🎯 Target RTH</span>
          <p class="text-slate-600 mt-1">30% luas kota</p>
        </div>
      </div>
      <div class="bg-white border rounded-xl p-3 text-xs">
        <p><span class="font-bold text-green-700">🌿 Program:</span> DLH secara rutin melakukan penghijauan dengan bibit tanaman gratis untuk warga dan penanaman pohon di area publik.</p>
      </div>
    </div>`,
    iconName: 'TreePine',
    color: '#15803D',
    markerColor: '#15803D',
    order: 3,
    createdAt: '2026-06-15 08:00',
    updatedAt: '2026-06-15 08:00',
  },
  {
    id: 'cat-ipal',
    name: 'IPAL & Instalasi Pengolahan',
    shortDesc: 'Instalasi Pengelolaan Air Limbah komunal dan industri',
    description: `<div class="space-y-3">
      <p class="text-sm">DLH Pontianak mengelola <strong class="text-emerald-700">12 IPAL komunal</strong> yang tersebar di permukiman padat penduduk dan kawasan industri kecil. IPAL ini memastikan air limbah domestik dan industri kecil memenuhi baku mutu lingkungan sebelum dibuang ke badan air.</p>
      <div class="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-2">
        <h4 class="font-bold text-xs uppercase tracking-wider text-blue-800">🔬 Sistem Pengolahan</h4>
        <div class="text-xs space-y-1 text-slate-700">
          <p>• <strong>Pretreatment:</strong> Penyaringan sampah padat</p>
          <p>• <strong>Primary:</strong> Bak pengendap awal</p>
          <p>• <strong>Secondary:</strong> Biofilter anaerob-aerob</p>
          <p>• <strong>Tertiary:</strong> Disinfeksi UV</p>
        </div>
      </div>
      <p class="text-xs text-slate-500">Pemantauan kualitas air limbah dilakukan setiap bulan oleh Laboratorium Lingkungan DLH.</p>
    </div>`,
    iconName: 'Droplets',
    color: '#2563EB',
    markerColor: '#2563EB',
    order: 4,
    createdAt: '2026-06-15 08:00',
    updatedAt: '2026-06-15 08:00',
  },
];
