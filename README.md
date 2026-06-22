# Talking to Tom

Private Chat Application without Phone Numbers

## Features
- SubServer-based isolated chat rooms
- 3-character access codes (2 digits + 1 symbol)
- Group & Private messaging
- Media sharing (images, voice)
- Admin contact management with FAB
- Push notifications via FCM
- Capacitor native build support

## Tech Stack
- React 18 + Vite
- Tailwind CSS
- Framer Motion
- Cloudflare Workers + Durable Objects
- D1 Database + KV Storage + R2
- Firebase Cloud Messaging

## Quick Start
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
```

## Asset Requirements
- Place `icon.png` (512x512) in `public/assets/`
- Place `party-tom.png` in `public/assets/` for Verify Your Age page

## Mandatory Flow
1. Splash Screen (3 seconds, logo only, no text)
2. Verify Your Age page (party Tom background, white overlay, input at bottom, no text)
3. Chat Room (after code verification)

## Assertions
- Link Akses Unik (wildcard subdomain)
- Kode Akses 3 Karakter (2 angka + 1 simbol)
- Kode Manual Bebas
- FAB CRUD Kontak
- DM Antar Kontak
- Fitur Ingat Login
- Isolasi SubServer
- Device Limit (max 3)
- Soft Delete Kontak
- Kompresi Client-Side
- WebSocket Hibernation
- No Polling HTTP
- Session di KV
- Rate Limit di DO
- Signed URL Maksimal 1 Jam
- Mandatory Splash Screen
- Mandatory Verify Your Age
- Gambar Party Tom Asli