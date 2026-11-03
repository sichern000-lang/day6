import { speakKo } from '../lib/speak'
import { useAppStore } from '../store/useAppStore'
import { useT } from '../lib/useT'

// 🔊 한국어 이름을 소리 내어 읽어 줌
export default function SpeakButton({ text, className = '' }) {
  const t = useT()
  const toast = useAppStore((s) => s.toast)
  return (
    <button type="button" className={`speak-btn ${className}`} aria-label={`${t('speak.hear')}: ${text}`} title={t('speak.hear')}
      onClick={(e) => { e.stopPropagation(); if (!speakKo(text)) toast(t('speak.none'), 'warn') }}>
      <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true">
        <path d="M4 10v4h4l5 4V6L8 10H4Z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        <path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    </button>
  )
}
