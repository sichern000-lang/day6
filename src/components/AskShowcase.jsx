import { useEffect, useRef, useState } from 'react'
import { useAppStore } from '../store/useAppStore'
import { useT } from '../lib/useT'

// 랜딩 3번째 섹션 — Ask 가 하는 일을 보여주는 예시 대화 (글 쓰기 → 도구 3개 → 답). 실제 호출이 아니라 정해 둔 예시
const reduce = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

export default function AskShowcase() {
  const t = useT()
  const lang = useAppStore((s) => s.lang)
  const openChat = useAppStore((s) => s.openChat)
  const sendMessage = useAppStore((s) => s.sendMessage)
  const box = useRef(null)
  const [seen, setSeen] = useState(false)
  const [q, setQ] = useState('')
  const [steps, setSteps] = useState(0)
  const [a, setA] = useState('')
  const Q = t('ask.demoQ'), A = t('ask.demoA')

  // 화면에 들어오면 시작 (한 번 보면 언어를 바꿔도 다시 재생)
  useEffect(() => {
    const el = box.current
    if (!el || !('IntersectionObserver' in window)) return setSeen(true)
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect() } }, { threshold: 0.45 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (!seen) return
    let alive = true
    const wait = (ms) => new Promise((r) => setTimeout(r, ms))
    ;(async () => {
      setQ(''); setSteps(0); setA('')
      if (reduce()) { setQ(Q); setSteps(3); setA(A); return }
      await wait(500)
      for (let i = 1; i <= Q.length && alive; i++) { setQ(Q.slice(0, i)); await wait(30) }
      await wait(450)
      for (let i = 1; i <= 3 && alive; i++) { setSteps(i); await wait(620) }
      await wait(250)
      for (let i = 2; i <= A.length && alive; i += 2) { setA(A.slice(0, i)); await wait(20) }
      if (alive) setA(A)
    })()
    return () => { alive = false }
  }, [seen, lang, Q, A])

  const ask = (text) => { openChat(); sendMessage(text) }

  return (
    <section className="snap-sec">
      <div className="wrap ask-grid">
        <div className="ask-copy">
          <span className="eyebrow">ASK</span>
          <h2 className="display">{t('ask.title').split('\n').map((line, i) => <span key={i}>{i > 0 && <br />}{line}</span>)}</h2>
          <p className="lede">{t('ask.lede')}</p>
          <div className="suggest ask-suggest">
            {[1, 2, 3, 4].map((n) => (
              <button key={n} type="button" onClick={() => ask(t(`guide.s${n}`))}>{t(`guide.s${n}`)}</button>
            ))}
          </div>
          <button className="btn dark ask-cta" onClick={openChat}>{t('ask.cta')}</button>
        </div>

        <div className="ask-window" ref={box} role="img" aria-label={t('ask.note')}>
          <div className="ask-bar"><i /><i /><i /><span>Ask</span></div>
          <div className="ask-body">
            <div className="msg user">{q}{a === '' && steps === 0 && q !== Q && <span className="caret" />}</div>
            {steps > 0 && (
              <ol className="steps ask-steps">
                {[1, 2, 3].slice(0, steps).map((n) => <li key={n}><span className="tick">✓</span>{t(`ask.step${n}`)}</li>)}
              </ol>
            )}
            {a && <div className="msg assistant">{a}</div>}
          </div>
          <div className="ask-input" aria-hidden="true">
            <span>{t('guide.ph')}</span>
            <i><svg viewBox="0 0 20 20" width="16" height="16"><path d="M17 3 3 9.2l5.6 2.2L10.8 17Z M8.6 11.4 17 3" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" /></svg></i>
          </div>
          <p className="ask-note">{t('ask.note')}</p>
        </div>
      </div>
    </section>
  )
}
