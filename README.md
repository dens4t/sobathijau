# SOBAT HIJAU

Portal Digital Dinas Lingkungan Hidup Kota Pontianak untuk permohonan izin, pengaduan, permintaan data, dan konsultasi lingkungan.

## Fitur Utama

- **Permohonan Izin Lingkungan** - Ajukan izin untuk usaha atau kegiatan baru
- **Pengaduan Lingkungan** - Laporkan gangguan lingkungan dengan bukti foto/video
- **Permohonan Data Lingkungan** - Akses data kualitas udara, air, dan dokumen AMDAL
- **Konsultasi Lingkungan** - Jadwalkan konsultasi dengan tim ahli DLH
- **Pelacakan Real-time** - Monitor status permohonan secara transparan

## Teknologi

- HTML5, CSS3, JavaScript (Vanilla)
- Tailwind CSS (via CDN)
- Font Awesome Icons
- Google Fonts (Poppins, Inter)

## Deployment ke Cloudflare Pages

### Metode 1: Git Integration (Recommended)

1. **Push repository ke GitHub** (jika belum):
   ```bash
   git add .
   git commit -m "Setup Cloudflare deployment"
   git push origin main
   ```

2. **Login ke Cloudflare Dashboard**:
   - Buka [dash.cloudflare.com](https://dash.cloudflare.com)
   - Pilih **Pages** dari menu

3. **Create New Project**:
   - Klik **"Create a project"**
   - Pilih **"Connect to Git"**
   - Authorize GitHub dan pilih repository ini

4. **Configure Build Settings**:
   - **Project name**: `sobat-hijau` (atau nama yang diinginkan)
   - **Production branch**: `main`
   - **Build command**: (kosongkan - tidak ada build process)
   - **Build output directory**: `/` (root directory)
   - Klik **"Save and Deploy"**

5. **Tunggu Deployment**:
   - Cloudflare akan otomatis deploy
   - Akses via URL: `https://sobat-hijau.pages.dev` (atau custom domain)

### Metode 2: Wrangler CLI

1. **Install Wrangler**:
   ```bash
   npm install -g wrangler
   ```

2. **Login ke Cloudflare**:
   ```bash
   wrangler login
   ```

3. **Deploy**:
   ```bash
   wrangler pages deploy . --project-name=sobat-hijau
   ```

### Metode 3: Direct Upload

1. Login ke Cloudflare Dashboard
2. Pages → Create a project → Upload assets
3. Drag & drop folder atau pilih files
4. Deploy

## Custom Domain

Setelah deployment berhasil:

1. Di Cloudflare Pages dashboard, pilih project **sobat-hijau**
2. Klik tab **"Custom domains"**
3. Klik **"Set up a custom domain"**
4. Masukkan domain (contoh: `sobathijau.pontianak.go.id`)
5. Ikuti instruksi untuk setup DNS

## Environment & Security

- File `_headers` sudah dikonfigurasi untuk security headers
- Caching strategy sudah dioptimalkan
- HTTPS otomatis enabled oleh Cloudflare

## Local Development

Untuk testing lokal, gunakan simple HTTP server:

```bash
# Python 3
python -m http.server 8000

# Node.js (npx)
npx serve

# PHP
php -S localhost:8000
```

Akses di browser: `http://localhost:8000`

## Preview Deployment

Setiap pull request akan otomatis mendapat preview URL untuk testing sebelum merge ke production.

## Monitoring

- **Analytics**: Cloudflare Pages dashboard → Analytics tab
- **Logs**: Cloudflare Pages dashboard → Functions/Logs
- **Performance**: Lihat Web Vitals di Analytics

## Support

Untuk bantuan teknis deployment:
- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Cloudflare Community](https://community.cloudflare.com/)

---

© 2024 Dinas Lingkungan Hidup Kota Pontianak
