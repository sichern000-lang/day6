import { useState } from 'react'
import PageHeader from '../components/PageHeader'
import StoryCard from '../components/StoryCard'
import { Empty } from '../components/Status'
import { KINDS, STORIES } from '../lib/stories'

export default function Stories() {
  const [q, setQ] = useState('')
  const [kind, setKind] = useState('전체')
  const list = STORIES.filter((s) =>
    (kind === '전체' || s.kind === kind) && (s.title + s.place + s.summary).includes(q))

  return (
    <>
      <PageHeader title="이야기 목록" subtitle={`신화·전설 ${STORIES.length}편`} />
      <input className="input" placeholder="이름·장소로 검색" value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="tabs">
        {KINDS.map((k) => <button key={k} className={k === kind ? 'on' : ''} onClick={() => setKind(k)}>{k}</button>)}
      </div>
      {list.length === 0 ? <Empty text="맞는 이야기가 없어요" /> : (
        <div className="grid three">{list.map((s) => <StoryCard key={s.id} story={s} />)}</div>
      )}
    </>
  )
}
