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
  const { pathname } = useLocation()
  const isHome = pathname === '/'
  const [menuOpen, setMenuOpen] = useState(false)
  const closeMenu = () => setMenuOpen(false)

  // 페이지를 옮기거나 Esc 를 누르면 닫고, 열려 있는 동안은 뒤 화면이 스크롤되지 않게 함
  useEffect(() => { setMenuOpen(false) }, [pathname])
  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e) => { if (e.key === 'Escape') setMenuOpen(false) }
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey) }
  }, [menuOpen])

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
      <nav className={`topbar ${isHome ? 'over' : ''} ${isHome && scrolled ? 'solid' : ''} ${menuOpen ? 'menu-open' : ''}`}>
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
          <button className="menu-btn" aria-label="Menu" aria-expanded={menuOpen} aria-controls="m-menu" onClick={() => setMenuOpen((o) => !o)}>
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
              {menuOpen
                ? <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                : <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />}
            </svg>
          </button>
        </div>
      </nav>
      {menuOpen && (
        <div className="m-menu" id="m-menu" role="dialog" aria-label="Menu" onClick={(e) => { if (e.target === e.currentTarget) closeMenu() }}>
          <div className="m-links">
            {NAV_ITEMS.map((n) => n.action ? (
              <button key={n.action} className="m-link" onClick={() => { closeMenu(); openChat() }}>{en(n.key)}</button>
            ) : (
              <NavLink key={n.to} to={n.to} end={n.to === '/'} className="m-link" onClick={closeMenu}>{en(n.key)}</NavLink>
            ))}
            <NavLink to="/booth" className="m-link" onClick={closeMenu}>{en('nav.booth')}</NavLink>
          </div>
          <div className="m-foot">
            <div className="lang m-lang" role="group" aria-label="Language">
              {LANGS.map((l) => (
                <button key={l.id} className={lang === l.id ? 'on' : ''} onClick={() => setLang(l.id)} title={l.name} aria-pressed={lang === l.id}>{l.name}</button>
              ))}
            </div>
            <button className={`m-login ${user ? 'in' : ''}`} onClick={() => { closeMenu(); openAuth() }}>
              {user ? (nickname || user.email) : en('auth.login')}
            </button>
          </div>
        </div>
      )}
      <main className={isHome ? '' : 'container'}><Outlet /></main>
      <footer className="footer">{t('footer')}</footer>
      <Toasts />
      {chatOpen && <ChatModal />}
      {authOpen && <AuthModal />}
    </>
  )
}
