import { useEffect, useMemo, useRef, useState } from 'react'
import Modal from './Modal'
import { useAppStore } from '../store/useAppStore'
import { useT } from '../lib/useT'
import { askId, clip, shareText } from '../lib/askShare'

// Ask — 이야기·장소·날씨·유산 도구를 스스로 골라 쓰는 AI 에이전트와의 대화 (어느 페이지에서든 모달로 열림)
export default function ChatModal() {
  const t = useT()
  const messages = useAppStore((s) => s.messages)
  const loading = useAppStore((s) => s.chatLoading)
  const sendMessage = useAppStore((s) => s.sendMessage)
  const closeChat = useAppStore((s) => s.closeChat)
  const clearChat = useAppStore((s) => s.clearChat)
  const saved = useAppStore((s) => s.saved)
  const toggleSave = useAppStore((s) => s.toggleSave)
  const toast = useAppStore((s) => s.toast)
  const [input, setInput] = useState('')
  const [round, setRound] = useState(0)          // 새로고침할 때마다 올라가서 추천 질문이 바뀜
  // 추천 질문: 열 때마다 전체 16개 중 무작위 4개
  const picks = useMemo(() => [...Array(16).keys()].map((n) => n + 1).sort(() => Math.random() - 0.5).slice(0, 4), [round]) // eslint-disable-line react-hooks/exhaustive-deps
  const end = useRef(null)
  const inputRef = useRef(null)

  // 새 메시지가 오면 맨 아래로
  useEffect(() => { end.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }) }, [messages, loading])

  // 마음에 드는 답을 수첩에 담고(다시 누르면 뺌), 공유함
  const questionOf = (i) => [...messages.slice(0, i)].reverse().find((m) => m.role === 'user')?.text ?? ''
  const keep = (i) => toggleSave({ id: askId(messages[i].text), title: clip(questionOf(i), 80), answer: messages[i].text })
  async function share(i) {
    const r = await shareText({ title: t('chat.shareHead'), text: `Q. ${questionOf(i)}\n\n${messages[i].text}` })
    if (r === 'copied') toast(t('chat.copied'))
    if (r === 'fail') toast(t('chat.copyFail'), 'warn')
  }

  function onSubmit(e) {
    e.preventDefault()
    if (!input.trim() || loading) return
    sendMessage(input.trim())
    setInput('')
  }

  return (
    <Modal onClose={closeChat} label="Ask">
      <div className="chat-modal">
        <button className="chat-refresh" onClick={() => { clearChat(); setInput(''); setRound((r) => r + 1); inputRef.current?.focus() }}
          disabled={messages.length === 0 && !loading} aria-label={t('chat.refresh')} title={t('chat.refresh')}>
          <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true">
            <path d="M16.2 9.6A6.4 6.4 0 1 0 14.4 14.3 M16.4 4.2v5.2h-5.2" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h2 className="modal-title">{t('guide.title')}</h2>
        <p className="modal-sub">{t('guide.sub')}</p>

        <div className="chat-scroll">
          {messages.length === 0 && (
            <div className="suggest">
              <p className="hint">{t('guide.try')}</p>
              {picks.map((n) => (
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
              {m.role === 'assistant' && !m.error && (
                <div className="msg-actions">
                  <button type="button" className={saved.some((s) => s.story_id === askId(m.text)) ? 'on' : ''} onClick={() => keep(i)}
                    aria-pressed={saved.some((s) => s.story_id === askId(m.text))}>
                    <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><path d="M7 4h10a1 1 0 0 1 1 1v15l-6-4-6 4V5a1 1 0 0 1 1-1Z" fill={saved.some((s) => s.story_id === askId(m.text)) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" /></svg>
                    {saved.some((s) => s.story_id === askId(m.text)) ? t('chat.saved') : t('chat.save')}
                  </button>
                  <button type="button" onClick={() => share(i)}>
                    <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><path d="M12 15V4m0 0L8 8m4-4 4 4M5 13v6h14v-6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    {t('chat.share')}
                  </button>
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="msg assistant waiting" role="status">
              {t(`guide.wait${(messages.length % 3) + 1}`)}<span className="dots" aria-hidden="true"><i /><i /><i /></span>
            </div>
          )}
          <div ref={end} />
        </div>

        <form onSubmit={onSubmit} className="chat-form">
          <div className="chat-input">
            <input className="input" ref={inputRef} autoFocus value={input} onChange={(e) => setInput(e.target.value)} placeholder={t('guide.ph')} />
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
