import { useState } from 'react'
import PageHeader from '../components/PageHeader'
import { Loading } from '../components/Status'
import { useAppStore } from '../store/useAppStore'

const TOOL_LABEL = {
  get_story: '이야기',
  search_tour_places: '관광 장소',
  get_weather: '날씨',
  search_heritage: '국가유산',
}

export default function Guide() {
  const messages = useAppStore((s) => s.messages)
  const loading = useAppStore((s) => s.chatLoading)
  const sendMessage = useAppStore((s) => s.sendMessage)
  const [input, setInput] = useState('')

  function onSubmit(e) {
    e.preventDefault()
    if (!input.trim() || loading) return
    sendMessage(input)
    setInput('')
  }

  return (
    <>
      <PageHeader title="이야기 안내자" subtitle="이야기·장소·날씨·유산 도구를 스스로 골라 쓰는 AI 에이전트" />
      <div className="chat">
        {messages.length === 0 && (
          <p className="hint">예) “산방산 전설 들려주고, 오늘 서귀포 날씨에 가도 괜찮을지 알려줘”</p>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`msg ${m.role}`}>
            {m.steps?.length > 0 && (
              <ol className="steps">
                {m.steps.map((s, j) => (
                  <li key={j} className={s.error ? 'bad' : ''}>
                    {TOOL_LABEL[s.tool] ?? s.tool}({Object.values(s.args ?? {}).join(', ')}) → {s.error ?? `${s.count}건`}
                  </li>
                ))}
              </ol>
            )}
            {m.text}
          </div>
        ))}
        {loading && <Loading text="안내자가 도구를 쓰는 중…" />}
      </div>
      <form onSubmit={onSubmit} className="row">
        <input className="input" value={input} onChange={(e) => setInput(e.target.value)} placeholder="무엇이든 물어보세요" />
        <button className="btn" disabled={loading}>보내기</button>
      </form>
    </>
  )
}
