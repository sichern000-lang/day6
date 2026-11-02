import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import StoryCard from '../components/StoryCard'
import LoreModal from '../components/LoreModal'
import { Empty, ErrorBox, Loading } from '../components/Status'
import { fetchCatalog } from '../api/client'
import { FOLK as folk, GROUP, keywordLabel, label } from '../lib/folk'
import { STORIES, localize } from '../lib/stories'
import { folkTitle } from '../lib/folkTitle'
import { isKo } from '../lib/langs'
import { useTranslated } from '../lib/useTranslated'
import { useAppStore } from '../store/useAppStore'
import { useT } from '../lib/useT'

const PAGE = 30

export default function Stories() {
  const t = useT()
  const lang = useAppStore((s) => s.lang)
  // 이 페이지 안에서만 쓰는 값은 지역 상태
  const [catalog, setCatalog] = useState({ data: [], loading: true, error: '' })
  const [params] = useSearchParams()
  const [q, setQ] = useState(params.get('q') ?? '')
  const [open, setOpen] = useState(null)   // 모달로 열어 둔 신화·민담
  const [kind, setKind] = useState('all')   // all | featured | myth | folktale
  const [group, setGroup] = useState('')    // '' = 해당 종류 전체
  const [shown, setShown] = useState(PAGE)

  useEffect(() => {
    fetchCatalog()
      .then((data) => setCatalog({ data, loading: false, error: '' }))
      .catch((e) => setCatalog({ data: [], loading: false, error: e.message }))
  }, [])

  const query = q.trim().toLowerCase()
  const counts = useMemo(() => {
    const c = {}
    for (const i of catalog.data) { c[i.group] = (c[i.group] ?? 0) + 1; c[i.kind] = (c[i.kind] ?? 0) + 1 }
    return c
  }, [catalog.data])

  const featured = STORIES.filter((s) => {
    const v = localize(s, lang)
    return !query || (v.title + v.place + v.summary).toLowerCase().includes(query)
  })
  const rows = catalog.data.filter((i) =>
    (kind === 'all' || kind === i.kind) && (!group || i.group === group) &&
    (!query || (i.title + i.tags.join(' ')).toLowerCase().includes(query)))
  const visible = rows.slice(0, shown)

  // 번역된 제목: 미리 넣어 둔 번역이 먼저, 없는 제목만 실시간 번역
  const tr0 = useTranslated(visible.filter((i) => !folkTitle(i.title, lang)).map((i) => i.title), !isKo(lang))
  const localTitle = (title) => (isKo(lang) ? undefined : folkTitle(title, lang) ?? tr0(title))
  const groups = folk.groups.filter((g) => g.kind === kind)
  const activeGroup = group ? GROUP[group] : null
  const showFeatured = kind === 'all' || kind === 'featured'
  const showRows = kind !== 'featured'

  const pick = (k) => { setKind(k); setGroup(''); setShown(PAGE) }
  const search = (text) => { setQ(text); setShown(PAGE) }

  return (
    <>
      <PageHeader title={t('stories.title')} subtitle={t('stories.sub2', { n: catalog.data.length || '…', f: STORIES.length })} />
      <input className="input" placeholder={t('stories.search2')} value={q} onChange={(e) => search(e.target.value)} />

      <div className="tabs">
        {[['all', t('stories.all'), catalog.data.length + STORIES.length], ['featured', t('stories.featured'), STORIES.length],
          ...folk.kinds.map((k) => [k.id, label(k, lang), counts[k.id]])].map(([id, name, n]) => (
          <button key={id} className={kind === id ? 'on' : ''} onClick={() => pick(id)}>
            {name}{n ? <span className="count"> {n}</span> : null}
          </button>
        ))}
      </div>

      {groups.length > 0 && (
        <div className="tabs sub">
          <button className={group === '' ? 'on' : ''} onClick={() => { setGroup(''); setShown(PAGE) }}>{t('stories.groupAll')}</button>
          {groups.map((g) => (
            <button key={g.id} className={group === g.id ? 'on' : ''} onClick={() => { setGroup(g.id); setShown(PAGE) }}>
              {label(g, lang)}<span className="count"> {counts[g.id] ?? 0}</span>
            </button>
          ))}
        </div>
      )}

      {activeGroup && (
        <p className="kw">
          <b>{t('stories.kw')}</b>
          {activeGroup.keywords.map((kw) => (
            <button key={kw[0]} className="tag" onClick={() => search(kw[0].replace(/\(.*\)/, ''))}>{keywordLabel(kw, lang)}</button>
          ))}
        </p>
      )}

      {showFeatured && featured.length > 0 && (
        <div className="grid three feature-grid">{featured.map((s) => <StoryCard key={s.id} story={s} />)}</div>
      )}

      {showRows && (
        <>
          {catalog.loading && <Loading />}
          <ErrorBox error={catalog.error && `${t('stories.err')} — ${catalog.error}`} />
          {!catalog.loading && !catalog.error && rows.length === 0 && (!showFeatured || featured.length === 0) && <Empty text={t('stories.none')} />}
          <ul className="rows lore">
            {visible.map((i) => (
              <li key={`${i.kind}-${i.id}`}>
                <div className="lore-item" role="button" tabIndex={0}
                  onClick={() => setOpen(i)} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), setOpen(i))}>
                  <span className="h-text">
                    <strong>{localTitle(i.title) ?? i.title}{localTitle(i.title) && <small> {i.title}</small>}</strong>
                    <span className="lore-meta">
                      <em>{label(GROUP[i.group], lang)}</em>
                      {i.tags.slice(0, 6).map((tag) => (
                        <button key={tag} className="tag" onClick={(e) => { e.stopPropagation(); search(tag) }}>{tag}</button>
                      ))}
                    </span>
                  </span>
                  <span className="h-arrow" aria-hidden="true">→</span>
                </div>
              </li>
            ))}
          </ul>
          {rows.length > shown && (
            <div className="more"><button className="btn ghost small" onClick={() => setShown(shown + PAGE)}>{t('stories.more')} ({rows.length - shown})</button></div>
          )}
          {!catalog.loading && !catalog.error && <p className="hint">{t('stories.note')}</p>}
        </>
      )}
      {open && <LoreModal item={open} titleLocal={localTitle(open.title)} onClose={() => setOpen(null)} onSearch={search} />}
    </>
  )
}
