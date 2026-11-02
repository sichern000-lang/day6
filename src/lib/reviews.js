import { supabase } from './supabase'
import sampleReviews from '../data/sample-reviews.json'

export const BUCKET = 'place-review-photos'
export const SAMPLES = sampleReviews

// place_reviews 테이블이 아직 없을 때 Supabase 가 돌려주는 오류 (supabase-reviews.sql 을 실행하면 사라짐)
export const isMissingTable = (e) => e?.code === 'PGRST205' || /schema cache|does not exist/i.test(e?.message ?? '')

export async function listReviews() {
  const { data, error } = await supabase.from('place_reviews').select('*').order('created_at', { ascending: false }).limit(200)
  if (error) throw error
  return data
}

export async function createReview(row) {
  const { data, error } = await supabase.from('place_reviews').insert(row).select().single()
  if (error) throw error
  return data
}

export async function deleteReview(id) {
  const { error } = await supabase.from('place_reviews').delete().eq('id', id)
  if (error) throw error
}

// 큰 사진은 긴 변 1280px, JPEG 로 줄여서 올림 (업로드가 빠르고 저장 공간도 아낌)
async function shrink(file, max = 1280) {
  const bmp = await createImageBitmap(file)
  const scale = Math.min(1, max / Math.max(bmp.width, bmp.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bmp.width * scale)
  canvas.height = Math.round(bmp.height * scale)
  canvas.getContext('2d').drawImage(bmp, 0, 0, canvas.width, canvas.height)
  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('사진을 읽지 못했어요'))), 'image/jpeg', 0.82))
}

export async function uploadPhoto(file) {
  const blob = await shrink(file)
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`
  const { error } = await supabase.storage.from(BUCKET).upload(path, blob, { contentType: 'image/jpeg' })
  if (error) throw error
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl
}
