import { ReactNode } from 'react'
import './data-table.css'

interface Col { key: string; label: string; width?: number }
interface Props { title: string; cols: Col[]; children: ReactNode; onAdd?: () => void; addLabel?: string }

export default function DataTable({ title, cols, children, onAdd, addLabel }: Props) {
  return (
    <div className="data-table-wrap">
      <div className="table-head">
        <h3>{title}</h3>
        {onAdd && <button className="btn-add" onClick={onAdd}>+ {addLabel || '新增'}</button>}
      </div>
      <table className="data-table">
        <thead><tr>{cols.map(c => <th key={c.key} style={c.width ? { width: c.width } : undefined}>{c.label}</th>)}</tr></thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  )
}
