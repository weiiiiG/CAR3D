import { type ReactNode } from 'react'
import './modal.module.scss'

interface Props { children: ReactNode; onClose: () => void }

export default function AdminModal({ children, onClose }: Props) {
  return (
    <div className="modal-mask" onClick={onClose}>
      <div className="modal-panel" onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  )
}
