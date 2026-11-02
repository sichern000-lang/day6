import { createBrowserRouter } from 'react-router-dom'
import RootLayout from './layouts/RootLayout'
import Home from './pages/Home'
import MapPage from './pages/MapPage'
import Stories from './pages/Stories'
import StoryDetail from './pages/StoryDetail'
import Reviews from './pages/Reviews'
import Notebook from './pages/Notebook'
import NotFound from './pages/NotFound'

// 페이지 추가: ① pages/ 에 파일 ② NAV_ITEMS 한 줄 ③ routes 한 줄
export const NAV_ITEMS = [
  { to: '/', key: 'nav.home' },
  { to: '/map', key: 'nav.map' },
  { to: '/stories', key: 'nav.stories' },
  { to: '/review', key: 'nav.review' },
  { to: '/notebook', key: 'nav.notebook' },
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
      { path: 'stories', element: <Stories /> },
      { path: 'stories/:id', element: <StoryDetail /> },
      { path: 'review', element: <Reviews /> },
      { path: 'notebook', element: <Notebook /> },
    ],
  },
])
