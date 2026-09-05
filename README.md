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

1. Landing de productoras → `/`
2. Evento público NEÓN → `/eventos/neon`
3. Checkout (Mercado Pago simulado) → `/checkout`
4. Confirmación + QR → `/confirmacion`
5. Panel organizador (crear eventos) → `/organizador`
6. Nuevo evento → `/organizador/nuevo`
7. Check-in en puerta → `/organizador/checkin`
8. Ranking RRPP → `/organizador/rrpp`
9. Super admin → `/admin`

El login no valida credenciales. Las compras y el scanner viven en el cliente (sessionStorage).

## Desarrollo

```bash
npm install
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000).
