import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import SpeakButton from '../components/SpeakButton'
import { CATS, GLOSSARY } from '../data/glossary'
import { romanize } from '../lib/romanize'
import { useAppStore } from '../store/useAppStore'
import { useT } from '../lib/useT'

// Your Helper: 제주 이야기에 자주 나오는 말을 쉬운 말로 풀어 주는 용어집 (발음 듣기 · 로마자 · 관련 이야기 찾기)
export default function Helper() {
  const t = useT()
  const lang = useAppStore((s) => s.lang)
  const saved = useAppStore((s) => s.saved)
  const nickname = useAppStore((s) => s.nickname)
  const loadSaved = useAppStore((s) => s.loadSaved)
  const toggleSave = useAppStore((s) => s.toggleSave)
  useEffect(() => { loadSaved() }, [loadSaved, nickname])
  const [cat, setCat] = useState('')
  const [q, setQ] = useState('')

  const shown = useMemo(() => {
    const s = q.trim().toLowerCase()
    return GLOSSARY.filter((g) => (!cat || g.cat === cat) &&
      (!s || [g.ko, romanize(g.ko), g.en, g[lang] ?? '', g.d[lang] ?? g.d.en].join(' ').toLowerCase().includes(s)))
  }, [cat, q, lang])

  return (
    <>
      <PageHeader center title="Your Helper" subtitle={t('helper.sub')} />
      <input className="input search-slim helper-search" placeholder={t('helper.search')} value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="tabs center pills">
        {['', ...CATS].map((c) => (
          <button key={c || 'all'} className={cat === c ? 'on' : ''} onClick={() => setCat(c)}>{t(c ? `helper.cat.${c}` : 'helper.all')}</button>
        ))}
      </div>

      {shown.length === 0 && <p className="hint center-text">{t('helper.none')}</p>}
      <div className="helper-grid">
        {shown.map((g) => (
          <article key={g.id} className="helper-card">
            <p className="helper-cat">{t(`helper.cat.${g.cat}`)}</p>
            <h3 className="helper-ko">{g.ko} <SpeakButton text={g.ko} /></h3>
            <p className="helper-rom">{romanize(g.ko)}</p>
            {lang !== 'ko' && <p className="helper-name">{g[lang] ?? g.en}</p>}
            <p className="helper-desc">{g.d[lang] ?? g.d.en}</p>
            <div className="helper-actions">
              {g.q && <Link className="textlink" to={`/stories?q=${encodeURIComponent(g.q)}`}>{t('helper.find')} →</Link>}
              {(() => {
                const on = saved.some((s) => s.story_id === `word:${g.id}`)
                return (
                  <button className={`helper-add ${on ? 'on' : ''}`} aria-pressed={on} onClick={() => toggleSave({ id: `word:${g.id}`, title: g.ko })}>
                    <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><path d="M7 3.5h10a1 1 0 0 1 1 1V21l-6-4-6 4V4.5a1 1 0 0 1 1-1Z" fill={on ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" /></svg>
                    {t(on ? 'helper.saved' : 'helper.add')}
                  </button>
                )
              })()}
            </div>
          </article>
        ))}
      </div>
    </>
  )
}
