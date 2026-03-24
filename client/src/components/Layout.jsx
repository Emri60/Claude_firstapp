import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import BottomNav from './BottomNav'

const TITLES = {
  '/objets': 'Objets',
  '/terrain': 'Terrain',
  '/vendeurs': 'Vendeurs',
  '/preparation': 'Préparation',
}

export default function Layout() {
  const { username, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const base = '/' + location.pathname.split('/')[1]
  const title = TITLES[base] ?? 'Sourcing Vintage'

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-bold text-ink">{title}</h1>
        <button
          onClick={handleLogout}
          className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          {username} · Déco
        </button>
      </header>
      <main className="flex-1 overflow-y-auto pb-20">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
