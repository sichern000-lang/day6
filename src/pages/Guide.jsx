import { useState } from 'react'
import PageHeader from '../components/PageHeader'
import { Loading } from '../components/Status'
import { useAppStore } from '../store/useAppStore'
import { useT } from '../lib/useT'

export default function Guide() {
  const t = useT()
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
      <PageHeader title={t('guide.title')} subtitle={t('guide.sub')} />
      <div className="chat">
        {messages.length === 0 && <p className="hint">{t('guide.example')}</p>}
        {messages.map((m, i) => (
          <div key={i} className={`msg ${m.role}`}>
            {m.steps?.length > 0 && (
              <ol className="steps">
                {m.steps.map((s, j) => (
                  <li key={j} className={s.error ? 'bad' : ''}>
                    {t(`tool.${s.tool}`)}({Object.values(s.args ?? {}).join(', ')}) → {s.error ?? `${s.count}`}
                  </li>
                ))}
              </ol>
            )}
            {m.text}
          </div>
        ))}
        {loading && <Loading text={t('guide.loading')} />}
      </div>
      <form onSubmit={onSubmit} className="row">
        <input className="input" value={input} onChange={(e) => setInput(e.target.value)} placeholder={t('guide.ph')} />
        <button className="btn" disabled={loading}>{t('guide.send')}</button>
      </form>
    </>
  )
}
