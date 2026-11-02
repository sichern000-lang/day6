import { useId, useMemo } from 'react'

// 색연필로 슥슥 그린 듯한 스케치 썸네일 — 이야기 종류마다 다른 획 패턴을 쓰고,
// 같은 seed 면 항상 같은 그림이 나옴 (획 위치는 시드 난수로 생성)
const PATTERN = { 창조신화: 'ridge', 건국신화: 'sprouts', 지형전설: 'flow', 마을전설: 'burst', 당신화: 'branch' }

function rng(seed) {
  let a = [...String(seed)].reduce((h, c) => (Math.imul(h, 31) + c.charCodeAt(0)) | 0, 7) >>> 0
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const f = (n) => n.toFixed(1)
const stroke = (x1, y1, x2, y2, bend = 0) => {
  const mx = (x1 + x2) / 2 + bend, my = (y1 + y2) / 2 - bend
  return `M${f(x1)} ${f(y1)} Q${f(mx)} ${f(my)} ${f(x2)} ${f(y2)}`
}

const MAKE = {
  // 층층이 겹친 산등성이 — 길고 비스듬한 획
  ridge(r) {
    const out = []
    for (let row = 0; row < 8; row++) {
      const y = 38 + row * 19 + r() * 6
      const n = 2 + Math.floor(r() * 3)
      let x = 18 + r() * 30
      for (let i = 0; i < n; i++) {
        const len = 34 + r() * 52
        out.push(stroke(x, y + r() * 5, x + len, y - 4 - r() * 14, r() * 5))
        x += len * (0.5 + r() * 0.5)
      }
    }
    return out
  },
  // 흩어져 돋아나는 새싹 — 짧은 세로 획과 곁가지
  sprouts(r) {
    const out = []
    for (let gy = 0; gy < 5; gy++) for (let gx = 0; gx < 5; gx++) {
      if (r() < 0.2) continue
      const x = 24 + gx * 36 + r() * 14, y = 34 + gy * 34 + r() * 12
      const h = 14 + r() * 18
      out.push(stroke(x, y + h, x + (r() - 0.5) * 6, y, (r() - 0.5) * 4))
      if (r() < 0.6) out.push(stroke(x, y + h * 0.5, x + 7 + r() * 5, y + h * 0.2))
    }
    return out
  },
  // 휘감아 오르는 결 — 나란한 곡선 다발
  flow(r) {
    const out = []
    for (let i = 0; i < 15; i++) {
      const o = i * 9 + r() * 4
      out.push(`M${f(20 + o * 0.4)} ${f(172 - r() * 6)} C${f(34 + o)} ${f(130 - o * 0.2)} ${f(90 + o * 0.5)} ${f(100 - o * 0.5)} ${f(150 + o * 0.3)} ${f(34 + o * 0.6 + r() * 8)}`)
    }
    return out
  },
  // 사방으로 퍼지는 빛살
  burst(r) {
    const out = []
    const n = 26
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + (r() - 0.5) * 0.2
      const r0 = 16 + r() * 18, r1 = r0 + 24 + r() * 42
      out.push(stroke(100 + Math.cos(a) * r0, 100 + Math.sin(a) * r0, 100 + Math.cos(a) * r1, 100 + Math.sin(a) * r1, (r() - 0.5) * 4))
    }
    return out
  },
  // 곁가지가 뻗은 나뭇가지
  branch(r) {
    const out = []
    const pts = [[44, 176], [70, 140], [96, 108], [126, 78], [158, 46]]
    for (let i = 0; i < pts.length - 1; i++) out.push(stroke(...pts[i], ...pts[i + 1], (r() - 0.5) * 4))
    pts.forEach(([x, y], i) => {
      for (const side of [-1, 1]) {
        if (r() < 0.25) continue
        const len = 26 - i * 3 + r() * 14
        const ang = -Math.PI / 4 + side * (0.55 + r() * 0.5)
        out.push(stroke(x, y, x + Math.cos(ang) * len, y + Math.sin(ang) * len, side * 3))
        if (r() < 0.5) out.push(stroke(x + Math.cos(ang) * len * 0.5, y + Math.sin(ang) * len * 0.5, x + Math.cos(ang + side * 0.5) * len * 0.9, y + Math.sin(ang + side * 0.5) * len * 0.9))
      }
    })
    return out
  },
}

export default function Sketch({ kind, seed = kind, className = '' }) {
  const id = useId().replace(/:/g, '')
  const pattern = PATTERN[kind] ?? 'ridge'
  const paths = useMemo(() => MAKE[pattern](rng(seed)), [pattern, seed])
  const base = pattern === 'flow' ? 1.7 : pattern === 'burst' ? 2.6 : 3.2 // 촘촘한 패턴은 획을 가늘게
  return (
    <svg className={`sketch ${className}`} viewBox="0 0 200 200" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      <defs>
        {/* 선이 살짝 일렁이고 종이 결 때문에 군데군데 끊기는 색연필 질감 */}
        <filter id={`${id}-c`} x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="3" result="warp" />
          <feDisplacementMap in="SourceGraphic" in2="warp" scale="2.4" result="rough" />
          <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="3" seed="8" result="grain" />
          <feColorMatrix in="grain" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  4 0 0 0 -0.85" result="mask" />
          <feComposite in="rough" in2="mask" operator="in" />
        </filter>
      </defs>
      <g filter={`url(#${id}-c)`} fill="none" stroke="currentColor" strokeLinecap="round">
        {paths.map((d, i) => <path key={i} d={d} strokeWidth={base + ((i * 7) % 5) * 0.4} opacity={0.86 + ((i * 3) % 4) * 0.04} />)}
      </g>
    </svg>
  )
}
