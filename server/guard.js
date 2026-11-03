// 공개 /api 를 지키는 작은 도구들 — 호출 횟수 제한(함수 인스턴스 안에서만 세는 간이 방식), 입력 길이 확인, 오류 문구 정리
const hits = new Map() // ip → [시각, ...]

export function clientIp(req) {
  return String(req.headers['x-forwarded-for'] ?? req.socket?.remoteAddress ?? 'unknown').split(',')[0].trim()
}

// 한도를 넘으면 429 로 응답하고 true 를 돌려줌 → 호출한 쪽은 바로 return
export function tooMany(req, res, { max, windowMs = 60_000 }) {
  const now = Date.now(), ip = clientIp(req)
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < windowMs)
  recent.push(now)
  hits.set(ip, recent)
  if (hits.size > 5000) for (const [k, v] of hits) if (now - v[v.length - 1] > windowMs) hits.delete(k)
  if (recent.length <= max) return false
  res.setHeader('Retry-After', String(Math.ceil(windowMs / 1000)))
  res.status(429).json({ error: '요청이 너무 많아요. 잠시 뒤 다시 시도하세요.' })
  return true
}

// 사용자에게는 정리된 문구만, 자세한 원인은 서버 로그에만 남김
export function fail(res, e, status = 500) {
  console.error(e)
  res.status(status).json({ error: '데이터를 가져오지 못했어요. 잠시 뒤 다시 시도해 주세요.' })
}
