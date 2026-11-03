import { useMemo, useState } from 'react'
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
            {g.q && <Link className="textlink" to={`/stories?q=${encodeURIComponent(g.q)}`}>{t('helper.find')} →</Link>}
          </article>
        ))}
      </div>
    </>
  )
}
