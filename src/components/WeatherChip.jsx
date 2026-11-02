import { useEffect, useState } from 'react'
import { fetchWeather } from '../api/client'

export default function WeatherChip({ place = '서귀포시' }) {
  const [w, setW] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchWeather(place).then((list) => setW(list[0])).catch((e) => setError(e.message))
  }, [place])

  if (error) return <span className="chip warn" title={error}>날씨를 불러오지 못했어요</span>
  if (!w) return <span className="chip">날씨 확인 중…</span>
  return (
    <span className="chip live">
      {place} {w.temp}℃ · {w.rain !== '없음' ? w.rain : w.sky} · 강수 {w.pop}%
    </span>
  )
}
