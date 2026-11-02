import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import Modal from '../components/Modal'
import Doodle, { DOODLES } from '../components/Doodle'
import { Empty, Loading } from '../components/Status'
import { isSupabaseReady } from '../lib/supabase'
import { getStoryById, localize } from '../lib/stories'
import { folkTitle } from '../lib/folkTitle'
import { rng } from '../lib/rng'
import { shareText } from '../lib/askShare'
import { fetchRandomDrawings } from '../lib/places'
import { useAppStore } from '../store/useAppStore'
import { useT } from '../lib/useT'

// 내 수첩: 담은 이야기가 색색의 메모지로 흩어져 있고, 옆으로 밀어서 넘겨 봄.
// 북마크한 메모는 맨 앞(맨 위)에 오고, "리스트로 보기"를 누르면 가지런히 정리됨.
// (북마크는 saved_stories.visited 칸을 그대로 씀)
const TONES = ['#c9d8ee', '#cfe0d2', '#d9d3ee', '#ebd2cc', '#d3e3ea']
const PAPER = ['#f1f5f1', '#e6edf2', '#e8efe6']   // 두들 종이 조각 색 (랜딩 인트로와 같은 톤)
const STEP = 202   // 메모지 사이 간격(px) — 카드보다 좁아서 살짝 겹침
const pad2 = (n) => String(n).padStart(2, '0')
const dateOf = (iso) => { const d = new Date(iso); return isNaN(d) ? '' : `${pad2(d.getMonth() + 1)} / ${pad2(d.getDate())} / ${pad2(d.getFullYear() % 100)}` }

