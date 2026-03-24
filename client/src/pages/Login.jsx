import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(username, password)
      navigate('/objets')
    } catch {
      setError('Identifiants incorrects')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-ink">Sourcing Vintage</h1>
          <p className="text-gray-500 mt-1">Pologne — Varsovie</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-card rounded-2xl p-6 shadow-sm space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Utilisateur</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full rounded-xl border-gray-200 text-lg py-3 px-4 focus:ring-primary focus:border-primary"
              placeholder="user1"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full rounded-xl border-gray-200 text-lg py-3 px-4 focus:ring-primary focus:border-primary"
              placeholder="••••••••"
              required
            />
          </div>
          {error && <p className="text-primary text-sm font-medium">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white font-semibold text-lg py-4 rounded-xl hover:bg-red-700 disabled:opacity-60 transition-colors"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  )
}
