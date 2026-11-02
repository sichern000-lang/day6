import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '../lib/supabase'
import { askAgent } from '../api/client'
import { translate } from '../lib/i18n'
import { LANGS } from '../lib/langs'

// ── 여러 페이지가 함께 쓰는 "전역 상태" ─────────────────
// 한 페이지에서만 쓰는 값(입력창, 선택한 탭 등)은 그 페이지의 useState 로 둡니다.
// 인트로(종이 조각 덮개)는 한 탭에서 한 번만 보여 줌 (?intro=1 로 다시 보기)
const seen = (k) => { try { return sessionStorage.getItem(k) === '1' } catch { return false } }
const mark = (k) => { try { sessionStorage.setItem(k, '1') } catch { /* 저장 못 해도 동작에는 지장 없음 */ } }
const reduced = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
const forced = () => typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('intro') === '1'
const skipIntro = !forced() && (seen('sinhwa-intro') || reduced())

let chatRun = 0 // 대화를 새로 시작할 때마다 올라감 — 이전 대화의 늦은 답이 새 대화에 끼어들지 않게 구분

export const useAppStore = create(
  persist(
    (set, get) => ({
      // ① 사용자 닉네임 — localStorage 에 저장
      nickname: '',
      setNickname: (nickname) => set({ nickname: nickname.trim() }),

      // ① -2 표시 언어 — 'ko' | 'en', localStorage 에 저장
      lang: 'ko',
      setLang: (lang) => set({ lang: LANGS.some((l) => l.id === lang) ? lang : 'ko' }),

      // ① -3 인트로·히어로 연출 (저장하지 않는 값)
      introDone: skipIntro,
      finishIntro: () => { mark('sinhwa-intro'); set({ introDone: true }) },

      // ② 알림
      toasts: [],
      toast: (message, variant = 'ok') => {
        const id = Date.now() + Math.random()
        set({ toasts: [...get().toasts, { id, message, variant }] })
        setTimeout(() => set({ toasts: get().toasts.filter((t) => t.id !== id) }), 2600)
      },

      // ③ 내 수첩 — Supabase saved_stories 테이블 (새로고침해도 유지)
      saved: [],
      savedLoading: false,
      loadSaved: async () => {
        if (!supabase) return
        set({ savedLoading: true })
        const { data, error } = await supabase
          .from('saved_stories').select('*')
          .eq('nickname', get().nickname || '익명')
          .order('created_at', { ascending: false })
        set({ savedLoading: false })
        if (error) return get().toast(error.message, 'error')
        set({ saved: data })
      },
      saveStory: async ({ id, title }) => {
        if (!supabase) return get().toast(translate(get().lang, 'toast.nosb'), 'warn')
        if (get().saved.some((s) => s.story_id === id)) return get().toast(translate(get().lang, 'toast.dup'), 'warn')
        const { data, error } = await supabase
          .from('saved_stories')
          .insert({ nickname: get().nickname || '익명', story_id: id, title })
          .select().single()
        if (error) return get().toast(error.message, 'error')
        set({ saved: [data, ...get().saved] })
        get().toast(translate(get().lang, 'toast.saved', { title }))
      },
      toggleVisited: async (row) => {
        if (!supabase) return
        const { error } = await supabase.from('saved_stories').update({ visited: !row.visited }).eq('id', row.id)
        if (error) return get().toast(error.message, 'error')
        set({ saved: get().saved.map((s) => (s.id === row.id ? { ...s, visited: !s.visited } : s)) })
      },
      // 하트: 담겨 있으면 빼고, 없으면 담음 (랜딩 수첩 섹션)
      toggleSave: async (item) => {
        const row = get().saved.find((s) => s.story_id === item.id)
        if (row) return get().removeStory(row.id)
        return get().saveStory(item)
      },
      // 수첩 메모 (saved_stories.memo 컬럼 — supabase.sql 참고)
      updateMemo: async (row, memo) => {
        if (!supabase || (row.memo ?? '') === memo) return
        const { error } = await supabase.from('saved_stories').update({ memo }).eq('id', row.id)
        if (error) return get().toast(error.message, 'error')
        set({ saved: get().saved.map((s) => (s.id === row.id ? { ...s, memo } : s)) })
      },
      removeStory: async (id) => {
        if (!supabase) return
        const { error } = await supabase.from('saved_stories').delete().eq('id', id)
        if (error) return get().toast(error.message, 'error')
        set({ saved: get().saved.filter((s) => s.id !== id) })
      },

      // ④ 이야기 안내자(에이전트) 대화 — 페이지를 옮겨도 대화가 남도록 store 에 둠
      messages: [],
      chatLoading: false,
      chatOpen: false,            // Ask 모달이 열려 있는지
      openChat: () => set({ chatOpen: true }),
      closeChat: () => set({ chatOpen: false }),
      clearChat: () => { chatRun++; set({ messages: [], chatLoading: false }) },
      sendMessage: async (text) => {
        // 오류 메시지는 대화 기록(history)에서 빼고 서버로 보냄
        const run = chatRun
        const history = get().messages.filter((m) => !m.error).map((m) => ({ role: m.role, content: m.text }))
        set({ messages: [...get().messages, { role: 'user', text }], chatLoading: true })
        try {
          const { answer, steps } = await askAgent(text, history, get().lang)
          if (run !== chatRun) return // 그 사이 대화를 새로 시작했으면 이 답은 버림
          set({ messages: [...get().messages, { role: 'assistant', text: answer, steps }] })
        } catch (e) {
          if (run !== chatRun) return
          // 모달 안에서 바로 보이도록 대화에도 오류를 남김
          set({ messages: [...get().messages, { role: 'assistant', text: e.message, error: true }] })
        } finally {
          if (run === chatRun) set({ chatLoading: false })
        }
      },
    }),
    {
      name: 'sinhwa-map-store',
      partialize: (s) => ({ nickname: s.nickname, lang: s.lang }),
    },
  ),
)
