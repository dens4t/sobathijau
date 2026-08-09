# Deployment ke Shared Hosting cPanel

Ya, semua file siap di-hosting di shared hosting cPanel (tanpa Node.js di server —
frontend sudah di-build ke `public/assets` dan di-commit).

## Persyaratan Server
- **PHP 8.2+** (Laravel 12). Pilih lewat **MultiPHP Manager** di cPanel.
- Ekstensi PHP wajib: `pdo_sqlite`/`sqlite3`, `mbstring`, `openssl`, `tokenizer`,
  `xml`/`dom`, `ctype`, `json`, `fileinfo`, `curl`, `zip`, `gd`(opsional).
  Cek lewat **"Select PHP Version"** → tab "Extensions".
  - **Catatan**: `pdo_sqlite` kadang nonaktif di hosting tertentu. Jika tidak ada
    di daftar ekstensi, minta aktivasi ke support hosting, atau ganti ke MySQL
    (ubah `DB_CONNECTION=mysql` + isi kredensial, lalu `php artisan migrate`).
- Composer CLI (beberapa cPanel punya di Terminal; jika tidak, jalankan
  `composer install` via SSH/Terminal cPanel atau composer.phar di root proyek).

## Langkah
1. **Upload kode** (folder ini) ke hosting, misal:
   - Seluruh folder ke `/home/user/sobathijau/` (di luar `public_html`)
   - atau langsung ke `public_html/` (folder itu jadi document root)
2. **Set document root ke `public/`** (disarankan, paling aman):
   - cPanel → **Domains** → pilih domain → **Document Root** → ubah ke
     `<path>/sobathijau/public`
   - Alternatif tanpa ubah document root: upload `.htaccess` berikut di
     `public_html/` (mengarahkan ke folder app):
     ```apache
     RewriteEngine On
     RewriteRule ^(.*)$ /../sobathijau/public/$1 [L]
     ```
3. **Dependensi + environment**:
   ```bash
   composer install --no-dev --optimize-autoloader
   cp .env.example .env        # lalu isi APP_KEY & konfigurasi
   php artisan key:generate
   php artisan migrate --force --seed
   php artisan config:cache && php artisan route:cache
   ```
   - `APP_ENV=production`, `APP_DEBUG=false`, `APP_URL=https://domainanda`
4. **Izin folder** (via File Manager cPanel):
   - `storage/` dan `bootstrap/cache/` → writable (755/775)
   - `database/database.sqlite` → writable oleh user PHP
5. **Selesai** — akses `https://domainanda` dan `/admin/login`.

## Catatan Penting
- **Frontend tidak perlu di-build di server** — `public/assets/*` sudah termasuk
  hasil build (`npm run build` → salin `dist/assets` + `dist/index.html`).
- DB SQLite: satu file `database/database.sqlite`. Cadangkan berkala (download).
  Jika ada banyak pemohon sekaligus, pertimbangkan pindah ke MySQL (lihat atas).
- Update berikutnya: cukup upload ulang file berubah lalu
  `php artisan migrate --force` (perubahan skema) + `php artisan config:clear`.
- Feed berita/Instagram butuh akses internet keluar dari server (biasanya OK
  di cPanel; jika diblokir, feed otomatis menampilkan pesan "tidak dapat dimuat").
# Deployment & pemeliharaan

- Live deploy: git push ke main memicu deploy otomatis (termasuk migrate:fresh + seed — data live di-reset ke baseline seeder tiap deploy).
- Untuk data persisten, perlukan konfigurasi deploy tanpa migrate:fresh.
