import { useEffect, useRef, useState } from 'react'
import { toPath } from '../lib/places'

// 손가락·마우스로 그리는 작은 그림판. 한 가지 색·한 가지 굵기의 선만 그려져서 사이트의 두들과 어울림.
// 그림은 200×200 좌표의 SVG path 로 바뀌어 onChange(d) 로 올라감.
const SIZE = 200, LINE = 3.4
export default function DrawPad({ onChange, undoLabel, clearLabel, hint, initial = '' }) {
  const cv = useRef(null)
  const [strokes, setStrokes] = useState([])
  const cur = useRef(null)
  const [base, setBase] = useState(initial)      // 수정할 때 이미 있던 그림 — 그 위에 덧그리거나 지우고 새로 그림

  useEffect(() => {
    const c = cv.current, ctx = c.getContext('2d'), k = c.width / SIZE
    ctx.clearRect(0, 0, c.width, c.height)
    ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = '#1d2616'; ctx.lineWidth = LINE * k
    const all = cur.current ? [...strokes, cur.current] : strokes
    for (const s of all) {
      ctx.beginPath()
      s.forEach(([x, y], i) => (i ? ctx.lineTo(x * k, y * k) : ctx.moveTo(x * k, y * k)))
      if (s.length === 1) ctx.lineTo(s[0][0] * k + 0.1, s[0][1] * k + 0.1)
      ctx.stroke()
    }
  }, [strokes])

  const pt = (e) => {
    const r = cv.current.getBoundingClientRect()
    return [((e.clientX - r.left) / r.width) * SIZE, ((e.clientY - r.top) / r.height) * SIZE]
  }
  const join = (b, next) => [b, next.length ? toPath(next) : ''].filter(Boolean).join(' ')
  const commit = (next, b = base) => { setStrokes(next); setBase(b); onChange(join(b, next)) }
  const down = (e) => { cv.current.setPointerCapture(e.pointerId); cur.current = [pt(e)]; setStrokes((s) => [...s]) }
  const move = (e) => { if (!cur.current) return; cur.current.push(pt(e)); setStrokes((s) => [...s]) }
  const up = () => { if (!cur.current) return; const s = cur.current; cur.current = null; commit([...strokes, s]) }

  return (
    <div className="drawpad">
      <div className="drawpad-box">
        {base && <svg className="drawpad-base" viewBox="0 0 200 200" aria-hidden="true"><path d={base} fill="none" stroke="#1d2616" strokeWidth={LINE} strokeLinecap="round" strokeLinejoin="round" /></svg>}
        <canvas ref={cv} width={400} height={400} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} aria-label={hint} />
        {strokes.length === 0 && !base && <span className="drawpad-hint">{hint}</span>}
      </div>
      <div className="drawpad-bar">
        <button type="button" onClick={() => (strokes.length ? commit(strokes.slice(0, -1)) : commit([], ''))} disabled={!strokes.length && !base}>{undoLabel}</button>
        <button type="button" onClick={() => commit([], '')} disabled={!strokes.length && !base}>{clearLabel}</button>
      </div>
    </div>
  )
}

// 저장된 그림(path)을 보여 줌
export function Drawing({ d, className = '' }) {
  return (
    <svg className={`drawing ${className}`} viewBox="0 0 200 200" aria-hidden="true">
      <path d={d} fill="none" stroke="currentColor" strokeWidth={LINE} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
