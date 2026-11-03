// 브라우저에 들어 있는 음성(Web Speech)으로 한국어를 읽어 줌 — 별도 서버나 비용 없음
export const canSpeak = () => typeof window !== 'undefined' && 'speechSynthesis' in window

export function speakKo(text) {
  if (!canSpeak() || !text) return false
  const synth = window.speechSynthesis
  synth.cancel()
  const u = new SpeechSynthesisUtterance(text.replace(/\(.*?\)/g, ' '))   // 괄호 안 풀이는 읽지 않음
  u.lang = 'ko-KR'
  u.rate = 0.85
  const voice = synth.getVoices().find((v) => v.lang?.toLowerCase().replace('_', '-').startsWith('ko'))
  if (voice) u.voice = voice
  synth.speak(u)
  return true
}
