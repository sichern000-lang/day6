import { useMemo, useState } from 'react'
import Modal from './Modal'
import { CHAR_TYPES, charName } from '../lib/characters'
import { characterPreviews } from '../lib/characterPreview'
import { useAppStore } from '../store/useAppStore'
import { useT } from '../lib/useT'

// 내 캐릭터 만들기: 돼지·귤·말·고양이·남자·여자 중에 고르고, 말풍선에 띄울 한마디를 적음 → 섬에서 세울 자리를 누르러 감
export default function CharacterModal({ onClose, onPlace }) {
  const t = useT()
  const lang = useAppStore((s) => s.lang)
  const previews = useMemo(() => { try { return characterPreviews() } catch { return {} } }, [])
  const [type, setType] = useState('pig')
  const [msg, setMsg] = useState('')
  return (
    <Modal onClose={onClose} label={t('island.addChar')}>
      <form className="char-form" onSubmit={(e) => { e.preventDefault(); onPlace({ type, msg: msg.trim() }) }}>
        <h2 className="modal-title">{t('island.addChar')}</h2>
        <p className="modal-sub">{t('island.chooseChar')}</p>
        <div className="char-grid" role="radiogroup" aria-label={t('island.chooseChar')}>
          {CHAR_TYPES.map((c) => (
            <button type="button" key={c} role="radio" aria-checked={type === c} className={type === c ? 'on' : ''} onClick={() => setType(c)}>
              {previews[c] ? <img src={previews[c]} alt="" /> : <span className="char-ph" />}
              <span>{charName(c, lang)}</span>
            </button>
          ))}
        </div>
        <label>{t('island.msgLabel')}
          <input className="input" value={msg} maxLength={30} onChange={(e) => setMsg(e.target.value)} placeholder={t('island.msgPh')} />
        </label>
        <div className="modal-actions">
          <button className="btn dark">{t('island.placeBtn')}</button>
          <button type="button" className="btn ghost" onClick={onClose}>{t('island.cancel')}</button>
        </div>
      </form>
    </Modal>
  )
}
