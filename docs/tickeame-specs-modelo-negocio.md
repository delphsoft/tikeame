# Tickeame — Specs, Features y Modelo de Negocio

_Consolidado de la sesión de trabajo sobre arquitectura, pagos y modelo de negocio
(septiembre 2026). Repo: `delphsoft/tickeame`. Ver también `tickeame-diferenciadores.md`
para el detalle de investigación competitiva._

---

## 1. Resumen ejecutivo

Tickeame es una ticketera argentina en modelo **marketplace** (no white-label): los eventos
de distintos organizadores conviven en una misma plataforma con descubribilidad compartida,
a diferencia de competidores como Fanz que ofrecen sitios de marca propia sin tráfico
orgánico. El diferenciador no es "somos más baratos" (el costo real converge con la
competencia una vez contado el procesamiento de pagos) — es **pago instantáneo al
organizador + comisión transparente y escalonada + cumplimiento fiscal desde el alta**,
pensado por un contador para productoras PyME argentinas.

---

## 2. Modelo de negocio

### 2.1 Estructura de la transacción

El comprador paga: **precio de la entrada + cargo de servicio**. El cargo de servicio tiene
dos capas completamente separadas (inspirado en cómo lo resuelven qrTicket y Fanz):

**Capa 1 — Costo del procesador (pass-through, siempre se cobra)**
Cubre lo que Mercado Pago descuenta realmente. Como MP se cobra del lado del organizador
antes que cualquier otra comisión, esta capa repone ese costo para que el organizador reciba
el 100% del precio de la entrada:

| Medio de pago | % pass-through |
|---|---|
| Tarjeta | 8,5% |
| Transferencia / dinero en cuenta (dentro de MP) | 2% |

**Capa 2 — Comisión propia de Tickeame (según plan elegido por el organizador)**

- **Plan "% por venta"** (default): escalonado por GMV mensual (mes calendario) de la
  productora —
  - `<$2M/mes` → 15%
  - `$2M-10M/mes` → 12%
  - `>$10M/mes` → 9%
- **Plan "mensual"**: fee fijo de referencia **$45.000 ARS/mes**, hasta **10 eventos**
  incluidos. En este plan la Capa 2 es 0% — el organizador ya pagó por adelantado, el
  comprador solo paga el pass-through del procesador. _Nota: el cobro recurrente de este
  plan (vía Suscripciones de MP o equivalente) todavía no está construido — hoy solo existe
  el modelo de datos y la selección de plan._

Piso mínimo de cargo total: **4%** (protege márgen aunque el organizador esté en el tramo
más bajo y elija transferencia).

### 2.2 Por qué el organizador recibe el 100%

El split se hace vía Mercado Pago Marketplace (OAuth): cada organizador conecta su propia
cuenta de MP, y el cobro se reparte automáticamente al momento de la venta — el organizador
nunca depende de que Tickeame le "liquide" nada, ni Tickeame custodia fondos de terceros (lo
que evita quedar alcanzados como PSP regulado por el BCRA).

### 2.3 Riesgo conocido del modelo actual

Con `marketplace_fee`, un reembolso revierte automáticamente todo el split, incluida la
porción de Tickeame — si el organizador no tiene saldo suficiente en su cuenta de MP en ese
momento, Tickeame puede quedar debiendo esa porción. Mitigación a evaluar: reserva de
garantía por organizador, o migrar a un procesador donde la comisión propia se cobre al
originante en vez de al vendedor (ver Mobbex, sección 5).

### 2.4 Fuentes de ingreso

1. Comisión de intermediación (Capa 2) — variable según plan.
2. (Roadmap) Plan mensual como ingreso recurrente independiente del GMV.
3. (Roadmap) Add-on de marketing con IA — SaaS aparte, no reemplaza la comisión.
4. (Roadmap, decisión estratégica pendiente) Tier white-label para organizadores
   establecidos que no necesitan descubribilidad — mismo segmento que atiende Fanz.

---

## 3. Especificación técnica

### 3.1 Stack

- **Frontend/Backend**: Next.js 16 (App Router) + React 19, TypeScript, Tailwind CSS 4
- **Tipografía**: Anton (display) + Manrope (texto)
- **Base de datos**: Supabase (Postgres), con fallback a store en memoria/archivo para dev
  local sin credenciales
- **Deploy**: Vercel — dominio real `tickeame.com.ar`, subdominio temporal
  `tikeame.vercel.app` mientras se delega el DNS
- **Analytics**: Vercel Analytics + Google Analytics (gtag.js)

### 3.2 Autenticación y roles

- Roles: `buyer`, `organizer`, `admin`
- Auth propia: email + contraseña, sesión firmada (cookie), sin OAuth social
- Registro de organizador exige datos fiscales: **CUIT** (validado con dígito verificador),
  **razón social**, **condición ante IVA**, **domicilio fiscal** — requerido por el régimen de
  percepción de IVA en plataformas digitales (RG 5319/5794)

### 3.3 Modelo de datos (Supabase)

