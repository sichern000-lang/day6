import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '../lib/supabase'
import { askAgent } from '../api/client'

// ── 여러 페이지가 함께 쓰는 "전역 상태" ─────────────────
// 한 페이지에서만 쓰는 값(입력창, 선택한 탭 등)은 그 페이지의 useState 로 둡니다.
export const useAppStore = create(
  persist(
    (set, get) => ({
      // ① 사용자 닉네임 — localStorage 에 저장
      nickname: '',
      setNickname: (nickname) => set({ nickname: nickname.trim() }),

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
        if (!supabase) return get().toast('Supabase 설정(.env.local)이 필요해요', 'warn')
        if (get().saved.some((s) => s.story_id === id)) return get().toast('이미 수첩에 있어요', 'warn')
        const { data, error } = await supabase
          .from('saved_stories')
          .insert({ nickname: get().nickname || '익명', story_id: id, title })
          .select().single()
        if (error) return get().toast(error.message, 'error')
        set({ saved: [data, ...get().saved] })
        get().toast(`'${title}' 수첩에 담았어요`)
      },
      toggleVisited: async (row) => {
        if (!supabase) return
        const { error } = await supabase.from('saved_stories').update({ visited: !row.visited }).eq('id', row.id)
        if (error) return get().toast(error.message, 'error')
        set({ saved: get().saved.map((s) => (s.id === row.id ? { ...s, visited: !s.visited } : s)) })
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
      sendMessage: async (text) => {
        const history = get().messages.map((m) => ({ role: m.role, content: m.text }))
        set({ messages: [...get().messages, { role: 'user', text }], chatLoading: true })
        try {
          const { answer, steps } = await askAgent(text, history)
          set({ messages: [...get().messages, { role: 'assistant', text: answer, steps }] })
        } catch (e) {
          get().toast(e.message, 'error')
        } finally {
          set({ chatLoading: false })
        }
      },
    }),
    {
      name: 'sinhwa-map-store',
      partialize: (s) => ({ nickname: s.nickname }),
    },
  ),
)
