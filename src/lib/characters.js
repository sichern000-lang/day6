import { supabase } from './supabase'

// ── 내 캐릭터: 섬 위에 세워 두는 돼지·귤·말·고양이·사람 + 말풍선 (장소와 같은 방식: Supabase island_characters, 표가 없으면 이 기기에만 저장) ──
export const CHAR_TYPES = ['pig', 'tangerine', 'horse', 'cat', 'man', 'woman']
export const MAX_CHARS = 5
const NAMES = {
  pig: { ko: '돼지', en: 'Pig', es: 'Cerdito', de: 'Schweinchen' }, tangerine: { ko: '귤', en: 'Tangerine', es: 'Mandarina', de: 'Mandarine' },
  horse: { ko: '말', en: 'Pony', es: 'Caballo', de: 'Pferd' }, cat: { ko: '고양이', en: 'Cat', es: 'Gato', de: 'Katze' },
  man: { ko: '남자', en: 'Man', es: 'Hombre', de: 'Mann' }, woman: { ko: '여자', en: 'Woman', es: 'Mujer', de: 'Frau' },
}
export const charName = (type, lang) => NAMES[type]?.[lang] ?? NAMES[type]?.en ?? type

const LS = 'sinhwa-island-chars'
const rd = () => { try { return JSON.parse(localStorage.getItem(LS)) ?? [] } catch { return [] } }
const wr = (v) => { try { localStorage.setItem(LS, JSON.stringify(v)) } catch { /* 저장 못 해도 동작에는 지장 없음 */ } }

export async function loadChars(owner) {
  if (supabase) {
    const { data, error } = await supabase.from('island_characters').select('*').eq('owner', owner).order('created_at', { ascending: true })
    if (!error) return { rows: data, mode: 'db' }
  }
  return { rows: rd().filter((r) => r.owner === owner), mode: 'local' }
}
export async function createChar(owner, c, mode) {
  const row = { owner, type: c.type, x: c.x, y: c.y, msg: c.msg }
  if (mode === 'db' && supabase) {
    const { data, error } = await supabase.from('island_characters').insert(row).select().single()
    if (error) throw error
    return data
  }
  const local = { ...row, id: `local-${Date.now()}`, created_at: new Date().toISOString() }
  wr([...rd(), local]); return local
}
export async function updateChar(id, patch, mode) {
  if (mode === 'db' && supabase) {
    const { data, error } = await supabase.from('island_characters').update(patch).eq('id', id).select().single()
    if (error) throw error
    return data
  }
  wr(rd().map((r) => (r.id === id ? { ...r, ...patch } : r)))
  return rd().find((r) => r.id === id)
}
export async function deleteChar(id, mode) {
  if (mode === 'db' && supabase) {
    const { error } = await supabase.from('island_characters').delete().eq('id', id)
    if (error) throw error
    return
  }
  wr(rd().filter((r) => r.id !== id))
}
