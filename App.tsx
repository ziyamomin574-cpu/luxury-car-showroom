import { Suspense, lazy } from 'react'
import { Route, Routes } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { Home } from '@/pages/Home'
import { Cars } from '@/pages/Cars'
import { NotFound } from '@/pages/NotFound'

/** 3D pages are split out so the first paint does not carry the three.js bundle. */
const CarDetail = lazy(() => import('@/pages/CarDetail').then((m) => ({ default: m.CarDetail })))
const Showroom = lazy(() => import('@/pages/Showroom').then((m) => ({ default: m.Showroom })))
const Compare = lazy(() => import('@/pages/Compare').then((m) => ({ default: m.Compare })))
const Contact = lazy(() => import('@/pages/Contact').then((m) => ({ default: m.Contact })))
const About = lazy(() => import('@/pages/About').then((m) => ({ default: m.About })))

function PageLoader() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="label">Loading</div>
      <div className="mt-4 h-1 w-40 overflow-hidden rounded-full bg-ink/10">
        <div className="h-full w-1/3 animate-pulse rounded-full bg-ink/60" />
      </div>
    </div>
  )
}

export function App() {
  return (
    <Layout>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cars" element={<Cars />} />
          <Route path="/cars/:slug" element={<CarDetail />} />
          <Route path="/showroom" element={<Showroom />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </Layout>
  )
}
