import { ReactNode } from 'react'
import './settings-group.css'

interface Props { title: string; children: ReactNode }

export default function SettingsGroup({ title, children }: Props) {
  return (
    <div className="settings-group">
      <h3>{title}</h3>
      {children}
    </div>
  )
}
