import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-cream px-6 text-center">
      <Logo href="/" />
      <h1 className="font-display text-4xl uppercase">Esta página no existe</h1>
      <p className="max-w-sm text-sm text-muted">
        El tiko se perdió. Volvé al inicio o al evento demo NEÓN.
      </p>
      <div className="flex gap-3">
        <Link href="/" className="rounded bg-coral px-5 py-3 text-sm font-extrabold text-white">
          Inicio
        </Link>
        <Link
          href="/eventos/neon"
          className="rounded border-2 border-ink px-5 py-3 text-sm font-extrabold"
        >
          Ver NEÓN
        </Link>
      </div>
    </div>
  );
}
