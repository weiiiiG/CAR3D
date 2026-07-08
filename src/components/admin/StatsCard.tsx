import styles from './stats-card.module.scss'

interface Props { num: string | number; label: string }

export default function StatsCard({ num, label }: Props) {
  return (
    <div className={styles['stat-card']}>
      <div className={styles['stat-num']}>{num}</div>
      <div className={styles['stat-label']}>{label}</div>
    </div>
  )
}
