import './stats-card.css'

interface Props { num: string | number; label: string }

export default function StatsCard({ num, label }: Props) {
  return (
    <div className="stat-card">
      <div className="stat-num">{num}</div>
      <div className="stat-label">{label}</div>
    </div>
  )
}
