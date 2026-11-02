import { supabase } from './supabase'

// ── 내 이야기 장소: 지도에 더하는 장소 (이름·메모·종류·주소·대표 그림) ──
export const CATEGORIES = [
  { id: 'restaurant', label: { ko: '식당', en: 'Restaurant', es: 'Restaurante', de: 'Restaurant' } },
  { id: 'cafe', label: { ko: '카페', en: 'Café', es: 'Cafetería', de: 'Café' } },
  { id: 'stay', label: { ko: '숙소', en: 'Stay', es: 'Alojamiento', de: 'Unterkunft' } },
  { id: 'sight', label: { ko: '볼거리', en: 'Sight', es: 'Atractivo', de: 'Sehenswürdigkeit' } },
  { id: 'nature', label: { ko: '자연·오름', en: 'Nature', es: 'Naturaleza', de: 'Natur' } },
  { id: 'shop', label: { ko: '가게', en: 'Shop', es: 'Tienda', de: 'Laden' } },
  { id: 'etc', label: { ko: '기타', en: 'Other', es: 'Otro', de: 'Sonstiges' } },
]
export const catLabel = (id, lang) => {
  const c = CATEGORIES.find((x) => x.id === id) ?? CATEGORIES[CATEGORIES.length - 1]
  return c.label[lang] ?? c.label.en
}

// 예시 장소 5곳 (코드에 들어 있는 견본 — 휴지통으로 숨길 수 있음)
const pick = (o, lang) => o[lang] ?? o.en
export const SAMPLES = [
  { id: 'sample-1', category: 'cafe', lat: 33.4635, lng: 126.3105,
    name: { ko: '애월 바닷가 카페', en: 'Aewol seaside café' }, memo: { ko: '파도 소리 들으며 쓴 첫 엽서', en: 'Where I wrote my first postcard to the sound of waves' },
    address: 'Aewol, Jeju', drawing: 'M60 92 H140 L132 150 Q100 166 68 150 Z M140 102 Q170 102 164 126 Q160 142 136 140 M84 72 Q94 58 84 44 M110 72 Q120 58 110 44' },
  { id: 'sample-2', category: 'restaurant', lat: 33.4590, lng: 126.9330,
    name: { ko: '성산 국숫집', en: 'Seongsan noodle shop' }, memo: { ko: '일출봉 오르기 전에 꼭 들르는 곳', en: 'My stop before climbing Ilchulbong' },
    address: 'Seongsan, Seogwipo', drawing: 'M40 102 H160 Q156 152 100 162 Q44 152 40 102 Z M72 88 Q100 72 128 88 M118 52 L150 98 M132 46 L164 92' },
  { id: 'sample-3', category: 'stay', lat: 33.5440, lng: 126.6690,
    name: { ko: '함덕 돌담집', en: 'Hamdeok stone-wall house' }, memo: { ko: '돌담 너머로 바다가 보이던 방', en: 'A room with the sea beyond the stone wall' },
    address: 'Hamdeok, Jeju', drawing: 'M38 112 L100 56 L162 112 M52 100 V158 H148 V100 M88 158 V124 H112 V158' },
  { id: 'sample-4', category: 'nature', lat: 33.3650, lng: 126.3600,
    name: { ko: '새별오름 억새밭', en: 'Saebyeol Oreum reeds' }, memo: { ko: '가을 억새가 은빛으로 흔들리던 저녁', en: 'An autumn evening of silver reeds swaying' },
    address: 'Saebyeol Oreum, Jeju', drawing: 'M20 152 Q70 64 112 112 Q142 82 182 152 Z M152 52 a14 14 0 1 0 0.1 0 M60 152 l4 -14 M80 152 l-2 -16 M130 152 l3 -14' },
  { id: 'sample-5', category: 'sight', lat: 33.3940, lng: 126.2390,
    name: { ko: '협재 해변 포토스팟', en: 'Hyeopjae beach photo spot' }, memo: { ko: '비양도가 사진 한가운데 들어오는 자리', en: 'Biyangdo sits right in the middle of the frame' },
    address: 'Hyeopjae, Jeju', drawing: 'M44 84 H70 L80 68 H120 L130 84 H156 V146 H44 Z M100 100 a20 20 0 1 0 0.1 0' },
].map((s) => ({ ...s, sample: true }))
export const sampleView = (s, lang) => ({ ...s, name: pick(s.name, lang), memo: pick(s.memo, lang) })

