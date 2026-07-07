import { useState, useEffect, useRef } from 'react'
import * as echarts from 'echarts'
import { useToast } from './AdminToast'

const API = '/api'

export default function DashboardPage() {
  const [stats, setStats] = useState({ views: 0, overrides: 0, active: 0, mock: 0 })
  const radarRef = useRef<HTMLDivElement>(null); const barRef = useRef<HTMLDivElement>(null)
  const pieRef = useRef<HTMLDivElement>(null); const trendRef = useRef<HTMLDivElement>(null)
  const chartsRef = useRef<echarts.ECharts[]>([])
  const toast = useToast()

  useEffect(() => {
    const ch: echarts.ECharts[] = []
    function make(id: HTMLDivElement | null, opt: any) { if (!id) return; const c = echarts.init(id); c.setOption(opt); ch.push(c); return c }

    const loadData = async () => {
      try {
        const [views, overrides, mock, dash] = await Promise.all([
          fetch(API + '/views').then(r => r.json()),
          fetch(API + '/overrides').then(r => r.json()),
          fetch(API + '/mock-vehicles').then(r => r.json()),
          fetch(API + '/dashboard').then(r => r.json()).catch(() => ({})),
        ])
        setStats({ views: views.length, overrides: overrides.length, active: views.filter((v: any) => v.isActive).length, mock: mock.length })

        make(radarRef.current, {
          tooltip: { trigger: 'item' as const, formatter: (p: any) => {
            const labels = [['马力', ' hp'], ['扭矩', ' Nm'], ['极速', ' km/h'], ['0-100', 's'], ['下压力', ' kg']]
            return '<b>' + p.name + '</b><br/>' + labels.map((l, i) => l[0] + ': ' + p.value[i] + l[1]).join('<br/>')
          }},
          radar: { center: ['50%', '52%'], radius: '65%', indicator: [{ name: '马力 (hp)', max: 1500 }, { name: '扭矩(Nm)', max: 1200 }, { name: '极速km/h', max: 350 }, { name: '0-100s', max: 3.5 }, { name: '下压力kg', max: 500 }],
            axisName: { color: '#9CA0B0', fontSize: 11 }, splitArea: { areaStyle: { color: ['rgba(255,188,10,0.04)', 'rgba(255,188,10,0.10)'] } }, splitLine: { lineStyle: { color: 'rgba(240,241,244,0.08)' } } },
          series: [{ type: 'radar' as const, data: [{ value: [1244, 1155, 301, 2.7, 450], name: 'Venom GT' }], areaStyle: { color: 'rgba(255,188,10,0.25)' }, lineStyle: { color: '#FFBC0A', width: 2 }, itemStyle: { color: '#FFBC0A' } }],
          animationDuration: 800, animationEasing: 'elasticOut',
        })

        const dim = (dash as any).dimensions; const mat = (dash as any).materials; const trend = (dash as any).trend
        if (dim) {
          make(barRef.current, {
            tooltip: { trigger: 'axis' as const }, grid: { top: 16, bottom: 28, left: 56, right: 12 },
            xAxis: { type: 'category' as const, data: dim.labels, axisLabel: { color: '#9CA0B0', fontSize: 11 }, axisLine: { lineStyle: { color: 'rgba(240,241,244,0.08)' } } },
            yAxis: { type: 'value' as const, axisLabel: { color: '#5C5F6E', fontSize: 10, formatter: '{value}mm' }, splitLine: { lineStyle: { color: 'rgba(240,241,244,0.06)' } } },
            series: [{ type: 'bar' as const, data: dim.values, itemStyle: { color: '#FFBC0A' }, barMaxWidth: 50, label: { show: true, position: 'top' as const, color: '#FFBC0A', fontSize: 10, formatter: (p: any) => p.value + 'mm' } }],
            animationDuration: 600, animationEasing: 'bounceOut',
          })
        }
        if (mat) {
          const matColors: Record<string, string> = { '碳纤维': '#2D3040', 'Alcantara': '#6B7280', '皮革': '#FFBC0A', '铝合金': '#D99A00' }
          make(pieRef.current, {
            tooltip: { trigger: 'item' as const, formatter: '{b}: {c}% ({d}%)' },
            series: [{ type: 'pie' as const, radius: ['30%', '60%'], center: ['50%', '52%'], roseType: 'radius' as const,
              data: mat.labels.map((l: string, i: number) => ({ value: mat.values[i], name: l, itemStyle: { color: matColors[l] || '#6B7280' } })),
              label: { color: '#9CA0B0', fontSize: 11, formatter: '{b}\n{d}%' } }],
            animationDuration: 800, animationEasing: 'cubicOut',
          })
        }
        if (trend) {
          const colors = ['#FFBC0A', '#D99A00', '#6B7280', '#5C5F6E']; const syms = ['circle', 'diamond', 'triangle', 'rect'] as const
          make(trendRef.current, {
            tooltip: { trigger: 'axis' as const }, grid: { top: 28, bottom: 24, left: 44, right: 12 },
            legend: { data: trend.series.map((s: any) => s.name), textStyle: { color: '#9CA0B0', fontSize: 10 }, itemWidth: 12, itemHeight: 8, top: 0, right: 0 },
            xAxis: { type: 'category' as const, data: trend.months, axisLabel: { color: '#9CA0B0', fontSize: 11 }, axisLine: { lineStyle: { color: 'rgba(240,241,244,0.08)' } } },
            yAxis: { type: 'value' as const, axisLabel: { color: '#5C5F6E', fontSize: 10, formatter: '{value}次' }, splitLine: { lineStyle: { color: 'rgba(240,241,244,0.06)' } } },
            series: trend.series.map((s: any, i: number) => ({ name: s.name, type: 'line' as const, data: s.data, smooth: true, lineStyle: { color: colors[i], width: 2 }, itemStyle: { color: colors[i] }, areaStyle: { color: colors[i], opacity: 0.1 }, symbol: syms[i], symbolSize: 6 })),
            animationDuration: 1000, animationEasing: 'quadraticOut',
          })
        }
      } catch { toast('无法连接后端服务') }
    }
    loadData()
    return () => { ch.forEach(c => c.dispose()); chartsRef.current.forEach(c => c.dispose()) }
  }, [])

  return (
    <div className="page active">
      <h1>仪表盘</h1>
      <div className="subtitle">Hennessy Venom GT · 数据管理后台</div>
      <div className="stats-row">
        <div className="stat-card"><div className="stat-num">{stats.views || '—'}</div><div className="stat-label">视角总数</div></div>
        <div className="stat-card"><div className="stat-num">{stats.overrides || '—'}</div><div className="stat-label">覆盖调整数</div></div>
        <div className="stat-card"><div className="stat-num">{stats.active || '—'}</div><div className="stat-label">启用的视角</div></div>
        <div className="stat-card"><div className="stat-num">{stats.mock || '—'}</div><div className="stat-label">Mock 数据条目</div></div>
      </div>
      <div className="charts-row">
        <div className="chart-card"><h3>规格雷达</h3><div className="chart-box" ref={radarRef} /></div>
        <div className="chart-card"><h3>尺寸对比</h3><div className="chart-box" ref={barRef} /></div>
      </div>
      <div className="charts-row">
        <div className="chart-card"><h3>材料分布</h3><div className="chart-box" ref={pieRef} /></div>
        <div className="chart-card"><h3>月度访问趋势</h3><div className="chart-box" ref={trendRef} /></div>
      </div>
    </div>
  )
}
