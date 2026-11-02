import { useEffect, useState } from 'react'

// 히어로 제목을 한 글자씩 타이핑. 아직 안 친 글자는 투명하게 자리만 잡아 두어 줄바꿈이 흔들리지 않음.
// parts: [{ text, em? }, { br: true }, ...]
// 사람이 치듯 글자마다 간격이 조금씩 다르고, 쉼표·띄어쓰기 뒤에서는 잠깐 멈춤
const delayAfter = (ch) => 55 + Math.random() * 75 + (ch === ',' ? 320 : ch === ' ' ? 40 + Math.random() * 90 : 0)
const reduce = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

export default function TypedTitle({ parts, start = true, onDone }) {
  const total = parts.reduce((n, p) => n + (p.text?.length ?? 0), 0)
  const key = parts.map((p) => p.text ?? '\n').join('')
  const flat = parts.map((p) => p.text ?? '').join('')
  const [n, setN] = useState(0)

  useEffect(() => { setN(reduce() ? total : 0) }, [key, total])

  useEffect(() => {
    if (!start || n >= total) { if (start && n >= total && total) onDone?.(); return }
    const id = setTimeout(() => setN((v) => v + 1), n === 0 ? 700 : delayAfter(flat[n - 1]))
    return () => clearTimeout(id)
  }, [start, n, total, onDone])

  let left = n
  const typing = start && n < total
  // 커서(타이핑 바)는 늘 보임: 치는 중에는 멈춘 채 따라가고, 다 치고 나면 깜빡임
  let caretAt = -1
  { let c = n; caretAt = parts.findIndex((p) => { if (p.br) return false; if (c < p.text.length) return true; c -= p.text.length; return false }) }
  if (caretAt < 0) caretAt = parts.reduce((last, p, i) => (p.br ? last : i), 0)
  return (
    <h1 aria-label={key.replace('\n', ' ')}>
      {parts.map((p, i) => {
        if (p.br) return <br key={i} />
        const shown = p.text.slice(0, Math.max(0, left)), rest = p.text.slice(shown.length)
        left -= p.text.length
        const Tag = p.em ? 'em' : 'span'
        return (
          <Tag key={i} aria-hidden="true">
            {shown}{i === caretAt && <span className={`type-caret ${typing ? 'solid' : ''}`} />}<span className="type-rest">{rest}</span>
          </Tag>
        )
      })}
    </h1>
  )
}
