import { useEffect, useState } from 'react'

// 히어로 제목을 한 글자씩 타이핑. 아직 안 친 글자는 투명하게 자리만 잡아 두어 줄바꿈이 흔들리지 않음.
// parts: [{ text, em? }, { br: true }, ...]
const SPEED = 55          // 글자당 ms
const reduce = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

export default function TypedTitle({ parts, start = true, onDone }) {
  const total = parts.reduce((n, p) => n + (p.text?.length ?? 0), 0)
  const key = parts.map((p) => p.text ?? '\n').join('')
  const [n, setN] = useState(0)

  useEffect(() => { setN(reduce() ? total : 0) }, [key, total])

  useEffect(() => {
    if (!start || n >= total) { if (start && n >= total && total) onDone?.(); return }
    const id = setTimeout(() => setN((v) => v + 1), n === 0 ? 350 : SPEED)
    return () => clearTimeout(id)
  }, [start, n, total, onDone])

  let left = n
  const typing = start && n < total
  let caretAt = -1                       // 타이핑 중인 조각(처음으로 덜 쳐진 조각)
  if (typing) { let c = n; caretAt = parts.findIndex((p) => { if (p.br) return false; if (c < p.text.length) return true; c -= p.text.length; return false }) }
  return (
    <h1 aria-label={key.replace('\n', ' ')}>
      {parts.map((p, i) => {
        if (p.br) return <br key={i} />
        const shown = p.text.slice(0, Math.max(0, left)), rest = p.text.slice(shown.length)
        left -= p.text.length
        const Tag = p.em ? 'em' : 'span'
        return (
          <Tag key={i} aria-hidden="true">
            {shown}{i === caretAt && <span className="type-caret" />}<span className="type-rest">{rest}</span>
          </Tag>
        )
      })}
    </h1>
  )
}
