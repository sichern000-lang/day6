import { useEffect, useState } from 'react'
import Modal from './Modal'
import PlacePicker from './PlacePicker'
import Stars from './Stars'
import { STORIES } from '../lib/stories'
import { createReview, uploadPhoto } from '../lib/reviews'
import { useAppStore } from '../store/useAppStore'
import { useT } from '../lib/useT'

// 후기 쓰기 — 장소 고르기 → 사진(선택) → 별점·추천 → 올리기
export default function ReviewModal({ onClose, onCreated }) {
  const t = useT()
  const nickname = useAppStore((s) => s.nickname)
  const toast = useAppStore((s) => s.toast)
  const [place, setPlace] = useState(null)
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState('')
  const [rating, setRating] = useState(0)
  const [recommend, setRecommend] = useState(true)
  const [comment, setComment] = useState('')
  const [busy, setBusy] = useState(false)

  // 고른 사진 미리보기 (닫을 때 주소 해제)
  useEffect(() => {
    if (!file) return setPreview('')
    const url = URL.createObjectURL(file)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  async function submit(e) {
    e.preventDefault()
    if (!place) return toast(t('review.needPlace'), 'warn')
    if (!rating) return toast(t('review.needRating'), 'warn')
    setBusy(true)
    try {
      let image_url = null
      if (file) {
        try { image_url = await uploadPhoto(file) }
        catch (err) { toast(`${t('review.uploadFail')}: ${err.message}`, 'error'); setBusy(false); return }
      }
      // 장소 이름에 이야기 속 낱말이 들어 있으면 그 이야기와 연결
      const story = STORIES.find((s) => [s.tourKeyword, s.tourKeywordEn].some((k) => place.title.includes(k)))
      const row = await createReview({
        nickname: nickname || '익명', place_id: place.id, place_title: place.title, place_addr: place.addr ?? null,
        story_id: story?.id ?? null, rating, recommend, comment: comment.trim() || null, image_url,
      })
      toast(t('review.saved'))
      onCreated(row)
      onClose()
    } catch (err) {
      toast(err.message, 'error')
      setBusy(false)
    }
  }

  return (
    <Modal onClose={onClose} label={t('review.formTitle')}>
      <h2 className="modal-title">{t('review.formTitle')}</h2>
      <form onSubmit={submit} className="review-form">
        <section>
          <b className="modal-label">{t('review.step1')}</b>
          <PlacePicker value={place} onPick={setPlace} />
        </section>

        <section>
          <b className="modal-label">{t('review.step2')}</b>
          {preview ? (
            <div className="photo-preview">
              <img src={preview} alt="" />
              <button type="button" className="btn ghost small" onClick={() => setFile(null)}>{t('review.photoRemove')}</button>
            </div>
          ) : (
            <label className="photo-drop">
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
              <span>＋ {t('review.photoAdd')}</span>
              <small>{t('review.photoHint')}</small>
            </label>
          )}
        </section>

        <section>
          <b className="modal-label">{t('review.step3')}</b>
          <div className="rate-row">
            <Stars value={rating} onChange={setRating} size={30} />
            <button type="button" className={`rec ${recommend ? 'on' : ''}`} aria-pressed={recommend} onClick={() => setRecommend((r) => !r)}>
              <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true"><path d="M7 9V17H3.5V9Zm1.5 0 3-6c1.2 0 2 .9 1.8 2L12.8 8H17a1.2 1.2 0 0 1 1.2 1.4l-1 5.8a1.5 1.5 0 0 1-1.5 1.3H8.5Z" fill={recommend ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></svg>
              {t('review.recommend')}
            </button>
          </div>
          <textarea className="input" rows={3} maxLength={400} value={comment} onChange={(e) => setComment(e.target.value)}
            aria-label={t('review.comment')} placeholder={`${t('review.comment')} — ${t('review.commentPh')}`} />
        </section>

        <div className="modal-actions">
          <button className="btn dark" disabled={busy}>{busy ? '…' : t('review.submit')}</button>
        </div>
      </form>
    </Modal>
  )
}
