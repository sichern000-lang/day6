import { useEffect, useState } from 'react'
import { fetchWeather } from '../api/client'
import { useAppStore } from '../store/useAppStore'
import { useT } from '../lib/useT'

const EN = {
  제주시: 'Jeju City', 서귀포시: 'Seogwipo',
  맑음: 'Clear', 구름많음: 'Mostly cloudy', 흐림: 'Overcast',
  비: 'Rain', '비/눈': 'Rain/Snow', 눈: 'Snow', 소나기: 'Showers',
}

export default function WeatherChip({ place = '서귀포시' }) {
  const lang = useAppStore((s) => s.lang)
  const t = useT()
  const [w, setW] = useState(null)
  const [error, setError] = useState('')
  const tr = (v) => (lang === 'en' ? EN[v] ?? v : v)

  useEffect(() => {
    fetchWeather(place).then((list) => setW(list[0])).catch((e) => setError(e.message))
  }, [place])

  if (error) return <span className="chip warn" title={error}>{t('wx.fail')}</span>
  if (!w) return <span className="chip">{t('wx.loading')}</span>
  return (
    <span className="chip live">
      {tr(place)} {w.temp}℃ · {tr(w.rain !== '없음' ? w.rain : w.sky)} · {t('wx.pop')} {w.pop}%
    </span>
  )
}
