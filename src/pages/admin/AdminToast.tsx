import { useState, useCallback, createContext, useContext } from 'react'

const ToastCtx = createContext<(msg: string) => void>(() => {})

export function useToast() { return useContext(ToastCtx) }

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [msg, setMsg] = useState('')
  const show = useCallback((m: string) => { setMsg(m); setTimeout(() => setMsg(''), 3000) }, [])
  return (
    <ToastCtx.Provider value={show}>
      {children}
      {msg && <div className="toast" key={msg}><span>{msg}</span></div>}
    </ToastCtx.Provider>
  )
}
