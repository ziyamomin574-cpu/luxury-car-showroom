export function Loader3D({ progress = 0, label = 'Preparing the stage' }: { progress?: number; label?: string }) {
  const pct = Math.round(Math.min(100, Math.max(0, progress)))
  return (
    <div className="pointer-events-none absolute inset-0 z-10 grid place-items-center bg-bg/55 backdrop-blur-sm">
      <div className="flex w-56 flex-col items-center gap-4" role="status" aria-live="polite">
        <div className="relative h-16 w-16">
          <svg viewBox="0 0 64 64" className="h-full w-full -rotate-90">
            <circle cx="32" cy="32" r="28" fill="none" stroke="var(--muted)" strokeWidth="2" opacity="0.35" />
            <circle
              cx="32"
              cy="32"
              r="28"
              fill="none"
              stroke="var(--highlight)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 28}
              strokeDashoffset={2 * Math.PI * 28 * (1 - (pct || 6) / 100)}
            />
          </svg>
          <span className="absolute inset-0 grid place-items-center text-xs font-medium text-ink">
            {pct}%
          </span>
        </div>
        <p className="label text-center">{label}</p>
      </div>
    </div>
  )
}
