import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="flex flex-wrap items-center justify-between gap-4 bg-ink px-6 py-8 md:px-12">
      <div className="flex items-center gap-3">
        <Logo href="/" light size="sm" />
        <span className="text-xs font-semibold text-lilac">© 2026</span>
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-lilac">
        <a href="/legal/terminos" className="font-bold text-muted2">
          Términos
        </a>
        <a href="/legal/privacidad" className="font-bold text-muted2">
          Privacidad
        </a>
        <a href="/legal/arrepentimiento" className="font-bold text-muted2">
          Arrepentimiento
        </a>
        <span>Pagos vía Mercado Pago. Tikeame nunca custodia fondos.</span>
      </div>
    </footer>
  );
}
