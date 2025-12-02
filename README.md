# SOBAT HIJAU

Portal Digital Dinas Lingkungan Hidup Kota Pontianak untuk permohonan dan pelacakan layanan lingkungan secara real-time.

## Fitur Utama

- **Pelacakan Real-time** - Monitor status permohonan secara transparan dengan sistem real-time
- **Permohonan Online** - Ajukan permohonan layanan lingkungan secara digital
- **Dashboard Admin** - Panel admin untuk mengelola permohonan dan layanan
- **Konfigurasi Layanan** - Admin dapat mengaktifkan/menonaktifkan jenis layanan
- **Statistik Live** - Dashboard statistik yang diperbarui secara real-time

## Teknologi

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Firebase Firestore + Authentication
- **Hosting**: Cloudflare Pages (atau Firebase Hosting)
- **Styling**: Tailwind CSS (via CDN)
- **Icons**: Font Awesome
- **Fonts**: Google Fonts (Poppins, Inter)

## Firebase Setup (Backend)

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add project" and name it "sobat-hijau"
3. Disable Google Analytics (optional)
4. Click "Create project"

### 2. Enable Firestore Database

1. In Firebase Console, go to **Firestore Database**
2. Click "Create database"
3. Choose "Start in **production mode**"
4. Select location (asia-southeast1 - Singapore recommended)
5. Click "Enable"

### 3. Setup Security Rules

1. Go to **Firestore Database** → **Rules** tab
2. Copy content from `firestore.rules` file
3. Paste and click "Publish"

### 4. Enable Authentication

1. Go to **Authentication** → **Sign-in method**
2. Enable "Email/Password"
3. Click "Save"

### 5. Create Admin User

1. Go to **Authentication** → **Users** tab
2. Click "Add user"
3. Enter email: `admin@dlh.pontianak.go.id` (atau email admin Anda)
4. Enter password (min 6 characters)
5. Click "Add user"
6. **Copy the User UID** (you'll need this)

### 6. Add Admin Document

1. Go to **Firestore Database** → **Data** tab
2. Click "+ Start collection"
3. Collection ID: `admins`
4. Document ID: **paste the User UID you copied**
5. Add fields:
   - `email` (string): `admin@dlh.pontianak.go.id`
   - `role` (string): `admin`
   - `name` (string): `Admin DLH Pontianak`
   - `createdAt` (string): `2024-12-02`
6. Click "Save"

### 7. Seed Initial Data

#### Create Services Collection:

1. Click "+ Start collection"
2. Collection ID: `services`
3. Add these documents:

**Document ID:** `izin-lingkungan`
```
{
  id: "izin-lingkungan",
  name: "Permohonan Izin Lingkungan",
  icon: "fa-file-signature",
  enabled: true,
  description: "Ajukan izin lingkungan untuk usaha atau kegiatan baru",
  requiredFields: ["nama", "email", "phone", "nik", "alamat", "catatan"],
  order: 1
}
```

**Document ID:** `pengaduan`
```
{
  id: "pengaduan",
  name: "Pengaduan Lingkungan",
  icon: "fa-triangle-exclamation",
  enabled: true,
  description: "Laporkan gangguan lingkungan dengan bukti",
  requiredFields: ["nama", "email", "phone", "lokasi", "catatan"],
  order: 2
}
```

#### Create Statistics Collection:

**Document ID:** `current`
```
{
  totalRequests: 0,
  totalCompleted: 0,
  activeRequests: 0,
  avgCompletionDays: 0,
  completionRate: 0,
  lastUpdated: "2024-12-02T00:00:00Z"
}
```

#### Create Counters Collection:

**Document ID:** `requests`
```
{
  count: 0,
  year: 2024
}
```

### 8. Get Firebase Configuration

1. Go to **Project Settings** (gear icon)
2. Scroll down to "Your apps"
3. Click "Web" icon (</>) to add web app
4. Register app name: "SOBAT HIJAU Web"
5. **Copy the firebaseConfig object**
6. Open `js/firebase-config.js`
7. Replace the placeholder config with your actual config

```javascript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "sobat-hijau.firebaseapp.com",
  projectId: "sobat-hijau",
  storageBucket: "sobat-hijau.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

---

## Local Testing

1. Open terminal in project directory
2. Run a local server:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Or using Node.js
   npx serve
   ```
3. Open browser: `http://localhost:8000`
4. Test the application:
   - Submit a request from main page
   - Track request using registration number
   - Login to admin panel: `/admin.html`
   - Manage requests and services

---

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
