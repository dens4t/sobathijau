
## 2026-08-09 — FAQ ke DB + hardening submission publik
- Migration: `database/migrations/2026_08_09_000001_create_assistant_questions_table.php` (string PK `id`, `question` text, `keywords` json nullable, `answer` text, `sort_order` int default 0).
- Model: `app/Models/AssistantQuestion.php` — konvensi lama: `$incrementing=false`, `$keyType='string'`, `$timestamps=false`, `$guarded=[]`, cast `keywords => array`.
- Seeder: `assistantQuestions()` 5 baris (faq-1..faq-5) di-seed `updateOrCreate` SEBELUM guard `Service::exists()` → selalu terisi idempoten. Teks jawaban byte-identical dari AssistantController lama.
- `AssistantController`: `questions()` = `pluck('question')` orderBy sort_order; `answer()` iterasi semua baris, keyword match pertama menang, fallback default tetap di kode.
- Submission `store()`: whitelist (id/serviceId/serviceName/applicantName/formData/submittedAt) — `status` & `timeline` SELALU dipaksa server (`DIAJUKAN` + `Timeline::build()`), payload attacker diabaikan. Return 201 (bukan 200 dari snippet awal — test `SobatHijauApiTest` menuntut 201; frontend tak cek status code, kontrak aman).
- `Timeline::build(string $date)` mirror `src/lib/timeline.ts createTimeline()`: 5 tahapan, step-0 isCompleted=true, sisanya false updatedAt='-'.
- `updateStatus`: `abort_unless(array_key_exists($status, Timeline::STATUS_LABELS), 422, ...)` setelah validate — defensif; Rule::in sudah menangkap invalid status → 422 (bukan 500).
- Dihapus: `src/data/` (sudah kosong, file default* ts ternyata sudah hilang).
- Verifikasi: `php artisan migrate --force`, `db:seed --force` x2 idempoten, php -r rows=5, test suite 27/27.
