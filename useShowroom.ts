import { create } from 'zustand'
import type { Vec3 } from '@/data/cars'

export type ViewMode = 'exterior' | 'interior'

type ShowroomState = {
  selectedCarId: string | null
  colors: Record<string, string>
  viewMode: ViewMode
  compare: [string | null, string | null]
  isFullscreen: boolean
  webglSupported: boolean
  autoRotate: boolean
  resetToken: number
  zoomRequest: { factor: number; token: number }
  toast: { id: number; message: string } | null
  setSelectedCar: (id: string | null) => void
  setColor: (carId: string, colorId: string) => void
  setViewMode: (mode: ViewMode) => void
  setCompare: (pair: [string | null, string | null]) => void
  toggleFullscreen: (value?: boolean) => void
  setWebglSupported: (value: boolean) => void
  setAutoRotate: (value: boolean) => void
  resetView: () => void
  requestZoom: (factor: number) => void
  showToast: (message: string) => void
  dismissToast: () => void
}

let toastSeq = 0

export const useShowroom = create<ShowroomState>((set) => ({
  selectedCarId: null,
  colors: {},
  viewMode: 'exterior',
  compare: [null, null],
  isFullscreen: false,
  webglSupported: true,
  autoRotate: true,
  resetToken: 0,
  zoomRequest: { factor: 1, token: 0 },
  toast: null,
  setSelectedCar: (selectedCarId) => set({ selectedCarId }),
  setColor: (carId, colorId) => set((s) => ({ colors: { ...s.colors, [carId]: colorId } })),
  setViewMode: (viewMode) => set({ viewMode }),
  setCompare: (compare) => set({ compare }),
  toggleFullscreen: (value) => set((s) => ({ isFullscreen: value ?? !s.isFullscreen })),
  setWebglSupported: (webglSupported) => set({ webglSupported }),
  setAutoRotate: (autoRotate) => set({ autoRotate }),
  resetView: () => set((s) => ({ resetToken: s.resetToken + 1 })),
  requestZoom: (factor) => set((s) => ({ zoomRequest: { factor, token: s.zoomRequest.token + 1 } })),
  showToast: (message) => set({ toast: { id: ++toastSeq, message } }),
  dismissToast: () => set({ toast: null }),
}))

export function detectWebgl(): boolean {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(
      window.WebGL2RenderingContext && canvas.getContext('webgl2', { failIfMajorPerformanceCaveat: false }),
    )
  } catch {
    return false
  }
}

/** Best available camera preset for a car's interior. */
export function interiorCamOf(pos: Vec3): Vec3 {
  return pos
}
