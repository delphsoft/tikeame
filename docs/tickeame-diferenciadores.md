# Tickeame — Diferenciadores competitivos

_Última actualización: sesión de trabajo sobre modelo de negocio, comisiones y payment rails (septiembre 2026)_

## Contexto: por qué esto importa

El diferenciador de "comisión total baja (2-5%)" no era sostenible: una vez que se descuenta
el costo real de Mercado Pago (~7,85% con tarjeta, acreditación inmediata, descontado del
lado del organizador antes que la comisión de la plataforma), el número real converge a
~12-15% — muy cerca de lo que ya cobra un competidor directo (Tickean) con el mismo
mecanismo de split instantáneo. El diferenciador tuvo que recalibrarse de **precio** a
**transparencia + velocidad + formalidad fiscal + ejecución**.

---

## Diferenciador por organizador (productora)

| | Tickeame | Passline | Ticketek | Tickean |
|---|---|---|---|---|
| Cuándo cobra | Al instante, split automático | Post-evento, 5-10 días hábiles | Post-evento | Al instante |
| Comisión visible | Un solo número, calculado antes de vender | Fragmentada: % + cargo de emisión de QR por ticket | Opaca, no publicada | Un solo número (~15%) |
| Formalidad fiscal | CUIT/razón social/condición IVA desde el alta, factura de comisión con CAE | No exigido de entrada | — | No confirmado |
| Escalonado por volumen | Sí — 9-15% según GMV mensual | No, tarifa fija | — | No conocido |
| Métricas propias | Dashboard con conversión, ticket promedio, ranking por evento | Básico | — | No conocido |
| Soporte | Local, Córdoba/interior, en español real | Call center genérico | Call center genérico | — |

**Contra Passline/Ticketek**: pago instantáneo + comisión transparente.
**Contra Tickean** (mismo mecanismo, comisión similar): escalonado por volumen + formalidad
fiscal desde el día uno.

## Diferenciador por comprador (el que va al evento)

| | Tickeame | Passline | Ticketek |
|---|---|---|---|
| Costo total antes de pagar | Un cargo, visible en el checkout | Cargo de servicio + a veces recargos ocultos | Cargo de servicio alto, poco transparente |
| Elegir cómo pagar | Tarjeta o transferencia, con descuento por transferencia | Solo lo que ofrezca su pasarela | Solo tarjeta/pasarela |
| Entrega de la entrada | QR inmediato al confirmar el pago | Variable | Variable |
| Reventa/transferencia de entrada | A definir — no armado todavía | No | No |

## El diferenciador de fondo (no es de precio)

Tickeame es la única ticketera de esta lista pensada desde el cumplimiento fiscal para
adentro (CUIT, condición IVA, CAE, percepciones) en vez de agregarlo como parche después de
un cruce con ARCA — coherente con el posicionamiento de Juan como "el contador que usa IA
para ayudar a las PyMEs argentinas". Es una ventaja estructural, más difícil de copiar
rápido que ajustar un porcentaje.

---

## Modelo de comisión (referencia técnica)

- Escalonado por GMV mensual del organizador (mes calendario):
  - `<$2M/mes` → 15%
  - `$2M-10M/mes` → 12%
  - `>$10M/mes` → 9%
- Descuento de 8 puntos si el comprador paga por transferencia en vez de tarjeta (piso 4%).
- Implementado en `src/lib/server/pricing.ts` (repo `delphsoft/tickeame`).

## Payment rails evaluados

| Rail | Uso | Comisión | Estado |
|---|---|---|---|
| Mercado Pago | Tarjeta + split OAuth por organizador | 7,85% inmediato / 2,17% a 35 días | Integrado |
| Mobbex | Posible alternativa/competencia directa a MP, tiene producto propio de Split de Pagos | ~4% estimado inmediato (no confirmado) | Consulta enviada — pendiente respuesta. **Hallazgo técnico clave**: su modo "Split de pagos" cobra la comisión de Mobbex al ORIGINANTE (Tickeame), no al vendedor — al revés que MP, que la descuenta del lado del organizador. Si se confirma, el organizador podría recibir el 100% limpio y garantizado. Tienen además "Dev Connect", su equivalente al OAuth de MP para que cada organizador conecte su cuenta. Pendiente: confirmar si el % de Mobbex en modo Split aplica sobre el total de la operación o solo sobre la porción del originante |
| Talo | Transferencia/CVU, complemento (no reemplazo) | 0,8-1%, instantáneo | Evaluado, no integrado — requiere desarrollo a medida |
| MODO / Bezza Pay | — | — | Descartados: no tienen producto de marketplace/split para terceros |
| Pomelo | — | — | Descartado: es infraestructura de emisión de tarjetas (BaaS), no pasarela de checkout |
| Cocos | — | — | Descartado: billetera/bróker para consumidores, no pasarela para comercios |
| qrTicket | Costo fijo por ticket (créditos, $179-299 c/u) en vez de %, comprador sin cargo de servicio | Partner oficial de MP (comisiones reducidas). Usan OAuth igual que nosotros pero SIN marketplace_fee — su ingreso es 100% independiente de la transacción | Investigado a fondo — ver sección de riesgos abajo |
| Fanz | Ticketera **white-label** (no marketplace) — cada productora tiene su propio dominio/marca | 8,26% + IVA fijo para todo volumen, **separado** del costo del procesador (MP/Stripe/dLocal, a elección del organizador, pagado aparte) | Categoría distinta a la nuestra — apunta a organizaciones con audiencia propia (teatros, universidades), no a quien necesita descubribilidad. Tiene Fanz AI (smart pricing, copy, predicción de asistencia) y diseño de tickets personalizados por tipo (Roll digital / Card premium), superpuestos sobre un flyer subido por el organizador |
| Atera | — | — | Descartado: es un helpdesk de IT (ticketing de soporte técnico), no tiene nada que ver con eventos |
| PassEntry | — | — | Descartado: es infraestructura B2B de Apple/Google Wallet (PassKit), no una ticketera — sería un proveedor a integrar, no un competidor |

