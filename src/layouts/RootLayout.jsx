import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { NAV_ITEMS } from '../router'
import Toasts from '../components/Toasts'
import ChatModal from '../components/ChatModal'
import AuthModal from '../components/AuthModal'
import { useAppStore } from '../store/useAppStore'
import { LANGS } from '../lib/langs'
import { useT } from '../lib/useT'
import { translate } from '../lib/i18n'

const en = (key) => translate('en', key)   // 상단 메뉴는 언어와 상관없이 영어로 고정

export default function RootLayout() {
  const t = useT()
  const nickname = useAppStore((s) => s.nickname)
  const lang = useAppStore((s) => s.lang)
  const setLang = useAppStore((s) => s.setLang)
  const chatOpen = useAppStore((s) => s.chatOpen)
  const openChat = useAppStore((s) => s.openChat)
  const user = useAppStore((s) => s.user)
  const authOpen = useAppStore((s) => s.authOpen)
  const openAuth = useAppStore((s) => s.openAuth)
  const initAuth = useAppStore((s) => s.initAuth)
  const isHome = useLocation().pathname === '/'

  useEffect(() => { document.documentElement.lang = lang }, [lang])
  useEffect(() => initAuth(), [initAuth])

  // 랜딩: 맨 위에서는 투명, 스크롤하면 크림색 배경으로
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <nav className={`topbar ${isHome ? 'over' : ''} ${isHome && scrolled ? 'solid' : ''}`}>
        <div className="links">
          {NAV_ITEMS.map((n) => n.action ? (
            <button key={n.action} className="navbtn" onClick={openChat}>{en(n.key)}</button>
          ) : (
            <NavLink key={n.to} to={n.to} end={n.to === '/'}>{en(n.key)}</NavLink>
          ))}
        </div>
        <NavLink to="/" className="brand">{en('brand')}</NavLink>
        <div className="right">
          <div className="lang" role="group" aria-label="Language">
            {LANGS.map((l) => (
              <button key={l.id} className={lang === l.id ? 'on' : ''} onClick={() => setLang(l.id)} title={l.name} aria-pressed={lang === l.id}>{l.label}</button>
            ))}
          </div>
          <NavLink to="/booth" className="cam-link" aria-label={en('nav.booth')} title={en('nav.booth')}>
            <svg viewBox="0 0 24 24" width="19" height="19" aria-hidden="true"><path d="M4 8.5A1.5 1.5 0 0 1 5.5 7h2l1.2-2h6.6l1.2 2h2A1.5 1.5 0 0 1 20 8.5v9A1.5 1.5 0 0 1 18.5 19h-13A1.5 1.5 0 0 1 4 17.5v-9Z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" /><circle cx="12" cy="13" r="3.4" fill="none" stroke="currentColor" strokeWidth="1.7" /></svg>
          </NavLink>
          <button className={`who ${user ? 'in' : ''}`} onClick={openAuth}>{user ? (nickname || user.email) : en('auth.login')}</button>
        </div>
      </nav>
      <main className={isHome ? '' : 'container'}><Outlet /></main>
      <footer className="footer">{t('footer')}</footer>
      <Toasts />
      {chatOpen && <ChatModal />}
      {authOpen && <AuthModal />}
    </>
  )
}
