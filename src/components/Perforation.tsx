export function Perforation({ className = "" }: { className?: string }) {
  return (
    <div className={`relative h-0 border-t-[3px] border-dashed border-ink ${className}`}>
      <div className="absolute -top-[10px] -left-[10px] size-5 rounded-full bg-cream" />
      <div className="absolute -top-[10px] -right-[10px] size-5 rounded-full bg-cream" />
    </div>
  );
}
