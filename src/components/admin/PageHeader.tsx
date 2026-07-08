import styles from './page-header.module.scss'

interface Props { title: string; subtitle?: string }

export default function PageHeader({ title, subtitle }: Props) {
  return (
    <div className={styles['page-header']}>
      <h1>{title}</h1>
      {subtitle && <div className={styles.subtitle}>{subtitle}</div>}
    </div>
  )
}
