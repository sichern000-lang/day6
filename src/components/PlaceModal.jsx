import { useState } from 'react'
import Modal from './Modal'
import DrawPad from './DrawPad'
import { CATEGORIES, catLabel, geocode } from '../lib/places'
import { useAppStore } from '../store/useAppStore'
import { useT } from '../lib/useT'

// 내 이야기 장소 추가: 이름 · 종류 · 나의 이야기(메모) · 주소 검색 · 대표 그림
export default function PlaceModal({ onClose }) {
  const t = useT()
  const lang = useAppStore((s) => s.lang)
  const addPlace = useAppStore((s) => s.addPlace)
  const toast = useAppStore((s) => s.toast)
  const [f, setF] = useState({ name: '', memo: '', category: 'cafe', address: '', lat: null, lng: null, drawing: '' })
  const [q, setQ] = useState('')
  const [found, setFound] = useState(null)       // null: 아직 검색 안 함 | []: 결과 없음
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setF((o) => ({ ...o, [k]: e.target.value }))

  async function find(e) {
    e.preventDefault()
    if (!q.trim() || busy) return
    setBusy(true)
    try { setFound(await geocode(q.trim(), lang === 'ko' ? 'ko' : 'en')) } catch { setFound([]) }
    setBusy(false)
  }
  const pick = (r) => { setF((o) => ({ ...o, address: r.label, lat: r.lat, lng: r.lng })); setFound(null) }

  async function save(e) {
    e.preventDefault()
    if (!f.name.trim()) return toast(t('map.needName'), 'warn')
    setBusy(true)
    const ok = await addPlace({ ...f, name: f.name.trim(), memo: f.memo.trim() })
    setBusy(false)
    if (ok) onClose()
  }

  return (
    <Modal onClose={onClose} label={t('map.add')}>
      <form className="place-form" onSubmit={save}>
        <h2 className="modal-title">{t('map.add')}</h2>
        <p className="modal-sub">{t('map.addSub')}</p>

        <label>{t('map.name')}
          <input className="input" value={f.name} onChange={set('name')} placeholder={t('map.nameph')} maxLength={30} required autoFocus />
        </label>
        <label>{t('map.cat')}
          <select className="input" value={f.category} onChange={set('category')}>
            {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{catLabel(c.id, lang)}</option>)}
          </select>
        </label>
        <label>{t('map.memo')}
          <textarea className="input" rows={2} value={f.memo} onChange={set('memo')} placeholder={t('map.memoph')} maxLength={120} />
        </label>

        <div className="place-addr">
          <span className="lbl">{t('map.addr')}</span>
          <div className="addr-row">
            <input className="input" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('map.addrph')}
              onKeyDown={(e) => e.key === 'Enter' && find(e)} />
            <button type="button" className="btn ghost small" onClick={find} disabled={busy}>{t('map.find')}</button>
          </div>
          {f.lat != null && <p className="addr-picked">📍 {f.address} <button type="button" onClick={() => setF((o) => ({ ...o, address: '', lat: null, lng: null }))} aria-label={t('map.clear')}>×</button></p>}
          {found && found.length === 0 && <p className="hint">{t('map.noresult')}</p>}
          {found && found.length > 0 && (
            <ul className="addr-list">{found.map((r, i) => <li key={i}><button type="button" onClick={() => pick(r)}>{r.label}</button></li>)}</ul>
          )}
        </div>

        <div>
          <span className="lbl">{t('map.draw')}</span>
          <DrawPad onChange={(d) => setF((o) => ({ ...o, drawing: d }))} undoLabel={t('map.undo')} clearLabel={t('map.clear')} hint={t('map.drawHint')} />
        </div>

        <div className="modal-actions">
          <button className="btn dark" disabled={busy}>{t('map.save')}</button>
          <button type="button" className="btn ghost" onClick={onClose}>{t('map.cancel')}</button>
        </div>
      </form>
    </Modal>
  )
}
