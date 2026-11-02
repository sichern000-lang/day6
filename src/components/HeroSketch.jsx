import { useLayoutEffect, useMemo, useRef } from 'react'
import { ART, P, Q, hatch, ridge } from './Doodle'
import { rng } from '../lib/rng'

// 히어로: 들판·한라산·말이 연필로 그려지다가(draw), 종이가 걷히며 지금의 사진으로 바뀜(reveal)
// 선이 그려지는 순서 = 아래 JSX 의 순서 (먼 하늘 → 산 → 들판 → 말 → 풀)
const mtY = (x) => 391 + Math.pow(Math.abs(x - 650) / 600, 1.4) * (x < 650 ? 82 : 98)
const farY = (x) => 505 - 18 * Math.sin((x / 1200) * Math.PI * 2.4)

export default function HeroSketch({ phase }) {
  const svg = useRef(null)
  const scene = useMemo(() => {
    const r = rng('hero-scene')
    const grass = Array.from({ length: 70 }, (_, i) => {
      const x = r() * 1200, y = 575 + r() * 115
      return { d: `M${x.toFixed(1)} ${y.toFixed(1)} q-3 -12 -9 -16 M${x.toFixed(1)} ${y.toFixed(1)} q2 -14 6 -19`, green: i % 3 === 0 }
    })
    return {
      slope: ridge(r, mtY, 30, 1180, 15, 44),
      far: ridge(r, farY, 20, 1190, 17, 26),
      grass,
    }
  }, [])

  // 각 선의 길이를 재서 "그려지는" 애니메이션 값(길이·지연·시간)을 정함
  useLayoutEffect(() => {
    const els = [...svg.current.querySelectorAll('path, circle, ellipse')]
    const n = els.length
    els.forEach((el, i) => {
      const delay = Math.pow(i / n, 0.92) * 4.1
      el.style.setProperty('--delay', `${delay.toFixed(2)}s`)
      if (el.tagName === 'path') {
        const len = el.getTotalLength?.() ?? 100
        el.style.setProperty('--len', len)
        el.style.setProperty('--dur', `${Math.min(1.1, 0.25 + len / 900).toFixed(2)}s`)
        el.style.strokeDasharray = len
        el.style.strokeDashoffset = len
        el.classList.add('ink')
      } else el.classList.add('pop')
    })
  }, [])

  return (
    <div className={`hero-sketch ${phase}`} aria-hidden="true">
      <div className="hs-paper paper" />
      <svg ref={svg} viewBox="0 0 1200 700" preserveAspectRatio="xMidYMax slice">
        <defs>
          <filter id="hs-pencil" x="-2%" y="-2%" width="104%" height="104%">
            <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="2" seed="4" result="warp" />
            <feDisplacementMap in="SourceGraphic" in2="warp" scale="4" result="rough" />
            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" seed="9" result="grain" />
            <feColorMatrix in="grain" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  3.4 0 0 0 -0.6" result="mask" />
            <feComposite in="rough" in2="mask" operator="in" />
          </filter>
        </defs>
        <g className="doodle" filter="url(#hs-pencil)" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
          {/* 구름 */}
          <P d="M150 150 c18 -34 70 -34 92 -6 c30 -16 62 6 46 32 H168 c-24 0 -34 -14 -18 -26 z" w={3} className="c-grey" />
          <P d="M840 110 c14 -26 54 -26 70 -4 c24 -12 48 4 36 24 H852 c-18 0 -26 -10 -12 -20 z" w={3} className="c-grey" />
          {/* 한라산: 둥근 능선, 정상의 눈, 비탈의 결 */}
          <P d="M-20 470 C200 452 420 418 560 398 C610 391 680 389 730 394 C860 408 1040 450 1240 486" w={4} />
          <P d="M560 405 L596 417 L620 399 L650 419 L676 397 L706 415 L738 401" w={3} />
          <P d="M580 396 C620 386 700 386 752 400" w={3} />
          {scene.slope.map((d, i) => <P key={'s' + i} d={d} w={2.4} />)}
          {/* 먼 들판 */}
          <P d="M-20 520 C200 480 420 500 640 470 C860 440 1040 470 1240 490" w={3.6} />
          {scene.far.map((d, i) => <P key={'f' + i} d={d} w={2} className="c-green" />)}
          {/* 가까운 들판 */}
          <P d="M-20 600 C260 560 560 600 820 570 C1000 548 1120 560 1240 574" w={3.6} />
          {/* 말 (Doodle 의 말 그림을 크게) */}
          <g transform="translate(462 384) scale(1.75)">{ART.horse()}</g>
          {/* 풀 */}
          {scene.grass.map((g, i) => <P key={'g' + i} d={g.d} w={2.4} className={g.green ? 'c-green' : undefined} />)}
          <P d={Q(100, 640, 160, 630, 2)} w={2.4} className="c-yellow" />
        </g>
      </svg>
    </div>
  )
}
