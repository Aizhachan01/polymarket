# Vercel Deployment Guide

## Status
✅ Code sudah di-push ke GitHub: https://github.com/Aizhachan01/polymarket
✅ Frontend sudah di-update untuk menggunakan environment variable `VITE_API_BASE_URL`

## Deployment Steps

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Connect GitHub Repository**
   - Go to https://vercel.com/dashboard
   - Click "Add New Project"
   - Import repository: `Aizhachan01/polymarket`
   - Root Directory: `frontend` (important!)

2. **Configure Build Settings**
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Environment Variables**
   Add this environment variable:
   - **Name**: `VITE_API_BASE_URL`
   - **Value**: `http://localhost:3000/api` (atau URL backend Anda jika sudah di-deploy)
   
   Note: Jika backend juga di-deploy ke Vercel atau platform lain, ganti dengan URL production backend.

4. **Deploy**
   - Click "Deploy"
   - Vercel akan otomatis build dan deploy frontend

### Option 2: Deploy via Vercel CLI

```bash
cd frontend
npm install -g vercel
vercel login
vercel
```

Saat ditanya:
- Set up and deploy? Y
- Which scope? (pilih account/team Anda)
- Link to existing project? N (atau Y jika sudah ada)
- What's your project's name? polymarket-frontend (atau nama yang diinginkan)
- In which directory is your code located? ./
- Want to override the settings? N

Set environment variable:
```bash
vercel env add VITE_API_BASE_URL
# Enter value: http://localhost:3000/api
# Select environments: Production, Preview, Development
```

Deploy:
```bash
vercel --prod
```

## Environment Variables

### Required Variables

- `VITE_API_BASE_URL` - Backend API URL
  - Development: `http://localhost:3000/api`
  - Production: URL backend production (jika sudah di-deploy)

## Important Notes

1. **Root Directory**: Pastikan set root directory ke `frontend` di Vercel settings
2. **Environment Variables**: Harus menggunakan prefix `VITE_` untuk Vite environment variables
3. **Build Output**: Vite akan build ke folder `dist/`
4. **SPA Routing**: `vercel.json` sudah dikonfigurasi untuk handle React Router dengan rewrites

## Post-Deployment

Setelah deploy:
1. Copy deployment URL dari Vercel
2. Jika backend juga perlu di-deploy, deploy backend terlebih dahulu
3. Update `VITE_API_BASE_URL` di Vercel dengan URL backend production
4. Redeploy frontend

## Troubleshooting

- **Build fails**: Pastikan `package.json` dependencies sudah lengkap
- **404 on routes**: Pastikan `vercel.json` rewrites sudah benar
- **API calls fail**: Pastikan `VITE_API_BASE_URL` sudah di-set dan URL benar
- **CORS errors**: Pastikan backend mengizinkan origin dari Vercel URL

