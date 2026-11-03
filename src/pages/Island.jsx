import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import IslandScene from '../components/IslandScene'
import CharacterModal from '../components/CharacterModal'
import Modal from '../components/Modal'
import { MAX_CHARS, charName, createChar, deleteChar, loadChars, updateChar } from '../lib/characters'
import { GoButton } from '../components/GoModal'
import { SAMPLES, catLabel, ownerOf, sampleView } from '../lib/places'
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
  const toast = useAppStore((s) => s.toast)
  // 내 캐릭터: 만들기 창 → (섬의 땅을 눌러 세우기) → 말풍선과 함께 섬 위에 서 있음
  const [chars, setChars] = useState([])
  const [charMode, setCharMode] = useState('db')
  const [adding, setAdding] = useState(false)
  const [placing, setPlacing] = useState(null)       // { type, msg } — 땅을 누르면 그 자리에 세움
  const [photo, setPhoto] = useState(null)           // { busy } | { url, blob }

  useEffect(() => { loadPlaces() }, [loadPlaces, user])
  useEffect(() => { loadChars(ownerOf(user)).then(({ rows, mode }) => { setChars(rows); setCharMode(mode) }) }, [user])

  async function onPlace(at) {
    if (!placing) return
    if (at.error) return toast(t('island.needLand'), 'warn')
    try {
      const row = await createChar(ownerOf(user), { ...placing, x: at.x, y: at.y }, charMode)
      setChars((c) => [...c, row]); setPlacing(null); setSelected(`char:${row.id}`); toast(t('island.added'))
    } catch (e) { toast(e.message, 'error') }
  }
  async function saveMsg(c, msg) {
    if ((c.msg ?? '') === msg) return
    try { const row = await updateChar(c.id, { msg }, charMode); setChars((all) => all.map((x) => (x.id === c.id ? row : x))) } catch (e) { toast(e.message, 'error') }
  }
  async function removeChar(c) {
    try { await deleteChar(c.id, charMode); setChars((all) => all.filter((x) => x.id !== c.id)); setSelected(null) } catch (e) { toast(e.message, 'error') }
  }
  function startAdd() {
    if (chars.length >= MAX_CHARS) return toast(t('island.max'), 'warn')
    setAdding(true)
  }

  // 사진: 4:5 세로 그림을 만들어 보여 주고, 휴대폰이면 공유 창(인스타그램 포함), 아니면 이미지로 저장
  async function takePhoto() {
    setPhoto({ busy: true })
    try {
      const blob = await scene.current.snapshot({ footer: 'Jeju Story Archive', sub: t('island.shareText') })
      setPhoto({ url: URL.createObjectURL(blob), blob })
    } catch { setPhoto(null); toast(t('island.photoFail'), 'error') }
  }
  const closePhoto = () => { if (photo?.url) URL.revokeObjectURL(photo.url); setPhoto(null) }
  async function sharePhoto() {
    const file = new File([photo.blob], 'jeju-island.png', { type: 'image/png' })
    if (navigator.canShare?.({ files: [file] })) {
      try { await navigator.share({ files: [file], title: 'Jeju Story Archive', text: t('island.shareText') }) } catch { /* 공유 창을 닫은 경우 */ }
    } else savePhoto()
  }
  function savePhoto() {
    const a = document.createElement('a'); a.href = photo.url; a.download = 'jeju-island.png'; document.body.appendChild(a); a.click(); a.remove()
  }


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
  const chr = selected?.startsWith('char:') ? chars.find((c) => `char:${c.id}` === selected) : null
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
            <IslandScene ref={scene} pins={pins} selectedKey={selected} autoRotate={auto} characters={chars} placing={!!placing} onPlace={onPlace}
              onPick={(k) => setSelected((cur) => (cur === k ? null : k))} onHover={setTip} />
            {(tip?.pin || tipFriend || tip?.char) && (
              <div className="island-tip" style={{ left: tip.x, top: tip.y }} role="tooltip">
                <strong>{tip.pin?.name ?? tipFriend?.name ?? charName(chars.find((c) => c.id === tip.char)?.type, lang)}</strong>{tip.pin?.sub && <span>{tip.pin.sub}</span>}
              </div>
            )}
            {placing && (
              <div className="island-banner" role="status">{t('island.placing')} <button onClick={() => setPlacing(null)}>{t('island.cancel')}</button></div>
            )}
            <div className="island-tools">
              <button className="char-add" onClick={startAdd}>＋ {t('island.addChar')}</button>
              <button onClick={takePhoto}>{t('island.photo')}</button>
              <button onClick={() => { setSelected(null); scene.current?.reset() }}>{t('island.reset')}</button>
              <button className={auto ? 'on' : ''} aria-pressed={auto} onClick={() => setAuto((a) => !a)}>{t('island.auto')}</button>
            </div>
            <p className="island-hint">{t('island.hint')}</p>
            <div className="island-legend">
              <span><i className="lg-story" />{t('island.legendStory')}</span>
              <span><i className="lg-mine" />{t('island.legendMine')}</span>
            </div>
            {(story || place || friend || chr) && (
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
                {chr && (
                  <>
                    <p className="island-kind">{t('island.myChar')}</p>
                    <h2>{charName(chr.type, lang)}</h2>
                    <input className="input char-msg" defaultValue={chr.msg} maxLength={30} placeholder={t('island.msgPh')} aria-label={t('island.msgLabel')}
                      key={chr.id} onBlur={(e) => saveMsg(chr, e.target.value.trim())} onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()} />
                    <div className="island-actions">
                      <button className="textlink danger" onClick={() => removeChar(chr)}>{t('island.delete')}</button>
                      {charMode === 'local' && <span className="island-addr">{t('island.localNote')}</span>}
                    </div>
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
      {adding && <CharacterModal onClose={() => setAdding(false)} onPlace={(c) => { setPlacing(c); setAdding(false); setSelected(null) }} />}
      {photo && (
        <Modal onClose={closePhoto} label={t('island.photo')}>
          <h2 className="modal-title">{t('island.photoTitle')}</h2>
          <p className="modal-sub">{t('island.photoSub')}</p>
          {photo.busy ? <p className="hint">{t('island.making')}</p> : (
            <>
              <img className="photo-preview" src={photo.url} alt="" />
              <div className="modal-actions">
                <button className="btn dark" onClick={sharePhoto}>{t('island.share')}</button>
                <button className="btn ghost" onClick={savePhoto}>{t('island.saveImg')}</button>
              </div>
              <p className="hint">{t('island.shareHint')}</p>
            </>
          )}
        </Modal>
      )}
    </>
  )
}
