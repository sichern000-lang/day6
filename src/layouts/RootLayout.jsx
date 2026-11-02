import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { NAV_ITEMS } from '../router'
import Toasts from '../components/Toasts'
import { useAppStore } from '../store/useAppStore'

export default function RootLayout() {
  const nickname = useAppStore((s) => s.nickname)
  const isHome = useLocation().pathname === '/'
  return (
    <>
      <div className="announce">제주 신화·전설을 지도 위에서 만나 보세요</div>
      <nav className={`topbar ${isHome ? 'over' : ''}`}>
        <div className="links">
          {NAV_ITEMS.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.to === '/'}>{n.label}</NavLink>
          ))}
        </div>
        <NavLink to="/" className="brand">신화지도</NavLink>
        <span className="who">{nickname || '익명'}</span>
      </nav>
      <main className={isHome ? '' : 'container'}><Outlet /></main>
      <footer className="footer">
        데이터: 기상청 · 한국관광공사 · 국가유산청(공공데이터포털) · 신화는 전승에 따라 다르며 요약은 학습용입니다
      </footer>
      <Toasts />
    </>
  )
}
