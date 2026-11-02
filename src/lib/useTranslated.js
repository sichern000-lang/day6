import { useEffect, useState } from 'react'
import { translateTexts } from '../api/client'
import { useAppStore } from '../store/useAppStore'

// 한국어 → 화면 언어 번역 캐시 (새로고침해도 같은 낱말은 다시 번역하지 않도록 sessionStorage 에도 저장)
// 키는 `언어|원문` — 언어가 달라도 섞이지 않음
const KEY = 'sinhwa-tr-cache-v2'
const load = () => { try { return JSON.parse(sessionStorage.getItem(KEY)) ?? {} } catch { return {} } }
const cache = load()
const save = () => { try { sessionStorage.setItem(KEY, JSON.stringify(cache)) } catch { /* 저장 못 해도 동작에는 지장 없음 */ } }

// enabled 일 때만 texts 를 현재 화면 언어로 번역. 돌려주는 tr(원문)은 번역이 오기 전엔 undefined → 원문을 그대로 보여주면 됨
export function useTranslated(texts, enabled) {
  const lang = useAppStore((s) => s.lang)
  const [, bump] = useState(0)
  const key = texts.join('\u0001')

  useEffect(() => {
    if (!enabled) return
    const need = [...new Set(texts)].filter((t) => t && !(`${lang}|${t}` in cache))
    if (need.length === 0) return
    let cancelled = false
    // 서버 함수는 한 번에 40개까지만 받으므로 나눠서 요청
    for (let i = 0; i < need.length; i += 40) {
      const chunk = need.slice(i, i + 40)
      translateTexts(chunk, lang)
        .then(({ texts: out }) => {
          chunk.forEach((t, j) => { cache[`${lang}|${t}`] = out[j] })
          save()
          if (!cancelled) bump((n) => n + 1)
        })
        .catch(() => {}) // 실패하면 원문(한국어)을 그대로 보여줌
    }
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, enabled, lang])

  return (t) => (enabled ? cache[`${lang}|${t}`] : undefined)
}
