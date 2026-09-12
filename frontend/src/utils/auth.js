import { createContext, useContext, useState, useCallback, createElement } from 'react'

const TOKEN_KEY = 'ca_jwt'
const USER_KEY  = 'ca_user'

export const getToken = () => localStorage.getItem(TOKEN_KEY)

const parseUser = () => {
  try { return JSON.parse(localStorage.getItem(USER_KEY) ?? 'null') }
  catch { return null }
}

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(parseUser)

  const login = useCallback((token, userData) => {
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(USER_KEY, JSON.stringify(userData))
    setUser(userData)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setUser(null)
  }, [])

  return createElement(
    AuthContext.Provider,
    { value: { user, login, logout, isAuthenticated: !!user } },
    children
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}
