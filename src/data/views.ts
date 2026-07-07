export const HI: Record<string, { label: string; desc: string; spec: string }> = {
  front: { label: '前脸', desc: '激进车身套件搭配碳纤维进气口。', spec: '1,244 hp' },
  side: { label: '侧颜', desc: '风洞打磨的流畅空气动力学轮廓。', spec: 'Cd 0.35' },
  '45': { label: '座舱', desc: '以驾驶者为中心的座舱预览。', spec: 'RWD 底盘' },
  interior: { label: '内饰', desc: 'Alcantara 翻毛皮与碳纤维座舱。', spec: '单座布局' },
  doors: { label: '鸥翼门', desc: '向上开启的碳纤维车门。', spec: '单扇 2.7 kg' },
  wheels: { label: '轮毂', desc: '20 英寸锻造合金轮毂。', spec: 'Pilot Sport Cup 2' },
}

export const BUILTIN_VIEWS: Record<string, { pos: number[]; target: number[] }> = {
  front: { pos: [0, 1.8, 9.5], target: [-0.8, 0.6, 0] },
  side: { pos: [11, 1.7, 0.1], target: [-0.8, 0.6, 0] },
  '45': { pos: [7, 3, 7], target: [-0.8, 0.6, 0] },
  interior: { pos: [-0.05, 0.58, 0.35], target: [0, 0.3, 3.2] },
  doors: { pos: [3.5, 1.6, 2.4], target: [0.2, 0.5, 0] },
  wheels: { pos: [4.0, 0.9, 5.0], target: [0.4, 0.3, 1.8] },
}

export const DEF = { pos: [8, 2.5, 10], target: [0, 0.6, 0] }

