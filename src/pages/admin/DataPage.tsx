import { useState, useEffect, useRef } from 'react'
import * as echarts from 'echarts'
import { useToast } from './AdminToast'

const API = '/api'

export default function DataPage() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const toast = useToast()
  const chartRefs = useRef<echarts.ECharts[]>([])

  useEffect(() => {
    const ch: echarts.ECharts[] = []
    function initChart(el: HTMLDivElement | null, opt: any) { if (!el) return; const c = echarts.init(el); c.setOption(opt); ch.push(c) }

    fetch(API + '/mock-vehicles').then(r => r.json()).then(mock => {
      setData(mock); setLoading(false)
      if (!mock.length) return

      const sorted = (fn: (d: any) => number, asc = false) => mock.slice().sort((a: any, b: any) => asc ? fn(a) - fn(b) : fn(b) - fn(a)).slice(0, 8)
      const colors = ['#FFBC0A', '#D99A00', '#6B7280', '#2D3040', '#FFBC0A', '#D99A00', '#6B7280', '#2D3040']
      const hp = sorted(d => d.hp)
      initChart(document.getElementById('mBar1'), {
        tooltip: { trigger: 'axis', formatter: (p: any) => p[0].name + '<br/>马力: ' + p[0].value + ' hp' },
        xAxis: { type: 'category', data: hp.map((d: any) => d.name.split(' ').pop()), axisLabel: { color: '#9CA0B0', fontSize: 10, interval: 0 }, axisLine: { show: false } },
        yAxis: { type: 'value', name: 'hp', axisLabel: { color: '#5C5F6E', fontSize: 9 }, splitLine: { lineStyle: { color: 'rgba(240,241,244,0.06)' } } },
        series: [{ type: 'bar', data: hp.map((d: any, i: number) => ({ value: d.hp, itemStyle: { color: colors[i] } })), barMaxWidth: 28, label: { show: true, position: 'top', color: '#FFBC0A', fontSize: 9, formatter: '{c}' } }],
        grid: { top: 12, bottom: 36, left: 40, right: 10 }, animationDuration: 700, animationEasing: 'bounceOut',
      })
      const acc = sorted(d => d.acceleration, true)
      initChart(document.getElementById('mBar2'), {
        tooltip: { trigger: 'axis', formatter: (p: any) => p[0].name + '<br/>0-100km/h: ' + p[0].value + 's' },
        xAxis: { type: 'category', data: acc.map((d: any) => d.name.split(' ').pop()), axisLabel: { color: '#9CA0B0', fontSize: 10, interval: 0 }, axisLine: { show: false } },
        yAxis: { type: 'value', name: '秒', axisLabel: { color: '#5C5F6E', fontSize: 9 }, splitLine: { lineStyle: { color: 'rgba(240,241,244,0.06)' } } },
        series: [{ type: 'bar', data: acc.map((d: any, i: number) => ({ value: d.acceleration, itemStyle: { color: colors[i] } })), barMaxWidth: 28, label: { show: true, position: 'top', color: '#FFBC0A', fontSize: 9, formatter: (p: any) => p.value + 's' } }],
        grid: { top: 12, bottom: 36, left: 36, right: 10 }, animationDuration: 700, animationEasing: 'bounceOut',
      })
      const catMap: Record<string, number> = {}; mock.forEach((d: any) => { catMap[d.category] = (catMap[d.category] || 0) + 1 })
      const catColors: Record<string, string> = { '燃油': '#FFBC0A', '混动': '#D99A00', '电动': '#38BDF8' }
      initChart(document.getElementById('mPie1'), {
        tooltip: { trigger: 'item', formatter: '{b}: {c} 款 ({d}%)' },
        series: [{ type: 'pie', radius: ['20%', '55%'], center: ['50%', '55%'], data: Object.entries(catMap).map(([k, v]) => ({ name: k, value: v, itemStyle: { color: catColors[k] || '#6B7280' } })), label: { color: '#9CA0B0', fontSize: 11, formatter: '{b}\n{d}%' }, emphasis: { label: { fontSize: 13, fontWeight: 'bold' } }, animationDuration: 800, animationEasing: 'cubicOut' }],
      })
      const flagships = ['Hennessy Venom GT', 'Bugatti Chiron', 'Rimac Nevera', 'Koenigsegg Jesko']
      const rd = mock.filter((d: any) => flagships.includes(d.name))
      initChart(document.getElementById('mRadar'), {
        tooltip: { trigger: 'item', formatter: (p: any) => ['马力', '扭矩(Nm)', '极速(km/h)', '重量(kg)', '售价(万$)'].map((l, i) => l + ': ' + p.value[i]).join('<br/>') },
        legend: { data: rd.map((d: any) => d.name.split(' ').slice(0, 2).join(' ')), textStyle: { color: '#9CA0B0', fontSize: 10 }, top: 0, left: 'center', itemWidth: 14, itemHeight: 8 },
        radar: { center: ['50%', '55%'], radius: '60%', indicator: [{ name: '马力', max: 2000 }, { name: '扭矩(Nm)', max: 2500 }, { name: '极速(km/h)', max: 500 }, { name: '重量(kg)', max: 2500 }, { name: '售价(万$)', max: 400 }], axisName: { color: '#9CA0B0', fontSize: 11 }, splitArea: { areaStyle: { color: ['rgba(255,188,10,0.03)', 'rgba(255,188,10,0.08)'] } }, splitLine: { lineStyle: { color: 'rgba(240,241,244,0.06)' } } },
        series: [{ type: 'radar', data: rd.map((d: any, i: number) => ({ value: [d.hp, d.torque, d.topSpeed, d.weight, d.price], name: d.name.split(' ').slice(0, 2).join(' '), lineStyle: { color: ['#FFBC0A', '#D99A00', '#38BDF8', '#EF4444'][i], width: 2 }, areaStyle: { color: ['#FFBC0A', '#D99A00', '#38BDF8', '#EF4444'][i], opacity: 0.08 }, itemStyle: { color: ['#FFBC0A', '#D99A00', '#38BDF8', '#EF4444'][i] } })), animationDuration: 800, animationEasing: 'elasticOut' }],
      })
      const topSpeed = sorted(d => d.topSpeed)
      initChart(document.getElementById('mLine'), {
        tooltip: { trigger: 'axis', formatter: (p: any) => p[0].name + '<br/>极速: ' + p[0].value + ' km/h' },
        xAxis: { type: 'category', data: topSpeed.map((d: any) => d.name.split(' ').pop()), axisLabel: { color: '#9CA0B0', fontSize: 10, interval: 0 }, axisLine: { lineStyle: { color: 'rgba(240,241,244,0.08)' } } },
        yAxis: { type: 'value', name: 'km/h', axisLabel: { color: '#5C5F6E', fontSize: 9 }, splitLine: { lineStyle: { color: 'rgba(240,241,244,0.06)' } } },
        series: [{ type: 'bar', data: topSpeed.map((d: any, i: number) => ({ value: d.topSpeed, itemStyle: { color: colors[i] } })), barMaxWidth: 28, label: { show: true, position: 'top', color: '#FFBC0A', fontSize: 9, formatter: '{c}' } }],
        grid: { top: 12, bottom: 36, left: 40, right: 10 }, animationDuration: 700, animationEasing: 'bounceOut',
      })
      setTimeout(() => ch.forEach(c => c.resize()), 100)
    }).catch(() => { setLoading(false); toast('加载失败') })

    return () => ch.forEach(c => c.dispose())
  }, [])

  const sorted = data.slice().sort((a, b) => b.hp - a.hp)

  return (
    <div className="page active">
      <h1>数据概览</h1>
      <div className="subtitle">所有视角数据的详细展示 + Mock 数据集</div>
      <div className="charts-row" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
        <div className="chart-card"><h3>马力对比</h3><div className="chart-box-sm" id="mBar1" /></div>
        <div className="chart-card"><h3>0-100加速</h3><div className="chart-box-sm" id="mBar2" /></div>
        <div className="chart-card"><h3>车型分类</h3><div className="chart-box-sm" id="mPie1" /></div>
      </div>
      <div className="charts-row">
        <div className="chart-card"><h3>超跑性能雷达</h3><div className="chart-box" id="mRadar" /></div>
        <div className="chart-card"><h3>极速对比</h3><div className="chart-box" id="mLine" /></div>
      </div>
      <div className="data-table-wrap" style={{ marginTop: 16 }}>
        <div className="table-head"><h3>Mock 数据 · 超跑参数对比</h3></div>
        <table className="data-table"><thead><tr>
          <th>车型</th><th>马力</th><th>扭矩(Nm)</th><th>0-100km/h</th><th>极速(km/h)</th><th>重量(kg)</th><th>发动机</th><th>年份</th>
        </tr></thead><tbody>
          {loading ? <tr><td colSpan={8} style={{ textAlign: 'center', padding: 24, color: 'var(--ink-soft)' }}>加载中...</td></tr>
          : sorted.map(d => (
            <tr key={d.id}>
              <td style={{ fontWeight: 600, color: 'var(--ink)' }}>{d.name}</td>
              <td>{d.hp}</td><td>{d.torque}</td><td>{d.acceleration}s</td>
              <td>{d.topSpeed}</td><td>{d.weight}kg</td><td>{d.engine}</td><td>{d.year}</td>
            </tr>
          ))}
        </tbody></table>
      </div>
    </div>
  )
}
