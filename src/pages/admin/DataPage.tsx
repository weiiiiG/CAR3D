import { useState, useEffect, useRef } from 'react'
import * as echarts from 'echarts'
import PageHeader from '../../components/admin/PageHeader'
import ChartCard from '../../components/admin/ChartCard'
import DataTable from '../../components/admin/DataTable'
import { useToast } from './AdminLayout'

const API = '/api'
const cols = [
  { key: 'name', label: '车型' }, { key: 'hp', label: '马力' }, { key: 'torque', label: '扭矩(Nm)' },
  { key: 'acc', label: '0-100km/h' }, { key: 'speed', label: '极速(km/h)' }, { key: 'weight', label: '重量(kg)' },
  { key: 'engine', label: '发动机' }, { key: 'year', label: '年份' },
]

export default function DataPage() {
  const [data, setData] = useState<any[]>([]); const [loading, setLoading] = useState(true)
  const toast = useToast()
  const m1 = useRef<HTMLDivElement>(null); const m2 = useRef<HTMLDivElement>(null); const p1 = useRef<HTMLDivElement>(null)
  const rd = useRef<HTMLDivElement>(null); const ml = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ch: echarts.ECharts[] = []
    function init(el: HTMLDivElement | null, opt: any) { if (!el) return; const c = echarts.init(el); c.setOption(opt); ch.push(c) }

    fetch(API + '/mock-vehicles').then(r => r.json()).then(mock => {
      setData(mock); setLoading(false)
      const sorted = (fn: (d: any) => number, asc = false) => mock.slice().sort((a: any, b: any) => asc ? fn(a) - fn(b) : fn(b) - fn(a)).slice(0, 8)
      const colors = ['#FFBC0A', '#D99A00', '#6B7280', '#2D3040', '#FFBC0A', '#D99A00', '#6B7280', '#2D3040']
      const hp = sorted(d => d.hp); init(m1.current, { grid: { top: 12, bottom: 36, left: 40, right: 10 }, xAxis: { type: 'category', data: hp.map((d: any) => d.name.split(' ').pop()), axisLabel: { color: '#9CA0B0', fontSize: 10, interval: 0 }, axisLine: { show: false } }, yAxis: { type: 'value', name: 'hp', axisLabel: { color: '#5C5F6E', fontSize: 9 }, splitLine: { lineStyle: { color: 'rgba(240,241,244,0.06)' } } }, series: [{ type: 'bar', data: hp.map((d: any, i: number) => ({ value: d.hp, itemStyle: { color: colors[i] } })), barMaxWidth: 28, label: { show: true, position: 'top', color: '#FFBC0A', fontSize: 9, formatter: '{c}' } }] })
      const acc = sorted(d => d.acceleration, true); init(m2.current, { grid: { top: 12, bottom: 36, left: 36, right: 10 }, xAxis: { type: 'category', data: acc.map((d: any) => d.name.split(' ').pop()), axisLabel: { color: '#9CA0B0', fontSize: 10, interval: 0 }, axisLine: { show: false } }, yAxis: { type: 'value', name: '秒', axisLabel: { color: '#5C5F6E', fontSize: 9 }, splitLine: { lineStyle: { color: 'rgba(240,241,244,0.06)' } } }, series: [{ type: 'bar', data: acc.map((d: any, i: number) => ({ value: d.acceleration, itemStyle: { color: colors[i] } })), barMaxWidth: 28, label: { show: true, position: 'top', color: '#FFBC0A', fontSize: 9, formatter: (p: any) => p.value + 's' } }] })
      const cm: Record<string, number> = {}; mock.forEach((d: any) => { cm[d.category] = (cm[d.category] || 0) + 1 }); const cc: Record<string, string> = { '燃油': '#FFBC0A', '混动': '#D99A00', '电动': '#38BDF8' }
      init(p1.current, { series: [{ type: 'pie', radius: ['20%', '55%'], center: ['50%', '55%'], data: Object.entries(cm).map(([k, v]) => ({ name: k, value: v, itemStyle: { color: cc[k] || '#6B7280' } })), label: { color: '#9CA0B0', fontSize: 11, formatter: '{b}\n{d}%' }, emphasis: { label: { fontSize: 13, fontWeight: 'bold' } } }] })
      const flagships = ['Hennessy Venom GT', 'Bugatti Chiron', 'Rimac Nevera', 'Koenigsegg Jesko']; const rdd = mock.filter((d: any) => flagships.includes(d.name))
      init(rd.current, { legend: { data: rdd.map((d: any) => d.name.split(' ').slice(0, 2).join(' ')), textStyle: { color: '#9CA0B0', fontSize: 10 }, top: 0, left: 'center', itemWidth: 14, itemHeight: 8 }, radar: { center: ['50%', '55%'], radius: '60%', indicator: [{ name: '马力', max: 2000 }, { name: '扭矩(Nm)', max: 2500 }, { name: '极速(km/h)', max: 500 }, { name: '重量(kg)', max: 2500 }, { name: '售价(万$)', max: 400 }], axisName: { color: '#9CA0B0', fontSize: 11 }, splitArea: { areaStyle: { color: ['rgba(255,188,10,0.03)', 'rgba(255,188,10,0.08)'] } }, splitLine: { lineStyle: { color: 'rgba(240,241,244,0.06)' } } }, series: [{ type: 'radar', data: rdd.map((d: any, i: number) => ({ value: [d.hp, d.torque, d.topSpeed, d.weight, d.price], name: d.name.split(' ').slice(0, 2).join(' '), lineStyle: { color: ['#FFBC0A', '#D99A00', '#38BDF8', '#EF4444'][i], width: 2 }, areaStyle: { color: ['#FFBC0A', '#D99A00', '#38BDF8', '#EF4444'][i], opacity: 0.08 }, itemStyle: { color: ['#FFBC0A', '#D99A00', '#38BDF8', '#EF4444'][i] } })) }] })
      const ts = sorted(d => d.topSpeed); init(ml.current, { grid: { top: 12, bottom: 36, left: 40, right: 10 }, xAxis: { type: 'category', data: ts.map((d: any) => d.name.split(' ').pop()), axisLabel: { color: '#9CA0B0', fontSize: 10, interval: 0 }, axisLine: { lineStyle: { color: 'rgba(240,241,244,0.08)' } } }, yAxis: { type: 'value', name: 'km/h', axisLabel: { color: '#5C5F6E', fontSize: 9 }, splitLine: { lineStyle: { color: 'rgba(240,241,244,0.06)' } } }, series: [{ type: 'bar', data: ts.map((d: any, i: number) => ({ value: d.topSpeed, itemStyle: { color: colors[i] } })), barMaxWidth: 28, label: { show: true, position: 'top', color: '#FFBC0A', fontSize: 9, formatter: '{c}' } }] })
      setTimeout(() => ch.forEach(c => c.resize()), 100)
    }).catch(() => { setLoading(false); toast('加载失败') })
    return () => ch.forEach(c => c.dispose())
  }, [])

  const sorted = data.slice().sort((a, b) => b.hp - a.hp)
  return (
    <>
      <PageHeader title="数据概览" subtitle="所有视角数据的详细展示 + Mock 数据集" />
      <div className="charts-row" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
        <ChartCard title="马力对比" small><div ref={m1} style={{ height: '100%' }} /></ChartCard>
        <ChartCard title="0-100加速" small><div ref={m2} style={{ height: '100%' }} /></ChartCard>
        <ChartCard title="车型分类" small><div ref={p1} style={{ height: '100%' }} /></ChartCard>
      </div>
      <div className="charts-row">
        <ChartCard title="超跑性能雷达"><div ref={rd} style={{ height: '100%' }} /></ChartCard>
        <ChartCard title="极速对比"><div ref={ml} style={{ height: '100%' }} /></ChartCard>
      </div>
      <div style={{ marginTop: 16 }}>
        <DataTable title="Mock 数据 · 超跑参数对比" cols={cols}>
          {loading ? <tr><td colSpan={8} style={{ textAlign: 'center', padding: 24, color: 'var(--ink-soft)' }}>加载中...</td></tr>
          : sorted.map(d => (
            <tr key={d.id}>
              <td style={{ fontWeight: 600, color: 'var(--ink)' }}>{d.name}</td>
              <td>{d.hp}</td><td>{d.torque}</td><td>{d.acceleration}s</td>
              <td>{d.topSpeed}</td><td>{d.weight}kg</td><td>{d.engine}</td><td>{d.year}</td>
            </tr>
          ))}
        </DataTable>
      </div>
    </>
  )
}
