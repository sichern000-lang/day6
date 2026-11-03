import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import './styles/theme.css'
import { router } from './router'
import Maintenance from './MaintenancePage'
import { MAINTENANCE } from './maintenance'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {MAINTENANCE || import.meta.env.VITE_MAINTENANCE === '1' ? <Maintenance /> : <RouterProvider router={router} />}
  </StrictMode>,
)
