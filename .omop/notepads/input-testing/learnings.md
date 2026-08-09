
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
## 2026-08-09 Input testing + DB data audit
- FINDINGS (input tests, in-process HTTP kernel harness):
  - SQLi: none — Eloquent parameterizes; payloads stored as literal strings
  - HIGH mass assignment: public POST /api/submissions accepted attacker `status=SELESAI`/`timeline` (forged approved records) — FIXED: store() whitelist, server forces status=DIAJUKAN + Timeline::build()
  - MEDIUM: PUT /submissions/{id}/status arbitrary status → 500 ErrorException (Undefined array key STATUS_LABELS) — FIXED: Rule::in + abort_unless → 422
  - OK: login throttle 429 after 5; auth.token 401 on all protected routes
  - LOW: category `description` rendered via dangerouslySetInnerHTML (admin-only write); submission formData not HTML-rendered
- DUMMY DATA → DB:
  - assistant_questions table (migration 2026_08_09_000001) + AssistantQuestion model + seeder faq-1..5 (updateOrCreate, idempotent)
  - AssistantController questions()/answer() now query DB; bootstrap.assistantQuestions DB-backed
  - Deleted dead src/data/* (defaultServices/Locations/Categories.ts — imported nowhere)
- CONCURRENT-SESSION NOTE: another session added ReplyTemplate/DIKEMBALIKAN features + ran migrate:fresh (deleted 4 submissions; restored via seeder reflection). phpunit uses :memory: (safe). api_tokens has test residue (~78) — prunes >30d.
- QA harness: /tmp/harness.php (argv offset bug fixed) — in-process HTTP kernel, no server needed (artisan serve flaky in this env).
