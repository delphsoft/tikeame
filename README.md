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

## Desarrollo

```bash
npm install
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000).
