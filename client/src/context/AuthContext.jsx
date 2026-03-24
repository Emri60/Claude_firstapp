import { createContext, useContext, useState } from 'react'
import api from '../api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [username, setUsername] = useState(() => localStorage.getItem('username'))

  async function login(user, pass) {
    const { data } = await api.post('/auth/login', { username: user, password: pass })
    localStorage.setItem('token', data.token)
    localStorage.setItem('username', data.username)
    setToken(data.token)
    setUsername(data.username)
  }

  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    setToken(null)
    setUsername(null)
  }

  return (
    <AuthContext.Provider value={{ token, username, login, logout, isAuth: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
