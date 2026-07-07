import { createContext, useContext } from 'react'

export interface AuthCtxValue {
  authFetch: (url: string, opts?: RequestInit) => Promise<Response>
  canManage: boolean
  userRole: string
}

export const AuthCtx = createContext<AuthCtxValue>({
  authFetch: fetch,
  canManage: false,
  userRole: '',
})

export const useAuth = () => useContext(AuthCtx)