export default function Notebook() {
  const t = useT()
  const lang = useAppStore((s) => s.lang)
  const saved = useAppStore((s) => s.saved)
  const loading = useAppStore((s) => s.savedLoading)
  const loadSaved = useAppStore((s) => s.loadSaved)
  const toggleVisited = useAppStore((s) => s.toggleVisited)
  const updateMemo = useAppStore((s) => s.updateMemo)
  const removeStory = useAppStore((s) => s.removeStory)
  const nickname = useAppStore((s) => s.nickname)
  const [list, setList] = useState(false)       // true: 리스트로 보기
  const [reading, setReading] = useState(null)  // 전문을 펼쳐 보는 Ask 메모

  useEffect(() => { loadSaved() }, [loadSaved, nickname])

  // 북마크한 메모를 앞으로 (나머지는 담은 순서 그대로)
  const notes = useMemo(() => [...saved].sort((a, b) => Number(!!b.visited) - Number(!!a.visited)), [saved])

  return (
    <>
      <div className="nb-top">
        <PageHeader title="My Notebook" subtitle={t('nb.sub', { who: nickname || t('anon') })} />
        {notes.length > 0 && (
          <button className="nb-toggle" onClick={() => setList((l) => !l)} aria-pressed={list}>
            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
              {list ? <path d="M5 6h6v6H5zM13 9h6v6h-6zM8 14h6v5H8z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                : <path d="M5 7h14M5 12h14M5 17h14" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />}
            </svg>
            {t(list ? 'nb.notes' : 'nb.list')}
          </button>
        )}
      </div>
      {!isSupabaseReady && <div className="status error">{t('nb.nosb')}</div>}
      {loading && <Loading />}
      {!loading && isSupabaseReady && saved.length === 0 && <Empty text={t('nb.empty')} />}

      {notes.length > 0 && (list
        ? <ul className="nb-list" key="list">{notes.map((s, i) => <li key={s.id}><Note s={s} i={i} lang={lang} t={t} list onMark={toggleVisited} onMemo={updateMemo} onDel={removeStory} onRead={setReading} /></li>)}</ul>
        : <Slider key="notes" count={notes.length} hint={t('nb.hint')} decor={<Scraps count={notes.length} />}>
            {notes.map((s, i) => <Note key={s.id} s={s} i={i} lang={lang} t={t} onMark={toggleVisited} onMemo={updateMemo} onDel={removeStory} onRead={setReading} />)}
          </Slider>)}

      {reading && <AskModal s={reading} t={t} onClose={() => setReading(null)} />}
    </>
  )
}

// 옆으로 밀어서 넘기는 줄 — 마우스는 끌어서, 터치·트랙패드는 그대로 스크롤
function Slider({ count, hint, decor, children }) {
  const box = useRef(null)
  const drag = useRef(null)
  const down = (e) => {
    if (e.pointerType !== 'mouse' || e.target.closest('button, a, textarea, input')) return
    drag.current = { x: e.clientX, left: box.current.scrollLeft }
    box.current.classList.add('grabbing')
  }
  const move = (e) => { if (drag.current) box.current.scrollLeft = drag.current.left - (e.clientX - drag.current.x) }
  const up = () => { drag.current = null; box.current?.classList.remove('grabbing') }
  return (
    <>
      <div className="nb-slide" ref={box} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerLeave={up}>
        <div className="nb-track" style={{ width: `${count * STEP + 340}px` }}>{decor}{children}</div>
      </div>
      <p className="nb-hint">← {hint} →</p>
    </>
  )
}

// 메모지 사이에 섞이는 두들 종이 조각들 (랜딩 인트로의 그림과 다른 사람들이 그린 그림) — 리스트 보기에서는 나오지 않음
function Scraps({ count }) {
  const [mine, setMine] = useState([])
  useEffect(() => { let on = true; fetchRandomDrawings(5).then((d) => on && setMine(d)); return () => { on = false } }, [])
  const width = count * STEP + 340
  const scraps = useMemo(() => {
    const r = rng(`scraps-${count}`)
    const n = Math.max(5, Math.round(count * 0.9) + 2)
    const bag = [...DOODLES].sort(() => r() - 0.5)
    return Array.from({ length: n }, (_, k) => ({
      id: k, doodle: bag[k % bag.length], size: 120 + Math.round(r() * 70),
      x: ((k + 0.15 + r() * 0.7) / n) * (width - 160), y: Math.round(10 + r() * 340),
      rot: ((r() - 0.5) * 50).toFixed(1), z: r() < 0.5 ? 0 : 3, tone: Math.floor(r() * 3),
    }))
  }, [count, width])
  return scraps.map((s, k) => (
    <figure key={s.id} className="scrap" aria-hidden="true"
      style={{ left: s.x, top: s.y, width: s.size, '--rot': `${s.rot}deg`, zIndex: s.z }}>
      <Doodle variant={mine[k] ? 'mine' : s.doodle} d={mine[k]?.drawing} seed={`nb-${s.id}`} cut paper={PAPER[s.tone]} />
    </figure>
  ))
}

function Note({ s, i, lang, t, list = false, onMark, onMemo, onDel, onRead }) {
  const [memo, setMemo] = useState(s.memo ?? '')
  useEffect(() => setMemo(s.memo ?? ''), [s.memo])
  const ask = s.story_id.startsWith('ask:')
  const story = getStoryById(s.story_id)
  const title = (story ? localize(story, lang)?.title : folkTitle(s.title, lang)) ?? s.title
  const to = story ? `/stories/${s.story_id}` : `/stories?q=${encodeURIComponent(s.title)}`
  // 같은 메모는 항상 같은 색·기울기·높이로 흩어짐
  const style = useMemo(() => {
    const r = rng(`note-${s.id}`)
    return { '--tone': TONES[Math.floor(r() * TONES.length)], '--rot': `${((r() - 0.5) * 24).toFixed(1)}deg`, '--dy': `${Math.round((r() - 0.5) * 190)}px`, '--dx': `${Math.round((r() - 0.5) * 70)}px`, '--i': i, zIndex: 1 + Math.floor(r() * 2) * 2 }
  }, [s.id, i])
  const marked = !!s.visited

  return (
    <article className={`note-card ${marked ? 'marked' : ''} ${list ? 'as-list' : ''}`} style={style}>
      <button className="note-mark" role="checkbox" aria-checked={marked} aria-label={`${t('nb.mark')}: ${title}`} title={t('nb.mark')} onClick={() => onMark(s)}>
        <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M7 3.5h10a1 1 0 0 1 1 1V21l-6-4-6 4V4.5a1 1 0 0 1 1-1Z" fill={marked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /></svg>
      </button>
      <p className="note-kind">{ask ? 'ask' : 'story'}</p>
      {ask
        ? <button className="note-title" onClick={() => onRead(s)}>{title}</button>
        : <Link className="note-title" to={to}>{title}</Link>}
      {ask && <p className="note-answer">{s.answer}</p>}
      <textarea className="note-memo" rows={ask ? 2 : 3} value={memo} maxLength={140} placeholder={t('nb.memoph')} aria-label={t('nb.memoph')}
        onChange={(e) => setMemo(e.target.value)} onBlur={() => onMemo(s, memo.trim())} />
      <div className="note-foot">
        <span>date : {dateOf(s.created_at)}</span>
        <button className="note-del" aria-label={t('nb.del')} title={t('nb.del')} onClick={() => onDel(s.id)}>×</button>
      </div>
    </article>
  )
}

function AskModal({ s, t, onClose }) {
  const toast = useAppStore((st) => st.toast)
  return (
    <Modal onClose={onClose} label={s.title}>
      <h2 className="modal-title">{s.title}</h2>
      <p className="ask-full">{s.answer}</p>
      <div className="modal-actions">
        <button className="btn ghost" onClick={async () => { const r = await shareText({ title: t('chat.shareHead'), text: `Q. ${s.title}\n\n${s.answer}` }); if (r === 'copied') toast(t('chat.copied')) }}>{t('chat.share')}</button>
      </div>
    </Modal>
  )
}
