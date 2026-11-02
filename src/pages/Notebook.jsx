import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import { Empty, Loading } from '../components/Status'
import { isSupabaseReady } from '../lib/supabase'
import { getStoryById, localize } from '../lib/stories'
import { useAppStore } from '../store/useAppStore'
import { useT } from '../lib/useT'

export default function Notebook() {
  const t = useT()
  const lang = useAppStore((s) => s.lang)
  const saved = useAppStore((s) => s.saved)
  const loading = useAppStore((s) => s.savedLoading)
  const loadSaved = useAppStore((s) => s.loadSaved)
  const toggleVisited = useAppStore((s) => s.toggleVisited)
  const removeStory = useAppStore((s) => s.removeStory)
  const nickname = useAppStore((s) => s.nickname)

  useEffect(() => { loadSaved() }, [loadSaved, nickname])

  return (
    <>
      <PageHeader title={t('nb.title')} subtitle={t('nb.sub', { who: nickname || t('anon') })} />
      {!isSupabaseReady && <div className="status error">{t('nb.nosb')}</div>}
      {loading && <Loading />}
      {!loading && isSupabaseReady && saved.length === 0 && <Empty text={t('nb.empty')} />}
      <ul className="list">
        {saved.map((s) => (
          <li key={s.id}>
            <div>
              <Link to={`/stories/${s.story_id}`}>
                <strong>{localize(getStoryById(s.story_id), lang)?.title ?? s.title}</strong>
              </Link>
              <span>{s.visited ? t('nb.visited') : t('nb.notyet')}</span>
            </div>
            <button className="btn ghost small" onClick={() => toggleVisited(s)}>{s.visited ? t('nb.cancel') : t('nb.visit')}</button>
            <button className="btn ghost small" onClick={() => removeStory(s.id)}>{t('nb.del')}</button>
          </li>
        ))}
      </ul>
    </>
  )
}
