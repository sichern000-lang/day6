import { createClient } from '@supabase/supabase-js'

// 프로젝트 주소 끝에 /rest/v1 이 붙어 있어도 떼어 줌 (붙어 있으면 요청이 엉뚱한 곳으로 가서 "Failed to fetch" 가 남)
const url = import.meta.env.VITE_SUPABASE_URL?.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '')
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

// .env.local 이 없어도 앱이 멈추지 않도록 값이 없으면 null
export const supabase = url && key ? createClient(url, key) : null
export const isSupabaseReady = Boolean(supabase)
