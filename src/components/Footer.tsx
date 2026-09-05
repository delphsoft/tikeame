import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="flex flex-wrap items-center justify-between gap-4 bg-ink px-6 py-8 md:px-12">
      <div className="flex items-center gap-3">
        <Logo href="/" light size="sm" />
        <span className="text-xs font-semibold text-lilac">© 2026</span>
      </div>
      <p className="text-xs text-lilac">
        Pagos vía Mercado Pago Marketplace. Tikeame nunca custodia fondos.
      </p>
    </footer>
  );
}
