import { useEffect, useMemo, useState } from 'react'
import PageHeader from '../components/PageHeader'
import ReviewModal from '../components/ReviewModal'
import Sketch from '../components/Sketch'
import Stars from '../components/Stars'
import { Empty, ErrorBox, Loading } from '../components/Status'
import { SAMPLES, deleteReview, isMissingTable, listReviews } from '../lib/reviews'
import { getStoryById } from '../lib/stories'
import { isSupabaseReady } from '../lib/supabase'
import { useAppStore } from '../store/useAppStore'
import { useT } from '../lib/useT'

export default function Reviews() {
  const t = useT()
  const lang = useAppStore((s) => s.lang)
  const nickname = useAppStore((s) => s.nickname)
  const toast = useAppStore((s) => s.toast)
  // 이 페이지에서만 쓰는 값은 지역 상태
  const [state, setState] = useState({ list: [], loading: true, error: '', demo: false })
  const [onlyRec, setOnlyRec] = useState(false)
  const [sort, setSort] = useState('new')
  const [writing, setWriting] = useState(false)
  const me = nickname || '익명'

  useEffect(() => {
    if (!isSupabaseReady) return setState({ list: SAMPLES, loading: false, error: '', demo: true })
    listReviews()
      .then((list) => setState({ list, loading: false, error: '', demo: false }))
      // 테이블이 아직 없으면 샘플을 보여 주면서 안내
      .catch((e) => setState(isMissingTable(e)
        ? { list: SAMPLES, loading: false, error: '', demo: true }
        : { list: [], loading: false, error: e.message, demo: false }))
  }, [])

  const shown = useMemo(() => {
    const list = state.list.filter((r) => !onlyRec || r.recommend)
    return [...list].sort((a, b) => (sort === 'star' ? b.rating - a.rating : 0) || new Date(b.created_at) - new Date(a.created_at))
  }, [state.list, onlyRec, sort])
  const avg = state.list.length ? (state.list.reduce((n, r) => n + r.rating, 0) / state.list.length).toFixed(1) : '–'

  async function remove(r) {
    try {
      await deleteReview(r.id)
      setState((s) => ({ ...s, list: s.list.filter((x) => x.id !== r.id) }))
      toast(t('review.deleted'))
    } catch (e) { toast(e.message, 'error') }
  }

  return (
    <>
      <PageHeader title={t('review.title')} subtitle={t('review.sub')} />
      <div className="review-bar">
        <p className="avg"><Stars value={Math.round(avg) || 0} size={20} /> <span>{t('review.avg', { avg, n: state.list.length })}</span></p>
        <button className="btn dark" onClick={() => (isSupabaseReady && !state.demo ? setWriting(true) : toast(t(isSupabaseReady ? 'review.sampleBanner' : 'review.noSupabase'), 'warn'))}>
          + {t('review.write')}
        </button>
      </div>

      <div className="tabs">
        <button className={!onlyRec ? 'on' : ''} onClick={() => setOnlyRec(false)}>{t('review.all')}</button>
        <button className={onlyRec ? 'on' : ''} onClick={() => setOnlyRec(true)}>{t('review.recommended')}</button>
        <span className="tabs-gap" />
        <button className={sort === 'new' ? 'on' : ''} onClick={() => setSort('new')}>{t('review.sortNew')}</button>
        <button className={sort === 'star' ? 'on' : ''} onClick={() => setSort('star')}>{t('review.sortStar')}</button>
      </div>

      {state.demo && <p className="status banner">{t(isSupabaseReady ? 'review.sampleBanner' : 'review.noSupabase')}</p>}
      {state.loading && <Loading />}
      <ErrorBox error={state.error} />
      {!state.loading && !state.error && shown.length === 0 && <Empty text={t('review.empty')} />}

      <div className="review-grid">
        {shown.map((r) => {
          const story = getStoryById(r.story_id)
          return (
            <article key={r.id} className="review-card">
              <div className="review-photo">
                {r.image_url ? <img src={r.image_url} alt="" loading="lazy" /> : <Sketch kind={story?.kind ?? '창조신화'} seed={String(r.id)} />}
                {r.recommend && <span className="rec-badge">{t('review.recBadge')}</span>}
              </div>
              <div className="review-body">
                <h3>{r.place_title}</h3>
                <p className="meta">{r.place_addr}</p>
                <Stars value={r.rating} />
                {r.comment && <p className="review-comment">{r.comment}</p>}
                <p className="review-foot">
                  <span>{r.nickname}{(r.is_sample || r.id?.toString().startsWith('s')) && <em> · {t('review.sample')}</em>} · {new Date(r.created_at).toLocaleDateString(lang === 'en' ? 'en-US' : 'ko-KR')}</span>
                  {!state.demo && !r.is_sample && r.nickname === me && (
                    <button className="tag" onClick={() => remove(r)}>{t('review.del')}</button>
                  )}
                </p>
              </div>
            </article>
          )
        })}
      </div>

      {writing && <ReviewModal onClose={() => setWriting(false)} onCreated={(row) => setState((s) => ({ ...s, list: [row, ...s.list] }))} />}
    </>
  )
}
