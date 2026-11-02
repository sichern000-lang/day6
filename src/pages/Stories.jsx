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

const PAGE = 10                       // 한 번에 보여 주는 개수 (더 보기를 누르면 10개씩 추가)
const ORDER = ['folktale', 'myth']    // 민담이 먼저, 신화가 그다음
const KINDS = ORDER.map((id) => folk.kinds.find((k) => k.id === id))
const fresh = (v) => Object.fromEntries(ORDER.map((id) => [id, v]))

export default function Stories() {
  const t = useT()
  const lang = useAppStore((s) => s.lang)
  // 이 페이지 안에서만 쓰는 값은 지역 상태
  const [catalog, setCatalog] = useState({ data: [], loading: true, error: '' })
  const [params] = useSearchParams()
  const [q, setQ] = useState(params.get('q') ?? '')
  const [modal, setModal] = useState(null)                       // 모달로 열어 둔 신화·민담
  const [kind, setKind] = useState('all')                         // all | featured | folktale | myth
  const [opened, setOpened] = useState(fresh(Boolean(params.get('q'))))  // 접힘/펼침 (처음엔 모두 접힘)
  const [shown, setShown] = useState(fresh(PAGE))                // 종류별로 지금 보여 주는 개수
  const [group, setGroup] = useState(fresh(''))                  // 종류별로 고른 분류

  // 이 페이지는 연한 회녹색 배경
  useEffect(() => {
    document.body.classList.add('sage')
    return () => document.body.classList.remove('sage')
  }, [])

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
  // 종류별 목록 (검색어·분류로 걸러진 것)
  const rows = Object.fromEntries(ORDER.map((id) => [id, catalog.data.filter((i) =>
    i.kind === id && (!group[id] || i.group === group[id]) &&
    (!query || (i.title + i.tags.join(' ')).toLowerCase().includes(query)))]))

  const sections = kind === 'all' ? ORDER : ORDER.includes(kind) ? [kind] : []
  const visible = Object.fromEntries(ORDER.map((id) => [id, sections.includes(id) && opened[id] ? rows[id].slice(0, shown[id]) : []]))

  // 번역된 제목: 미리 넣어 둔 번역이 먼저, 없는 제목만 실시간 번역
  const onScreen = ORDER.flatMap((id) => visible[id])
  const tr0 = useTranslated(onScreen.filter((i) => !folkTitle(i.title, lang)).map((i) => i.title), !isKo(lang))
  const localTitle = (title) => (isKo(lang) ? undefined : folkTitle(title, lang) ?? tr0(title))

  const showFeatured = kind === 'all' || kind === 'featured'
  const setFor = (setter, id, v) => setter((o) => ({ ...o, [id]: v }))
  const pick = (k) => { setKind(k); if (ORDER.includes(k)) setFor(setOpened, k, true) }   // 종류 탭을 누르면 그 종류는 펼쳐 보여 줌
  const search = (text) => {
    setQ(text); setShown(fresh(PAGE))
    if (text.trim()) setOpened(fresh(true))                                                 // 검색하면 결과가 보이게 둘 다 펼침
  }

  return (
    <>
      <PageHeader center title={t('stories.title')} subtitle={t('stories.sub2', { n: catalog.data.length || '…', f: STORIES.length })} />
      <input className="input search-slim" placeholder={t('stories.search2')} value={q} onChange={(e) => search(e.target.value)} />

      <div className="tabs center pills">
        {[['all', t('stories.all'), catalog.data.length + STORIES.length], ['featured', t('stories.featured'), STORIES.length],
          ...KINDS.map((k) => [k.id, label(k, lang), counts[k.id]])].map(([id, name, n]) => (
          <button key={id} className={kind === id ? 'on' : ''} onClick={() => pick(id)}>
            {name}{n ? <span className="count"> {n}</span> : null}
          </button>
        ))}
      </div>

      {showFeatured && featured.length > 0 && (
        <div className="feature-ruled">{featured.map((s) => <StoryCard key={s.id} story={s} ruled />)}</div>
      )}

      {sections.length > 0 && (
        <>
          {catalog.loading && <Loading />}
          <ErrorBox error={catalog.error && `${t('stories.err')} — ${catalog.error}`} />
        </>
      )}

      {sections.map((id) => {
        const k = KINDS.find((x) => x.id === id)
        const isOpen = opened[id]
        const list = rows[id]
        const groups = folk.groups.filter((g) => g.kind === id)
        const active = group[id] ? GROUP[group[id]] : null
        const filtered = Boolean(query || group[id])
        return (
          <section key={id} className={`fold ${isOpen ? 'open' : ''}`}>
            <div className="fold-bar">
              <button className="fold-head" aria-expanded={isOpen} aria-controls={`fold-${id}`} onClick={() => setFor(setOpened, id, !isOpen)}>
                <span className="fold-title">
                  {label(k, lang)}
                  <small>{catalog.loading ? '…' : filtered ? `${list.length} / ${counts[id] ?? 0}` : (counts[id] ?? 0)}</small>
                </span>
                <svg className="chev" viewBox="0 0 20 20" width="22" height="22" aria-hidden="true">
                  <path d="m5 7.5 5 5 5-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {isOpen && (
                <div className="tabs sub" role="group" aria-label={label(k, lang)}>
                  <button className={group[id] === '' ? 'on' : ''} onClick={() => { setFor(setGroup, id, ''); setFor(setShown, id, PAGE) }}>{t('stories.groupAll')}<span className="count"> {counts[id] ?? 0}</span></button>
                  {groups.map((g) => (
                    <button key={g.id} className={group[id] === g.id ? 'on' : ''} onClick={() => { setFor(setGroup, id, g.id); setFor(setShown, id, PAGE) }}>
                      {label(g, lang)}<span className="count"> {counts[g.id] ?? 0}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {isOpen && (
              <div className="fold-body" id={`fold-${id}`} role="region" aria-label={label(k, lang)}>
                {active && (
                  <p className="kw">
                    <b>{t('stories.kw')}</b>
                    {active.keywords.map((kw) => (
                      <button key={kw[0]} className="tag" onClick={() => search(kw[0].replace(/\(.*\)/, ''))}>{keywordLabel(kw, lang)}</button>
                    ))}
                  </p>
                )}

                {!catalog.loading && !catalog.error && list.length === 0 && <Empty text={t('stories.none')} />}
                <ul className="rows lore">
                  {visible[id].map((i) => (
                    <li key={`${i.kind}-${i.id}`}>
                      <div className="lore-item" role="button" tabIndex={0}
                        onClick={() => setModal(i)} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), setModal(i))}>
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
                {list.length > shown[id] && (
                  <div className="more">
                    <button className="btn ghost small" onClick={() => setFor(setShown, id, shown[id] + PAGE)}>
                      {t('stories.more')} ({list.length - shown[id]})
                    </button>
                  </div>
                )}
              </div>
            )}
          </section>
        )
      })}

      {sections.length > 0 && !catalog.loading && !catalog.error && <p className="hint">{t('stories.note')}</p>}
      {modal && <LoreModal item={modal} titleLocal={localTitle(modal.title)} onClose={() => setModal(null)} onSearch={search} />}
    </>
  )
}
