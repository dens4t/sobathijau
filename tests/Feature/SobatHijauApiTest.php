<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

final class SobatHijauApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();

        $this->adminToken = $this->postJson('/api/login', [
            'email' => 'densat98@gmail.com',
            'password' => 'deni1998',
        ])->assertOk()->json('token');

        $this->withHeader('Authorization', 'Bearer '.$this->adminToken);
    }

    private string $adminToken;

    protected function tearDown(): void
    {
        // Bersihkan berkas uji upload agar tidak mengotori run berikutnya.
        Storage::disk('local')->deleteDirectory('uploads');
        foreach (glob(storage_path('app/uploads/*')) ?: [] as $f) {
            @unlink($f);
        }

        parent::tearDown();
    }

    /** Buat berkas uji via API (server memaksa status/timeline sendiri). */
    protected function createSubmission(string $id, array $formData = []): void
    {
        $this->postJson('/api/submissions', [
            'id' => $id,
            'serviceId' => 'sppl',
            'serviceName' => 'Rekomendasi Dokumen Lingkungan SPPL',
            'applicantName' => 'Pemohon Test',
            'formData' => $formData ?: ['nama_pemohon' => 'Pemohon Test', 'nik' => '6171012809880002'],
            'submittedAt' => '2026-08-01 10:00',
        ])->assertStatus(201);
    }

    public function test_bootstrap_returns_all_seeded_collections(): void
    {
        $response = $this->getJson('/api/bootstrap');

        $response->assertOk()
            ->assertJsonCount(4, 'services')
            ->assertJsonCount(0, 'submissions')
            ->assertJsonCount(0, 'notifications')
            ->assertJsonCount(0, 'activityLogs')
            ->assertJsonCount(12, 'locations')
            ->assertJsonCount(4, 'categories')
            ->assertJsonCount(5, 'networkLinks')
            ->assertJsonCount(3, 'carouselSlides')
            ->assertJsonCount(1, 'siteMetrics')
            ->assertJsonCount(5, 'assistantQuestions')
            ->assertJsonPath('services.0.id', 'aduan-lingkungan')
            ->assertJsonPath('services.0.isCustom', false)
            ->assertJsonPath('carouselSlides.0.icon', 'water')
            ->assertJsonPath('carouselSlides.0.colorBg', 'from-teal-900/90 to-[#1B4332]')
            ->assertJsonPath('carouselSlides.0.metricLabel', 'Indeks Mutu Air')
            ->assertJsonCount(3, 'carouselSlides.0.bulletPoints')
            ->assertJsonMissingPath('carouselSlides.0.bullet_points')
            ->assertJsonPath('siteMetrics.0.key', 'iklh')
            ->assertJsonPath('siteMetrics.0.value', '65.69');
    }

    public function test_login_rejects_bad_credentials(): void
    {
        $this->postJson('/api/login', [
            'email' => 'densat98@gmail.com',
            'password' => 'salah',
        ])->assertStatus(401);
    }

    public function test_admin_routes_require_token(): void
    {
        $this->withHeader('Authorization', 'Bearer invalid')
            ->postJson('/api/services', ['id' => 'x', 'name' => 'x'])
            ->assertStatus(401);
    }

    public function test_bootstrap_masks_sensitive_form_data(): void
    {
        $this->createSubmission('SH-MASK-0001', ['nama_pelapor' => 'Anonim', 'kontak_pelapor' => '081234567890', 'nik' => '6171012809880002']);
        $resp = $this->getJson('/api/bootstrap');
        $sppl = collect($resp->json('submissions'))->firstWhere('id', 'SH-MASK-0001');

        $this->assertSame('6171**********02', $sppl['formData']['nik']);
        $this->assertStringNotContainsString('2809880002', $sppl['formData']['nik']);

        // Kontak pada aduan ikut ter-mask.
        $this->assertStringContainsString('*', $sppl['formData']['kontak_pelapor']);
    }

    public function test_admin_endpoint_returns_full_form_data(): void
    {
        $this->createSubmission('SH-FULL-0001');
        $rows = $this->getJson('/api/submissions')->assertOk()->json();
        $sppl = collect($rows)->firstWhere('id', 'SH-FULL-0001');

        $this->assertSame('6171012809880002', $sppl['formData']['nik']);
        $this->assertStringNotContainsString('*', $sppl['formData']['nik']);
    }

    public function test_public_submission_store_works_without_token(): void
    {
        $this->postJson('/api/submissions', [
            'id' => 'SH-PUBLIC-1',
            'serviceId' => 'sppl',
            'serviceName' => 'Rekomendasi Dokumen Lingkungan SPPL',
            'applicantName' => 'Test Publik',
            'status' => 'DIAJUKAN',
            'submittedAt' => '2026-08-01 12:00',
            'timeline' => [
                ['status' => 'DIAJUKAN', 'title' => 'Berkas Diterima', 'description' => 'Permohonan masuk database', 'updatedAt' => '2026-08-01 12:00', 'isCompleted' => true],
                ['status' => 'VERIFIKASI_ADMIN', 'title' => 'Verifikasi Administrasi', 'description' => 'Pemeriksaan berkas', 'updatedAt' => '-', 'isCompleted' => false],
                ['status' => 'SURVEY_TEKNIS', 'title' => 'Pemeriksaan Teknis / Lapangan', 'description' => 'Peninjauan lokasi', 'updatedAt' => '-', 'isCompleted' => false],
                ['status' => 'PROSES_REKOMENDASI', 'title' => 'Penerbitan Surat Rekomendasi', 'description' => 'Validasi kepala dinas', 'updatedAt' => '-', 'isCompleted' => false],
                ['status' => 'SELESAI', 'title' => 'Selesai & Serah Terima', 'description' => 'Dokumen final', 'updatedAt' => '-', 'isCompleted' => false],
            ],
            'formData' => ['nama_pemohon' => 'Test Publik', 'nik' => '6171010101900001'],
        ])->assertStatus(201)->assertJsonPath('id', 'SH-PUBLIC-1');

        $this->assertDatabaseHas('submissions', ['id' => 'SH-PUBLIC-1']);
    }

    public function test_assistant_answers_rule_based(): void
    {
        $this->postJson('/api/assistant', ['message' => 'Bagaimana cara mendaftar SPPL?'])
            ->assertOk()
            ->assertJsonPath('text', fn (string $text) => str_contains($text, 'NIK/KTP'));

        $this->getJson('/api/assistant/questions')->assertOk()->assertJsonCount(5);
    }

    public function test_activity_log_store_creates_real_row(): void
    {
        $this->postJson('/api/activity-logs', ['action' => 'Admin menguji audit log', 'iconType' => 'info'])
            ->assertOk()
            ->assertJsonPath('action', 'Admin menguji audit log');

        $this->assertDatabaseCount('activity_logs', 1);
    }

    public function test_service_crud_roundtrip(): void
    {
        $payload = [
            'id' => 'svc-test-1',
            'name' => 'Layanan Test',
            'category' => 'Layanan Umum',
            'icon' => 'Leaf',
            'description' => 'test',
            'fields' => [],
            'isCustom' => true,
        ];

        $this->postJson('/api/services', $payload)
            ->assertOk()
            ->assertJsonPath('id', 'svc-test-1')
            ->assertJsonPath('isCustom', true);

        $this->putJson('/api/services/svc-test-1', ['id' => 'svc-test-1', 'name' => 'Updated'] + $payload)
            ->assertOk()
            ->assertJsonPath('name', 'Updated');

        $this->deleteJson('/api/services/svc-test-1')
            ->assertOk()
            ->assertJsonPath('ok', true);

        $this->assertDatabaseMissing('services', ['id' => 'svc-test-1']);
    }

    public function test_status_update_advances_timeline_and_creates_notification(): void
    {
        $this->createSubmission('SH-2026-08123');
        $response = $this->putJson('/api/submissions/SH-2026-08123/status', [
            'status' => 'PROSES_REKOMENDASI',
            'adminNote' => 'Berkas lengkap',
        ]);

        $response->assertOk()
            ->assertJsonPath('submission.status', 'PROSES_REKOMENDASI')
            ->assertJsonPath('submission.timeline.2.isCompleted', true)
            ->assertJsonPath('submission.timeline.3.isCompleted', true)
            ->assertJsonPath('notification.submissionId', 'SH-2026-08123')
            ->assertJsonPath('notification.isRead', false)
            ->assertJsonPath('notification.message', 'Berkas lengkap');

        $this->assertDatabaseCount('notifications', 1);
    }

    public function test_rejection_marks_verification_step_with_note(): void
    {
        $this->createSubmission('SH-2026-09255');
        $this->putJson('/api/submissions/SH-2026-09255/status', [
            'status' => 'DITOLAK',
            'adminNote' => 'Berkas tidak lengkap',
        ])
            ->assertOk()
            ->assertJsonPath('submission.status', 'DITOLAK')
            ->assertJsonPath('submission.timeline.1.title', 'Pemberitahuan Ditolak')
            ->assertJsonPath('submission.timeline.1.description', 'Berkas tidak lengkap');
    }

    public function test_deleting_submission_removes_orphan_notifications(): void
    {
        $this->createSubmission('SH-2026-08123');
        $this->putJson('/api/submissions/SH-2026-08123/status', ['status' => 'SURVEY_TEKNIS'])->assertOk();
        $this->assertDatabaseCount('notifications', 1);

        $this->deleteJson('/api/submissions/SH-2026-08123')
            ->assertOk()
            ->assertJsonPath('ok', true);

        $this->assertDatabaseMissing('submissions', ['id' => 'SH-2026-08123']);
        $this->assertDatabaseMissing('notifications', ['submissionId' => 'SH-2026-08123']);
        $this->assertDatabaseCount('notifications', 0); // notif yatim ikut terhapus
    }

    public function test_notification_read_flow(): void
    {
        $this->createSubmission('SH-NOTIF-0001');
        $notifId = $this->putJson('/api/submissions/SH-NOTIF-0001/status', ['status' => 'VERIFIKASI_ADMIN'])
            ->assertOk()->json('notification.id');

        $this->putJson('/api/notifications/'.$notifId.'/read')
            ->assertOk()
            ->assertJsonPath('isRead', true);

        $this->putJson('/api/notifications/read-all')
            ->assertOk()
            ->assertJsonPath('0.isRead', true);

        $this->deleteJson('/api/notifications')
            ->assertOk()
            ->assertJsonPath('ok', true);

        $this->assertDatabaseCount('notifications', 0);
    }

    public function test_create_requires_id(): void
    {
        $this->postJson('/api/services', ['name' => 'tanpa id'])
            ->assertStatus(422);
    }

    public function test_export_locations_requires_token(): void
    {
        $this->withHeader('Authorization', 'Bearer invalid')
            ->getJson('/api/export/locations/kml')
            ->assertStatus(401);
    }

    public function test_export_locations_csv_and_kml(): void
    {
        $csv = $this->get('/api/export/locations/csv')->getContent();
        $this->assertStringStartsWith("\xEF\xBB\xBF", $csv);
        $this->assertStringContainsString('ID,Nama,Kategori,Latitude,Longitude,Alamat,Deskripsi', $csv);
        $this->assertStringContainsString('TPS 3R Siantan Hilir', $csv);

        $kml = $this->get('/api/export/locations/kml')->getContent();
        $this->assertStringContainsString('<kml xmlns="http://www.opengis.net/kml/2.2">', $kml);
        $this->assertSame(12, substr_count($kml, '<Placemark>'));
        $this->assertStringContainsString('<coordinates>109.339500,0.035100,0</coordinates>', $kml);
    }

    public function test_export_locations_kmz_xlsx_shp_are_valid_zips(): void
    {
        foreach ([['kmz', '.kml'], ['xlsx', 'xl/worksheets/sheet1.xml'], ['shp', '.shp']] as [$format, $entry]) {
            $bytes = $this->get('/api/export/locations/'.$format)->getContent();
            $tmp = tempnam(sys_get_temp_dir(), 'exp');
            file_put_contents($tmp, $bytes);
            $zip = new \ZipArchive;
            $this->assertTrue($zip->open($tmp) === true, "$format harus berupa zip yang valid");
            $names = [];
            for ($i = 0; $i < $zip->numFiles; $i++) {
                $names[] = $zip->getNameIndex($i);
            }
            $zip->close();
            unlink($tmp);

            $this->assertNotEmpty(array_filter($names, static fn (string $n): bool => str_contains($n, $entry)), "$format harus berisi $entry");
        }

        // Validasi struktur biner SHP: header ajaib 9994, jumlah record di DBF, PRJ WGS84.
        $bytes = $this->get('/api/export/locations/shp')->getContent();
        $tmp = tempnam(sys_get_temp_dir(), 'shpx');
        file_put_contents($tmp, $bytes);
        $zip = new \ZipArchive;
        $zip->open($tmp);
        $shp = $zip->getFromName('lokasi-dlh-pontianak-'.date('Y-m-d').'.shp');
        $dbf = $zip->getFromName('lokasi-dlh-pontianak-'.date('Y-m-d').'.dbf');
        $prj = $zip->getFromName('lokasi-dlh-pontianak-'.date('Y-m-d').'.prj');
        $zip->close();
        unlink($tmp);

        $this->assertSame(9994, unpack('N', substr($shp, 0, 4))[1], 'magic SHP');
        $this->assertSame(1, unpack('V', substr($shp, 32, 4))[1], 'shape type point');
        $this->assertSame(12, unpack('V', substr($dbf, 4, 4))[1], 'jumlah record DBF');
        $this->assertStringContainsString('GCS_WGS_1984', $prj);
    }

    public function test_export_locations_respects_ids_filter(): void
    {
        $kml = $this->get('/api/export/locations/kml?ids=loc-tps-01,loc-bs-01')->getContent();
        $this->assertSame(2, substr_count($kml, '<Placemark>'));
        $this->assertStringContainsString('TPS 3R Siantan Hilir', $kml);
        $this->assertStringNotContainsString('TPS Pasar Dahlia', $kml);
    }

    public function test_export_locations_invalid_format_404(): void
    {
        $this->getJson('/api/export/locations/evil')->assertStatus(404);
    }

    public function test_bootstrap_includes_reply_templates(): void
    {
        $resp = $this->getJson('/api/bootstrap');

        $resp->assertOk()->assertJsonCount(14, 'replyTemplates');
        $this->assertSame('DIAJUKAN', $resp->json('replyTemplates.0.status'));
        $this->assertStringContainsString('tindaklanjuti', mb_strtolower($resp->json('replyTemplates.0.text')));
    }

    public function test_return_status_marks_verification_step(): void
    {
        $this->createSubmission('SH-2026-09255');
        $this->putJson('/api/submissions/SH-2026-09255/status', [
            'status' => 'DIKEMBALIKAN',
            'adminNote' => 'Lampiran KTP kurang jelas, mohon perbaiki',
        ])->assertOk()
            ->assertJsonPath('submission.status', 'DIKEMBALIKAN')
            ->assertJsonPath('submission.timeline.1.title', 'Dikembalikan ke Pemohon')
            ->assertJsonPath('submission.timeline.1.description', 'Lampiran KTP kurang jelas, mohon perbaiki')
            ->assertJsonPath('submission.timeline.1.notes', 'Lampiran KTP kurang jelas, mohon perbaiki')
            ->assertJsonPath('submission.timeline.1.isCompleted', true)
            ->assertJsonPath('notification.message', 'Lampiran KTP kurang jelas, mohon perbaiki');
    }

    public function test_reply_template_crud(): void
    {
        $this->postJson('/api/reply-templates', [
            'label' => 'Uji Template',
            'status' => 'SURVEY_TEKNIS',
            'text' => 'Jadwal survei akan dihubungi.',
        ])->assertStatus(201)->assertJsonPath('label', 'Uji Template');

        $this->assertDatabaseHas('reply_templates', ['label' => 'Uji Template']);
        $tpl = \App\Models\ReplyTemplate::where('label', 'Uji Template')->first();

        $this->putJson('/api/reply-templates/'.$tpl->id, [
            'label' => 'Uji Template v2',
            'status' => 'SURVEY_TEKNIS',
            'text' => 'Jadwal berubah.',
        ])->assertOk()->assertJsonPath('text', 'Jadwal berubah.');

        $this->deleteJson('/api/reply-templates/'.$tpl->id)->assertOk()->assertJsonPath('ok', true);
        $this->assertDatabaseMissing('reply_templates', ['id' => $tpl->id]);
    }

    public function test_reply_template_requires_valid_status(): void
    {
        $this->postJson('/api/reply-templates', [
            'label' => 'X',
            'status' => 'HACKED',
            'text' => 'Teks',
        ])->assertStatus(422);
    }

    public function test_upload_store_and_download(): void
    {
        $path = tempnam(sys_get_temp_dir(), 'upl').'.pdf';
        file_put_contents($path, "%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\n%%EOF");

        $resp = $this->post('/api/uploads', ['file' => new \Illuminate\Http\UploadedFile($path, 'ktp-uji.pdf', 'application/pdf', null, true)])
            ->assertStatus(201);
        $id = $resp->json('id');
        $this->assertSame('ktp-uji.pdf', $resp->json('name'));

        $this->assertNotEmpty(Storage::disk('local')->files('uploads'));

        // Unduh tanpa token → 401; dengan token → 200 berisi isi berkas.
        $this->withHeader('Authorization', 'Bearer invalid')
            ->getJson('/api/uploads/'.$id)->assertStatus(401);

        $this->withHeader('Authorization', 'Bearer '.$this->adminToken);
        $this->get('/api/uploads/'.$id)->assertOk();

        // Isi berkas tersimpan utuh di disk.
        $stored = collect(Storage::disk('local')->files('uploads'))->first(fn (string $f): bool => str_starts_with(basename($f), $id.'.'));
        $this->assertSame("%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\n%%EOF", file_get_contents(Storage::disk('local')->path($stored)));

        Storage::disk('local')->delete($stored);
        @unlink($path);
    }

    public function test_upload_rejects_invalid_file(): void
    {
        $path = tempnam(sys_get_temp_dir(), 'upl').'.exe';
        file_put_contents($path, 'x');

        $this->post('/api/uploads', ['file' => new \Illuminate\Http\UploadedFile($path, 'jahat.exe', 'application/octet-stream', null, true)])
            ->assertStatus(422);

        @unlink($path);
    }

    public function test_deleting_submission_removes_upload_file(): void
    {
        $path = tempnam(sys_get_temp_dir(), 'upl').'.png';
        file_put_contents($path, "\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01");
        $meta = $this->post('/api/uploads', ['file' => new \Illuminate\Http\UploadedFile($path, 'lampiran.png', 'image/png', null, true)])
            ->assertStatus(201)->json();

        $this->createSubmission('SH-UPL-0001', ['nama_pemohon' => 'X', 'lampiran' => ['id' => $meta['id'], 'name' => 'lampiran.png', 'size' => 3, 'type' => 'image/png']]);
        $this->assertNotEmpty(Storage::disk('local')->files('uploads'));

        $this->deleteJson('/api/submissions/SH-UPL-0001')->assertOk();

        $this->assertEmpty(Storage::disk('local')->files('uploads'));
        @unlink($path);
    }

    public function test_dlh_feed_parser_extracts_berita(): void
    {
        $service = new \App\Services\DlhFeed;
        $html = '
            <img src="/assets/upload/posting/post-1.jpeg" alt="">
            <div class="product-content">
                <h5><a href="https://dlh.pontianak.go.id/beritadetail/177">Judul Berita DLH</a></h5>
                <p><i class="far fa-calendar"></i>2026-07-22</p>
            </div>
        ';

        $items = $service->parse($html);

        $this->assertCount(1, $items);
        $this->assertSame('Judul Berita DLH', $items[0]['title']);
        $this->assertSame('2026-07-22', $items[0]['date']);
        $this->assertSame('https://dlh.pontianak.go.id/assets/upload/posting/post-1.jpeg', $items[0]['image']);
    }

    public function test_empty_string_fields_are_accepted(): void
    {
        $this->postJson('/api/locations', [
            'id' => 'loc-empty-1',
            'name' => 'Lokasi Tanpa Deskripsi',
            'category' => 'TPS & TPA',
            'lat' => 0.01,
            'lng' => 109.34,
            'address' => 'Alamat',
            'description' => '',
            'iconName' => 'MapPin',
            'color' => '#000',
            'createdAt' => '2026-08-02 10:00',
            'updatedAt' => '2026-08-02 10:00',
        ])->assertOk()->assertJsonPath('description', '');

        $this->assertDatabaseHas('locations', ['id' => 'loc-empty-1']);
    }
}
