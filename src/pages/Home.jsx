import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ping } from '../api/client'
import { isSupabaseReady, supabase } from '../lib/supabase'
import { STORIES, storyOfTheDay } from '../lib/stories'
import { useAppStore } from '../store/useAppStore'
import WeatherChip from '../components/WeatherChip'
import StoryCard from '../components/StoryCard'
import Landscape from '../components/Landscape'

export default function Home() {
  const nickname = useAppStore((s) => s.nickname)
  const setNickname = useAppStore((s) => s.setNickname)
  const loadSaved = useAppStore((s) => s.loadSaved)
  const [db, setDb] = useState(isSupabaseReady
    ? { state: 'wait', msg: '확인 중…' }
    : { state: 'fail', msg: '.env.local 에 Supabase 값을 넣으세요' })
  const [api, setApi] = useState({ state: 'wait', msg: '확인 중…' })

  useEffect(() => {
    if (isSupabaseReady) {
      supabase.from('saved_stories').select('id').limit(1).then(({ error }) =>
        setDb(error ? { state: 'fail', msg: error.message } : { state: 'ok', msg: '연결 OK' }))
    }
    ping()
      .then((d) => setApi({ state: 'ok', msg: `공공데이터 키 ${d.hasDataKey ? '있음' : '없음'} · Claude 키 ${d.hasClaudeKey ? '있음' : '없음'}` }))
      .catch(() => setApi({ state: 'fail', msg: 'npm run dev 가 아니라 vercel dev 로 실행하세요' }))
  }, [])

  const today = storyOfTheDay()
  return (
    <>
      {/* TODO: 기획 의도에 맞게 문구를 다듬으세요 */}
      <section className="hero">
        <Landscape />
        <div className="hero-copy">
          <WeatherChip place="제주시" />
          <h1>신들의 섬,<br /><em>이야기</em>를 따라 걷다</h1>
          <Link className="btn" to="/map">지도 펼치기</Link>
        </div>
        <div className="stickers" aria-hidden="true">
          <div className="sticker blue"><b>18,000</b><span>gods of jeju</span></div>
          <div className="sticker cream"><b>{STORIES.length}</b><span>tales on the map</span></div>
          <div className="sticker butter"><b>3</b><span>open data</span></div>
        </div>
      </section>

      <div className="sheet">
        <div className="wrap">
          <h2 className="display">이야기를 천천히,<br />장소와 함께.</h2>
          <p className="lede">오늘의 이야기부터 골라 보세요.</p>
          <div className="rail">
            <div className="rail-lead">
              <span className="eyebrow">TODAY</span>
              <h3>{today.title}</h3>
              <p>{today.summary}</p>
              <Link className="btn" to={`/stories/${today.id}`}>읽어 보기</Link>
            </div>
            {STORIES.map((s) => <StoryCard key={s.id} story={s} />)}
          </div>

          <section className="split">
            <div className="split-text">
              <span className="eyebrow">OUR TELLING</span>
              <p>
                제주에는 일만 팔천 신의 이야기가 전해집니다. 우리는 그 이야기를 지도 위에 올리고,
                이야기가 시작된 장소의 날씨와 국가유산을 이어 붙였어요.
                읽는 데서 끝나지 않고, 직접 걸어 볼 수 있도록.
              </p>
              <Link className="btn ghost" to="/guide">안내자에게 묻기</Link>
            </div>
            <div className="split-art">
              <Landscape variant="card" />
              <span className="tape" />
            </div>
          </section>

          <h2 className="display small">준비 상태</h2>
          <div className="grid three">
            <div className="panel">
              <strong>닉네임</strong>
              <input className="input" placeholder="닉네임을 입력하세요" value={nickname}
                onChange={(e) => setNickname(e.target.value)} onBlur={loadSaved} />
              <p className="hint">내 수첩이 이 닉네임으로 저장돼요.</p>
            </div>
            <Check title="Supabase" {...db} />
            <Check title="서버 함수 /api" {...api} />
          </div>
        </div>
      </div>
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
