import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import IslandScene from '../components/IslandScene'
import { GoButton } from '../components/GoModal'
import { SAMPLES, catLabel, sampleView } from '../lib/places'
import { GLOSSARY } from '../data/glossary'
import { STORIES, kindLabel, localize, project } from '../lib/stories'
import { useAppStore } from '../store/useAppStore'
import { useT } from '../lib/useT'

// 섬 위의 작은 친구들 → Your Helper 의 낱말 풀이와 연결 (여행자만 따로 설명)
const FRIENDS = {
  haenyeo: { g: 'haenyeo' }, tangerine: { g: 'hallabong' }, pig: { g: 'heukdwaeji' }, hareubang: { g: 'dolhareubang' }, olle: { g: 'olle' }, pony: { g: 'jorangmal' },
  traveler: {
    name: { ko: '여행자', en: 'Traveler', es: 'Viajero', de: 'Reisender' },
    d: { ko: '올레길을 한 걸음씩 걷고 있어요. “놀멍 쉬멍 걸으멍” — 서두르지 말고 천천히.', en: 'Walking the Olle trail one slow step at a time: “nolmeong swimeong georeumeong”, play, rest and walk.',
      es: 'Recorre el sendero Olle paso a paso: «nolmeong swimeong georeumeong», jugando, descansando y caminando.', de: 'Wandert Schritt für Schritt auf dem Olle-Pfad: „nolmeong swimeong georeumeong“ – spielen, rasten, wandern.' },
  },
}
const friendInfo = (id, lang) => {
  const f = FRIENDS[id]; if (!f) return null
  if (f.g) { const g = GLOSSARY.find((x) => x.id === f.g); const full = g[lang] ?? g.en; return { name: lang === 'ko' ? g.ko : full.split(' (')[0], title: lang === 'ko' ? g.ko : full, desc: g.d[lang] ?? g.d.en } }
  return { name: f.name[lang] ?? f.name.en, title: f.name[lang] ?? f.name.en, desc: f.d[lang] ?? f.d.en }
}

// 3D 제주 섬: 신화 장소와 내가 더한 장소가 한 섬 위에 핀으로 꽂혀 있음 (Story Map 의 3D 버전)
export default function Island() {
  const t = useT()
  const lang = useAppStore((s) => s.lang)
  const user = useAppStore((s) => s.user)
  const places = useAppStore((s) => s.places)
  const hidden = useAppStore((s) => s.hiddenSamples)
  const loadPlaces = useAppStore((s) => s.loadPlaces)
  const scene = useRef(null)
  const [selected, setSelected] = useState(null)
  const [tip, setTip] = useState(null)
  const [auto, setAuto] = useState(true)

  useEffect(() => { loadPlaces() }, [loadPlaces, user])

  const mine = useMemo(
    () => [...places, ...SAMPLES.filter((s) => !hidden.includes(s.id)).map((s) => sampleView(s, lang))].filter((p) => p.lat != null && p.lng != null),
    [places, hidden, lang],
  )
  const pins = useMemo(() => [
    ...STORIES.map((s) => { const v = localize(s, lang); return { key: `story:${s.id}`, kind: 'story', ...project(s.lat, s.lng), name: v.title, sub: v.place } }),
    ...mine.map((p) => ({ key: `place:${p.id}`, kind: 'place', ...project(p.lat, p.lng), name: p.name, sub: p.address, drawing: p.drawing })),
  ], [lang, mine])

  const story = selected?.startsWith('story:') ? STORIES.find((s) => `story:${s.id}` === selected) : null
  const place = selected?.startsWith('place:') ? mine.find((p) => `place:${p.id}` === selected) : null
  const sv = story && localize(story, lang)
  const friend = selected?.startsWith('prop:') ? friendInfo(selected.slice(5), lang) : null
  const tipFriend = tip?.prop ? friendInfo(tip.prop, lang) : null
  const noGL = tip?.error

  return (
    <>
      <PageHeader title="Jeju Island" subtitle={t('island.sub')} />
      <div className="island-stage">
        {noGL ? (
          <div className="island-fallback"><p>{t('island.nowebgl')}</p><Link className="btn" to="/map">Story Map →</Link></div>
        ) : (
          <>
            <IslandScene ref={scene} pins={pins} selectedKey={selected} autoRotate={auto}
              onPick={(k) => setSelected((cur) => (cur === k ? null : k))} onHover={setTip} />
            {(tip?.pin || tipFriend) && (
              <div className="island-tip" style={{ left: tip.x, top: tip.y }} role="tooltip">
                <strong>{tip.pin?.name ?? tipFriend.name}</strong>{tip.pin?.sub && <span>{tip.pin.sub}</span>}
              </div>
            )}
            <div className="island-tools">
              <button onClick={() => { setSelected(null); scene.current?.reset() }}>{t('island.reset')}</button>
              <button className={auto ? 'on' : ''} aria-pressed={auto} onClick={() => setAuto((a) => !a)}>{t('island.auto')}</button>
            </div>
            <p className="island-hint">{t('island.hint')}</p>
            <div className="island-legend">
              <span><i className="lg-story" />{t('island.legendStory')}</span>
              <span><i className="lg-mine" />{t('island.legendMine')}</span>
            </div>
            {(story || place || friend) && (
              <aside className="island-card" aria-live="polite">
                <button className="island-x" aria-label={t('modal.close')} onClick={() => setSelected(null)}>×</button>
                {story && (
                  <>
                    <p className="island-kind">{kindLabel(story.kind, lang)} · {sv.place}</p>
                    <h2>{sv.title}</h2>
                    <p>{sv.summary}</p>
                    <Link className="textlink" to={`/stories/${story.id}`}>{t('island.read')} →</Link>
                  </>
                )}
                {friend && (
                  <>
                    <p className="island-kind">Your Helper</p>
                    <h2>{friend.title}</h2>
                    <p>{friend.desc}</p>
                    <Link className="textlink" to="/helper">Your Helper →</Link>
                  </>
                )}
                {place && (
                  <>
                    <p className="island-kind">{catLabel(place.category, lang)}{place.sample ? ` · ${t('map.sample')}` : ''}</p>
                    <h2>{place.name}</h2>
                    {place.memo && <p>{place.memo}</p>}
                    {place.address && <p className="island-addr">{place.address}</p>}
                    <div className="island-actions">
                      <GoButton place={{ name: place.name, addr: place.address, lat: place.lat, lng: place.lng }} />
                      <Link className="textlink" to="/map">Story Map →</Link>
                    </div>
                  </>
                )}
              </aside>
            )}
          </>
        )}
      </div>
    </>
  )
}
