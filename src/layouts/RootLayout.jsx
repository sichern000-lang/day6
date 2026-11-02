import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { NAV_ITEMS } from '../router'
import Toasts from '../components/Toasts'
import { useAppStore } from '../store/useAppStore'
import { useT } from '../lib/useT'

export default function RootLayout() {
  const t = useT()
  const nickname = useAppStore((s) => s.nickname)
  const lang = useAppStore((s) => s.lang)
  const setLang = useAppStore((s) => s.setLang)
  const isHome = useLocation().pathname === '/'

  useEffect(() => { document.documentElement.lang = lang }, [lang])

  return (
    <>
      <div className="announce">{t('announce')}</div>
      <nav className={`topbar ${isHome ? 'over' : ''}`}>
        <div className="links">
          {NAV_ITEMS.map((n) => (
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
    </>
  )
}
