import { useEffect, useState } from 'react'
import { fetchWeather } from '../api/client'
import { useAppStore } from '../store/useAppStore'
import { useT } from '../lib/useT'

// 기상청이 한국어로 주는 지역·하늘·강수 낱말을 화면 언어로
const WORDS = {
  en: { 제주시: 'Jeju City', 서귀포시: 'Seogwipo', 맑음: 'Clear', 구름많음: 'Mostly cloudy', 흐림: 'Overcast', 비: 'Rain', '비/눈': 'Rain/Snow', 눈: 'Snow', 소나기: 'Showers' },
  es: { 제주시: 'Jeju', 서귀포시: 'Seogwipo', 맑음: 'Despejado', 구름많음: 'Muy nublado', 흐림: 'Nublado', 비: 'Lluvia', '비/눈': 'Lluvia/Nieve', 눈: 'Nieve', 소나기: 'Chubascos' },
  de: { 제주시: 'Jeju-Stadt', 서귀포시: 'Seogwipo', 맑음: 'Klar', 구름많음: 'Stark bewölkt', 흐림: 'Bedeckt', 비: 'Regen', '비/눈': 'Regen/Schnee', 눈: 'Schnee', 소나기: 'Schauer' },
}

export default function WeatherChip({ place = '서귀포시' }) {
  const lang = useAppStore((s) => s.lang)
  const t = useT()
  const [w, setW] = useState(null)
  const [error, setError] = useState('')
  const tr = (v) => WORDS[lang]?.[v] ?? v

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
