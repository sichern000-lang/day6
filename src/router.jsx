import { Suspense, lazy } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import RootLayout from './layouts/RootLayout'
import Home from './pages/Home'
import MapPage from './pages/MapPage'
import Stories from './pages/Stories'
import StoryDetail from './pages/StoryDetail'
import Notebook from './pages/Notebook'
import Helper from './pages/Helper'
import { Loading } from './components/Status'

const Island = lazy(() => import('./pages/Island'))
const Booth = lazy(() => import('./pages/Booth'))       // 포토부스(두들 그림 만들기 포함)도 이 페이지에 들어갈 때만 불러옴   // three.js 는 크니까 이 페이지에 들어갈 때만 불러옴
import NotFound from './pages/NotFound'

// 페이지 추가: ① pages/ 에 파일 ② NAV_ITEMS 한 줄 ③ routes 한 줄
export const NAV_ITEMS = [
  { to: '/', key: 'nav.home' },
  { to: '/stories', key: 'nav.stories' },
  { to: '/map', key: 'nav.map' },
  { to: '/island', key: 'nav.island' },
  { to: '/notebook', key: 'nav.notebook' },
  { to: '/helper', key: 'nav.helper' },
  { action: 'ask', key: 'nav.ask' }, // 페이지가 아니라 Ask 모달을 엽니다
]

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <NotFound />,
    children: [
      { index: true, element: <Home /> },
      { path: 'map', element: <MapPage /> },
      { path: 'island', element: <Suspense fallback={<Loading />}><Island /></Suspense> },
      { path: 'stories', element: <Stories /> },
      { path: 'stories/:id', element: <StoryDetail /> },
      { path: 'notebook', element: <Notebook /> },
      { path: 'helper', element: <Helper /> },
      { path: 'booth', element: <Suspense fallback={<Loading />}><Booth /></Suspense> },
    ],
  },
])
