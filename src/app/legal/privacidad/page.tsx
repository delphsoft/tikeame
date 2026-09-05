import type { Metadata } from "next";
import { LegalLayout } from "../LegalLayout";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Privacidad",
  description: "Cómo Tikeame trata tus datos personales.",
  path: "/legal/privacidad",
});

export default function Page() {
  return (
    <LegalLayout title="Privacidad">
      <p>Tratamos nombre, email, DNI/CUIT y datos de compra para emitir tu entrada y cumplir obligaciones fiscales de la productora.</p>
      <p>La ubicación del dispositivo se usa solo en el browser, para ordenar “próximos eventos” cerca tuyo. No la mandamos a un servidor si no comprás.</p>
      <p>No vendemos padrones. Podés pedir acceso o baja a hola@tikeame.com.ar, según la Ley 25.326.</p>
    </LegalLayout>
  );
}
