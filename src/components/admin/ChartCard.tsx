import { type ReactNode } from 'react'
import './chart-card.css'

interface Props { title: string; children: ReactNode; small?: boolean }

export default function ChartCard({ title, children, small }: Props) {
  return (
    <div className="admin-chart-card">
      <h3>{title}</h3>
      <div className={small ? 'admin-chart-box-sm' : 'admin-chart-box'}>{children}</div>
    </div>
  )
}
