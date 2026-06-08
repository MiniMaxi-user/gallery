# Paard & Portret — Project Context

## Wat is dit project?
Een webapplicatie voor fotografen om klantgalerijen te beheren en te delen. Klanten ontvangen een link en kunnen hun foto's bekijken en selecteren.

## Stack
- **Next.js 15** (App Router) + **TypeScript**
- **Tailwind CSS** voor styling
- **Vercel Blob** voor foto-opslag (vervangt `/uploads/`)
- **Vercel KV** (Redis) voor data-opslag (vervangt `data.json`)
- **Deployment:** Vercel (automatisch via GitHub)

## Bestandsstructuur
```
/
├── app/
│   ├── layout.tsx            — Root layout
│   ├── page.tsx              — Landingspagina
│   ├── globals.css           — Tailwind + globale stijlen
│   ├── admin/page.tsx        — Fotografenbeheer
│   ├── gallery/[id]/page.tsx — Klantgalerij
│   └── api/
│       ├── auth/route.ts     — POST/DELETE admin sessie
│       ├── shoots/route.ts   — GET alle shoots, POST nieuwe shoot
│       ├── shoots/[id]/route.ts — GET/PUT/DELETE shoot
│       ├── upload/route.ts   — POST foto uploaden naar Blob
│       └── gallery/[id]/route.ts — POST login, PUT selectie opslaan
├── components/
│   ├── admin/                — AdminApp, Dashboard, ShootDetail, etc.
│   └── gallery/              — GalleryApp, Lightbox
└── lib/
    ├── types.ts              — Shared TypeScript interfaces
    ├── data.ts               — Vercel KV data-laag
    └── auth.ts               — Session helpers
```

## Environment variables
Zie `.env.local.example`. Stel in via Vercel dashboard:
- `ADMIN_PASSWORD` — inlogwachtwoord fotograaf
- `ADMIN_SESSION_SECRET` — willekeurige string voor sessie-cookie
- `KV_*` — automatisch na Vercel KV koppeling
- `BLOB_READ_WRITE_TOKEN` — automatisch na Vercel Blob koppeling

## Data migratie
Bestaande shoots uit `data.json` kunnen worden geïmporteerd via de Vercel KV CLI:
```bash
vercel kv set gallery_data "$(cat data.json)"
```
Foto's in `/uploads/` moeten handmatig opnieuw worden geüpload via het admin paneel.

## Lokaal ontwikkelen
```bash
npm install
cp .env.local.example .env.local
# Vul .env.local in met Vercel credentials (vercel env pull .env.local)
npm run dev
```
