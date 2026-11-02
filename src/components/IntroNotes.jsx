import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import Doodle, { DOODLES } from './Doodle'
import { rng } from '../lib/rng'
import { useAppStore } from '../store/useAppStore'
import { useT } from '../lib/useT'

// 랜딩 위에 종이 메모지가 겹겹이 덮여 있다가, 스크롤(휠·스와이프·키·클릭) 3번에 한 겹씩 날아가며 진짜 랜딩이 드러남
const PEELS = 3          // 위 메모 → 가운데 메모 → 바닥 종이
const PAPER = ['#f1f5f1', '#e6edf2', '#e8efe6'] // 조각마다 살짝 다른 종이색
const LOCK_MS = 950      // 한 번 넘기고 나면 잠깐 잠금 (관성 휠이 한꺼번에 넘기지 않게)

// 화면 크기에 맞춰 메모를 흩뿌림 (같은 시드라 새로고침해도 같은 배치)
function layout(vw, vh) {
  const size = Math.max(150, Math.min(vw * 0.3, 330))
  const per = Math.max(6, Math.min(13, Math.round((vw * vh) / (size * size * 1.7))))
  const r = rng('intro-layout')
  const pick = (() => { const bag = [...DOODLES].sort(() => r() - 0.5); let i = 0; return () => bag[i++ % bag.length] })()
  const layers = [0, 1, 2].map((layer) => {
    const count = layer === 2 ? Math.max(4, Math.round(per * 0.45)) : per
    return Array.from({ length: count }, (_, i) => {
      const x = 4 + r() * 88, y = 4 + r() * 84
      return {
        id: `${layer}-${i}`, doodle: pick(), x, y, rot: (r() - 0.5) * 28, scale: 0.82 + r() * 0.36,
        // 날아갈 때 화면 중심에서 바깥쪽으로, 조금 더 돌면서
        dx: (x - 50) * 2.6 + (r() - 0.5) * 30, dy: (y - 50) * 2.6 - 40 + (r() - 0.5) * 30, spin: (r() - 0.5) * 120, delay: r() * 0.18,
        tone: Math.floor(r() * 3),
      }
    })
  })
  return { size, layers }
}

export default function IntroNotes() {
  const t = useT()
  const finishIntro = useAppStore((s) => s.finishIntro)
  const [step, setStep] = useState(0)
  const { size, layers } = useMemo(() => layout(window.innerWidth, window.innerHeight), [])
  const done = step >= PEELS

  // 인트로 동안 뒤 화면은 스크롤·포커스 잠금
  useEffect(() => {
    document.documentElement.classList.add('intro-lock')
    const root = document.getElementById('root')
    root?.setAttribute('inert', '')
    return () => { document.documentElement.classList.remove('intro-lock'); root?.removeAttribute('inert') }
  }, [])

  // 입력: 휠 · 스와이프 · 키보드 → 다음 장으로
  useEffect(() => {
    if (done) return
    let locked = false, startY = null
    const next = () => {
      if (locked) return
      locked = true
      setStep((s) => s + 1)
      setTimeout(() => { locked = false }, LOCK_MS)
    }
    const onWheel = (e) => { e.preventDefault(); if (e.deltaY > 6) next() }
    const onTouchStart = (e) => { startY = e.touches[0].clientY }
    const onTouchMove = (e) => { e.preventDefault(); if (startY != null && startY - e.touches[0].clientY > 36) { startY = null; next() } }
    const onKey = (e) => {
      if (['ArrowDown', 'PageDown', ' ', 'Enter'].includes(e.key)) { e.preventDefault(); next() }
      if (e.key === 'Escape') setStep(PEELS)
    }
    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('keydown', onKey)
    }
  }, [done])

  // 마지막 장이 날아간 뒤 인트로를 정리하고 히어로 연출을 시작
  useEffect(() => {
    if (!done) return
    const id = setTimeout(finishIntro, 1300)
    return () => clearTimeout(id)
  }, [done, finishIntro])

  const click = () => !done && setStep((s) => s + 1)

  return createPortal(
    <div className={`intro ${done ? 'out' : ''} ${step >= PEELS - 1 ? 'bare' : ''}`} onClick={click} role="region" aria-label={t('intro.label')}>
      {[2, 1, 0].map((li) => (
        <div key={li} className={`intro-layer ${step > li ? 'gone' : ''}`} style={{ zIndex: 10 - li }}>
          {layers[li].map((n) => (
            <figure key={n.id} className="note"
              style={{
                left: `${n.x}%`, top: `${n.y}%`, width: size * n.scale,
                '--rot': `${n.rot}deg`, '--dx': `${n.dx}vw`, '--dy': `${n.dy}vh`, '--spin': `${n.spin}deg`, '--delay': `${n.delay}s`,
              }}>
              <Doodle variant={n.doodle} seed={n.id} cut paper={PAPER[n.tone]} />
            </figure>
          ))}
        </div>
      ))}

      <button className="intro-skip" onClick={(e) => { e.stopPropagation(); setStep(PEELS) }}>{t('intro.skip')}</button>
      <div className="intro-hint" aria-hidden="true">
        <span className="dots">{Array.from({ length: PEELS }, (_, i) => <i key={i} className={step > i ? 'on' : ''} />)}</span>
        <span>{t('intro.hint')}</span>
      </div>
    </div>,
    document.body,
  )
}
