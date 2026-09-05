type QtyStepperProps = {
  value: number;
  onInc: () => void;
  onDec: () => void;
  light?: boolean;
};

export function QtyStepper({ value, onInc, onDec, light = false }: QtyStepperProps) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onDec}
        aria-label="Quitar"
        className="flex size-7 items-center justify-center rounded-full border border-border bg-cream text-base font-bold text-ink"
      >
        –
      </button>
      <div
        className={`min-w-[18px] text-center text-sm font-extrabold ${light ? "text-cream" : "text-ink"}`}
      >
        {value}
      </div>
      <button
        type="button"
        onClick={onInc}
        aria-label="Agregar"
        className="flex size-7 items-center justify-center rounded-full bg-coral text-base font-bold text-white"
      >
        +
      </button>
    </div>
  );
}
