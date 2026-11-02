import { useAppStore } from '../store/useAppStore'

export default function Toasts() {
  const toasts = useAppStore((s) => s.toasts)
  return (
    <div className="toasts" aria-live="polite">
      {toasts.map((t) => <div key={t.id} className={`toast ${t.variant}`}>{t.message}</div>)}
    </div>
  )
}
