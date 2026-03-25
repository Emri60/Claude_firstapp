import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import BottomNav from './BottomNav'
import OfflineBanner from './OfflineBanner'

const TITLES = {
  '/objets': 'Objets',
  '/gestion': 'Gestion',
  '/preparation': 'Préparation',
}

export default function Layout() {
  const { username, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const base = '/' + location.pathname.split('/')[1]
  const title = TITLES[base] ?? 'Sourcing Vintage'
  const isSubPage = location.pathname !== base

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <OfflineBanner />
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        {isSubPage ? (
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-ink font-medium text-sm active:opacity-60"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Retour
          </button>
        ) : (
          <h1 className="text-lg font-bold text-ink">{title}</h1>
        )}
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
