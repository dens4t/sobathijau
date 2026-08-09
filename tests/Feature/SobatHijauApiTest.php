<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

final class SobatHijauApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();

        $token = $this->postJson('/api/login', [
            'email' => 'densat98@gmail.com',
            'password' => 'deni1998',
        ])->assertOk()->json('token');

        $this->withHeader('Authorization', 'Bearer '.$token);
    }

    public function test_bootstrap_returns_all_seeded_collections(): void
    {
        $response = $this->getJson('/api/bootstrap');

        $response->assertOk()
            ->assertJsonCount(4, 'services')
            ->assertJsonCount(8, 'submissions')
            ->assertJsonCount(2, 'notifications')
            ->assertJsonCount(5, 'activityLogs')
            ->assertJsonCount(12, 'locations')
            ->assertJsonCount(4, 'categories')
            ->assertJsonCount(5, 'networkLinks')
            ->assertJsonCount(3, 'carouselSlides')
            ->assertJsonCount(1, 'siteMetrics')
            ->assertJsonCount(5, 'assistantQuestions')
            ->assertJsonPath('services.0.id', 'aduan-lingkungan')
            ->assertJsonPath('submissions.0.id', 'SH-2026-04981')
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
        $resp = $this->getJson('/api/bootstrap');
        $sppl = collect($resp->json('submissions'))->firstWhere('id', 'SH-2026-04981');

        $this->assertSame('6171**********02', $sppl['formData']['nik']);
        $this->assertStringNotContainsString('2809880002', $sppl['formData']['nik']);

        // Kontak pada aduan ikut ter-mask.
        $aduan = collect($resp->json('submissions'))->firstWhere('id', 'SH-2026-11508');
        $this->assertStringContainsString('*', $aduan['formData']['kontak_pelapor']);
    }

    public function test_admin_endpoint_returns_full_form_data(): void
    {
        $rows = $this->getJson('/api/submissions')->assertOk()->json();
        $sppl = collect($rows)->firstWhere('id', 'SH-2026-04981');

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

        $this->assertDatabaseCount('activity_logs', 6);
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

        $this->assertDatabaseCount('notifications', 3);
    }

    public function test_rejection_marks_verification_step_with_note(): void
    {
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
        $this->assertDatabaseCount('notifications', 2);

        $this->deleteJson('/api/submissions/SH-2026-08123')
            ->assertOk()
            ->assertJsonPath('ok', true);

        $this->assertDatabaseMissing('submissions', ['id' => 'SH-2026-08123']);
        $this->assertDatabaseMissing('notifications', ['submissionId' => 'SH-2026-08123']);
        $this->assertDatabaseCount('notifications', 1); // hanya notif-2 (SH-2026-04981) tersisa
    }

    public function test_notification_read_flow(): void
    {
        $this->putJson('/api/notifications/notif-1/read')
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

        $resp->assertOk()->assertJsonCount(12, 'replyTemplates');
        $this->assertSame('DIAJUKAN', $resp->json('replyTemplates.0.status'));
        $this->assertStringContainsString('tindaklanjuti', mb_strtolower($resp->json('replyTemplates.0.text')));
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
