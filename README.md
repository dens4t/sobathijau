# Sobat Hijau - DLH Kota Pontianak (Laravel)

Sistem Pelayanan Online Terpadu Dinas Lingkungan Hidup Kota Pontianak.
Backend **Laravel** + frontend **React** (SPA di-serve dari Laravel).

## Stack

- **Backend:** Laravel 12 + SQLite (Eloquent)
- **Frontend:** React 19 + Vite + TypeScript + Tailwind CSS 4 + Zustand + Leaflet
- **API:** REST JSON, kontrak identik dengan versi Express sebelumnya

## Struktur

```
src/                    # Frontend React (source)
  App.tsx               # routing pathname-based
  components/           # UI (AdminPanel, TrackingSobat, FormCreator, dll)
  data/                 # data default (services, submissions, locations, categories)
  lib/                  # API client, timeline utils
  store/                # Zustand store
app/                    # Laravel
  Http/Controllers/Api/ # ResourceController + per-resource controller
  Models/               # Eloquent models (7 tabel)
  Support/Timeline.php  # logika status timeline
database/
  migrations/           # 7 tabel domain + tabel default Laravel
  seeders/              # data dari src/data (TS -> PHP)
routes/
  api.php               # 25 endpoint API
  web.php               # SPA fallback (serve public/app.html)
tests/Feature/          # SobatHijauApiTest (bootstrap, CRUD, status, notifikasi)
```

## Menjalankan

```bash
# 1. Install backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed

# 2. Serve (API + SPA)
php artisan serve   # http://localhost:8000
```

Frontend build (jika mengubah `src/`):

```bash
npm install
npm run build
cp -r dist/assets public/
cp dist/index.html public/app.html
```

## API Endpoints

```
GET  /api/bootstrap          → services, submissions, notifications, activityLogs, locations, categories, networkLinks
POST /api/services           → create service
PUT  /api/services/{id}      → update service
DEL  /api/services/{id}      → delete service
POST /api/submissions        → create submission
PUT  /api/submissions/{id}/status → update status + timeline + notifikasi
DEL  /api/submissions/{id}   → delete submission
PUT  /api/notifications/read-all → tandai semua terbaca
PUT  /api/notifications/{id}/read → tandai satu terbaca
DEL  /api/notifications      → hapus semua notifikasi
GET/POST /api/locations, /api/categories, /api/network-links
PUT/DEL  /api/{resource}/{id}
```

## Test

```bash
php artisan test
```

## Feed Berita & Sosial Media

Beranda menampilkan feed `GET /api/feed` (sumber resmi, cache server-side):

- **Berita DLH** — auto-fetch dari `dlh.pontianak.go.id/berita` (cache 1 jam). Parser di `app/Services/DlhFeed.php`.
- **Instagram @dinaslingkunganhidup_pontianak** — via Meta Graph API (cache 15 menit). Service: `app/Services/InstagramFeed.php`.

### Aktivasi feed Instagram

Instagram tidak bisa di-scrape server-side (diblokir Meta). Jalur resmi = Meta Graph API:

1. Instagram → Setelan → Akun → **Beralih ke Akun Profesional** (kategori Layanan Publik/Kantor Pemerintah).
2. Hubungkan ke **Halaman Facebook** yang dikelola.
3. developers.facebook.com → **Buat Aplikasi** (Business) → tambah produk **Instagram Graph API**.
4. Generate User Token (permission `instagram_basic`, `pages_show_list`); ambil:
   - `META_IG_USER_ID` = ID akun IG bisnis (dari `/me/accounts`)
   - `META_ACCESS_TOKEN` = long-lived token (masa aktif 60 hari)
5. Isi di `.env`:

```bash
META_ACCESS_TOKEN=
META_IG_USER_ID=
```

lalu `php artisan config:clear && php artisan cache:clear`. Feed IG otomatis muncul di beranda.

