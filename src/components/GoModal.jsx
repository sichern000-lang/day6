import { useEffect, useState } from 'react'
import Modal from './Modal'
import SpeakButton from './SpeakButton'
import { romanize } from '../lib/romanize'
import { copyText } from '../lib/copy'
import { useAppStore } from '../store/useAppStore'
import { useT } from '../lib/useT'

// 가는 길: ① 택시 기사님께 보여 줄 한국어 이름·주소 큰 카드 ② 지도 앱(구글·네이버·카카오)으로 열기
// place: { name, addr, lat?, lng?, koName?, koAddr? } — 한국어 이름·주소가 따로 있으면 koName/koAddr
export default function GoModal({ place, onClose }) {
  const t = useT()
  const toast = useAppStore((s) => s.toast)
  const [koAddr, setKoAddr] = useState(place.koAddr ?? (/[가-힣]/.test(place.addr ?? '') ? place.addr : ''))
  const [loading, setLoading] = useState(false)
  const koName = place.koName ?? place.name
  const hasCoord = place.lat != null && place.lng != null

  // 한국어 주소가 없고 좌표가 있으면 좌표로 한국어 주소를 찾아 옴 (OpenStreetMap Nominatim)
  useEffect(() => {
    if (koAddr || !hasCoord) return
    let alive = true
    setLoading(true)
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&accept-language=ko&lat=${place.lat}&lon=${place.lng}`)
      .then((r) => r.json())
      .then((d) => alive && setKoAddr(d.display_name?.replace(/, 대한민국$/, '') ?? ''))
      .catch(() => {})
      .finally(() => alive && setLoading(false))
    return () => { alive = false }
  }, [koAddr, hasCoord, place.lat, place.lng])

  const query = [koName, koAddr].filter(Boolean).join(' ')
  const links = [
    { id: 'google', name: 'Google Maps', url: hasCoord ? `https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lng}` : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}` },
    { id: 'naver', name: 'Naver Map', url: `https://map.naver.com/p/search/${encodeURIComponent(koName)}` },
    { id: 'kakao', name: 'Kakao Map', url: hasCoord ? `https://map.kakao.com/link/map/${encodeURIComponent(koName)},${place.lat},${place.lng}` : `https://map.kakao.com/?q=${encodeURIComponent(query)}` },
  ]

  return (
    <Modal onClose={onClose} label={t('go.title')}>
      <h2 className="modal-title">{t('go.title')}</h2>
      <p className="modal-sub">{t('go.show')}</p>

      <div className="taxi-card">
        <p className="taxi-name">{koName} <SpeakButton text={koName} /></p>
        <p className="taxi-rom">{romanize(koName)}</p>
        {koAddr ? <p className="taxi-addr">{koAddr}</p> : <p className="taxi-addr dim">{loading ? t('go.loadingAddr') : t('go.noAddr')}</p>}
        {koAddr && <p className="taxi-rom">{romanize(koAddr)}</p>}
      </div>

      <div className="modal-actions">
        <button className="btn dark" disabled={!koAddr} onClick={async () => toast(await copyText(`${koName}\n${koAddr}`) ? t('toast.copied') : t('toast.copyfail'))}>{t('go.copy')}</button>
      </div>

      <b className="modal-label">{t('go.open')}</b>
      <div className="go-links">
        {links.map((l) => <a key={l.id} className="btn ghost" href={l.url} target="_blank" rel="noopener noreferrer">{l.name} ↗</a>)}
      </div>
      <p className="hint">{t('go.note')}</p>
    </Modal>
  )
}

// 장소 줄에 붙이는 작은 "가는 길" 버튼
export function GoButton({ place, className = '' }) {
  const t = useT()
  const [open, setOpen] = useState(false)
  return (
    <>
      <button type="button" className={`go-btn ${className}`} aria-label={`${t('go.btn')}: ${place.name}`} title={t('go.btn')}
        onClick={(e) => { e.stopPropagation(); setOpen(true) }}>
        <svg viewBox="0 0 24 24" width="19" height="19" aria-hidden="true"><path d="m4 11 16-7-7 16-2-7-7-2Z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" /></svg>
      </button>
      {open && <GoModal place={place} onClose={() => setOpen(false)} />}
    </>
  )
}
