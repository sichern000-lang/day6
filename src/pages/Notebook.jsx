import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import { Empty, Loading } from '../components/Status'
import { isSupabaseReady } from '../lib/supabase'
import { getStoryById, localize } from '../lib/stories'
import { folkTitle } from '../lib/folkTitle'
import { shareText } from '../lib/askShare'
import { useAppStore } from '../store/useAppStore'
import { useT } from '../lib/useT'

// 내 수첩: 담은 이야기를 체크리스트로 — 가 본 곳을 체크하고, 한 줄 메모를 남김
export default function Notebook() {
  const t = useT()
  const lang = useAppStore((s) => s.lang)
  const saved = useAppStore((s) => s.saved)
  const loading = useAppStore((s) => s.savedLoading)
  const loadSaved = useAppStore((s) => s.loadSaved)
  const toggleVisited = useAppStore((s) => s.toggleVisited)
  const updateMemo = useAppStore((s) => s.updateMemo)
  const removeStory = useAppStore((s) => s.removeStory)
  const nickname = useAppStore((s) => s.nickname)

  useEffect(() => { loadSaved() }, [loadSaved, nickname])

  const done = saved.filter((s) => s.visited).length

  return (
    <>
      <PageHeader title="My Notebook" subtitle={t('nb.sub', { who: nickname || t('anon') })} />
      {!isSupabaseReady && <div className="status error">{t('nb.nosb')}</div>}
      {loading && <Loading />}
      {!loading && isSupabaseReady && saved.length === 0 && <Empty text={t('nb.empty')} />}
      {saved.length > 0 && (
        <div className="nb-progress" role="status">
          <span>{t('nb.progress', { done, total: saved.length })}</span>
          <i><b style={{ width: `${(done / saved.length) * 100}%` }} /></i>
        </div>
      )}
      <ul className="checklist">
        {saved.map((s) => <Row key={s.id} s={s} lang={lang} t={t} onVisit={toggleVisited} onMemo={updateMemo} onDel={removeStory} />)}
      </ul>
    </>
  )
}

function Row({ s, lang, t, onVisit, onMemo, onDel }) {
  const [memo, setMemo] = useState(s.memo ?? '')
  useEffect(() => setMemo(s.memo ?? ''), [s.memo])
  const [open, setOpen] = useState(false)
  const ask = s.story_id.startsWith('ask:')
  const toast = useAppStore((st) => st.toast)
  const story = getStoryById(s.story_id)
  const title = (story ? localize(story, lang)?.title : folkTitle(s.title, lang)) ?? s.title
  const to = story ? `/stories/${s.story_id}` : `/stories?q=${encodeURIComponent(s.title)}`
  return (
    <li className={`check-row ${s.visited ? 'done' : ''}`}>
      <button className="box" role="checkbox" aria-checked={!!s.visited} aria-label={`${t('nb.visit')}: ${title}`} onClick={() => onVisit(s)}>
        <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true"><path d="m4 10.5 4 4 8-9" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
      <div className="check-main">
        {ask ? (
          <>
            <button className="ask-title" onClick={() => setOpen((o) => !o)} aria-expanded={open}><em className="chip-soft">Ask</em><strong>{title}</strong></button>
            <p className={`ask-answer ${open ? 'open' : ''}`}>{s.answer}</p>
            <span className="ask-tools">
              <button onClick={() => setOpen((o) => !o)}>{open ? t('nb.less') : t('nb.more')}</button>
              <button onClick={async () => { const r = await shareText({ title: t('chat.shareHead'), text: `Q. ${s.title}\n\n${s.answer}` }); if (r === 'copied') toast(t('chat.copied')) }}>{t('chat.share')}</button>
            </span>
          </>
        ) : <Link to={to}><strong>{title}</strong></Link>}
        <input className="memo" value={memo} maxLength={140} placeholder={t('nb.memoph')} aria-label={t('nb.memoph')}
          onChange={(e) => setMemo(e.target.value)} onBlur={() => onMemo(s, memo.trim())}
          onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()} />
      </div>
      <button className="x" aria-label={t('nb.del')} title={t('nb.del')} onClick={() => onDel(s.id)}>×</button>
    </li>
  )
}
