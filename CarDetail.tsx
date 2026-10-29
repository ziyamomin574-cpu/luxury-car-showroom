import { useCallback, useEffect, useRef } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { formatPrice, getCar, nextCar, prevCar, PRICE_DISCLAIMER } from '@/data/cars'
import { useShowroom } from '@/store/useShowroom'
import { CarViewer } from '@/three/CarViewer'
import { CarNav } from '@/components/CarNav'
import { ColorSwatches } from '@/components/ColorSwatches'
import { SpecGrid } from '@/components/SpecGrid'
import { ViewerControls } from '@/components/ViewerControls'
import { NotFound } from './NotFound'

function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false
  return /iP(hone|ad|od)|Mac/.test(navigator.userAgent) && 'ontouchend' in document
}

/** Fullscreen API where supported, CSS 100dvh on iPhone (arch 5.3). */
function useFullscreen(shell: React.RefObject<HTMLDivElement>) {
  const isFullscreen = useShowroom((s) => s.isFullscreen)
  const toggle = useShowroom((s) => s.toggleFullscreen)

  useEffect(() => {
    if (!isFullscreen || isIOS()) return
    const node = shell.current
    if (!node || typeof node.requestFullscreen !== 'function') return
    node.requestFullscreen().catch(() => toggle(false))
  }, [isFullscreen, shell, toggle])

  useEffect(() => {
    const onChange = () => {
      if (!document.fullscreenElement) toggle(false)
    }
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [toggle])

  return { isFullscreen, toggle }
}

export function CarDetail() {
  const { slug = '' } = useParams()
  const [search, setSearch] = useSearchParams()
  const navigate = useNavigate()
  const car = getCar(slug)
  const shell = useRef<HTMLDivElement>(null)
  const { isFullscreen, toggle } = useFullscreen(shell)

  const colors = useShowroom((s) => s.colors)
  const setColor = useShowroom((s) => s.setColor)
  const viewMode = useShowroom((s) => s.viewMode)
  const setViewMode = useShowroom((s) => s.setViewMode)
  const autoRotate = useShowroom((s) => s.autoRotate)
  const setAutoRotate = useShowroom((s) => s.setAutoRotate)
  const resetView = useShowroom((s) => s.resetView)
  const requestZoom = useShowroom((s) => s.requestZoom)
  const direction = useRef(0)

  useEffect(() => {
    if (!car) return
    if (search.get('view') === 'interior') setViewMode('interior')
    const fromUrl = search.get('color')
    if (fromUrl && car.colors.some((c) => c.id === fromUrl)) setColor(car.slug, fromUrl)
  }, [car, search, setColor, setViewMode])

  const onSelectColor = useCallback(
    (id: string) => {
      if (!car) return
      setColor(car.slug, id)
      const next = new URLSearchParams(search)
      next.set('color', id)
      setSearch(next, { replace: true })
    },
    [car, search, setColor, setSearch],
  )

  if (!car) return <NotFound />

  const colorId = colors[car.slug] ?? car.colors[0].id
  const activeColor = car.colors.find((c) => c.id === colorId) ?? car.colors[0]
  const previous = prevCar(car.slug)
  const next = nextCar(car.slug)

  return (
    <div
      ref={shell}
      className={`mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 ${
        isFullscreen ? 'fixed inset-0 z-40 max-w-none bg-bg p-0' : ''
      }`}
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,65fr)_minmax(320px,35fr)]">
        <div className="flex flex-col gap-4">
          <div
            className={
              isFullscreen
                ? 'h-dvh w-full'
                : 'h-[55dvh] min-h-[340px] w-full sm:h-[62dvh] lg:h-[calc(100dvh-7rem)]'
            }
          >
            <CarViewer key={car.slug} car={car} direction={direction.current} />
          </div>

          {!isFullscreen && (
            <>
              <ViewerControls
                className="mx-auto w-full max-w-3xl"
                viewMode={viewMode}
                autoRotate={autoRotate}
                onViewMode={(mode) => {
                  setViewMode(mode)
                  setAutoRotate(false)
                }}
                onReset={resetView}
                onZoom={(factor) => {
                  setAutoRotate(false)
                  requestZoom(factor)
                }}
                onFullscreen={() => toggle()}
                onAutoRotate={() => setAutoRotate(!autoRotate)}
              />
              <CarNav previous={previous} next={next} />
            </>
          )}

          <p className="sr-only" aria-live="polite">
            Viewing {car.brand} {car.name} in {activeColor.label}, {viewMode} view.
          </p>
        </div>

        {!isFullscreen && (
          <aside className="no-scrollbar lg:sticky lg:top-[88px] lg:h-[calc(100dvh-7rem)] lg:overflow-y-auto">
            <div className="glass flex flex-col gap-6 p-5 sm:p-6">
              <header>
                <p className="label">{car.brand}</p>
                <h1 className="mt-1 font-display text-3xl leading-tight sm:text-4xl">{car.name}</h1>
                <p className="mt-1 text-sm text-detail">{car.type}</p>
                <p className="mt-4 text-2xl">{formatPrice(car.price)}</p>
                <p className="mt-1 text-[11px] leading-relaxed text-detail">{PRICE_DISCLAIMER}</p>
              </header>

              <ColorSwatches
                colors={car.colors}
                value={colorId}
                onChange={onSelectColor}
                carLabel={`${car.brand} ${car.name}`}
              />

              <p className="text-sm leading-relaxed text-detail">{car.description}</p>

              <SpecGrid car={car} />

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => navigate(`/contact?car=${car.slug}&color=${colorId}`)}
                >
                  Book test drive
                </button>
                <Link className="btn" to={`/compare?a=${car.slug}`}>
                  Compare
                </Link>
              </div>

              <p className="text-[11px] leading-relaxed text-detail">
                Source: {car.specsSource.url.replace(/^https?:\/\//, '')} · verified{' '}
                {car.specsSource.checkedOn}. Confirm every figure with the manufacturer before purchase.
              </p>
            </div>
          </aside>
        )}
      </div>
    </div>
  )
}
