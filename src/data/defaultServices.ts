/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ServiceTemplate, Submission } from '../types';

export const defaultServices: ServiceTemplate[] = [
  {
    id: 'sppl',
    name: 'Rekomendasi Dokumen Lingkungan SPPL',
    category: 'Izin & Rekomendasi',
    icon: 'FileText',
    description: 'Persetujuan Surat Pernyataan Kesanggupan Pengelolaan dan Pemantauan Lingkungan Hidup untuk usaha mikro dan kecil.',
    fields: [
      {
        id: 'nama_pemohon',
        label: 'Nama Lengkap Pemohon / Penanggung Jawab',
        type: 'text',
        required: true,
        placeholder: 'Contoh: Joko Susilo, S.H.'
      },
      {
        id: 'nik',
        label: 'Nomor Induk Kependudukan (NIK)',
        type: 'text',
        required: true,
        placeholder: '16 digit nomor NIK sesuai KTP'
      },
      {
        id: 'nama_usaha',
        label: 'Nama Usaha / Kegiatan',
        type: 'text',
        required: true,
        placeholder: 'Contoh: CV. Berkah Abadi Sejahtera'
      },
      {
        id: 'jenis_usaha',
        label: 'Sektor Kegiatan Usaha',
        type: 'select',
        required: true,
        options: ['Perdagangan Ritel', 'Kuliner / Restoran', 'Fasilitas Kesehatan Tingkat Pertama', 'Bengkel Kendaraan', 'Jasa / Kantor', 'Lainnya']
      },
      {
        id: 'alamat_usaha',
        label: 'Alamat Lokasi Kegiatan Usaha',
        type: 'textarea',
        required: true,
        placeholder: 'Masukkan nama jalan, nomor, RT/RW, dan kelurahan'
      },
      {
        id: 'luas_bangunan',
        label: 'Luas Lahan / Bangunan Usaha (m²)',
        type: 'number',
        required: true,
        placeholder: 'Contoh: 150'
      },
      {
        id: 'kapasitas_produksi',
        label: 'Estimasi Volume Sampah/Limbah per Hari (Kg)',
        type: 'number',
        required: false,
        placeholder: 'Contoh: 5'
      }
    ]
  },
  {
    id: 'lab-air',
    name: 'Pengujian Sampah / Air / Udara Laboratorium',
    category: 'Laboratorium',
    icon: 'Droplet',
    description: 'Pengujian kualitas lingkungan (air bersih, air limbah, tanah, maupun tingkat kebisingan) di Laboratorium DLH.',
    fields: [
      {
        id: 'nama_instansi',
        label: 'Nama Perusahaan / Instansi Pemohon',
        type: 'text',
        required: true,
        placeholder: 'Contoh: PT. Pontianak Tirta Agung'
      },
      {
        id: 'no_kontak',
        label: 'No. Handphone / WhatsApp Aktif',
        type: 'text',
        required: true,
        placeholder: 'Contoh: 081234567890'
      },
      {
        id: 'jenis_sampel',
        label: 'Jenis Sampel Lingkungan',
        type: 'select',
        required: true,
        options: ['Air Limbah Industri', 'Air Bersih / Sumur Bor', 'Udara Ambien (Kebisingan)', 'Air Sungai / Danau', 'Limbah Padat / Tanah']
      },
      {
        id: 'parameter_uji',
        label: 'Parameter Pengujian Utama',
        type: 'checkbox_group',
        required: true,
        options: ['pH & Suhu', 'BOD & COD (Beban Organik)', 'Kadar Logam Berat (Pb, Cd, Hg)', 'Total Suspended Solids (TSS)', 'Kebisingan & Getaran']
      },
      {
        id: 'jumlah_titik',
        label: 'Jumlah Titik Sampling',
        type: 'number',
        required: true,
        placeholder: 'Contoh: 2'
      },
      {
        id: 'tanggal_antar',
        label: 'Rencana Tanggal Pengantaran Sampel',
        type: 'date',
        required: true
      }
    ]
  },
  {
    id: 'bibit-gratis',
    name: 'Permohonan Bibit Tanaman Penghijauan',
    category: 'Kemitraan & Edukasi',
    icon: 'Leaf',
    description: 'Layanan penyediaan bibit tanaman / pohon pelindung gratis untuk menghijaukan pemukiman, sekolah, atau taman publik.',
    fields: [
      {
        id: 'nama_organisasi',
        label: 'Nama Pemohon / Kelompok Masyarakat / Sekolah',
        type: 'text',
        required: true,
        placeholder: 'Contoh: Karang Taruna Kelurahan Banjar Serasan'
      },
      {
        id: 'alamat_tujuan',
        label: 'Lokasi Rencana Penanaman',
        type: 'textarea',
        required: true,
        placeholder: 'Sebutkan nama jalan, wilayah, atau nama sekolah/tempat'
      },
      {
        id: 'jenis_bibit',
        label: 'Pilihan Jenis Bibit Tanaman',
        type: 'select',
        required: true,
        options: ['Pohon Pelindung (Mahoni, Angsana)', 'Pohon Buah (Mangga, Rambutan, Jambu)', 'Tanaman Hias / Perimbun (Pucuk Merah, Bougenville)']
      },
      {
        id: 'jumlah_pohon',
        label: 'Jumlah Bibit yang Diperlukan (Batang)',
        type: 'number',
        required: true,
        placeholder: 'Contoh: 25'
      },
      {
        id: 'rencana_tanam',
        label: 'Rencana Tanggal Aksi Penanaman',
        type: 'date',
        required: true
      },
      {
        id: 'deskripsi_kegiatan',
        label: 'Deskripsi Singkat Tujuan Kegiatan',
        type: 'textarea',
        required: false,
        placeholder: 'Sebutkan tujuan penanaman, misal: memperingati Hari Bumi'
      }
    ]
  },
  {
    id: 'aduan-lingkungan',
    name: 'Pengaduan Kasus Pencemaran Lingkungan',
    category: 'Layanan Umum',
    icon: 'ShieldAlert',
    description: 'Wadah pengaduan resmi atas tindak pencemaran air, udara, pembakaran sampah ilegal, atau pembuangan limbah B3 sembarangan.',
    fields: [
      {
        id: 'nama_pelapor',
        label: 'Nama Pelapor (Gunakan "Anonim" jika ingin dirahasiakan)',
        type: 'text',
        required: true,
        placeholder: 'Contoh: Anonim atau Budi Setiawan'
      },
      {
        id: 'kontak_pelapor',
        label: 'No. WhatsApp untuk Koordinasi Lapangan',
        type: 'text',
        required: true,
        placeholder: 'Contoh: 0811XXXXXX. Rahasia dijamin.'
      },
      {
        id: 'jenis_pencemaran',
        label: 'Kategori Kasus',
        type: 'select',
        required: true,
        options: [
          'Pembuangan Limbah Cair ke Parit/Sungai',
          'Polusi Udara / Asap Cerobong Pabrik',
          'Aktivitas Pembakaran Sampah Liar Sekala Besar',
          'Pencemaran Suara / Kebisingan Industri',
          'Penumpukan Sampah Ilegal di Fasilitas Publik'
        ]
      },
      {
        id: 'lokasi_kejadian',
        label: 'Lokasi Detail Kejadian',
        type: 'textarea',
        required: true,
        placeholder: 'Sebutkan Kelurahan, Kecamatan, dan ciri/patokan lokasi terdekat'
      },
      {
        id: 'deskripsi_kronologi',
        label: 'Deskripsi Singkat Keadaan / Kronologi',
        type: 'textarea',
        required: true,
        placeholder: 'Tuliskan seberapa sering polusi terjadi, dampaknya pada warga, dll.'
      }
    ]
  }
];

