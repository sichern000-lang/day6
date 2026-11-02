import { useEffect, useState } from 'react'
import { translateTexts } from '../api/client'

// 한국어 → 영어 번역 캐시 (새로고침해도 같은 낱말은 다시 번역하지 않도록 sessionStorage 에도 저장)
const KEY = 'sinhwa-tr-cache'
const load = () => { try { return JSON.parse(sessionStorage.getItem(KEY)) ?? {} } catch { return {} } }
const cache = load()
const save = () => { try { sessionStorage.setItem(KEY, JSON.stringify(cache)) } catch { /* 저장 못 해도 동작에는 지장 없음 */ } }

// enabled 일 때만 texts 를 번역. 돌려주는 tr(원문)은 번역이 오기 전엔 원문을 그대로 보여줌
export function useTranslated(texts, enabled) {
  const [, bump] = useState(0)
  const key = texts.join('\u0001')

  useEffect(() => {
    if (!enabled) return
    const need = [...new Set(texts)].filter((t) => t && !(t in cache))
    if (need.length === 0) return
    let cancelled = false
    translateTexts(need)
      .then(({ texts: out }) => {
        need.forEach((t, i) => { cache[t] = out[i] })
        save()
        if (!cancelled) bump((n) => n + 1)
      })
      .catch(() => {}) // 실패하면 원문(한국어)을 그대로 보여줌
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, enabled])

  return (t) => (enabled ? cache[t] : undefined)
}
