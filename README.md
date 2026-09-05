# Tikeame

Ticketera argentina. La plata de tus entradas, en tu cuenta al toque.

Split automático por Mercado Pago Marketplace — Tikeame nunca custodia fondos.

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

El login no valida credenciales. Las compras y el scanner viven en el cliente (sessionStorage).

SEO: las páginas públicas (`/`, `/organizadores`, `/eventos/*`) tienen title, description, canonical, Open Graph y JSON-LD. Paneles, checkout y `/fondos` van con `noindex`.

## Backend (lo que falta para cobrar en serio)

Checkout pega a `/api/checkout`. Si hay `MP_ACCESS_TOKEN`, redirige a Mercado Pago Checkout Pro y el webhook `/api/mp/webhook` emite los QR. Si no hay token, confirma en **demo** (útil para probar check-in y entradas).

En Vercel / `.env.local`:

```
MP_ACCESS_TOKEN=APP_USR-…   # o TEST-… para sandbox
MP_WEBHOOK_URL=https://tikeame.com.ar/api/mp/webhook
RESEND_API_KEY=re_…         # mail de entradas
RESEND_FROM=Tikeame <hola@tikeame.com.ar>
SESSION_SECRET=cambia-esto
```

Usuarios demo: `hola@tikeame.com.ar`, `organizador@tikeame.com.ar`, `admin@tikeame.com.ar` / `tikeame`.

El check-in (`/organizador/checkin`) valida el ID del QR en el servidor y lo quema. En serverless de Vercel el JSON vive en `/tmp` (se pierde al frío): para persistir de verdad, conectá Supabase con `supabase/schema.sql`.

## Desarrollo

```bash
npm install
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000).
