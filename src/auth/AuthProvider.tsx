import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  login as loginRequest,
  logout as logoutRequest,
  refreshSession,
  signup as signupRequest,
} from '../api/auth'
import type { LoginRequest, SignupRequest, User } from '../types/auth'
import {
  AuthContext,
  type AuthContextValue,
  type AuthStatus,
} from './AuthContext'

type AuthProviderProps = {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [status, setStatus] = useState<AuthStatus>('checking')
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    let active = true

    refreshSession()
      .then(() => {
        if (!active) {
          return
        }

        setStatus('authenticated')
      })
      .catch(() => {
        if (!active) {
          return
        }

        setUser(null)
        setStatus('unauthenticated')
      })

    return () => {
      active = false
    }
  }, [])

  const login = useCallback(async (request: LoginRequest) => {
    const response = await loginRequest(request)

    setUser(response.user)
    setStatus('authenticated')
  }, [])

  const signup = useCallback(async (request: SignupRequest) => {
    await signupRequest(request)
    const response = await loginRequest(request)

    setUser(response.user)
    setStatus('authenticated')
  }, [])

  const logout = useCallback(async () => {
    try {
      await logoutRequest()
    } finally {
      setUser(null)
      setStatus('unauthenticated')
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      login,
      signup,
      logout,
    }),
    [login, logout, signup, status, user],
  )

  return <AuthContext value={value}>{children}</AuthContext>
}
