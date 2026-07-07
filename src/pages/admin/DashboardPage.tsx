import { useState, useEffect, useRef } from 'react'
import * as echarts from 'echarts'
import PageHeader from '../../components/admin/PageHeader'
import StatsCard from '../../components/admin/StatsCard'
import ChartCard from '../../components/admin/ChartCard'
import { useToast } from './AdminLayout'

const API = '/api'

export default function DashboardPage() {
  const [stats, setStats] = useState({ views: 0, overrides: 0, active: 0, mock: 0 })
  const radarRef = useRef<HTMLDivElement>(null); const barRef = useRef<HTMLDivElement>(null)
  const pieRef = useRef<HTMLDivElement>(null); const trendRef = useRef<HTMLDivElement>(null)
  const toast = useToast()

  useEffect(() => {
    const ch: echarts.ECharts[] = []
    function init(id: HTMLDivElement | null, opt: any) { if (!id) return; const c = echarts.init(id); c.setOption(opt); ch.push(c) }

    const onResize = () => ch.forEach(c => c.resize())
    window.addEventListener('resize', onResize)
    fetch(API + '/dashboard').then(r => r.json()).catch(() => ({})).then(dash => {
      Promise.all([fetch(API + '/views'), fetch(API + '/overrides'), fetch(API + '/mock-vehicles')])
        .then(rs => Promise.all(rs.map(r => r.json())))
        .then(([views, overrides, mock]) => {
          setStats({ views: views.length, overrides: overrides.length, active: views.filter((v: any) => v.isActive).length, mock: mock.length })

          init(radarRef.current, {
            tooltip: { trigger: 'item', formatter: (p: any) => { const l = [['马力', ' hp'], ['扭矩', ' Nm'], ['极速', ' km/h'], ['0-100', 's'], ['下压力', ' kg']]; return '<b>' + p.name + '</b><br/>' + l.map((x, i) => x[0] + ': ' + p.value[i] + x[1]).join('<br/>') } },
            radar: { center: ['50%', '52%'], radius: '65%', indicator: [{ name: '马力 (hp)', max: 1500 }, { name: '扭矩(Nm)', max: 1200 }, { name: '极速km/h', max: 350 }, { name: '0-100s', max: 3.5 }, { name: '下压力kg', max: 500 }], axisName: { color: '#9CA0B0', fontSize: 11 }, splitArea: { areaStyle: { color: ['rgba(255,188,10,0.04)', 'rgba(255,188,10,0.10)'] } }, splitLine: { lineStyle: { color: 'rgba(240,241,244,0.08)' } } },
            series: [{ type: 'radar', data: [{ value: [1244, 1155, 301, 2.7, 450], name: 'Venom GT' }], areaStyle: { color: 'rgba(255,188,10,0.25)' }, lineStyle: { color: '#FFBC0A', width: 2 }, itemStyle: { color: '#FFBC0A' } }],
          })

          const dim = (dash as any).dimensions, mat = (dash as any).materials, trend = (dash as any).trend
          if (dim) init(barRef.current, {
            grid: { top: 16, bottom: 28, left: 56, right: 12 },
            xAxis: { type: 'category', data: dim.labels, axisLabel: { color: '#9CA0B0', fontSize: 11 }, axisLine: { lineStyle: { color: 'rgba(240,241,244,0.08)' } } },
            yAxis: { type: 'value', axisLabel: { color: '#5C5F6E', fontSize: 10, formatter: '{value}mm' }, splitLine: { lineStyle: { color: 'rgba(240,241,244,0.06)' } } },
            series: [{ type: 'bar', data: dim.values, itemStyle: { color: '#FFBC0A' }, barMaxWidth: 50, label: { show: true, position: 'top', color: '#FFBC0A', fontSize: 10, formatter: (p: any) => p.value + 'mm' } }],
          })
          if (mat) { const mc: Record<string, string> = { '碳纤维': '#2D3040', 'Alcantara': '#6B7280', '皮革': '#FFBC0A', '铝合金': '#D99A00' }; init(pieRef.current, { series: [{ type: 'pie', radius: ['30%', '60%'], center: ['50%', '52%'], roseType: 'radius', data: mat.labels.map((l: string, i: number) => ({ value: mat.values[i], name: l, itemStyle: { color: mc[l] || '#6B7280' } })), label: { color: '#9CA0B0', fontSize: 11, formatter: '{b}\n{d}%' } }] }) }
          if (trend) { const cs = ['#FFBC0A', '#D99A00', '#6B7280', '#5C5F6E']; const sym = ['circle', 'diamond', 'triangle', 'rect']; init(trendRef.current, { grid: { top: 28, bottom: 24, left: 44, right: 12 }, legend: { data: trend.series.map((s: any) => s.name), textStyle: { color: '#9CA0B0', fontSize: 10 }, itemWidth: 12, itemHeight: 8, top: 0, right: 0 }, xAxis: { type: 'category', data: trend.months, axisLabel: { color: '#9CA0B0', fontSize: 11 }, axisLine: { lineStyle: { color: 'rgba(240,241,244,0.08)' } } }, yAxis: { type: 'value', axisLabel: { color: '#5C5F6E', fontSize: 10, formatter: '{value}次' }, splitLine: { lineStyle: { color: 'rgba(240,241,244,0.06)' } } }, series: trend.series.map((s: any, i: number) => ({ name: s.name, type: 'line', data: s.data, smooth: true, lineStyle: { color: cs[i], width: 2 }, itemStyle: { color: cs[i] }, areaStyle: { color: cs[i], opacity: 0.1 }, symbol: sym[i], symbolSize: 6 })) }) }
        }).catch(() => toast('无法连接后端服务'))
    })
    return () => { ch.forEach(c => c.dispose()); window.removeEventListener('resize', onResize) }
  }, [])

  return (
    <>
      <PageHeader title="仪表盘" subtitle="Hennessy Venom GT · 数据管理后台" />
      <div className="stats-row">
        <StatsCard num={stats.views || '—'} label="视角总数" />
        <StatsCard num={stats.overrides || '—'} label="覆盖调整数" />
        <StatsCard num={stats.active || '—'} label="启用的视角" />
        <StatsCard num={stats.mock || '—'} label="Mock 数据条目" />
      </div>
      <div className="charts-row">
        <ChartCard title="规格雷达"><div ref={radarRef} style={{ height: '100%' }} /></ChartCard>
        <ChartCard title="尺寸对比"><div ref={barRef} style={{ height: '100%' }} /></ChartCard>
      </div>
      <div className="charts-row">
        <ChartCard title="材料分布"><div ref={pieRef} style={{ height: '100%' }} /></ChartCard>
        <ChartCard title="月度访问趋势"><div ref={trendRef} style={{ height: '100%' }} /></ChartCard>
      </div>
    </>
  )
}
