import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { NAV_ITEMS } from '../router'
import Toasts from '../components/Toasts'
import ChatModal from '../components/ChatModal'
import { useAppStore } from '../store/useAppStore'
import { useT } from '../lib/useT'

export default function RootLayout() {
  const t = useT()
  const nickname = useAppStore((s) => s.nickname)
  const lang = useAppStore((s) => s.lang)
  const setLang = useAppStore((s) => s.setLang)
  const chatOpen = useAppStore((s) => s.chatOpen)
  const openChat = useAppStore((s) => s.openChat)
  const isHome = useLocation().pathname === '/'

  useEffect(() => { document.documentElement.lang = lang }, [lang])

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
      <div className="announce">{t('announce')}</div>
      <nav className={`topbar ${isHome ? 'over' : ''} ${isHome && scrolled ? 'solid' : ''}`}>
        <div className="links">
          {NAV_ITEMS.map((n) => n.action ? (
            <button key={n.action} className="navbtn" onClick={openChat}>{t(n.key)}</button>
          ) : (
            <NavLink key={n.to} to={n.to} end={n.to === '/'}>{t(n.key)}</NavLink>
          ))}
        </div>
        <NavLink to="/" className="brand">{t('brand')}</NavLink>
        <div className="right">
          <div className="lang" role="group" aria-label="Language">
            <button className={lang === 'ko' ? 'on' : ''} onClick={() => setLang('ko')}>KO</button>
            <button className={lang === 'en' ? 'on' : ''} onClick={() => setLang('en')}>EN</button>
          </div>
          <span className="who">{nickname || t('anon')}</span>
        </div>
      </nav>
      <main className={isHome ? '' : 'container'}><Outlet /></main>
      <footer className="footer">{t('footer')}</footer>
      <Toasts />
      {chatOpen && <ChatModal />}
    </>
  )
}
