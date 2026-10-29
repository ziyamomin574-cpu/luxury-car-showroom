export type ViewerControlState = {
  viewMode: 'exterior' | 'interior'
  autoRotate: boolean
  onViewMode: (mode: 'exterior' | 'interior') => void
  onReset: () => void
  onZoom: (factor: number) => void
  onFullscreen: () => void
  onAutoRotate: () => void
  className?: string
}

const icon =
  'h-4 w-4 shrink-0'
const btn =
  'grid h-11 min-w-11 place-items-center rounded-full border border-ink/15 px-3 text-xs font-medium transition-colors hover:border-muted hover:bg-ink/10'

function Glyph({ path }: { path: string }) {
  return (
    <svg viewBox="0 0 24 24" className={icon} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d={path} />
    </svg>
  )
}

export function ViewerControls({
  viewMode,
  autoRotate,
  onViewMode,
  onReset,
  onZoom,
  onFullscreen,
  onAutoRotate,
  className = '',
}: ViewerControlState) {
  return (
    <div className={`glass safe-b flex flex-wrap items-center gap-2 p-2 ${className}`}>
      <div className="flex rounded-full border border-ink/15 p-1" role="group" aria-label="View mode">
        {(['exterior', 'interior'] as const).map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => onViewMode(mode)}
            aria-pressed={viewMode === mode}
            className={`min-h-9 rounded-full px-4 text-xs font-medium capitalize tracking-wide transition-colors ${
              viewMode === mode ? 'bg-ink text-bg' : 'text-detail hover:text-ink'
            }`}
          >
            {mode}
          </button>
        ))}
      </div>

      <button type="button" className={btn} onClick={onReset} title="Reset view">
        <Glyph path="M4 12a8 8 0 1 0 2.4-5.7M4 4v4h4" />
        <span className="sr-only">Reset view</span>
      </button>

      <button type="button" className={btn} onClick={() => onZoom(0.78)} title="Zoom in">
        <Glyph path="M12 6v12M6 12h12" />
        <span className="sr-only">Zoom in</span>
      </button>

      <button type="button" className={btn} onClick={() => onZoom(1.28)} title="Zoom out">
        <Glyph path="M6 12h12" />
        <span className="sr-only">Zoom out</span>
      </button>

      <button
        type="button"
        className={btn}
        onClick={onAutoRotate}
        aria-pressed={autoRotate}
        title="Auto-rotate"
      >
        <Glyph path="M21 12a9 9 0 1 1-3-6.7M21 4v5h-5" />
        <span className="sr-only">Toggle auto-rotate</span>
      </button>

      <button type="button" className={btn} onClick={onFullscreen} title="Fullscreen">
        <Glyph path="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
        <span className="sr-only">Toggle fullscreen 3D</span>
      </button>
    </div>
  )
}