// Helper to construct seed baseline tracking timeline
const generateTimeline = (status: string, dateStr: string): any[] => {
  const steps = [
    {
      status: 'DIAJUKAN',
      title: 'Berkas Diterima',
      description: 'Permohonan Anda berhasil masuk ke database Sobat Hijau DLH.',
      updatedAt: `${dateStr} 08:30`,
      isCompleted: true
    },
    {
      status: 'VERIFIKASI_ADMIN',
      title: 'Verifikasi Administrasi',
      description: 'Pemeriksaan kesesuaian berkas dan kelengkapan data oleh petugas.',
      updatedAt: `${dateStr} 14:15`,
      isCompleted: false
    },
    {
      status: 'SURVEY_TEKNIS',
      title: 'Pemeriksaan Teknis / Lapangan',
      description: 'Peninjauan langsung ke lokasi dan identifikasi parameter lapangan.',
      updatedAt: '-',
      isCompleted: false
    },
    {
      status: 'PROSES_REKOMENDASI',
      title: 'Penerbitan Surat Rekomendasi',
      description: 'Format naskah surat dan validasi dari kepala dinas.',
      updatedAt: '-',
      isCompleted: false
    },
    {
      status: 'SELESAI',
      title: 'Selesai & Serah Terima',
      description: 'Dokumen final telah diterbitkan dan siap diunduh atau diambil.',
      updatedAt: '-',
      isCompleted: false
    }
  ];

  // Adjust completed status based on flow
  if (status === 'VERIFIKASI_ADMIN') {
    steps[1].isCompleted = true;
  } else if (status === 'SURVEY_TEKNIS') {
    steps[1].isCompleted = true;
    steps[2].isCompleted = true;
    steps[2].updatedAt = '2026-06-02 09:00';
  } else if (status === 'PROSES_REKOMENDASI') {
    steps[1].isCompleted = true;
    steps[2].isCompleted = true;
    steps[3].isCompleted = true;
    steps[2].updatedAt = '2026-06-01 10:00';
    steps[3].updatedAt = '2026-06-02 11:30';
  } else if (status === 'SELESAI') {
    steps[1].isCompleted = true;
    steps[2].isCompleted = true;
    steps[3].isCompleted = true;
    steps[4].isCompleted = true;
    steps[1].updatedAt = '2026-05-28 15:30';
    steps[2].updatedAt = '2026-05-29 11:00';
    steps[3].updatedAt = '2026-05-30 09:15';
    steps[4].updatedAt = '2026-06-01 14:00';
  } else if (status === 'DITOLAK') {
    steps[1].isCompleted = true;
    steps[1].title = 'Berkas Ditolak';
    steps[1].description = 'Sarat administratif tidak terpenuhi. Silakan ajukan ulang.';
    steps[1].updatedAt = `${dateStr} 16:00`;
  }

  return steps;
};

