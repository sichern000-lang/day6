import { useMemo } from 'react'
import { rng } from '../lib/rng'

// 랜딩 장식: 초록 색연필 낙서 (코드로 그린 SVG)

// 초록 색연필 낙서: burst(방사형 짧은 선) · hatch(비스듬한 빗금) · grass(휘어진 풀결)
export function Scribble({ kind = 'burst', seed = kind, className = '' }) {
  const paths = useMemo(() => {
    const r = rng(`scribble-${seed}`)
    const out = []
    if (kind === 'burst') {
      for (let i = 0; i < 30; i++) {
        const a = (i / 30) * Math.PI * 2 + (r() - 0.5) * 0.18, r0 = 22 + r() * 24, r1 = r0 + 26 + r() * 52
        out.push(`M${(100 + Math.cos(a) * r0).toFixed(1)} ${(100 + Math.sin(a) * r0).toFixed(1)} L${(100 + Math.cos(a) * r1).toFixed(1)} ${(100 + Math.sin(a) * r1).toFixed(1)}`)
      }
    } else if (kind === 'hatch') {
      for (let i = 0; i < 26; i++) {
        const x = 20 + i * 6 + (r() - 0.5) * 6, y = 170 - r() * 30, len = 70 + r() * 80
        out.push(`M${x.toFixed(1)} ${y.toFixed(1)} Q${(x + 18).toFixed(1)} ${(y - len * 0.5).toFixed(1)} ${(x + 40 + r() * 20).toFixed(1)} ${(y - len).toFixed(1)}`)
      }
    } else {
      for (let i = 0; i < 16; i++) {
        const y = 24 + i * 10 + (r() - 0.5) * 6
        out.push(`M${(r() * 12).toFixed(1)} ${y.toFixed(1)} Q${(70 + r() * 30).toFixed(1)} ${(y - 18 - r() * 14).toFixed(1)} ${(150 + r() * 30).toFixed(1)} ${(y - 6 + r() * 8).toFixed(1)}`)
      }
    }
    return out
  }, [kind, seed])
  return (
    <svg className={`scribble ${className}`} viewBox="0 0 200 200" aria-hidden="true">
      <filter id={`sc-${seed}`}><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4" result="g" /><feColorMatrix in="g" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  3.2 0 0 0 -0.5" result="m" /><feComposite in="SourceGraphic" in2="m" operator="in" /></filter>
      <g filter={`url(#sc-${seed})`} fill="none" strokeLinecap="round" strokeWidth="3.4">{paths.map((d, i) => <path key={i} d={d} />)}</g>
    </svg>
  )
}
