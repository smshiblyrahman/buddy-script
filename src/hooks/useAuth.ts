'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import type { User } from '@/types'

type AuthState = { user: User | null; isLoading: boolean }

export const AuthContext = React.createContext<AuthState>({ user: null, isLoading: false })

export function useAuth() {
  const router = useRouter()
  const { user, isLoading } = React.useContext(AuthContext)

  const logout = React.useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }, [router])

  return { user, isLoading, logout }
}

