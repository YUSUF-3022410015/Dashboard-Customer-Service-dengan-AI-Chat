# Partner AI - Dokumentasi Proyek

## Identitas Proyek

| | |
|---|---|
| **Nama** | Partner AI |
| **Deskripsi** | Chatbot AI temen curhat & belajar |
| **Developer** | Yusuf Dede Yonaldy |
| **Program Studi** | Sistem Informasi - UISI |
| **Final Project** | AI Chatbot for Business & Academic |

---

## Tech Stack

| Komponen | Teknologi |
|----------|-----------|
| Frontend | Next.js 14.2.21 (App Router + TypeScript) |
| UI | Tailwind CSS + shadcn/ui |
| Database | Supabase PostgreSQL |
| Auth | Supabase Auth |
| AI Model | Google Gemini (gemini-3.1-flash-lite) |
| Hosting | Vercel |
| Repository | GitHub |

---

## Fitur Utama

1. **Chat dengan AI** - Ngobrol langsung sama Partner AI
2. **Sidebar History** - Lihat semua percakapan sebelumnya
3. **Multi Conversation** - Buat chat baru, simpan chat lama
4. **Auto Title** -Judul chat otomatis dari pesan pertama
5. **Context Memory** - AI ingat 20 pesan terakhir dalam satu conversation
6. **Responsive** - Tampilan desktop dan mobile (hamburger menu)
7. **Auth** - Login & Register pakai Supabase Auth
8. **Dashboard** - Statistik total pesan, user aktif, pesan hari ini

---

## Database Schema

### Tabel `conversations`
```sql
id           UUID (PK)
user_id      UUID (FK -> auth.users)
title        TEXT
created_at   TIMESTAMPTZ
updated_at   TIMESTAMPTZ
```

### Tabel `chat_messages`
```sql
id              UUID (PK)
user_id         UUID (FK -> auth.users)
conversation_id UUID (FK -> conversations)
role            TEXT ('user' | 'assistant')
content         TEXT
created_at      TIMESTAMPTZ
```

---

## Struktur File

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx         # Halaman login
│   │   ├── register/page.tsx      # Halaman register
│   │   └── layout.tsx             # Auth layout
│   ├── (dashboard)/
│   │   ├── chat/page.tsx          # Halaman chat utama
│   │   ├── dashboard/page.tsx     # Halaman statistik
│   │   ├── layout.tsx             # Dashboard layout + Navbar
│   │   └── layout.tsx
│   ├── api/
│   │   └── chat/route.ts          # API endpoint chat
│   ├── layout.tsx                 # Root layout
│   ├── page.tsx                   # Landing page
│   └── globals.css                # Global styles
├── components/
│   ├── ConversationSidebar.tsx    # Sidebar history chat
│   ├── Navbar.tsx                 # Navigasi atas
│   └── ui/                        # shadcn/ui components
├── lib/
│   ├── auth-context.tsx           # Auth context provider
│   ├── gemini.ts                  # Google Gemini integration
│   ├── supabase.ts                # Client-side Supabase
│   ├── supabase-server.ts         # Server-side Supabase
│   └── utils.ts                   # Utility functions
└── supabase-schema.sql            # Database schema
```

---

## Timeline Pengembangan

### Awal Mula
- Proyek dimulai dengan nama "Yusuf AI"
- Menggunakan Python + Streamlit
- Fokus: Customer service Toko Masyusuf (jualan beras)

### Migrasi ke Next.js
- Dimigrasi ke Next.js + Supabase + TypeScript
- File Python lama (APP.PY, requirements.txt) dihapus

### Bug Fixing (Vercel Deploy)
1. **`next.config.ts` error** - Next.js 14.2.21 tidak support `.ts` config
   - Fix: Rename ke `next.config.mjs`
2. **`supabase-server.ts` cookies error** - Opsi `cookies` tidak kompatibel
   - Fix: Simplify client creation
3. **Gemini model error** - `gemini-2.5-flash-lite` tidak ada
   - Fix: Ganti ke `gemini-1.5-flash`, lalu `gemini-2.0-flash`
4. **Gemini 404 error** - Model tidak ditemukan di API v1beta
   - Fix: Ganti model name
5. **Gemini 429 error** - Kuota free tier habis
   - Fix: Ganti API key / tunggu reset
6. **Supabase 404 error** - Tabel `chat_messages` belum dibuat
   - Fix: Jalankan SQL schema di Supabase

### Rebranding
- Nama diganti dari "Yusuf AI" ke "Partner AI"
- Persona diubah dari customer service toko beras jadi temen curhat & belajar
- AI personality diubah jadi friendly, gaul, bahasa santai

### Fitur Sidebar Chat History
1. Buat tabel `conversations` baru
2. Tambah kolom `conversation_id` di `chat_messages`
3. Buat `ConversationSidebar` component
4. Rewrite chat page dengan sidebar + responsive layout
5. Fix RLS policy - conversation creation dari client side

### Bug Fixing Sidebar
1. **RLS policy block INSERT** - Server client tidak punya auth
   - Fix: Buat conversation dari client side
2. **History chat tidak muncul** - Conversations table belum dibuat
   - Fix: Jalankan SQL yang benar step by step
3. **Mobile layout berantakan** - Sidebar overlap navbar
   - Fix: Responsive layout dengan hamburger menu

### Final Fixes
1. **Duplicate message in AI context** - Pesan dikirim 2x ke Gemini
   - Fix: Load 21 pesan, hapus 1 terakhir
2. **Conversation creation failure** - User message muncul walau gagal
   - Fix: Tunggu conversation terbuat dulu
3. **Dashboard unique user count** - Hitung semua row, bukan unique
   - Fix: Pakai `Set()` untuk count unique user_id

---

## Environment Variables (Vercel)

| Variable | Keterangan |
|----------|------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL project Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key Supabase |
| `GEMINI_API_KEY` | API key Google Gemini AI |

---

## Cara Deploy

1. Push code ke GitHub
2. Hubungkan repo ke Vercel
3. Set environment variables di Vercel
4. Jalankan SQL schema di Supabase SQL Editor
5. Vercel auto-deploy setiap push ke `main`

---

## Known Issues / Catatan

- Gemini API free tier punya quota harian; kalau kena 429, tunggu 24h
- Next.js 14.2.21 tidak support `next.config.ts`
- Server-side Supabase client tidak punya auth session (RLS hanya jalan di client side)
- History AI context terbatas 20 pesan terakhir

---

*Terakhir diperbarui: 13 Juli 2026*
