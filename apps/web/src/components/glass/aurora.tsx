/** Slow-drifting mesh-gradient aurora + grain. Pure CSS: static, zero JS. */
export function Aurora() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0" style={{ opacity: "var(--aurora-opacity)" }}>
        <div className="animate-drift-a absolute -left-[10vw] -top-[20vh] size-[60vw] rounded-full bg-violet blur-[120px]" />
        <div className="animate-drift-b absolute -right-[15vw] top-[10vh] size-[50vw] rounded-full bg-iris/80 blur-[140px]" />
        <div className="animate-drift-c absolute bottom-[-25vh] left-[25vw] size-[45vw] rounded-full bg-teal/50 blur-[150px]" />
      </div>
      {/* Vignette to keep content legible */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,var(--canvas)_95%)]" />
      <div className="grain absolute inset-0 mix-blend-overlay" />
    </div>
  );
}
