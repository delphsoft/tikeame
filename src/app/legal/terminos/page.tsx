import type { Metadata } from "next";
import { LegalLayout } from "../LegalLayout";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Términos y condiciones",
  description: "Términos de uso de Tickeame, ticketera argentina.",
  path: "/legal/terminos",
});

export default function Page() {
  return (
    <LegalLayout title="Términos y condiciones">
      <p>Tickeame es una ticketera. No custodiamos fondos: el cobro se hace vía el procesador de pagos (Mobbex), con split a la cuenta de la productora.</p>
      <p>La entrada es personal y de un solo ingreso. Se invalida al escanearse en la puerta. Podés transferirla hasta 24 hs antes, desde Mis entradas, cuando esa función esté activa.</p>
      <p>El comprador paga el precio publicado, sin cargo de servicio. La comisión de Tickeame (0% las primeras 100 entradas vendidas del organizador, después 2,5%) y el costo de Mobbex se descuentan del cobro de la productora.</p>
      <p>Si el evento se cancela, se reembolsa el 100% del valor de la entrada en los plazos que indique la productora, como mínimo 10 días hábiles.</p>
      <p>Contacto: hola@tickeame.com.ar</p>
    </LegalLayout>
  );
}
