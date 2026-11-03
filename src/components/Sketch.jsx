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
  // 휘감아 오르는 결 — 나란한 곡선 다발 (이야기마다 휘어지는 방향·높이가 달라짐)
  flow(r) {
    const out = []
    const flip = r() < 0.5 ? -1 : 1            // 좌우 반전
    const lift = 70 + r() * 70                 // 올라가는 높이
    const sway = 20 + r() * 60                 // 휘어지는 정도
    const n = 11 + Math.floor(r() * 7)
    const X = (x) => (flip > 0 ? x : 200 - x)
    for (let i = 0; i < n; i++) {
      const o = i * (8 + r() * 3) + r() * 4
      const y0 = 176 - r() * 8
      out.push(`M${f(X(18 + o * 0.45))} ${f(y0)} C${f(X(30 + o + sway * 0.3))} ${f(y0 - lift * 0.45)} ${f(X(80 + o * 0.5 + sway))} ${f(y0 - lift * 0.8 + o * 0.2)} ${f(X(130 + o * 0.35 + sway * 0.4))} ${f(y0 - lift - 20 + o * 0.5 + r() * 8)}`)
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

// 이야기마다 직접 그린 스케치 (seed = 이야기 id). 획은 { d, w(굵기) } — 윤곽은 굵게, 결은 가늘게
const poly = (pts) => (y) => {                                  // 다각형을 가로로 가르는 선 위의 구간들 [[x0, x1], ...]
  const xs = []
  for (let i = 0; i < pts.length; i++) {
    const [ax, ay] = pts[i], [bx, by] = pts[(i + 1) % pts.length]
    if ((ay <= y && by > y) || (by <= y && ay > y)) xs.push(ax + ((y - ay) / (by - ay)) * (bx - ax))
  }
  xs.sort((a, b) => a - b)
  const out = []; for (let i = 0; i + 1 < xs.length; i += 2) out.push([xs[i], xs[i + 1]])
  return out
}
const CUSTOM = {
  // 용두암 — 바다와 파도를 상징하는 추상 그림: 겹겹이 출렁이는 물결 줄과, 위쪽에서 말려 올라가는 큰 물결 한 줄기
  yongduam(r) {
    const out = []
    // 물결 한 줄: 시작 x, 높이 y, 길이, 물결 크기(진폭), 한 물결의 너비
    const wave = (x, y, len, amp, wl) => {
      let d = `M${f(x)} ${f(y)}`
      const n = Math.max(2, Math.round(len / (wl / 2)))
      for (let i = 0; i < n; i++) d += i === 0 ? ` q${f(wl / 4)} ${f(-amp)} ${f(wl / 2)} 0` : ` t${f(wl / 2)} 0`
      return d
    }
    for (let row = 0; row < 8; row++) {
      const y = 70 + row * 15, amp = 5.5 + r() * 3.5, wl = 30 + r() * 16
      let x = 14 + r() * 26
      const pieces = 1 + Math.floor(r() * 2)
      for (let k = 0; k < pieces; k++) {
        const len = pieces === 1 ? 150 + r() * 20 : 60 + r() * 50
        out.push({ d: wave(x, y + r() * 3, len, amp, wl), w: 2.2 + (row % 3) * 0.55 })
        x += len + 8 + r() * 14
        if (x > 170) break
      }
    }
    // 위에서 말려 올라가는 큰 물결 (소용돌이 모양의 파도 머리)
    out.push({ d: 'M26 66 C48 66 70 52 92 40 C110 30 132 28 146 38 C158 47 156 62 142 64 C130 66 122 56 130 50 C136 46 143 49 142 54', w: 3.8 })
    out.push({ d: 'M44 58 C66 56 84 46 102 38', w: 2.4 })
    for (const [x, y, dx, dy] of [[150, 30, 4, -6], [158, 36, 6, -4], [140, 24, 1, -7], [164, 46, 7, -1]]) out.push({ d: `M${x} ${y} l${dx} ${dy}`, w: 2.2 })      // 튀어 오르는 물보라
    for (let i = 0; i < 14; i++) { const x = 18 + r() * 160, y = 82 + r() * 76; out.push({ d: `M${f(x)} ${f(y)} l${f(5 + r() * 9)} ${f(-1.5 - r() * 2)}`, w: 1.5 + r() * 0.8 }) }   // 물방울처럼 흩어진 짧은 획
    return out
  },
}

export default function Sketch({ kind, seed = kind, className = '' }) {
  const id = useId().replace(/:/g, '')
  const pattern = PATTERN[kind] ?? 'ridge'
  const paths = useMemo(() => (CUSTOM[seed] ?? MAKE[pattern])(rng(seed)), [pattern, seed])
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
        {paths.map((p, i) => (typeof p === 'string'
          ? <path key={i} d={p} strokeWidth={base + ((i * 7) % 5) * 0.4} opacity={0.86 + ((i * 3) % 4) * 0.04} />
          : <path key={i} d={p.d} strokeWidth={p.w} opacity={0.9} />))}
      </g>
    </svg>
  )
}