---

## Riesgo del modelo qrTicket (OAuth sin split) — por qué el nuestro es distinto

Con OAuth y sin `marketplace_fee`, qrTicket nunca toca la plata — su comisión (créditos) se cobra
por adelantado, desacoplada de la transacción. Ventaja para ellos: **cero exposición a
reembolsos** (si hay que devolverle a un comprador, es 100% entre el organizador y su MP, no les
afecta ni un peso). Nuestro modelo con `marketplace_fee` sí tiene esa exposición: un reembolso
revierte automáticamente el split completo, incluida nuestra parte — si el organizador no tiene
saldo suficiente en su cuenta MP en ese momento, podemos terminar debiendo esa porción.
Riesgo a monitorear cuando haya volumen real.

## Arquitectura de fee en dos capas (adoptada, en desarrollo)

Inspirado en qrTicket y Fanz — separar completamente:
1. **Costo del procesador** (recargo pass-through): cubre el costo real de MP, el comprador lo
   paga, el organizador queda intacto. Ya calculado dinámicamente en pricing.ts.
2. **Comisión propia de Tickeame**: el organizador elige entre
   - **% por venta** (default, tramos por GMV mensual — ya implementado)
   - **Plan mensual fijo** (fee fijo, eventos/entradas incluidos) — para organizadores con
     volumen alto y constante a quienes les conviene más un costo predecible que un %.
   Nota: el plan mensual requiere cobro recurrente (MP Suscripciones u equivalente) — no
   construido todavía, solo el modelo de datos y la selección de plan.

## Línea futura: pulido de UX (no urgente, después del core)

- **Apple Wallet / Google Wallet**: gratis de implementar (PassKit / Google Wallet API), pero
  requiere certificados propios (Apple Developer, renovación anual) y días de desarrollo. Qué
  ofrece: entrada en pantalla de bloqueo cerca del venue (geofencing), sensación más profesional.
  Ya lo tiene qrTicket. PassEntry sería la alternativa de pagar en vez de construirlo, pero no
  hace falta a esta escala.
- **Diseño de tickets personalizado por tipo de entrada** (estilo Fanz): el organizador sube un
  flyer/fondo (diseñado en Canva u otra herramienta), el sistema superpone el QR + datos
  dinámicos encima. Distinto diseño posible por tipo de entrada (VIP vs General). Sube bastante
  la percepción de calidad del producto por un esfuerzo de desarrollo moderado.

## Línea futura (grande, requiere decisión estratégica): modo white-label tipo Fanz

Idea evaluada: ofrecer, además del marketplace actual, un modo "marca blanca" (dominio propio,
sin descubribilidad compartida) para organizadores grandes/establecidos que no necesitan
tráfico de la plataforma — el mismo segmento que atiende Fanz (teatros, universidades,
festivales grandes). Sería un producto/tier distinto, no un reemplazo del marketplace. Requiere
arquitectura multi-tenant de dominios (`NEXT_PUBLIC_SITE_URL` dinámico por organizador,
DNS personalizado, certificados TLS por dominio) — escala de esfuerzo considerable. Anotado
para evaluar una vez que el marketplace principal esté validado con organizadores reales;
no arrancar en paralelo con lo que todavía está sin cerrar (Mobbex, Talo, UI pública).

Idea evaluada y validada como diferenciador real, pero **secuenciada para después** de cerrar
el core (venta + cobro + facturación de punta a punta con un organizador real). No competir
en "generar contenido con IA" (commodity, ya lo hacen Canva/Buffer/ChatGPT) — el diferenciador
es usar la data de `orders`/`tickets` en tiempo real, que ninguna herramienta externa tiene:

- Sugerencias de contenido disparadas por ritmo de venta real ("se te están quedando VIP sin
  vender a 5 días del evento", "vendiste el 80% de general en 48hs, abrí segunda tanda")
- Calendario de posteo generado desde la fecha del evento + ritmo histórico de eventos
  similares en la base de Tickeame
- Empaquetar como SaaS aparte (ingreso recurrente, no atado al GMV) — plan con N eventos
  activos/mes incluidos, evento extra a $X. No reemplaza la comisión, la complementa.
- v1: copy + imagen + timing sugerido. v2 (más adelante): auto-posting vía API de Meta/Instagram.
