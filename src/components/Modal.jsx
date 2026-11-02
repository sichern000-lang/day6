import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useT } from '../lib/useT'

// 공용 모달 — 바깥 클릭·Esc 로 닫힘, 열려 있는 동안 뒤 화면 스크롤 잠금, 닫으면 눌렀던 곳으로 포커스 복귀
export default function Modal({ onClose, label, children }) {
  const t = useT()
  const box = useRef(null)

  useEffect(() => {
    const opener = document.activeElement
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    box.current?.focus()
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
      opener?.focus?.()
    }
  }, [onClose])

  return createPortal(
    <div className="modal-back" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={label} tabIndex={-1} ref={box}>
        <button className="modal-x" onClick={onClose} aria-label={t('modal.close')}>
          <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true"><path d="m5 5 10 10M15 5 5 15" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>
        </button>
        {children}
      </div>
    </div>,
    document.body,
  )
}
