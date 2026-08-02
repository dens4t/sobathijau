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
            ->assertJsonCount(3, 'submissions')
            ->assertJsonCount(2, 'notifications')
            ->assertJsonCount(5, 'activityLogs')
            ->assertJsonCount(12, 'locations')
            ->assertJsonCount(4, 'categories')
            ->assertJsonCount(5, 'networkLinks')
            ->assertJsonCount(3, 'carouselSlides')
            ->assertJsonCount(1, 'siteMetrics')
            ->assertJsonCount(5, 'assistantQuestions')
            ->assertJsonPath('services.0.id', 'sppl')
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

    public function test_public_submission_store_works_without_token(): void
    {
        $this->postJson('/api/submissions', [
            'id' => 'SH-PUBLIC-1',
            'serviceId' => 'sppl',
            'serviceName' => 'Rekomendasi Dokumen Lingkungan SPPL',
            'applicantName' => 'Test Publik',
            'status' => 'DIAJUKAN',
            'submittedAt' => '2026-08-01 12:00',
            'timeline' => [],
            'formData' => [],
        ])->assertOk()->assertJsonPath('id', 'SH-PUBLIC-1');

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
            ->assertJsonPath('notification.message', 'Status berkas Pengujian Sampah / Air / Udara Laboratorium (SH-2026-08123) diperbarui menjadi [PROSES PENYUSUNAN REKOMENDASI].');

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
