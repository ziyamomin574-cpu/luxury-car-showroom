import { useEffect } from 'react'
import { useShowroom } from '@/store/useShowroom'

export function Toast() {
  const toast = useShowroom((s) => s.toast)
  const dismiss = useShowroom((s) => s.dismissToast)

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(dismiss, 5000)
    return () => window.clearTimeout(timer)
  }, [toast, dismiss])

  if (!toast) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className="glass-strong safe-b fixed inset-x-4 bottom-4 z-[60] mx-auto flex max-w-md items-start gap-3 p-4"
    >
      <p className="flex-1 text-sm">{toast.message}</p>
      <button type="button" className="label shrink-0" onClick={dismiss}>
        Dismiss
      </button>
    </div>
  )
}
