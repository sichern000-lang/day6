import { createBrowserRouter } from 'react-router-dom'
import RootLayout from './layouts/RootLayout'
import Home from './pages/Home'
import MapPage from './pages/MapPage'
import Stories from './pages/Stories'
import StoryDetail from './pages/StoryDetail'
import Guide from './pages/Guide'
import Notebook from './pages/Notebook'
import NotFound from './pages/NotFound'

// 페이지 추가: ① pages/ 에 파일 ② NAV_ITEMS 한 줄 ③ routes 한 줄
export const NAV_ITEMS = [
  { to: '/', label: '홈' },
  { to: '/map', label: '신화 지도' },
  { to: '/stories', label: '이야기' },
  { to: '/guide', label: '안내자' },
  { to: '/notebook', label: '내 수첩' },
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
      { path: 'guide', element: <Guide /> },
      { path: 'notebook', element: <Notebook /> },
    ],
  },
])
