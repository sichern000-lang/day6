import { supabase } from './supabase'

// 수첩에 담는 사진: 기록용이라 작게 줄여서(가로 640px JPEG) Supabase Storage 에 올림 → 계정이 같으면 어느 기기에서나 보임
export const PHOTO_BUCKET = 'notebook-photos'

// canvas 또는 이미지 Blob → 줄인 JPEG Blob
export async function shrinkToJpeg(src, maxW = 640, quality = 0.74) {
  const bmp = src instanceof Blob ? await createImageBitmap(src) : src
  const w = bmp.width ?? bmp.naturalWidth, h = bmp.height ?? bmp.naturalHeight
  const k = Math.min(1, maxW / w), c = document.createElement('canvas')
  c.width = Math.round(w * k); c.height = Math.round(h * k)
  const g = c.getContext('2d'); g.fillStyle = '#ffffff'; g.fillRect(0, 0, c.width, c.height)   // 투명한 곳은 흰색으로
  g.imageSmoothingQuality = 'high'; g.drawImage(bmp, 0, 0, c.width, c.height)
  return new Promise((res) => c.toBlob(res, 'image/jpeg', quality))
}
export async function uploadPhoto(blob) {
  if (!supabase) throw new Error('Supabase')
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`
  const { error } = await supabase.storage.from(PHOTO_BUCKET).upload(path, blob, { contentType: 'image/jpeg', cacheControl: '31536000' })
  if (error) throw error
  return supabase.storage.from(PHOTO_BUCKET).getPublicUrl(path).data.publicUrl
}
// 수첩에서 지울 때 저장소의 파일도 함께 지움 (공개 주소 → 파일 경로)
export async function removePhoto(url) {
  const m = url?.split(`/${PHOTO_BUCKET}/`)[1]
  if (supabase && m) await supabase.storage.from(PHOTO_BUCKET).remove([decodeURIComponent(m)])
}
