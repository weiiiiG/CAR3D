import { type ReactNode } from 'react'
import styles from './settings-group.module.scss'

interface Props { title: string; children: ReactNode }

export default function SettingsGroup({ title, children }: Props) {
  return (
    <div className={styles['settings-group']}>
      <h3>{title}</h3>
      {children}
    </div>
  )
}