// ── 소유자: 로그인했으면 사용자 id, 아니면 이 기기의 임시 id ──
const rd = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d } catch { return d } }
const wr = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch { /* 저장 못 해도 동작에는 지장 없음 */ } }
export const ownerOf = (user) => {
  if (user?.id) return user.id
  let id = rd('sinhwa-device', '')
  if (!id) { id = `device-${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`; wr('sinhwa-device', id) }
  return id
}
export const loadHidden = () => rd('sinhwa-hidden-samples', [])
export const saveHidden = (ids) => wr('sinhwa-hidden-samples', ids)

// ── 저장소: Supabase my_places (표가 아직 없으면 이 기기에만 저장) ──
const LS = 'sinhwa-my-places'
const localRows = (owner) => rd(LS, []).filter((r) => r.owner === owner)

export async function loadMine(owner) {
  if (supabase) {
    const { data, error } = await supabase.from('my_places').select('*').eq('owner', owner).order('created_at', { ascending: false })
    if (!error) return { rows: data, mode: 'db' }
  }
  return { rows: localRows(owner).reverse(), mode: 'local' }
}
export async function createPlace(owner, p, mode) {
  const row = { owner, name: p.name, memo: p.memo, category: p.category, address: p.address, lat: p.lat ?? null, lng: p.lng ?? null, drawing: p.drawing }
  if (mode === 'db' && supabase) {
    const { data, error } = await supabase.from('my_places').insert(row).select().single()
    if (error) throw error
    return data
  }
  const local = { ...row, id: `local-${Date.now()}`, created_at: new Date().toISOString() }
  wr(LS, [...rd(LS, []), local])
  return local
}
export async function deletePlace(id, mode) {
  if (mode === 'db' && supabase) {
    const { error } = await supabase.from('my_places').delete().eq('id', id)
    if (error) throw error
    return
  }
  wr(LS, rd(LS, []).filter((r) => r.id !== id))
}
// 다른 사용자들이 그린 그림 중 무작위 몇 개 (랜딩 인트로의 종이 메모에 섞임)
export async function fetchRandomDrawings(n = 6) {
  if (!supabase) return []
  const { data, error } = await supabase.from('my_places').select('id, drawing').neq('drawing', '').order('created_at', { ascending: false }).limit(60)
  if (error || !data) return []
  return [...data].sort(() => Math.random() - 0.5).slice(0, n)
}

// ── 주소 검색 (OpenStreetMap Nominatim — 키 없이 쓸 수 있고, 제주 안으로만 찾음) ──
export async function geocode(query, lang = 'en') {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=5&countrycodes=kr&bounded=1&viewbox=126.1,33.65,127.0,33.05&accept-language=${lang}&q=${encodeURIComponent(query)}`
  const res = await fetch(url)
  if (!res.ok) throw new Error('geocode failed')
  return (await res.json()).map((r) => ({ lat: Number(r.lat), lng: Number(r.lon), label: r.display_name }))
}

// ── 그림: 획(점들)을 SVG path 문자열로 (너무 가까운 점은 건너뜀) ──
export function toPath(strokes) {
  return strokes.map((s) => {
    const pts = s.filter((p, i) => i === 0 || i === s.length - 1 || Math.hypot(p[0] - s[i - 1][0], p[1] - s[i - 1][1]) > 1.4)
    if (pts.length === 1) return `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)} l0.1 0.1`
    return `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}` + pts.slice(1).map((p) => ` L${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join('')
  }).join(' ')
}
