# Paard & Portret — Project Context

## Wat is dit project?
Een webapplicatie voor fotografen om klantgalerijen te beheren en te delen. Klanten ontvangen een link en kunnen hun foto's bekijken en selecteren.

## Stack
- **Next.js 15** (App Router) + **TypeScript**
- **Tailwind CSS** voor styling
- **Vercel Blob** voor foto-opslag (vervangt `/uploads/`)
- **Supabase** (Postgres, via Vercel Marketplace) voor data-opslag — tabellen `photographers` en `shoots` (elke shoot heeft een `photographer_id`)
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
    ├── data.ts               — Supabase data-laag
    └── auth.ts               — Session helpers (fotograaf-sessie is HMAC-ondertekend met photographerId, platform-adminsessie is een vast geheim)
```

## Environment variables
Zie `.env.local.example`. Stel in via Vercel dashboard:
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` — inloggegevens **platform admin** (fotografenbeheer), niet van individuele fotografen
- `ADMIN_SESSION_SECRET` — willekeurige string, gebruikt om fotograaf-sessies te ondertekenen (HMAC) en de platform-adminsessie te valideren
- `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` — automatisch na Supabase-koppeling via Vercel Marketplace (service-role key wordt alleen server-side gebruikt, nooit naar de client gestuurd)
- `BLOB_READ_WRITE_TOKEN` — automatisch na Vercel Blob koppeling

Individuele fotografen loggen in met hun eigen e-mail/wachtwoord, opgeslagen in de `photographers`-tabel (aangemaakt door de platform admin).

## Database
Schema (zie ook Supabase SQL Editor van het project):
- `photographers` — id (uuid), name, email (uniek), password, registered_at, is_active
- `shoots` — id, photographer_id (FK, on delete cascade), name, date, client_name, client_email, password, photos (jsonb), cover_photo (text, nullable — omslagfoto van de shoot), albums (jsonb), selections (jsonb), selection_submitted, status

Een fotograaf verwijderen verwijdert automatisch (cascade) al zijn/haar shoots uit de database; de bijbehorende foto's in Vercel Blob worden expliciet in de API-route opgeruimd.

## Lokaal ontwikkelen
```bash
npm install
cp .env.local.example .env.local
# Vul .env.local in met Vercel credentials (vercel env pull .env.local)
npm run dev
```
