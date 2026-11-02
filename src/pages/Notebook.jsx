import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import { Empty, Loading } from '../components/Status'
import { isSupabaseReady } from '../lib/supabase'
import { useAppStore } from '../store/useAppStore'

export default function Notebook() {
  const saved = useAppStore((s) => s.saved)
  const loading = useAppStore((s) => s.savedLoading)
  const loadSaved = useAppStore((s) => s.loadSaved)
  const toggleVisited = useAppStore((s) => s.toggleVisited)
  const removeStory = useAppStore((s) => s.removeStory)
  const nickname = useAppStore((s) => s.nickname)

  useEffect(() => { loadSaved() }, [loadSaved, nickname])

  return (
    <>
      <PageHeader title="내 수첩" subtitle={`${nickname || '익명'} 님이 담은 이야기 · Supabase 에 저장`} />
      {!isSupabaseReady && <div className="status error">Supabase 설정(.env.local)이 필요해요</div>}
      {loading && <Loading />}
      {!loading && isSupabaseReady && saved.length === 0 && <Empty text="아직 담은 이야기가 없어요. 이야기 상세에서 ＋ 내 수첩에 담기를 눌러 보세요" />}
      <ul className="list">
        {saved.map((s) => (
          <li key={s.id}>
            <div>
              <Link to={`/stories/${s.story_id}`}><strong>{s.title}</strong></Link>
              <span>{s.visited ? '✅ 가 봤어요' : '아직 안 가 봤어요'}</span>
            </div>
            <button className="btn ghost small" onClick={() => toggleVisited(s)}>{s.visited ? '취소' : '가 봤어요'}</button>
            <button className="btn ghost small" onClick={() => removeStory(s.id)}>삭제</button>
          </li>
        ))}
      </ul>
    </>
  )
}
