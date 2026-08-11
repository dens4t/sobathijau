<?php

namespace Database\Seeders;

use App\Models\ActivityLog;
use App\Models\AppNotification;
use App\Models\AssistantQuestion;
use App\Models\CarouselSlide;
use App\Models\GeoCategory;
use App\Models\GeoLocation;
use App\Models\NetworkLink;
use App\Models\ReplyTemplate;
use App\Models\Service;
use App\Models\SiteMetric;
use App\Models\Submission;
use App\Models\User;
use Illuminate\Database\Seeder;

final class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        foreach ($this->carouselSlides() as $row) {
            CarouselSlide::updateOrCreate(['id' => $row['id']], $row);
        }
        foreach ($this->siteMetrics() as $row) {
            SiteMetric::updateOrCreate(['key' => $row['key']], $row);
        }
        // Template balasan: selalu di-seed idempoten (updateOrCreate) agar DB lama ikut terisi.
        foreach (\App\Support\ReplyTemplates::defaults() as $row) {
            ReplyTemplate::updateOrCreate(['id' => $row['id']], $row);
        }
        // Pertanyaan asisten (FAQ): selalu di-seed idempoten agar DB lama ikut terisi.
        foreach ($this->assistantQuestions() as $row) {
            AssistantQuestion::updateOrCreate(['id' => $row['id']], $row);
        }
        User::updateOrCreate(
            ['email' => 'densat98@gmail.com'],
            ['name' => 'Densat Admin', 'password' => bcrypt('deni1998')],
        );

        // Layanan: selalu di-seed idempoten (updateOrCreate) agar perubahan nama/
        // tautan redirect ikut ter-update di DB lama.
        foreach ($this->services() as $row) {
            Service::updateOrCreate(['id' => $row['id']], $row);
        }

        // Permohonan magang: seed awal SEKALI (hanya bila belum ada).
        // Bila dihapus admin, tidak dibuat ulang.
        if (! Submission::where('serviceId', 'magang')->exists()) {
            foreach ($this->magangSubmissions() as $row) {
                Submission::create($row);
            }
        }

        // Master data (peta/kategori/jejaring): seed sekali pakai create().
        // Berkas pemohon TIDAK di-seed — data transaksi milik pengguna; bila
        // dihapus admin, tidak akan muncul kembali (deploy/seed apa pun).
        if (GeoLocation::exists()) {
            return;
        }

        foreach ($this->locations() as $row) {
            GeoLocation::create($row);
        }
        foreach ($this->categories() as $row) {
            GeoCategory::create($row);
        }
        foreach ($this->networkLinks() as $row) {
            NetworkLink::create($row);
        }
    }

    /** @return array<int, array<string, mixed>> */
    private function services(): array
    {
        return [
            [
                'id' => 'sppl',
                'name' => 'Rekomendasi Dokumen Lingkungan SPPL',
                'category' => 'Izin & Rekomendasi',
                'icon' => 'FileText',
                'description' => 'Persetujuan Surat Pernyataan Kesanggupan Pengelolaan dan Pemantauan Lingkungan Hidup untuk usaha mikro dan kecil.',
                'isCustom' => false,
                'createdAt' => '2026-01-15 08:00',

                'fields' => [
                    ['id' => 'nama_pemohon', 'label' => 'Nama Lengkap Pemohon / Penanggung Jawab', 'type' => 'text', 'required' => true, 'placeholder' => 'Contoh: Joko Susilo, S.H.'],
                    ['id' => 'nik', 'label' => 'Nomor Induk Kependudukan (NIK)', 'type' => 'text', 'required' => true, 'placeholder' => '16 digit nomor NIK sesuai KTP'],
                    ['id' => 'nama_usaha', 'label' => 'Nama Usaha / Kegiatan', 'type' => 'text', 'required' => true, 'placeholder' => 'Contoh: CV. Berkah Abadi Sejahtera'],
                    ['id' => 'jenis_usaha', 'label' => 'Sektor Kegiatan Usaha', 'type' => 'select', 'required' => true, 'options' => ['Perdagangan Ritel', 'Kuliner / Restoran', 'Fasilitas Kesehatan Tingkat Pertama', 'Bengkel Kendaraan', 'Jasa / Kantor', 'Lainnya']],
                    ['id' => 'alamat_usaha', 'label' => 'Alamat Lokasi Kegiatan Usaha', 'type' => 'textarea', 'required' => true, 'placeholder' => 'Masukkan nama jalan, nomor, RT/RW, dan kelurahan'],
                    ['id' => 'luas_bangunan', 'label' => 'Luas Lahan / Bangunan Usaha (m²)', 'type' => 'number', 'required' => true, 'placeholder' => 'Contoh: 150'],
                    ['id' => 'kapasitas_produksi', 'label' => 'Estimasi Volume Sampah/Limbah per Hari (Kg)', 'type' => 'number', 'required' => false, 'placeholder' => 'Contoh: 5'],
                ],
            ],
            [
                'id' => 'lab-air',
                'name' => 'Pengujian Sampel',
                'category' => 'Laboratorium',
                'icon' => 'Droplet',
                'description' => 'Pengujian kualitas sampel lingkungan (air bersih, air limbah, tanah, maupun tingkat kebisingan) di Laboratorium DLH.',
                'externalUrl' => 'https://polis.pontianak.go.id/',
                'externalNote' => 'Permohonan pengujian sampel dilayani melalui portal Pengelolaan Limbah dan ... — POLIS (Peta Online Limbah dan Sampah) Kota Pontianak. Anda akan diarahkan ke polis.pontianak.go.id untuk mengisi formulir permohonan pengujian secara resmi.',
                'isCustom' => false,
                'createdAt' => '2026-02-10 09:30',

                'fields' => [],
            ],
            [
                'id' => 'bibit-gratis',
                'name' => 'Permohonan Bibit Tanaman Penghijauan',
                'category' => 'Kemitraan & Edukasi',
                'icon' => 'Leaf',
                'description' => 'Layanan penyediaan bibit tanaman / pohon pelindung gratis untuk menghijaukan pemukiman, sekolah, atau taman publik.',
                'isCustom' => false,
                'createdAt' => '2026-03-05 10:15',

                'fields' => [
                    ['id' => 'nama_organisasi', 'label' => 'Nama Pemohon / Kelompok Masyarakat / Sekolah', 'type' => 'text', 'required' => true, 'placeholder' => 'Contoh: Karang Taruna Kelurahan Banjar Serasan'],
                    ['id' => 'alamat_tujuan', 'label' => 'Lokasi Rencana Penanaman', 'type' => 'textarea', 'required' => true, 'placeholder' => 'Sebutkan nama jalan, wilayah, atau nama sekolah/tempat'],
                    ['id' => 'jenis_bibit', 'label' => 'Pilihan Jenis Bibit Tanaman', 'type' => 'select', 'required' => true, 'options' => ['Pohon Pelindung (Mahoni, Angsana)', 'Pohon Buah (Mangga, Rambutan, Jambu)', 'Tanaman Hias / Perimbun (Pucuk Merah, Bougenville)']],
                    ['id' => 'jumlah_pohon', 'label' => 'Jumlah Bibit yang Diperlukan (Batang)', 'type' => 'number', 'required' => true, 'placeholder' => 'Contoh: 25'],
                    ['id' => 'rencana_tanam', 'label' => 'Rencana Tanggal Aksi Penanaman', 'type' => 'date', 'required' => true],
                    ['id' => 'deskripsi_kegiatan', 'label' => 'Deskripsi Singkat Tujuan Kegiatan', 'type' => 'textarea', 'required' => false, 'placeholder' => 'Sebutkan tujuan penanaman, misal: memperingati Hari Bumi'],
                ],
            ],
            [
                'id' => 'aduan-lingkungan',
                'name' => 'Pengaduan Kasus Pencemaran Lingkungan',
                'category' => 'Layanan Umum',
                'icon' => 'ShieldAlert',
                'description' => 'Wadah pengaduan resmi atas tindak pencemaran air, udara, pembakaran sampah ilegal, atau pembuangan limbah B3 sembarangan.',
                'externalUrl' => 'https://lapor.go.id',
                'externalNote' => 'Pengaduan pencemaran lingkungan kini dilayani melalui LAPOR! (Layanan Aspirasi dan Pengaduan Online Rakyat) — kanal resmi pemerintah. Anda akan diarahkan ke lapor.go.id untuk membuat aduan secara resmi dan terlacak.',
                'isCustom' => false,
                'createdAt' => '2026-03-20 13:45',

                'fields' => [
                    ['id' => 'nama_pelapor', 'label' => 'Nama Pelapor (Gunakan "Anonim" jika ingin dirahasiakan)', 'type' => 'text', 'required' => true, 'placeholder' => 'Contoh: Anonim atau Budi Setiawan'],
                    ['id' => 'kontak_pelapor', 'label' => 'No. WhatsApp untuk Koordinasi Lapangan', 'type' => 'text', 'required' => true, 'placeholder' => 'Contoh: 0811XXXXXX. Rahasia dijamin.'],
                    ['id' => 'jenis_pencemaran', 'label' => 'Kategori Kasus', 'type' => 'select', 'required' => true, 'options' => ['Pembuangan Limbah Cair ke Parit/Sungai', 'Polusi Udara / Asap Cerobong Pabrik', 'Aktivitas Pembakaran Sampah Liar Sekala Besar', 'Pencemaran Suara / Kebisingan Industri', 'Penumpukan Sampah Ilegal di Fasilitas Publik']],
                    ['id' => 'lokasi_kejadian', 'label' => 'Lokasi Detail Kejadian', 'type' => 'textarea', 'required' => true, 'placeholder' => 'Sebutkan Kelurahan, Kecamatan, dan ciri/patokan lokasi terdekat'],
                    ['id' => 'deskripsi_kronologi', 'label' => 'Deskripsi Singkat Keadaan / Kronologi', 'type' => 'textarea', 'required' => true, 'placeholder' => 'Tuliskan seberapa sering polusi terjadi, dampaknya pada warga, dll.'],
                ],
            ],
            [
                'id' => 'magang',
                'name' => 'Permohonan Magang / Praktik Kerja',
                'category' => 'Kemitraan & Edukasi',
                'icon' => 'Briefcase',
                'description' => 'Permohonan magang / praktik kerja lapangan di lingkungan Dinas Lingkungan Hidup Kota Pontianak untuk pelajar, mahasiswa, atau umum.',
                'isCustom' => false,
                'createdAt' => '2026-08-11 08:00',

                'fields' => [
                    ['id' => 'nama_pemohon', 'label' => 'Nama Lengkap Pemohon', 'type' => 'text', 'required' => true, 'placeholder' => 'Contoh: Budi Santoso'],
                    ['id' => 'asal_institusi', 'label' => 'Asal Institusi (Sekolah / Kampus / Umum)', 'type' => 'text', 'required' => true, 'placeholder' => 'Contoh: Universitas Tanjungpura'],
                    ['id' => 'program_studi', 'label' => 'Program Studi / Jurusan', 'type' => 'text', 'required' => false, 'placeholder' => 'Contoh: Teknik Lingkungan'],
                    ['id' => 'durasi_magang', 'label' => 'Durasi Magang', 'type' => 'select', 'required' => true, 'options' => ['1 Bulan', '2 Bulan', '3 Bulan', '6 Bulan']],
                    ['id' => 'tanggal_mulai', 'label' => 'Rencana Tanggal Mulai', 'type' => 'date', 'required' => true],
                    ['id' => 'tujuan_magang', 'label' => 'Tujuan & Bidang yang Diminati', 'type' => 'textarea', 'required' => false, 'placeholder' => 'Contoh: Mempelajari pengelolaan sampah dan laboratorium lingkungan'],
                ],
            ],
        ];
    }

    /** @return array<int, array<string, mixed>> */
    private function magangSubmissions(): array
    {
        $build = static fn (string $id, string $applicant, string $status, string $submittedAt, array $formData, ?string $note = null): array => [
            'id' => $id,
            'serviceId' => 'magang',
            'serviceName' => 'Permohonan Magang / Praktik Kerja',
            'applicantName' => $applicant,
            'status' => $status,
            'submittedAt' => $submittedAt,
            'formData' => $formData,
            'timeline' => $status === 'DIAJUKAN'
                ? \App\Support\Timeline::build($submittedAt)
                : \App\Support\Timeline::update(\App\Support\Timeline::build($submittedAt), $status, $note, $submittedAt),
        ];

        return [
            $build('SH-MG-2026-001', 'Budi Santoso', 'SURVEY_TEKNIS', '2026-08-05 09:00', [
                'nama_pemohon' => 'Budi Santoso',
                'asal_institusi' => 'Universitas Tanjungpura',
                'program_studi' => 'Teknik Lingkungan',
                'durasi_magang' => '3 Bulan',
                'tanggal_mulai' => '2026-09-01',
                'tujuan_magang' => 'Mempelajari pengelolaan sampah kota dan praktik laboratorium lingkungan.',
            ], 'Berkas lengkap, jadwal wawancara akan dihubungi.'),
            $build('SH-MG-2026-002', 'Siti Nurhaliza', 'VERIFIKASI_ADMIN', '2026-08-07 10:30', [
                'nama_pemohon' => 'Siti Nurhaliza',
                'asal_institusi' => 'SMK Negeri 4 Pontianak',
                'program_studi' => 'Kimia Analisis',
                'durasi_magang' => '2 Bulan',
                'tanggal_mulai' => '2026-09-14',
                'tujuan_magang' => 'Praktik kerja laboratorium uji air dan limbah.',
            ], 'Berkas diterima, sedang diverifikasi.'),
            $build('SH-MG-2026-003', 'Ahmad Fauzi', 'DIAJUKAN', '2026-08-09 14:15', [
                'nama_pemohon' => 'Ahmad Fauzi',
                'asal_institusi' => 'Politeknik Negeri Pontianak',
                'program_studi' => 'Teknologi Pengolahan Hasil Bumi',
                'durasi_magang' => '6 Bulan',
                'tanggal_mulai' => '2026-10-01',
                'tujuan_magang' => 'Pengelolaan limbah padat dan program bank sampah.',
            ]),
            $build('SH-MG-2026-004', 'Dewi Lestari', 'DIAJUKAN', '2026-08-10 08:45', [
                'nama_pemohon' => 'Dewi Lestari',
                'asal_institusi' => 'Umum',
                'program_studi' => '',
                'durasi_magang' => '1 Bulan',
                'tanggal_mulai' => '2026-08-24',
                'tujuan_magang' => 'Belajar administrasi perkantoran dan layanan informasi lingkungan.',
            ]),
        ];
    }

    /** @return array<int, array<string, mixed>> */
    private function locations(): array
    {
        $rows = [
            ['loc-tps-01', 'TPS 3R Siantan Hilir', 'TPS & TPA', 0.0351, 109.3395, 'Jl. Siantan Hilir, Pontianak Utara', 'Tempat Pembuangan Sementara 3R dengan kapasitas 12 ton/hari. Melayani 3 kelurahan sekitar.', 'Trash2', '#DC2626'],
            ['loc-tps-02', 'TPS Pasar Dahlia', 'TPS & TPA', -0.0198, 109.3402, 'Komplek Pasar Dahlia, Pontianak Kota', 'TPS pusat kota dengan ritase 2x sehari. Melayani area pasar dan permukiman sekitar.', 'Trash2', '#DC2626'],
            ['loc-tps-03', 'TPS Pal Lima', 'TPS & TPA', -0.0215, 109.3358, 'Jl. Pal Lima, Pontianak Kota', 'TPS dengan konsep penampungan terpilah untuk sampah organik dan anorganik.', 'Trash2', '#DC2626'],
            ['loc-tps-04', 'TPS Akcaya', 'TPS & TPA', -0.0192, 109.3518, 'Jl. Akcaya, Pontianak Selatan', 'TPS permukiman padat penduduk dengan kontainer 8m³.', 'Trash2', '#DC2626'],
            ['loc-tps-05', 'TPS Sungaijawi Dalam', 'TPS & TPA', -0.0087, 109.3572, 'Jl. Sungaijawi Dalam, Pontianak Timur', 'TPS tepi sungai dengan sistem pengangkutan menggunakan armada sungai.', 'Trash2', '#DC2626'],
            ['loc-tps-06', 'TPA Batu Layang', 'TPS & TPA', 0.0439, 109.3689, 'Jl. Batu Layang, Pontianak Utara', 'Tempat Pemrosesan Akhir dengan sistem controlled landfill. Kapasitas 50 ton/hari.', 'Landfill', '#B91C1C'],
            ['loc-bs-01', 'Bank Sampah Melati Bersih', 'Bank Sampah', -0.0256, 109.3421, 'Jl. Gusti Hamzah, Pontianak Kota', 'Bank sampah binaan DLH dengan sistem tabungan sampah. Menerima plastik, kertas, logam.', 'Recycle', '#16A34A'],
            ['loc-bs-02', 'Bank Sampah Kenanga', 'Bank Sampah', 0.0312, 109.3285, 'Jl. Kenanga Dalam, Pontianak Barat', 'Bank sampah berbasis komunitas RW. Melayani 400 KK dengan setoran rutin mingguan.', 'Recycle', '#16A34A'],
            ['loc-bs-03', 'Bank Sampah Harapan Baru', 'Bank Sampah', -0.0138, 109.3309, 'Jl. Harapan Baru, Pontianak Tenggara', 'Bank sampah dengan unit pengomposan dan daur ulang plastik skala kecil.', 'Recycle', '#16A34A'],
            ['loc-bs-04', 'Bank Sampah Sungaibangkong', 'Bank Sampah', -0.0181, 109.3195, 'Jl. Sungaibangkong, Pontianak Tenggara', 'Bank sampah dengan edukasi pemilahan sampah untuk pelajar dan masyarakat.', 'Recycle', '#16A34A'],
            ['loc-bs-05', 'Bank Sampah Flamboyan', 'Bank Sampah', -0.0115, 109.3418, 'Jl. Flamboyan, Pontianak Timur', 'Bank sampah dengan layanan jemput bola keliling permukiman setiap hari Sabtu.', 'Recycle', '#16A34A'],
            ['loc-bs-06', 'Bank Sampah Tanjungpura', 'Bank Sampah', -0.0072, 109.3521, 'Kampus Untan, Pontianak Tenggara', 'Bank sampah mahasiswa dengan program Kampung Iklim dan zero waste kampus.', 'Recycle', '#16A34A'],
        ];

        return array_map(static fn (array $r): array => [
            'id' => $r[0],
            'name' => $r[1],
            'category' => $r[2],
            'lat' => $r[3],
            'lng' => $r[4],
            'address' => $r[5],
            'description' => $r[6],
            'iconName' => $r[7],
            'color' => $r[8],
            'createdAt' => '2026-01-01 08:00',
            'updatedAt' => '2026-06-01 08:00',
        ], $rows);
    }

    /** @return array<int, array<string, mixed>> */
    private function categories(): array
    {
        return [
            [
                'id' => 'cat-tps',
                'name' => 'TPS & TPA',
                'shortDesc' => 'Tempat Pembuangan Sementara dan Akhir',
                'description' => <<<'HTML'
<div class="space-y-3">
  <p class="text-sm">Kota Pontianak memiliki <strong class="text-emerald-700">6 TPS (Tempat Pembuangan Sementara)</strong> dan <strong class="text-red-700">1 TPA (Tempat Pemrosesan Akhir)</strong> yang dikelola oleh Dinas Lingkungan Hidup. Sistem pengelolaan sampah di Pontianak menerapkan konsep <em>reduce-reuse-recycle</em> (3R) yang melibatkan partisipasi aktif masyarakat.</p>
  <div class="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2">
    <h4 class="font-bold text-xs uppercase tracking-wider text-amber-800">🕐 Jam Operasional</h4>
    <div class="grid grid-cols-2 gap-2 text-xs">
      <div class="bg-white rounded-lg p-2"><span class="font-bold text-slate-700">TPS Reguler</span><p class="text-slate-500">06.00 - 18.00 WIB</p></div>
      <div class="bg-white rounded-lg p-2"><span class="font-bold text-slate-700">TPA Batu Layang</span><p class="text-slate-500">06.00 - 16.00 WIB</p></div>
      <div class="bg-white rounded-lg p-2"><span class="font-bold text-slate-700">Pengangkutan</span><p class="text-slate-500">2 ritase/hari</p></div>
      <div class="bg-white rounded-lg p-2"><span class="font-bold text-slate-700">Hari Libur</span><p class="text-slate-500">Tetap beroperasi</p></div>
    </div>
  </div>
  <p class="text-xs text-slate-500 mt-2">Kapasitas total TPA Batu Layang mencapai 50 ton/hari dengan sistem controlled landfill yang ramah lingkungan.</p>
</div>
HTML,
                'iconName' => 'Trash2',
                'color' => '#DC2626',
                'markerColor' => '#DC2626',
                'order' => 1,
                'createdAt' => '2026-01-01 08:00',
                'updatedAt' => '2026-06-01 08:00',
            ],
            [
                'id' => 'cat-bank-sampah',
                'name' => 'Bank Sampah',
                'shortDesc' => 'Pusat daur ulang dan tabungan sampah berbasis komunitas',
                'description' => <<<'HTML'
<div class="space-y-3">
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
</div>
HTML,
                'iconName' => 'Recycle',
                'color' => '#16A34A',
                'markerColor' => '#16A34A',
                'order' => 2,
                'createdAt' => '2026-01-01 08:00',
                'updatedAt' => '2026-06-01 08:00',
            ],
            [
                'id' => 'cat-taman',
                'name' => 'Taman & Ruang Hijau',
                'shortDesc' => 'Paru-paru kota dan ruang terbuka hijau publik',
                'description' => <<<'HTML'
<div class="space-y-3">
  <p class="text-sm">Pontianak memiliki <strong class="text-emerald-700">30+ taman kota dan Ruang Terbuka Hijau (RTH)</strong> yang tersebar di 6 kecamatan. Taman-taman ini berfungsi sebagai paru-paru kota, area resapan air, dan ruang rekreasi publik.</p>
  <div class="grid grid-cols-2 gap-2 text-xs">
    <div class="bg-green-50 rounded-xl p-3 border border-green-200"><span class="font-bold text-green-800">🕐 Jam Buka</span><p class="text-slate-600 mt-1">06.00 - 21.00 WIB</p></div>
    <div class="bg-green-50 rounded-xl p-3 border border-green-200"><span class="font-bold text-green-800">🎯 Target RTH</span><p class="text-slate-600 mt-1">30% luas kota</p></div>
  </div>
  <div class="bg-white border rounded-xl p-3 text-xs">
    <p><span class="font-bold text-green-700">🌿 Program:</span> DLH secara rutin melakukan penghijauan dengan bibit tanaman gratis untuk warga dan penanaman pohon di area publik.</p>
  </div>
</div>
HTML,
                'iconName' => 'TreePine',
                'color' => '#15803D',
                'markerColor' => '#15803D',
                'order' => 3,
                'createdAt' => '2026-06-15 08:00',
                'updatedAt' => '2026-06-15 08:00',
            ],
            [
                'id' => 'cat-ipal',
                'name' => 'IPAL & Instalasi Pengolahan',
                'shortDesc' => 'Instalasi Pengelolaan Air Limbah komunal dan industri',
                'description' => <<<'HTML'
<div class="space-y-3">
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
</div>
HTML,
                'iconName' => 'Droplets',
                'color' => '#2563EB',
                'markerColor' => '#2563EB',
                'order' => 4,
                'createdAt' => '2026-06-15 08:00',
                'updatedAt' => '2026-06-15 08:00',
            ],
        ];
    }

    /** @return array<int, array<string, mixed>> */
    private function networkLinks(): array
    {
        $rows = [
            ['link-1', 'Portal Resmi DLH Kota Pontianak', 'https://dlh.pontianakkota.go.id', 'Website resmi Dinas Lingkungan Hidup Kota Pontianak', 1],
            ['link-2', 'Sistem Informasi Pengelolaan Sampah', 'https://sips.dlh.pontianakkota.go.id', 'Portal data dan monitoring pengelolaan sampah Kota Pontianak', 2],
            ['link-3', 'Informasi Indeks Kualitas Lingkungan Hidup', 'https://iklh.menlhk.go.id', 'Data IKLH nasional dari Kementerian Lingkungan Hidup', 3],
            ['link-4', 'Lapor Pengaduan Lingkungan Hidup', 'https://pengaduan.dlh.pontianakkota.go.id', 'Saluran aduan masyarakat seputar lingkungan hidup', 4],
            ['link-5', 'Sobat Hijau - Portal Pelayanan', 'https://sobat.dst.my.id', 'Portal pelayanan online terpadu DLH Kota Pontianak', 5],
        ];

        return array_map(static fn (array $r): array => [
            'id' => $r[0],
            'title' => $r[1],
            'url' => $r[2],
            'description' => $r[3],
            'sortOrder' => $r[4],
            'isActive' => true,
        ], $rows);
    }

    /** @return array<int, array<string, mixed>> */
    private function assistantQuestions(): array
    {
        return [
            [
                'id' => 'faq-1',
                'question' => 'Bagaimana cara mendaftar SPPL untuk UMKM?',
                'keywords' => ['sppl', 'izin', 'rekomendasi'],
                'answer' => 'Untuk mendaftar rekomendasi SPPL di Sobat Hijau, Anda perlu menyiapkan: 1. NIK/KTP pemohon, 2. Nama & alamat kegiatan usaha, 3. Ukuran luas bangunan usaha. Anda dapat mengisi formulir dinamis langsung pada menu "Layanan Kami > Rekomendasi Dokumen Lingkungan SPPL". Setelah dikirim, Anda akan menerima Kode Pelacakan (misal: SH-2026-XXXXX) untuk melacak kemajuan dokumen secara real-time!',
                'sort_order' => 1,
            ],
            [
                'id' => 'faq-2',
                'question' => 'Apa saja syarat uji sampel air limbah?',
                'keywords' => ['uji', 'air', 'lab', 'parameter', 'sampel'],
                'answer' => 'Sobat Hijau menyediakan layanan laboratorium DLH untuk uji air bersih, air limbah, tanah, maupun tingkat kebisingan. Anda cukup mengisi formulir pada kategori "Laboratorium", memilih parameter uji seperti pH, BOD/COD atau logam berat, lalu mengantarkan sampel fisik Anda ke kantor DLH sesuai tanggal rencana pengantaran yang Anda input.',
                'sort_order' => 2,
            ],
            [
                'id' => 'faq-3',
                'question' => 'Cara mendapatkan bibit tanaman pelindung gratis?',
                'keywords' => ['bibit', 'tanaman', 'pohon', 'gratis', 'hutan'],
                'answer' => 'Dinas Lingkungan Hidup membagikan bibit tanaman GRATIS untuk aksi penghijauan masyarakat, organisasi, atau sekolah. Di portal Sobat Hijau, pilih menu "Permohonan Bibit Tanaman", tentukan jumlah dan jenis bibit (pohon buah, tanaman hias, atau pelindung), serta tanggal aksi penanaman Anda. Tim kami akan memverifikasi dan menyiapkan bibit untuk diambil!',
                'sort_order' => 3,
            ],
            [
                'id' => 'faq-4',
                'question' => 'Cara melacak berkas permohonan?',
                'keywords' => ['lacak', 'pelacakan', 'kode', 'tracking'],
                'answer' => 'Untuk melacak status permohonan Anda, silakan catat Kode Pelacakan (contoh: SH-2026-04981) yang didapat setelah mengirim formulir. Masukkan kode tersebut di menu "Lacak Permohonan" di navigasi atas. Anda akan dapat melihat timeline proses pengerjaan dari pembukaan berkas, survei lapangan, hingga penerbitan surat selesai.',
                'sort_order' => 4,
            ],
            [
                'id' => 'faq-5',
                'question' => 'Cara melaporkan pembakaran sampah liar?',
                'keywords' => ['lapork', 'aduan', 'pencemaran', 'bakar', 'limbah'],
                'answer' => 'Jika Anda menemukan pencemaran lingkungan (misalnya pembuangan limbah sisa pabrik ke sungai atau pembakaran sampah liar secara besar-besaran), silakan buat laporan di menu "Pengaduan Kasus Pencemaran". Anda bisa memilih nama "Anonim" demi privasi, sertakan lokasi detail, kronologi kejadian, dan no WA aktif agar pengawas lingkungan DLH kami dapat berkoordinasi langsung.',
                'sort_order' => 5,
            ],
        ];
    }

    /** @return array<int, array<string, mixed>> */
    private function carouselSlides(): array
    {
        return [
            [
                'id' => 'slide-1',
                'tag' => 'KONSERVASI AIR',
                'title' => 'Penyelamatan Mutu Air Aliran Kapuas',
                'subtitle' => 'Menjaga keanekaragaman hayati sungai terpanjang di Indonesia melewati garis Khatulistiwa.',
                'color_bg' => 'from-teal-900/90 to-[#1B4332]',
                'icon' => 'water',
                'metric' => '68.4%',
                'metric_label' => 'Indeks Mutu Air',
                'bullet_points' => [
                    'Wajib grease trap bagi restoran sekitar aliran Kapuas.',
                    'Pemantauan baku mutu inlet pabrik Siantan menggunakan IoT.',
                    'Aksi penanaman pohon mangrove nipah di sempadan sungai.',
                ],
                'sort_order' => 1,
            ],
            [
                'id' => 'slide-2',
                'tag' => 'PENGELOLAAN SAMPAH',
                'title' => 'Gerakan Zero-Waste Sampah Rumah Tangga',
                'subtitle' => 'Mendorong pemisahan limbah organik dan daur ulang plastik bernilai ekonomi tinggi.',
                'color_bg' => 'from-amber-950/90 to-stone-900',
                'icon' => 'trash',
                'metric' => '12 Ton',
                'metric_label' => 'Plastik Terdaur Ulang',
                'bullet_points' => [
                    'Pembangunan 65 unit Bank Sampah 3R tingkat kecamatan.',
                    'Inovasi komposter mandiri untuk limbah sayur basah.',
                    'Hukuman pengawasan denda bagi pembuang liar pinggir jalan.',
                ],
                'sort_order' => 2,
            ],
            [
                'id' => 'slide-3',
                'tag' => 'REBOISASI KOTA',
                'title' => 'Hutan Kota & Pelindung Paru Khatulistiwa',
                'subtitle' => 'Bekerja sama menyediakan bibit pohon rindang gratis berkualitas bagi setiap pemohon.',
                'color_bg' => 'from-[#1B4332] to-emerald-950/95',
                'icon' => 'trees',
                'metric' => '+8.9K',
                'metric_label' => 'Bibit Pohon Tersalur',
                'bullet_points' => [
                    'Pemberian gratis bibit mahoni, angsana, mangga pekarangan.',
                    'Peningkatan ruang terbuka hijau publik perumahan.',
                    'Penyaringan CO2 udara gersang di jalur sibuk Ahmad Yani.',
                ],
                'sort_order' => 3,
            ],
        ];
    }

    /** @return array<int, array<string, mixed>> */
    private function siteMetrics(): array
    {
        return [
            ['key' => 'iklh', 'value' => '65.69', 'label' => 'CUKUP BAIK'],
        ];
    }
}
