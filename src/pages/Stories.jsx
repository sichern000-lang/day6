import { useState } from 'react'
import PageHeader from '../components/PageHeader'
import StoryCard from '../components/StoryCard'
import { Empty } from '../components/Status'
import { KINDS, STORIES, kindLabel, localize } from '../lib/stories'
import { useAppStore } from '../store/useAppStore'
import { useT } from '../lib/useT'

export default function Stories() {
  const t = useT()
  const lang = useAppStore((s) => s.lang)
  const [q, setQ] = useState('')
  const [kind, setKind] = useState('전체')
  const list = STORIES.filter((s) => {
    const v = localize(s, lang)
    return (kind === '전체' || s.kind === kind) && (v.title + v.place + v.summary).toLowerCase().includes(q.toLowerCase())
  })

  return (
    <>
      <PageHeader title={t('stories.title')} subtitle={t('stories.sub', { n: STORIES.length })} />
      <input className="input" placeholder={t('stories.search')} value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="tabs">
        {KINDS.map((k) => <button key={k} className={k === kind ? 'on' : ''} onClick={() => setKind(k)}>{kindLabel(k, lang)}</button>)}
      </div>
      {list.length === 0 ? <Empty text={t('stories.none')} /> : (
        <div className="grid three">{list.map((s) => <StoryCard key={s.id} story={s} />)}</div>
      )}
    </>
  )
}
