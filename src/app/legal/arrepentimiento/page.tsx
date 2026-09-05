import type { Metadata } from "next";
import { LegalLayout } from "../LegalLayout";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Derecho de arrepentimiento",
  description: "Devolución de entradas compradas online en Tikeame, ley 24.240.",
  path: "/legal/arrepentimiento",
});

export default function Page() {
  return (
    <LegalLayout title="Derecho de arrepentimiento">
      <p>Si compraste a distancia, podés arrepentirte dentro de los 10 días corridos desde el pago o la recepción de la entrada, lo que ocurra primero (Ley 24.240 art. 34 y Disp. 954/2025).</p>
      <p>El pedido tiene que llegar al menos 24 horas antes del inicio del evento. Fuera de ese plazo, la productora puede rechazarlo.</p>
      <p>La devolución incluye el cargo de servicio. Escribí a hola@tikeame.com.ar con el número de orden.</p>
    </LegalLayout>
  );
}
