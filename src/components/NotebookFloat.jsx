import { useEffect, useMemo, useState } from 'react'
import Doodle from './Doodle'
import { STORIES, localize } from '../lib/stories'
import { folkTitle } from '../lib/folkTitle'
import titles from '../data/folk-titles.json'
import { useAppStore } from '../store/useAppStore'
import { useT } from '../lib/useT'

// 랜딩 마지막 섹션: 가운데 작은 수첩 그림 둘레에 짧은 이야기 제목이 둥둥 떠다님. 하트를 누르면 내 수첩에 담김.
const SHORT = Object.keys(titles).filter((k) => k.length <= 9)
const SLOTS = [[22, 12], [50, 5], [78, 12], [15, 44], [85, 44], [22, 78], [50, 90], [78, 78], [34, 28]]  // 중앙은 비워 둠 (% 좌표)
const clean = (s) => s.replace(/\s*\(.*?\)/g, '')

const pickItems = () => {
  const pool = [...STORIES.map((s) => ({ id: s.id, ko: s.title, story: s })), ...SHORT.map((k) => ({ id: `folk:${k}`, ko: k }))]
  for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]] }
  return pool.slice(0, SLOTS.length)
}

export default function NotebookFloat() {
  const t = useT()
  const lang = useAppStore((s) => s.lang)
  const saved = useAppStore((s) => s.saved)
  const nickname = useAppStore((s) => s.nickname)
  const loadSaved = useAppStore((s) => s.loadSaved)
  const toggleSave = useAppStore((s) => s.toggleSave)
  const [round, setRound] = useState(0)
  const items = useMemo(pickItems, [round])   // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { loadSaved() }, [loadSaved, nickname])

  const show = (it) => clean(it.story ? localize(it.story, lang).title : folkTitle(it.ko, lang) ?? it.ko)

  return (
    <div className="nb-float">
      <div className="nb-center" aria-hidden="true"><Doodle variant="notebook" /></div>
      {items.map((it, i) => {
        const on = saved.some((s) => s.story_id === it.id)
        const [x, y] = SLOTS[i]
        return (
          <div key={it.id} className={`nb-chip ${on ? 'on' : ''}`}
            style={{ left: `${x}%`, top: `${y}%`, '--d': `${(i * 0.7) % 3}s`, '--t': `${4.2 + (i % 4) * 0.6}s` }}>
            <span>{show(it)}</span>
            <button aria-pressed={on} aria-label={`${t('nb.heart')}: ${show(it)}`} title={t('nb.heart')}
              onClick={() => toggleSave({ id: it.id, title: it.ko })}>
              <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                <path d="M12 20.5s-7.5-4.6-9.2-9.3C1.7 8 3.6 5 6.8 5c2 0 3.6 1.2 5.2 3 1.6-1.8 3.2-3 5.2-3 3.2 0 5.1 3 4 6.2-1.7 4.7-9.2 9.3-9.2 9.3Z"
                  fill={on ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        )
      })}
      <button className="nb-shuffle" onClick={() => setRound((r) => r + 1)}>↻ {t('home.shuffle')}</button>
    </div>
  )
}
