# Deploy ke Vercel via Git Integration

## Langkah-langkah:

1. **Buka Vercel Dashboard**: https://vercel.com/dashboard
2. **Add New Project** → **Import Git Repository**
3. **Pilih repository**: `Aizhachan01/polymarket`
4. **Configure Project**:
   - Framework Preset: **Vite**
   - Root Directory: **frontend** ⚠️ PENTING!
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. **Environment Variables**:
   - Tambahkan: `VITE_API_BASE_URL` = `http://localhost:3000/api`
6. **Deploy**

Setelah project dibuat, setiap push ke GitHub akan auto-deploy!

## Atau via Vercel CLI (sekali saja untuk setup):

```bash
cd frontend
npm install -g vercel
vercel login
vercel link  # Link ke project yang sudah dibuat di dashboard
vercel env add VITE_API_BASE_URL production
# Masukkan value: http://localhost:3000/api
vercel --prod
```

Setelah `vercel link`, folder `.vercel` akan dibuat, dan selanjutnya bisa deploy via MCP.

