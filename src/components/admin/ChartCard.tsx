import { type ReactNode } from 'react'
import styles from './chart-card.module.scss'

interface Props { title: string; children: ReactNode; small?: boolean }

export default function ChartCard({ title, children, small }: Props) {
  return (
    <div className={styles['admin-chart-card']}>
      <h3>{title}</h3>
      <div className={small ? styles['admin-chart-box-sm'] : styles['admin-chart-box']}>{children}</div>
    </div>
  )
}
