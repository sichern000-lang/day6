import { useEffect, useRef, useState } from 'react'
import Modal from './Modal'
import { Loading } from './Status'
import { useAppStore } from '../store/useAppStore'
import { useT } from '../lib/useT'

// Ask — 이야기·장소·날씨·유산 도구를 스스로 골라 쓰는 AI 에이전트와의 대화 (어느 페이지에서든 모달로 열림)
export default function ChatModal() {
  const t = useT()
  const messages = useAppStore((s) => s.messages)
  const loading = useAppStore((s) => s.chatLoading)
  const sendMessage = useAppStore((s) => s.sendMessage)
  const closeChat = useAppStore((s) => s.closeChat)
  const [input, setInput] = useState('')
  const end = useRef(null)

  // 새 메시지가 오면 맨 아래로
  useEffect(() => { end.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }) }, [messages, loading])

  function onSubmit(e) {
    e.preventDefault()
    if (!input.trim() || loading) return
    sendMessage(input.trim())
    setInput('')
  }

  return (
    <Modal onClose={closeChat} label="Ask">
      <div className="chat-modal">
        <h2 className="modal-title">{t('guide.title')}</h2>
        <p className="modal-sub">{t('guide.sub')}</p>

        <div className="chat-scroll">
          {messages.length === 0 && (
            <div className="suggest">
              <p className="hint">{t('guide.try')}</p>
              {[1, 2, 3, 4].map((n) => (
                <button key={n} type="button" onClick={() => sendMessage(t(`guide.s${n}`))}>{t(`guide.s${n}`)}</button>
              ))}
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`msg ${m.role} ${m.error ? 'err' : ''}`}>
              {m.steps?.length > 0 && (
                <ol className="steps">
                  {m.steps.map((s, j) => (
                    <li key={j} className={s.error ? 'bad' : ''}>
                      {t(`tool.${s.tool}`)}({Object.values(s.args ?? {}).join(', ')}) → {s.error ?? `${s.count}`}
                    </li>
                  ))}
                </ol>
              )}
              {m.error && <b>{t('chat.error')} · </b>}{m.text}
            </div>
          ))}
          {loading && <Loading text={t('guide.loading')} />}
          <div ref={end} />
        </div>

        <form onSubmit={onSubmit} className="chat-form">
          <div className="chat-input">
            <input className="input" autoFocus value={input} onChange={(e) => setInput(e.target.value)} placeholder={t('guide.ph')} />
            <button className="send" disabled={loading || !input.trim()} aria-label={t('guide.send')} title={t('guide.send')}>
              <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true">
                <path d="M17 3 3 9.2l5.6 2.2L10.8 17Z M8.6 11.4 17 3" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </Modal>
  )
}
