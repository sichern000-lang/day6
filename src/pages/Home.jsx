import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ping } from '../api/client'
import { isSupabaseReady, supabase } from '../lib/supabase'
import { useAppStore } from '../store/useAppStore'
import { useT } from '../lib/useT'
import WeatherChip from '../components/WeatherChip'
import FeatureCarousel from '../components/FeatureCarousel'
import IntroNotes from '../components/IntroNotes'
import AskShowcase from '../components/AskShowcase'
import NotebookFloat from '../components/NotebookFloat'
import TypedTitle from '../components/TypedTitle'
import { Scribble } from '../components/LandingArt'
import heroImg from '../assets/hero.jpg'

export default function Home() {
  const t = useT()
  const nickname = useAppStore((s) => s.nickname)
  const setNickname = useAppStore((s) => s.setNickname)
  const loadSaved = useAppStore((s) => s.loadSaved)
  const openChat = useAppStore((s) => s.openChat)
  const [db, setDb] = useState(isSupabaseReady ? { state: 'wait' } : { state: 'fail', key: 'check.sbfail' })
  const [api, setApi] = useState({ state: 'wait' })
  const introDone = useAppStore((s) => s.introDone)
  const [typed, setTyped] = useState(false)
  const onTyped = useCallback(() => setTyped(true), [])

  // 랜딩에서만 섹션 단위 스크롤 스냅 (다른 페이지로 가면 해제)
  useEffect(() => {
    document.documentElement.classList.add('snap')
    return () => document.documentElement.classList.remove('snap')
  }, [])

  // 스크롤해서 보이는 만큼 내용이 차례로 나타남
  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    const els = [...document.querySelectorAll('.statement-text > p, .land-map, .scribble, .stories-intro > *, .track > .slide, .ask-copy > *, .ask-window, .nb-sec .nb-head > *, .nb-float, .nb-foot')]
    els.forEach((el) => el.classList.add('reveal'))
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (!e.isIntersecting) return
      const sib = [...e.target.parentElement.children].indexOf(e.target)
      e.target.style.transitionDelay = `${Math.min(sib, 4) * 0.12}s`
      e.target.classList.add('in')
      io.unobserve(e.target)
    }), { threshold: 0.18 })
    els.forEach((el) => io.observe(el))
    return () => { io.disconnect(); els.forEach((el) => el.classList.remove('reveal', 'in')) }
  }, [])

  useEffect(() => {
    if (isSupabaseReady) {
      supabase.from('saved_stories').select('id').limit(1).then(({ error }) =>
        setDb(error ? { state: 'fail', msg: error.message } : { state: 'ok', key: 'check.ok' }))
    }
    ping()
      .then((d) => setApi({ state: 'ok', msg: `data.go.kr ${d.hasDataKey ? '✓' : '✗'} · EN tour ${d.hasEngKey ? '✓' : '✗'} · Gemini ${d.hasAiKey ? '✓' : '✗'}` }))
      .catch(() => setApi({ state: 'fail', key: 'check.apifail' }))
  }, [])

  return (
    <>
      {/* TODO: 기획 의도에 맞게 문구를 다듬으세요 (src/lib/i18n.js) */}
      {!introDone && <IntroNotes />}
      <section className="hero">
        <img className="hero-img" src={heroImg} alt="" />
        <div className="hero-copy">
          <div className={`hero-after ${typed ? 'in' : ''}`}><WeatherChip place="제주시" /></div>
          <TypedTitle start={introDone} onDone={onTyped}
            parts={[{ text: t('home.h1a') }, { br: true }, { text: t('home.h1pre') }, { text: t('home.h1em'), em: true }, { text: t('home.h1post') }]} />
          <Link className={`btn hero-after ${typed ? 'in' : ''}`} to="/stories">{t('home.cta')}</Link>
        </div>
      </section>

      <section className="snap-sec statement">
        <div className="land-map" aria-hidden="true" />
        <div className="wrap">
          <div className="statement-text">
            {t('home.statement').split('\n\n').map((para, i) => (
              <p key={i}>{para.split('\n').map((line, j) => <span key={j}>{j > 0 && <br />}{line}</span>)}</p>
            ))}
          </div>
        </div>
      </section>

      <section className="snap-sec stories-sec">
        <Scribble kind="burst" className="sc-burst" />
        <Scribble kind="grass" className="sc-grass" />
        <Scribble kind="hatch" className="sc-hatch" />
        <div className="wrap">
          <div className="stories-grid">
            <div className="stories-intro">
              <span className="eyebrow">STORIES</span>
              <h2 className="display">{t('home.storiesTitle')}</h2>
              <p className="lede">{t('home.storiesSub').split('\n').map((line, i) => <span key={i}>{i > 0 && <br />}{line}</span>)}</p>
              <Link className="textlink" to="/stories">{t('home.more')} <span aria-hidden="true">↗</span></Link>
            </div>
            <FeatureCarousel />
          </div>
        </div>
      </section>

      <AskShowcase />

      <section className="snap-sec nb-sec">
        <div className="wrap">
          <div className="nb-head">
            <span className="eyebrow">MY NOTEBOOK</span>
            <h2 className="display small">{t('home.nbTitle').split('\n').map((line, i) => <span key={i}>{i > 0 && <br />}{line}</span>)}</h2>
            <p className="lede">{t('home.nbSub')}</p>
          </div>
          <NotebookFloat />
          <div className="nb-foot">
            <Link className="btn" to="/notebook">{t('home.nbOpen')}</Link>
            <input className="input nb-nick" placeholder={t('home.nickph')} aria-label={t('home.nick')} value={nickname}
              onChange={(e) => setNickname(e.target.value)} onBlur={loadSaved} />
            <Check title="Supabase" state={db.state} msg={db.msg ?? (db.key ? t(db.key) : t('check.wait'))} />
            <Check title="/api" state={api.state} msg={api.msg ?? (api.key ? t(api.key) : t('check.wait'))} />
          </div>
        </div>
      </section>
    </>
  )
}

function Check({ title, state, msg }) {
  return (
    <span className="check-chip" title={msg}>
      <strong className={`mark ${state}`}>{state === 'wait' ? '○' : '●'}</strong> {title}
    </span>
  )
}
