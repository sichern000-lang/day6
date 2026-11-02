import { useState } from 'react'
import { useT } from '../lib/useT'

const STAR = 'M10 1.8l2.6 5.6 6.1.8-4.5 4.2 1.2 6.1L10 15.5l-5.4 3 1.2-6.1L1.3 8.2l6.1-.8Z'

// 별점 — onChange 가 있으면 눌러서 고르는 입력, 없으면 보여주기만 함
export default function Stars({ value = 0, onChange, size = 18 }) {
  const t = useT()
  const [hover, setHover] = useState(0)
  const shown = hover || value
  return (
    <span className={`stars ${onChange ? 'input' : ''}`} role={onChange ? 'radiogroup' : 'img'} aria-label={t('review.stars', { n: value })}
      onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((n) => {
        const svg = (
          <svg viewBox="0 0 20 20" width={size} height={size} className={n <= shown ? 'on' : ''} aria-hidden="true"><path d={STAR} /></svg>
        )
        return onChange ? (
          <button key={n} type="button" role="radio" aria-checked={value === n} aria-label={t('review.stars', { n })}
            onMouseEnter={() => setHover(n)} onFocus={() => setHover(n)} onBlur={() => setHover(0)} onClick={() => onChange(n)}>{svg}</button>
        ) : <span key={n}>{svg}</span>
      })}
    </span>
  )
}
