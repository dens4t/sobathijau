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
            ->assertJsonPath('services.0.id', 'sppl')
            ->assertJsonPath('submissions.0.id', 'SH-2026-04981')
            ->assertJsonPath('services.0.isCustom', false);
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
}