| Tabla | Contenido clave |
|---|---|
| `tikeame_users` | datos de cuenta + fiscales (cuit, razon_social, condicion_iva, domicilio_fiscal) + conexión MP OAuth (mp_user_id, mp_access_token, mp_refresh_token, mp_token_expires_at) + `fee_plan` |
| `tikeame_events` | eventos reales multi-organizador: slug, organizer_id, title, subtitle, date_label, venue, commission_pct, tickets (jsonb), status |
| `tikeame_orders` | payload completo de la orden (items, subtotal, fee, total, status, organizer_id) |
| `tikeame_tickets` | tickets emitidos por orden, con QR y estado (used/unused) |
| `tikeame_scans` | log de escaneos de check-in |

### 3.4 Pagos — Mercado Pago Marketplace (OAuth)

- `mpOAuthAuthorizeUrl` / `mpOAuthExchangeCode` / `mpOAuthRefresh` — flujo OAuth completo,
  con refresco automático de token al momento del checkout si venció
- `createPreference` acepta `sellerAccessToken` (del organizador) y `paymentMethod`
  (restringe el checkout de MP a tarjeta o transferencia vía `excluded_payment_types`)
- Webhook con verificación de firma HMAC antes de confirmar pago
- Catálogo (`catalog.ts`) resuelve primero contra un evento real (Supabase); si no existe,
  cae al catálogo demo estático (sin organizador, sin split real)

### 3.5 Facturación (CAE) — en desarrollo

Scaffold de integración con **FacturaFácil** (`delphsoft/facturafacil-mvp-web`, repo propio
y privado) para emitir la factura de la comisión de Tickeame al organizador. Patrón de auth
en dos pasos documentado, pero el contrato exacto del endpoint de emisión todavía no está
confirmado — no activar en producción hasta confirmarlo.

### 3.6 Gaps de arquitectura conocidos

- La UI pública (`/eventos/[slug]`) y el dashboard de creación de eventos del organizador
  todavía usan un catálogo demo estático + `localStorage`, no están conectados al modelo
  real de `tikeame_events` — el backend ya soporta eventos reales, falta migrar la UI.
- El plan "mensual" no tiene cobro recurrente implementado.
- Sin integración de Talo (transferencia barata, 0,8-1%) ni evaluación cerrada de Mobbex
  como alternativa/complemento a MP (consulta enviada, pendiente respuesta).

---

## 4. Features

### 4.1 Implementadas

- Compra de entradas con checkout propio + Mercado Pago (tarjeta o transferencia)
- Split automático al organizador vía OAuth Marketplace
- Emisión de ticket con QR al confirmar el pago
- Check-in por escaneo de QR (con registro de escaneos)
- Dashboard de organizador: crear eventos, ver eventos, conectar Mercado Pago, ver tramo de
  comisión actual según GMV del mes
- Dashboard de admin: resumen, métricas de negocio (conversión, ticket promedio, check-in
  rate, ranking de eventos por GMV), usuarios, órdenes, tickets
- Registro de organizador con validación fiscal (CUIT, razón social, condición IVA,
  domicilio)
- Comisión escalonada por volumen + descuento por medio de pago

### 4.2 Roadmap (priorizado)

1. **Alto impacto / esfuerzo medio**: terminar de conectar la UI pública y el dashboard de
   creación de eventos al modelo real de `tikeame_events` (hoy es el gap más grande)
2. **Alto impacto / esfuerzo bajo-medio**: confirmar y activar facturación con CAE vía
   FacturaFácil
3. **Medio impacto / esfuerzo medio**: diseño de ticket/QR personalizado por tipo de entrada
   (el organizador sube un flyer, el sistema superpone QR + datos — estilo Fanz)
4. **Medio impacto / esfuerzo medio**: integrar Talo como riel de transferencia barato,
   complementario a MP
5. **A confirmar con datos externos**: evaluar Mobbex como alternativa/complemento a MP —
   su modo "Split de pagos" cobra la comisión al originante (Tickeame) en vez de al
   vendedor, lo que resolvería el riesgo de reembolsos descripto en 2.3
6. **Bajo impacto inmediato, pulido de UX**: Apple Wallet / Google Wallet
7. **Fase siguiente, no en paralelo con lo anterior**: marketing con IA basado en datos de
   venta reales (SaaS add-on, ingreso recurrente separado de la comisión)
8. **Decisión estratégica grande, evaluar después de validar el marketplace**: tier
   white-label tipo Fanz, para organizadores establecidos que no necesitan descubribilidad

---

## 5. Panorama competitivo (resumen — detalle completo en `tickeame-diferenciadores.md`)

| | Modelo | Comisión | Pago al organizador |
|---|---|---|---|
| Passline | Custodio | 6-10% + cargo QR | Post-evento, 5-10 días |
| Ticketek | Custodio | Opaca | Post-evento |
| Tickean | Split instantáneo (MP) | ~15% al comprador | Instantáneo |
| MB Ticket | Split instantáneo (MP) | 5% | Instantáneo |
| eTickets | Multi-procesador | 3% + configurable por organizador | Directo |
| qrTicket | Sin split, OAuth + créditos prepagos | Costo fijo por ticket, 0% al comprador | Directo, sin comisión propia en la transacción |
| Fanz | White-label, multi-procesador | 8,26%+IVA fijo, separado del procesador | Directo |
| **Tickeame** | **Split instantáneo (MP), marketplace** | **9-15% escalonado + pass-through procesador** | **Instantáneo** |
