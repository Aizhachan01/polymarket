# Supabase Storage Setup

## Membuat Storage Bucket untuk Card Images

Untuk menggunakan fitur upload gambar pada Market Card, Anda perlu membuat storage bucket di Supabase:

### Langkah-langkah:

1. **Buka Supabase Dashboard**
   - Login ke https://supabase.com/dashboard
   - Pilih project Anda

2. **Buka Storage Section**
   - Klik menu "Storage" di sidebar kiri

3. **Buat Bucket Baru**
   - Klik tombol "New bucket"
   - Nama bucket: `card-images`
   - Pilih "Public bucket" (agar gambar bisa diakses secara publik)
   - Klik "Create bucket"

4. **Konfigurasi Bucket (Opsional)**
   - Set file size limit sesuai kebutuhan (default: 50MB)
   - Set allowed MIME types: `image/*` (untuk semua jenis gambar)

### Alternatif: Membuat Bucket via SQL

Jika Anda lebih suka menggunakan SQL, jalankan query berikut di SQL Editor:

```sql
-- Create storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('card-images', 'card-images', true);

-- Set up RLS policies (optional, untuk kontrol akses lebih lanjut)
-- Policy untuk upload (hanya authenticated users)
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'card-images');

-- Policy untuk public read access
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'card-images');
```

### Environment Variables

Pastikan environment variables berikut sudah di-set di file `.env` atau `.env.local`:

```env
VITE_SUPABASE_URL=https://lbndjqzeewbrwxkizkwj.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

Environment variables ini sudah di-hardcode di `src/utils/supabase.js` sebagai fallback, tapi lebih baik menggunakan environment variables untuk production.

### Testing Upload

Setelah bucket dibuat, Anda bisa test upload gambar melalui:
1. Admin Dashboard → Create New Market (upload saat create)
2. Admin Dashboard → Open Markets → Upload/Update Image (upload untuk market yang sudah ada)

### Troubleshooting

**Error: "Bucket not found"**
- Pastikan bucket `card-images` sudah dibuat
- Pastikan nama bucket sesuai (case-sensitive)

**Error: "Permission denied"**
- Pastikan bucket dibuat sebagai public bucket, atau
- Pastikan RLS policies sudah di-set dengan benar

**Error: "File too large"**
- Default limit adalah 50MB, sesuaikan di bucket settings jika perlu
- Atau kompres gambar sebelum upload (max 5MB direkomendasikan)
