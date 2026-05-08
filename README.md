# Aplikasi Pelayanan Publik Desa (Cloud-Ready)

Aplikasi web untuk mengelola pengajuan layanan desa dengan fitur CRUD dan upload file. Backend Express.js siap untuk deployment AWS ECS + RDS + S3.

## Fitur Aplikasi

- **CRUD Pengajuan Layanan**: Buat, baca, update, hapus pengajuan layanan desa
- **Upload Dokumen**: Unggah dokumen PDF atau gambar sebagai lampiran
- **Pencarian**: Cari pengajuan berdasarkan nama, jenis layanan, status, atau deskripsi
- **Status Management**: Update status pengajuan (Menunggu Proses / Selesai)
- **Responsive UI**: Antarmuka web sederhana dan responsif

## Struktur Project

```
/config          # Konfigurasi database
/controllers     # Logika API controller
/routes          # Definisi route API
/services        # Business logic dan service layer
/middlewares     # Middleware Express
/public          # Frontend HTML/CSS/JS
/uploads         # Folder upload file lokal
Dockerfile       # Docker image untuk ECS
docker-compose.yml # Setup lokal dengan MySQL
```

## Instalasi dan Menjalankan

### Opsi 1: Docker Compose (Direkomendasikan)

1. Pastikan Docker dan Docker Compose terinstall.

2. Clone atau buka folder project:
   ```bash
   cd /path/to/Eval2awan
   ```

3. Jalankan aplikasi:
   ```bash
   docker compose up -d
   ```

4. Buka browser:
   ```
   http://localhost:5500
   ```

### Opsi 2: Local Development

1. Pastikan Node.js dan MySQL terinstall.

2. Setup environment:
   ```bash
   cp .env.example .env
   # Edit .env sesuai kebutuhan
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Jalankan MySQL lokal atau gunakan Docker:
   ```bash
   docker run -d --name mysql-local -e MYSQL_ROOT_PASSWORD=rootpassword -e MYSQL_DATABASE=pelayanan_desa -p 3306:3306 mysql:8.0
   ```

5. Jalankan aplikasi:
   ```bash
   npm start
   ```

6. Buka browser:
   ```
   http://localhost:5500
   ```

## Environment Variables

| Variable | Default | Deskripsi |
|----------|---------|-----------|
| PORT | 5500 | Port server Express |
| DB_HOST | mysql | Host MySQL (gunakan 'mysql' untuk Docker Compose) |
| DB_USER | root | Username MySQL |
| DB_PASSWORD | rootpassword | Password MySQL |
| DB_NAME | pelayanan_desa | Nama database |
| MAX_FILE_SIZE | 5242880 | Max file size upload (bytes) |

## API Endpoints

- `GET /api/requests` - Ambil semua pengajuan (dengan query `?q=search`)
- `POST /api/requests` - Buat pengajuan baru (dengan file upload)
- `PUT /api/requests/:id` - Update pengajuan
- `DELETE /api/requests/:id` - Hapus pengajuan
- `GET /health` - Health check

## Deployment ke AWS

### Persiapan

1. **RDS MySQL**: Buat instance RDS MySQL
2. **S3 Bucket**: Buat bucket untuk file upload
3. **ECS Cluster**: Setup ECS cluster
4. **ECR**: Build dan push Docker image ke ECR

### Langkah Deployment

1. Update `.env` dengan RDS dan S3 credentials
2. Build Docker image:
   ```bash
   docker build -t pelayanan-desa .
   ```
3. Push ke ECR
4. Deploy ke ECS dengan task definition
5. Setup CloudFront untuk CDN (opsional)

## Development

- **Backend**: Express.js dengan MySQL
- **Frontend**: Vanilla HTML/CSS/JS
- **Database**: MySQL dengan connection pooling
- **Upload**: Multer untuk file handling (siap S3)
- **Security**: Helmet, CORS, input validation

## Testing

1. Jalankan `docker compose up -d`
2. Akses `http://localhost:5500`
3. Test CRUD operations
4. Test file upload (PDF/gambar)
5. Test health check: `http://localhost:5500/health`

## Troubleshooting

- **Error koneksi MySQL**: Pastikan MySQL running atau `docker compose up -d`
- **Port conflict**: Ubah PORT di .env
- **File upload gagal**: Cek MAX_FILE_SIZE dan tipe file
- **Health check fail**: Pastikan `/health` endpoint accessible

## Lisensi

Project ini untuk tugas komputasi awan.
