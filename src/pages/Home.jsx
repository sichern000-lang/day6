import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ping } from '../api/client'
import { isSupabaseReady, supabase } from '../lib/supabase'
import { STORIES } from '../lib/stories'
import { useAppStore } from '../store/useAppStore'
import { useT } from '../lib/useT'
import WeatherChip from '../components/WeatherChip'
import FeatureCarousel from '../components/FeatureCarousel'
import heroImg from '../assets/hero.jpg'

export default function Home() {
  const t = useT()
  const nickname = useAppStore((s) => s.nickname)
  const setNickname = useAppStore((s) => s.setNickname)
  const loadSaved = useAppStore((s) => s.loadSaved)
  const [db, setDb] = useState(isSupabaseReady ? { state: 'wait' } : { state: 'fail', key: 'check.sbfail' })
  const [api, setApi] = useState({ state: 'wait' })

  // 랜딩에서만 섹션 단위 스크롤 스냅 (다른 페이지로 가면 해제)
  useEffect(() => {
    document.documentElement.classList.add('snap')
    return () => document.documentElement.classList.remove('snap')
  }, [])

  useEffect(() => {
    if (isSupabaseReady) {
      supabase.from('saved_stories').select('id').limit(1).then(({ error }) =>
        setDb(error ? { state: 'fail', msg: error.message } : { state: 'ok', key: 'check.ok' }))
    }
    ping()
      .then((d) => setApi({ state: 'ok', msg: `data.go.kr ${d.hasDataKey ? '✓' : '✗'} · EN tour ${d.hasEngKey ? '✓' : '✗'} · Claude ${d.hasClaudeKey ? '✓' : '✗'}` }))
      .catch(() => setApi({ state: 'fail', key: 'check.apifail' }))
  }, [])

  return (
    <>
      {/* TODO: 기획 의도에 맞게 문구를 다듬으세요 (src/lib/i18n.js) */}
      <section className="hero">
        <img className="hero-img" src={heroImg} alt="" />
        <div className="hero-copy">
          <WeatherChip place="제주시" />
          <h1>{t('home.h1a')}<br />{t('home.h1pre')}<em>{t('home.h1em')}</em>{t('home.h1post')}</h1>
          <Link className="btn" to="/map">{t('home.cta')}</Link>
        </div>
        <div className="stickers" aria-hidden="true">
          <div className="sticker blue"><b>18,000</b><span>gods of jeju</span></div>
          <div className="sticker cream"><b>{STORIES.length}</b><span>tales on the map</span></div>
          <div className="sticker butter"><b>3</b><span>open data</span></div>
        </div>
      </section>

      <section className="snap-sec">
        <div className="wrap">
          <h2 className="display">{t('home.display').split('\n').map((line, i) => <span key={i}>{i > 0 && <br />}{line}</span>)}</h2>
          <p className="lede">{t('home.lede')}</p>
          <FeatureCarousel />
          <div className="more">
            <Link className="btn ghost small" to="/stories">{t('home.more')}</Link>
          </div>
        </div>
      </section>

      <section className="snap-sec">
        <div className="wrap">
          <div className="split">
            <div className="split-text">
              <span className="eyebrow">OUR TELLING</span>
              <p>{t('home.telling')}</p>
              <Link className="btn ghost" to="/guide">{t('home.ask')}</Link>
            </div>
            <div className="split-art">
              <img src={heroImg} alt="" loading="lazy" />
              <span className="tape" />
            </div>
          </div>
        </div>
      </section>

      <section className="snap-sec">
        <div className="wrap">
          <h2 className="display small">{t('home.status')}</h2>
          <div className="grid three">
            <div className="panel">
              <strong>{t('home.nick')}</strong>
              <input className="input" placeholder={t('home.nickph')} value={nickname}
                onChange={(e) => setNickname(e.target.value)} onBlur={loadSaved} />
              <p className="hint">{t('home.nickhint')}</p>
            </div>
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
    <div className="panel">
      <strong className={`mark ${state}`}>{state === 'wait' ? '○' : '●'}</strong> <strong>{title}</strong>
      <p className="hint">{msg}</p>
    </div>
  )
}