export const CO: Record<string, any> = {
  front: {
    radar: { center: ['50%', '52%'], radius: '65%', indicator: [{ name: '马力\n1244 hp', max: 1500 }, { name: '扭矩\n1155 Nm', max: 1200 }, { name: '极速\n301 km/h', max: 350 }, { name: '零百\n2.7s', max: 3.5 }, { name: '下压力\n450 kg', max: 500 }], axisTick: { length: 4, lineStyle: { color: 'rgba(228,229,235,0.12)' } }, axisName: { color: '#92949E', fontSize: 10 }, splitArea: { areaStyle: { color: ['rgba(255,188,10,0.04)', 'rgba(255,188,10,0.10)'] } }, splitLine: { lineStyle: { color: 'rgba(228,229,235,0.12)' } }, axisLine: { lineStyle: { color: 'rgba(228,229,235,0.12)' } } },
    series: [{ type: 'radar', data: [{ value: [1244, 1155, 301, 2.7, 450] }], areaStyle: { color: 'rgba(255,188,10,0.28)' }, lineStyle: { color: '#FFBC0A', width: 2 }, itemStyle: { color: '#FFBC0A' } }],
  },
  side: {
    tooltip: { trigger: 'axis' }, grid: { left: 48, right: 24, top: 14, bottom: 36 },
    xAxis: { type: 'category', data: ['车长', '车宽', '车高', '轴距'], axisTick: { length: 5, lineStyle: { color: 'rgba(228,229,235,0.18)' } }, axisLabel: { color: '#92949E', fontSize: 11, interval: 0, margin: 8 }, axisLine: { lineStyle: { color: 'rgba(228,229,235,0.18)' } } },
    yAxis: { type: 'value', splitNumber: 3, axisLabel: { color: '#6B7280', fontSize: 10, formatter: '{value}毫米', margin: 6 }, splitLine: { lineStyle: { color: 'rgba(228,229,235,0.08)' } } },
    series: [{ type: 'bar', data: [4650, 1960, 1130, 2800], itemStyle: { color: '#FFBC0A' }, barMaxWidth: 40, label: { show: true, position: 'top', color: '#FFBC0A', fontSize: 10, formatter: '{c}毫米' } }],
  },
  '45': {
    tooltip: { trigger: 'item', formatter: '{b}: {c}%' },
    series: [{ type: 'pie', radius: ['35%', '55%'], center: ['50%', '52%'], avoidLabelOverlap: true, label: { color: '#92949E', fontSize: 11, formatter: '{b}\n{d}%' }, labelLine: { length: 14, length2: 10 }, data: [{ value: 45, name: '碳纤维', itemStyle: { color: '#2D3040' } }, { value: 30, name: 'Alcantara', itemStyle: { color: '#6B7280' } }, { value: 15, name: '真皮', itemStyle: { color: '#FFBC0A' } }, { value: 10, name: '铝合金', itemStyle: { color: '#D99A00' } }] }],
  },
  interior: {
    radar: { center: ['50%', '52%'], radius: '65%', indicator: [{ name: '豪华感', max: 10 }, { name: '科技配置', max: 10 }, { name: '座椅舒适', max: 10 }, { name: '空间表现', max: 10 }, { name: '隔音效果', max: 10 }], axisTick: { length: 4, lineStyle: { color: 'rgba(228,229,235,0.12)' } }, axisName: { color: '#92949E', fontSize: 11 }, splitArea: { areaStyle: { color: ['rgba(255,188,10,0.04)', 'rgba(255,188,10,0.10)'] } }, splitLine: { lineStyle: { color: 'rgba(228,229,235,0.12)' } }, axisLine: { lineStyle: { color: 'rgba(228,229,235,0.12)' } } },
    series: [{ type: 'radar', data: [{ value: [9.2, 8.5, 9.0, 7.0, 8.5], name: '内饰评分' }], areaStyle: { color: 'rgba(255,188,10,0.28)' }, lineStyle: { color: '#FFBC0A', width: 2 }, itemStyle: { color: '#FFBC0A' } }],
  },
  doors: {
    tooltip: { trigger: 'axis' }, grid: { left: 36, right: 18, top: 28, bottom: 30 },
    xAxis: { type: 'category', data: ['碳纤维', '钢材', '铝合金'], axisTick: { length: 4, lineStyle: { color: 'rgba(228,229,235,0.18)' } }, axisLabel: { color: '#92949E', fontSize: 11, interval: 0, margin: 6 }, axisLine: { lineStyle: { color: 'rgba(228,229,235,0.18)' } } },
    yAxis: { type: 'value', splitNumber: 4, name: '公斤', nameTextStyle: { color: '#6B7280', fontSize: 10 }, axisLabel: { color: '#6B7280', fontSize: 10, margin: 4 }, splitLine: { lineStyle: { color: 'rgba(228,229,235,0.08)' } } },
    series: [{ type: 'bar', barMaxWidth: 28, data: [{ value: 2.7, itemStyle: { color: '#FFBC0A' } }, { value: 8.5, itemStyle: { color: '#6B7280' } }, { value: 5.1, itemStyle: { color: '#8B8FA0' } }], label: { show: true, position: 'top', color: '#FFBC0A', fontSize: 10, formatter: '{c}公斤' } }],
  },
  wheels: {
    series: [{
      type: 'gauge', startAngle: 200, endAngle: -20, min: 0, max: 320, center: ['50%', '40%'], radius: '98%',
      axisLine: { lineStyle: { width: 10, color: [[0.3, '#6B7280'], [0.7, '#FFBC0A'], [1, '#D99A00']] } },
      axisLabel: { color: '#FFBC0A', fontSize: 10, distance: 15, splitNumber: 4 }, splitLine: { length: 8 },
      detail: { formatter: '{value} 公里/小时', color: '#E4E5EB', fontSize: 13, offsetCenter: [0, '55%'] },
      title: { color: '#92949E', fontSize: 11, offsetCenter: [0, '35%'] },
      pointer: { showAbove: false },
      data: [{ value: 196, name: '极速锁定' }],
    }],
  },
}

export const API_BASE = '/api'
