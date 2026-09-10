# Tickeame

Ticketera argentina. La plata de tus entradas, en tu cuenta al toque.

Split automático por Mercado Pago Marketplace — Tickeame nunca custodia fondos.

Este repo es el prototipo navegable armado a partir de las pantallas de Tiko (landing, evento NEÓN, checkout, confirmación, panel organizador, check-in y RRPP).

## Stack

- Next.js 16 (App Router) + React 19
- TypeScript
- Tailwind CSS 4
- Tipografía: Anton + Manrope

## Flujo demo

1. Home de quien va al evento → `/`
2. 4 fondos animados del hero → `/fondos`
3. Landing de organizadores → `/organizadores`
4. Evento público NEÓN → `/eventos/neon`
5. Checkout (Mercado Pago simulado) → `/checkout`
6. Confirmación + QR → `/confirmacion`
7. Panel organizador (crear eventos) → `/organizador`
8. Super admin → `/admin`

Login de comprador / organizador / admin. Las órdenes y el check-in van al servidor (Supabase en Vercel).

SEO: las páginas públicas (`/`, `/organizadores`, `/eventos/*`) tienen title, description, canonical, Open Graph y JSON-LD. Paneles, checkout y `/fondos` van con `noindex`.

## Backend (lo que falta para cobrar en serio)

Checkout pega a `/api/checkout`. En **local**, si no hay `MP_ACCESS_TOKEN`, confirma en demo y emite QR. En **Vercel** el demo-pay está apagado: hace falta Mercado Pago + Supabase + `SESSION_SECRET`.

En Vercel / `.env.local`:

```
MP_ACCESS_TOKEN=APP_USR-…   # o TEST-… para sandbox
MP_PUBLIC_KEY=APP_USR-…     # public key Checkout Pro
MP_PUBLIC_URL=https://tickeame.com.ar
MP_WEBHOOK_URL=https://tickeame.com.ar/api/mp/webhook
MP_WEBHOOK_SECRET=          # firma x-signature
RESEND_API_KEY=re_…         # mail de entradas
RESEND_FROM=Tickeame <hola@tickeame.com.ar>
SESSION_SECRET=             # min 16 chars, obligatorio en Vercel
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
BOOTSTRAP_ADMIN_EMAIL=      # ese email, al registrarse, sale admin
```

Corrê `supabase/schema.sql` en el SQL editor del proyecto. RLS on, sin policies para anon.

Usuarios demo **solo en local**: `hola@tickeame.com.ar`, `organizador@tickeame.com.ar`, `admin@tickeame.com.ar` / `tikeame`.

El check-in (`/organizador/checkin`) pide sesión de organizador o admin, valida el ID del QR y lo quema. Las órdenes se ven con la cookie del comprador o el `t` de la URL de confirmación. El QR lo genera Tickeame (`/api/qr/...`), no un tercero. Corrê también `supabase/schema-v2.sql` (eventos + perfil fiscal).

## Desarrollo

```bash
npm install
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000).
