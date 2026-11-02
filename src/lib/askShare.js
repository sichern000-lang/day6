// Ask 답변을 수첩에 저장하거나 공유할 때 쓰는 작은 도구들
export const askId = (text) => `ask:${[...text].reduce((h, c) => (Math.imul(h, 31) + c.charCodeAt(0)) | 0, 7) >>> 0}`
export const clip = (s, n) => (s.length > n ? `${s.slice(0, n - 1)}…` : s)

// 가능하면 기기의 공유 창(휴대폰 등), 안 되면 클립보드에 복사. 반환: 'shared' | 'copied' | 'cancel' | 'fail'
export async function shareText({ title, text }) {
  const url = window.location.origin
  const body = `${text}\n\n— ${title}\n${url}`
  if (navigator.share) {
    try { await navigator.share({ title, text, url }); return 'shared' } catch (e) { if (e?.name === 'AbortError') return 'cancel' }
  }
  try { await navigator.clipboard.writeText(body); return 'copied' } catch { return 'fail' }
}
