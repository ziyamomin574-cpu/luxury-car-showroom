import { useEffect, useRef, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { Footer } from './Footer'
import { Navbar } from './Navbar'
import { Toast } from '../Toast'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [pathname])
  return null
}

/** Subtle fade/slide on scroll, disabled when the visitor asks for less motion. */
function RevealObserver({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const nodes = ref.current?.querySelectorAll<HTMLElement>('[data-reveal]') ?? []
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      nodes.forEach((node) => node.classList.add('is-in'))
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in')
            observer.unobserve(entry.target)
          }
        })
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.1 },
    )
    nodes.forEach((node) => observer.observe(node))
    return () => observer.disconnect()
  }, [])

  return <div ref={ref}>{children}</div>
}

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <ScrollToTop />
      <a
        href="#main"
        className="btn sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60]"
      >
        Skip to content
      </a>
      <Navbar />
      <main id="main" className="flex-1 pt-[68px]">
        <RevealObserver>{children}</RevealObserver>
      </main>
      <Footer />
      <Toast />
    </div>
  )
}
