import { useState } from 'react'
import Modal from './Modal'
import { isSupabaseReady } from '../lib/supabase'
import { useAppStore } from '../store/useAppStore'
import { useT } from '../lib/useT'

// 로그인·회원가입·내 계정 모달 (Supabase Auth: 이메일 + Google)
export default function AuthModal() {
  const t = useT()
  const user = useAppStore((s) => s.user)
  const closeAuth = useAppStore((s) => s.closeAuth)
  const signIn = useAppStore((s) => s.signIn)
  const signUp = useAppStore((s) => s.signUp)
  const signInGoogle = useAppStore((s) => s.signInGoogle)
  const signOut = useAppStore((s) => s.signOut)
  const toast = useAppStore((s) => s.toast)
  const [mode, setMode] = useState('login')            // login | signup
  const [form, setForm] = useState({ email: '', password: '', nickname: '' })
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState({ text: '', bad: false })
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const isAdmin = user?.app_metadata?.role === 'admin'

  async function submit(e) {
    e.preventDefault()
    if (busy) return
    if (mode === 'signup' && form.password.length < 6) return setMsg({ text: t('auth.pw'), bad: true })
    setBusy(true); setMsg({ text: '', bad: false })
    const { data, error } = mode === 'login'
      ? await signIn(form)
      : await signUp({ ...form, nickname: form.nickname.trim() })
    setBusy(false)
    if (error) return setMsg({ text: error.message, bad: true })
    if (mode === 'signup' && !data.session) return setMsg({ text: t('auth.checkmail'), bad: false })   // 이메일 확인이 켜져 있으면 세션이 아직 없음
    toast(t('auth.welcome', { name: data.user?.user_metadata?.nickname || form.email.split('@')[0] }))
  }

  async function google() {
    setMsg({ text: '', bad: false })
    const { error } = await signInGoogle()
    if (error) setMsg({ text: error.message, bad: true })
  }

  // 로그인 상태: 내 계정
  if (user) {
    return (
      <Modal onClose={closeAuth} label={t('auth.account')}>
        <div className="auth">
          <h2 className="modal-title">{t('auth.account')}</h2>
          <p className="auth-who">
            <strong>{user.user_metadata?.nickname || user.user_metadata?.full_name || user.email}</strong>
            {isAdmin && <span className="auth-badge">{t('auth.admin')}</span>}
          </p>
          <p className="modal-sub">{user.email}</p>
          <div className="modal-actions"><button className="btn dark" onClick={signOut}>{t('auth.logout')}</button></div>
        </div>
      </Modal>
    )
  }

  const login = mode === 'login'
  return (
    <Modal onClose={closeAuth} label={t(login ? 'auth.login' : 'auth.signup')}>
      <div className="auth">
        <h2 className="modal-title">{t(login ? 'auth.tLogin' : 'auth.tSignup')}</h2>
        <p className="modal-sub">{t(login ? 'auth.sLogin' : 'auth.sSignup')}</p>
        {!isSupabaseReady && <p className="auth-msg bad">{t('auth.nosb')}</p>}

        <button type="button" className="auth-google" onClick={google} disabled={!isSupabaseReady}>
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
            <path fill="#4285F4" d="M22.5 12.3c0-.8-.1-1.5-.2-2.2H12v4.3h5.9a5 5 0 0 1-2.2 3.3v2.7h3.5c2-1.9 3.3-4.7 3.3-8.1Z" />
            <path fill="#34A853" d="M12 23c3 0 5.4-1 7.2-2.7l-3.5-2.7c-1 .7-2.2 1-3.7 1-2.8 0-5.2-1.9-6-4.5H2.4v2.8A11 11 0 0 0 12 23Z" />
            <path fill="#FBBC05" d="M6 14.1a6.6 6.6 0 0 1 0-4.2V7.1H2.4a11 11 0 0 0 0 9.8L6 14.1Z" />
            <path fill="#EA4335" d="M12 5.4c1.6 0 3.1.6 4.2 1.7l3.1-3.1A11 11 0 0 0 2.4 7.1L6 9.9c.8-2.6 3.2-4.5 6-4.5Z" />
          </svg>
          {t('auth.google')}
        </button>

        <div className="auth-or"><span>{t('auth.or')}</span></div>

        <form onSubmit={submit} className="auth-form">
          {!login && (
            <label>{t('auth.nick')}
              <input className="input" value={form.nickname} onChange={set('nickname')} placeholder={t('auth.nickph')} maxLength={20} autoComplete="nickname" />
            </label>
          )}
          <label>{t('auth.email')}
            <input className="input" type="email" required value={form.email} onChange={set('email')} autoComplete="email" />
          </label>
          <label>{t('auth.password')}
            <input className="input" type="password" required minLength={6} value={form.password} onChange={set('password')} autoComplete={login ? 'current-password' : 'new-password'} />
          </label>
          {msg.text && <p className={`auth-msg ${msg.bad ? 'bad' : 'ok'}`} role="alert">{msg.text}</p>}
          <button className="btn dark auth-submit" disabled={busy || !isSupabaseReady}>{busy ? t('auth.busy') : t(login ? 'auth.goLogin' : 'auth.goSignup')}</button>
        </form>

        <p className="auth-switch">
          {t(login ? 'auth.toSignup' : 'auth.toLogin')}{' '}
          <button type="button" onClick={() => { setMode(login ? 'signup' : 'login'); setMsg({ text: '', bad: false }) }}>{t(login ? 'auth.goSignup' : 'auth.goLogin')}</button>
        </p>
        <button type="button" className="auth-guest" onClick={closeAuth}>{t('auth.guest')}</button>
      </div>
    </Modal>
  )
}
