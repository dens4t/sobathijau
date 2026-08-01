<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class AssistantController extends Controller
{
    /** @return array<int, string> */
    public function questions(): array
    {
        return [
            'Bagaimana cara mendaftar SPPL untuk UMKM?',
            'Apa saja syarat uji sampel air limbah?',
            'Bagaimana cara melacak berkas permohonan?',
            'Cara mendapatkan bibit tanaman pelindung gratis?',
            'Cara melaporkan pembakaran sampah liar?',
        ];
    }

    public function answer(Request $request): JsonResponse
    {
        $data = $request->validate(['message' => 'required|string']);
        $prompt = mb_strtolower($data['message']);

        $rules = [
            ['sppl', 'izin', 'rekomendasi' => 'Untuk mendaftar rekomendasi SPPL di Sobat Hijau, Anda perlu menyiapkan: 1. NIK/KTP pemohon, 2. Nama & alamat kegiatan usaha, 3. Ukuran luas bangunan usaha. Anda dapat mengisi formulir dinamis langsung pada menu "Layanan Kami > Rekomendasi Dokumen Lingkungan SPPL". Setelah dikirim, Anda akan menerima Kode Pelacakan (misal: SH-2026-XXXXX) untuk melacak kemajuan dokumen secara real-time!'],
            ['uji', 'air', 'lab', 'parameter', 'sampel' => 'Sobat Hijau menyediakan layanan laboratorium DLH untuk uji air bersih, air limbah, tanah, maupun tingkat kebisingan. Anda cukup mengisi formulir pada kategori "Laboratorium", memilih parameter uji seperti pH, BOD/COD atau logam berat, lalu mengantarkan sampel fisik Anda ke kantor DLH sesuai tanggal rencana pengantaran yang Anda input.'],
            ['bibit', 'tanaman', 'pohon', 'gratis', 'hutan' => 'Dinas Lingkungan Hidup membagikan bibit tanaman GRATIS untuk aksi penghijauan masyarakat, organisasi, atau sekolah. Di portal Sobat Hijau, pilih menu "Permohonan Bibit Tanaman", tentukan jumlah dan jenis bibit (pohon buah, tanaman hias, atau pelindung), serta tanggal aksi penanaman Anda. Tim kami akan memverifikasi dan menyiapkan bibit untuk diambil!'],
            ['lacak', 'pelacakan', 'kode', 'tracking' => 'Untuk melacak status permohonan Anda, silakan catat Kode Pelacakan (contoh: SH-2026-04981) yang didapat setelah mengirim formulir. Masukkan kode tersebut di menu "Lacak Permohonan" di navigasi atas. Anda akan dapat melihat timeline proses pengerjaan dari pembukaan berkas, survei lapangan, hingga penerbitan surat selesai.'],
            ['lapork', 'aduan', 'pencemaran', 'bakar', 'limbah' => 'Jika Anda menemukan pencemaran lingkungan (misalnya pembuangan limbah sisa pabrik ke sungai atau pembakaran sampah liar secara besar-besaran), silakan buat laporan di menu "Pengaduan Kasus Pencemaran". Anda bisa memilih nama "Anonim" demi privasi, sertakan lokasi detail, kronologi kejadian, dan no WA aktif agar pengawas lingkungan DLH kami dapat berkoordinasi langsung.'],
        ];

        $response = null;
        foreach ($rules as $rule) {
            $text = array_pop($rule);
            if (count(array_filter($rule, static fn (string $k): bool => str_contains($prompt, $k))) > 0) {
                $response = $text;
                break;
            }
        }

        $response ??= 'Terima kasih atas pertanyaan Anda mengenai Dinas Lingkungan Hidup. Melalui portal Sobat Hijau ini, Anda dapat mengajukan dokumen SPPL, pengujian uji lab sampel udara/air, pengajuan bibit, dan pengaduan pencemaran lingkungan. Semua permohonan ini bersifat dinamis, dapat dilacak secara instan, dan dirancang mudah digunakan oleh seluruh lapisan masyarakat termasuk penyandang disabilitas.';

        return response()->json(['text' => $response]);
    }
}
