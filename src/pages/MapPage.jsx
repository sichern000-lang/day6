import { useEffect, useMemo, useState } from 'react'
import PageHeader from '../components/PageHeader'
import IslandMap from '../components/IslandMap'
import StoryCard from '../components/StoryCard'
import PlaceModal from '../components/PlaceModal'
import { Drawing } from '../components/DrawPad'
import { GoButton } from '../components/GoModal'
import { Loading } from '../components/Status'
import { CATEGORIES, SAMPLES, catLabel, sampleView } from '../lib/places'
import { STORIES } from '../lib/stories'
import { useAppStore } from '../store/useAppStore'
import { useT } from '../lib/useT'

// 지도: 신화 속 장소(핀) 위에 "내 이야기가 담긴 장소"를 더함
export default function MapPage() {
  const t = useT()
  const lang = useAppStore((s) => s.lang)
  const user = useAppStore((s) => s.user)
  const places = useAppStore((s) => s.places)
  const mode = useAppStore((s) => s.placesMode)
  const loading = useAppStore((s) => s.placesLoading)
  const hidden = useAppStore((s) => s.hiddenSamples)
  const loadPlaces = useAppStore((s) => s.loadPlaces)
  const removePlace = useAppStore((s) => s.removePlace)
  // 지도에서 고른 핀·모달·필터는 이 페이지 안에서만 필요 → 지역 상태
  const [selected, setSelected] = useState(STORIES[0])
  const [selectedPlace, setSelectedPlace] = useState(null)
  const [adding, setAdding] = useState(false)
  const [editing, setEditing] = useState(null)   // 수정 중인 장소
  const [cat, setCat] = useState('')

  useEffect(() => { loadPlaces() }, [loadPlaces, user])

  const all = useMemo(
    () => [...places, ...SAMPLES.filter((s) => !hidden.includes(s.id)).map((s) => sampleView(s, lang))],
    [places, hidden, lang],
  )
  // 지도에서 신화 핀을 누르면 아래 목록의 그 카드로 이동
  const pickStory = (s) => {
    setSelected(s)
    document.getElementById(`lore-${s.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
  const shown = all.filter((p) => !cat || p.category === cat)

  return (
    <>
      <PageHeader title="Story Map" subtitle={t('map.sub')} />
      <div className="map-wrap">
        <IslandMap selectedId={selected.id} onSelect={pickStory} places={shown} selectedPlaceId={selectedPlace?.id} onSelectPlace={setSelectedPlace} />
      </div>

      <div className="places-head">
        <h2 className="section-title">{t('map.mine')} <small>{all.length}</small></h2>
        <div className="places-tools">
          <label className="group-select">
            <span className="sr-only">{t('map.cat')}</span>
            <select value={cat} onChange={(e) => setCat(e.target.value)}>
              <option value="">{t('map.catAll')}</option>
              {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{catLabel(c.id, lang)}</option>)}
            </select>
          </label>
          <button className="btn dark small" onClick={() => setAdding(true)}>+ {t('map.add')}</button>
        </div>
      </div>
      {mode === 'local' && <p className="hint">{t('map.local')}</p>}
      {loading && <Loading />}
      {!loading && shown.length === 0 && <p className="hint">{t('map.none')}</p>}
      <ul className="place-list">
        {shown.map((p) => (
          <li key={p.id} className={`place-row ${selectedPlace?.id === p.id ? 'on' : ''}`} onClick={() => setSelectedPlace(p)}>
            <div className="place-art">{p.drawing ? <Drawing d={p.drawing} /> : <span>{catLabel(p.category, lang)[0]}</span>}</div>
            <div className="place-main">
              <strong>{p.name}</strong>
              <span className="place-meta">
                <em className="chip-dark">{catLabel(p.category, lang)}</em>
                {p.sample && <em className="chip-soft">{t('map.sample')}</em>}
                {p.address && <span>{p.address}</span>}
              </span>
              {p.memo && <p>{p.memo}</p>}
            </div>
            <div className="place-actions">
            <GoButton place={{ name: p.name, addr: p.address, lat: p.lat, lng: p.lng }} className="place-go" />
            <button className="x edit" aria-label={`${t('map.edit')}: ${p.name}`} title={t('map.edit')}
              onClick={(e) => { e.stopPropagation(); setEditing(p) }}>
              <svg viewBox="0 0 24 24" width="19" height="19" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16v4ZM13.5 6.5l4 4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <button className="x trash" aria-label={`${t('map.del')}: ${p.name}`} title={t('map.del')}
              onClick={(e) => { e.stopPropagation(); removePlace(p) }}>
              <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            </div>
          </li>
        ))}
      </ul>

      <h2 className="section-title">{t('map.lore')} <small>{STORIES.length}</small></h2>
      <div className="lore-places">
        {STORIES.map((s) => (
          <div key={s.id} id={`lore-${s.id}`} className={`lore-place ${selected.id === s.id ? 'on' : ''}`} onClick={() => setSelected(s)}>
            <StoryCard story={s} showSummary />
          </div>
        ))}
      </div>
      {adding && <PlaceModal onClose={() => setAdding(false)} />}
      {editing && <PlaceModal place={editing} onClose={() => setEditing(null)} />}
    </>
  )
}