export const defaultSubmissions: Submission[] = [
  {
    id: 'SH-2026-04981',
    serviceId: 'sppl',
    serviceName: 'Rekomendasi Dokumen Lingkungan SPPL',
    submittedAt: '2026-05-28 08:30',
    status: 'SELESAI',
    applicantName: 'Joko Susilo, S.H.',
    formData: {
      nama_pemohon: 'Joko Susilo, S.H.',
      nik: '6171012809880002',
      nama_usaha: 'CV. Berkah Abadi Sejahtera',
      jenis_usaha: 'Kuliner / Restoran',
      alamat_usaha: 'Jl. Ahmad Yani No. 12, Kel. Akraya, Kec. Pontianak Selatan',
      luas_bangunan: '150',
      kapasitas_produksi: '5'
    },
    timeline: generateTimeline('SELESAI', '2026-05-28')
  },
  {
    id: 'SH-2026-08123',
    serviceId: 'lab-air',
    serviceName: 'Pengujian Sampah / Air / Udara Laboratorium',
    submittedAt: '2026-05-26 09:12',
    status: 'SURVEY_TEKNIS',
    applicantName: 'PT. Pontianak Tirta Agung',
    formData: {
      nama_instansi: 'PT. Pontianak Tirta Agung',
      no_kontak: '08125439123',
      jenis_sampel: 'Air Sungai / Danau',
      parameter_uji: ['pH & Suhu', 'BOD & COD (Beban Organik)', 'Total Suspended Solids (TSS)'],
      jumlah_titik: '2',
      tanggal_antar: '2026-06-05'
    },
    timeline: generateTimeline('SURVEY_TEKNIS', '2026-06-01')
  },
  {
    id: 'SH-2026-09255',
    serviceId: 'bibit-gratis',
    serviceName: 'Permohonan Bibit Tanaman Penghijauan',
    submittedAt: '2026-06-02 07:45',
    status: 'DIAJUKAN',
    applicantName: 'Karang Taruna Banjar Serasan',
    formData: {
      nama_organisasi: 'Karang Taruna Banjar Serasan',
      alamat_tujuan: 'Jl. Tritura Gg. Lingkungan Sehat No. 4, Pontianak Timur',
      jenis_bibit: 'Pohon Buah (Mangga, Rambutan, Jambu)',
      jumlah_pohon: '30',
      rencana_tanam: '2026-06-14',
      deskripsi_kegiatan: 'Gerakan Penghijauan Lingkungan RW 05 Pontianak Timur dalam rangka menyambut Hari Lingkungan Hidup.'
    },
    timeline: generateTimeline('DIAJUKAN', '2026-06-02')
  }
];
