// 图表模块 — 仪表盘图表 + Mock 数据图表
// 依赖: api.js (window.API, window.fetchAuth, window.toast)

window.dashCharts = []
window.dashConfig = {}
window.mockCharts = []

window.initCharts = function () {
  window.dashCharts.forEach(function (c) { try { c.dispose() } catch (e) { } }); window.dashCharts = []
  if (!window.dashConfig.dimensions) {
    fetch(window.API + '/dashboard').then(function (r) { return r.json() }).then(function (d) { window.dashConfig = d; window.initCharts() }).catch(function () { })
    return
  }
  function makeChart(id, opt) {
    var ch = echarts.init(document.getElementById(id))
    ch.setOption(opt); window.dashCharts.push(ch)
  }
  var dim = window.dashConfig.dimensions, mat = window.dashConfig.materials, trend = window.dashConfig.trend
  makeChart('cRadar', {
    tooltip: { trigger: 'item', formatter: function (p) {
        var html = '<b>' + p.name + '</b><br/>'
        var labels = [['马力', ' hp'], ['扭矩', ' Nm'], ['极速', ' km/h'], ['0-100', 's'], ['下压力', ' kg']]
        for (var i = 0; i < labels.length; i++) html += labels[i][0] + ': ' + p.value[i] + labels[i][1] + '<br/>'
        return html
      } },
    radar: { center: ['50%', '52%'], radius: '65%',
      indicator: [{ name: '马力 (hp)', max: 1500 }, { name: '扭矩(Nm)', max: 1200 }, { name: '极速km/h', max: 350 }, { name: '0-100s', max: 3.5 }, { name: '下压力kg', max: 500 }],
      axisName: { color: '#9CA0B0', fontSize: 11 }, splitArea: { areaStyle: { color: ['rgba(255,188,10,0.04)', 'rgba(255,188,10,0.10)'] } },
      splitLine: { lineStyle: { color: 'rgba(240,241,244,0.08)' } } },
    series: [{ type: 'radar', data: [{ value: [1244, 1155, 301, 2.7, 450], name: 'Venom GT' }], areaStyle: { color: 'rgba(255,188,10,0.25)' }, lineStyle: { color: '#FFBC0A', width: 2 }, itemStyle: { color: '#FFBC0A' },
      emphasis: { lineStyle: { width: 3, color: '#FFBC0A' }, areaStyle: { color: 'rgba(255,188,10,0.4)' } } }],
    animationDuration: 800, animationEasing: 'elasticOut'
  })
  if (!dim) return
  makeChart('cBar', {
    tooltip: { trigger: 'axis', formatter: function (p) { return p[0].name + ': ' + p[0].value + 'mm' } },
    xAxis: { type: 'category', data: dim.labels, axisLabel: { color: '#9CA0B0', fontSize: 11, interval: 0 }, axisLine: { lineStyle: { color: 'rgba(240,241,244,0.08)' } } },
    yAxis: { type: 'value', axisLabel: { color: '#5C5F6E', fontSize: 10, formatter: '{value}mm' }, splitLine: { lineStyle: { color: 'rgba(240,241,244,0.06)' } } },
    series: [{ type: 'bar', data: dim.values, itemStyle: { color: '#FFBC0A' }, barMaxWidth: 50,
      label: { show: true, position: 'top', color: '#FFBC0A', fontSize: 10, formatter: function (p) { return p.value + 'mm' } } }],
    grid: { top: 16, bottom: 28, left: 56, right: 12 }, animationDuration: 600, animationEasing: 'bounceOut'
  })
  if (!mat) return
  var matColors = { '碳纤维': '#2D3040', 'Alcantara': '#6B7280', '皮革': '#FFBC0A', '铝合金': '#D99A00' }
  makeChart('cPie', {
    tooltip: { trigger: 'item', formatter: '{b}: {c}% ({d}%)' },
    series: [{ type: 'pie', radius: ['30%', '60%'], center: ['50%', '52%'], roseType: 'radius',
      data: mat.labels.map(function (l, i) { return { value: mat.values[i], name: l, itemStyle: { color: matColors[l] || '#6B7280' } } }),
      label: { color: '#9CA0B0', fontSize: 11, formatter: '{b}\n{d}%' },
      emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.3)' } } }],
    animationDuration: 800, animationEasing: 'cubicOut'
  })
  if (!trend) return
  var lineColors = ['#FFBC0A', '#D99A00', '#6B7280', '#5C5F6E'], symbols = ['circle', 'diamond', 'triangle', 'rect']
  makeChart('cTrend', {
    tooltip: { trigger: 'axis' },
    legend: { data: trend.series.map(function (s) { return s.name }), textStyle: { color: '#9CA0B0', fontSize: 10 }, itemWidth: 12, itemHeight: 8, top: 0, right: 0 },
    xAxis: { type: 'category', data: trend.months, axisLabel: { color: '#9CA0B0', fontSize: 11, interval: 0 }, axisLine: { lineStyle: { color: 'rgba(240,241,244,0.08)' } } },
    yAxis: { type: 'value', axisLabel: { color: '#5C5F6E', fontSize: 10, formatter: '{value}次' }, splitLine: { lineStyle: { color: 'rgba(240,241,244,0.06)' } } },
    grid: { top: 28, bottom: 24, left: 44, right: 12 },
    series: trend.series.map(function (s, i) { return {
      name: s.name, type: 'line', data: s.data, smooth: true,
      lineStyle: { color: lineColors[i], width: 2 }, itemStyle: { color: lineColors[i] },
      areaStyle: { color: lineColors[i], opacity: 0.1 }, symbol: symbols[i], symbolSize: 6,
      label: { show: i < 2, color: lineColors[i], fontSize: 9 }
    } }),
    animationDuration: 1000, animationEasing: 'quadraticOut'
  })
}

window.initMockCharts = function () {
  window.mockCharts.forEach(function (c) { try { c.dispose() } catch (e) { } }); window.mockCharts = []
  var data = window.mockData
  if (!data.length) return

  function initChart(el, opt) { var ch = echarts.init(el); ch.setOption(opt); window.mockCharts.push(ch) }

  var el = document.getElementById('mBar1')
  if (el) {
    var sorted = data.slice().sort(function (a, b) { return b.hp - a.hp }).slice(0, 8)
    initChart(el, {
      tooltip: { trigger: 'axis', formatter: function (p) { return p[0].name + '<br/>马力: ' + p[0].value + ' hp' } },
      xAxis: { type: 'category', data: sorted.map(function (d) { return d.name.split(' ').pop() }), axisLabel: { color: '#9CA0B0', fontSize: 10, interval: 0 }, axisLine: { show: false } },
      yAxis: { type: 'value', name: 'hp', nameTextStyle: { color: '#5C5F6E', fontSize: 10 }, axisLabel: { color: '#5C5F6E', fontSize: 9 }, splitLine: { lineStyle: { color: 'rgba(240,241,244,0.06)' } } },
      series: [{ type: 'bar', data: sorted.map(function (d, i) { return { value: d.hp, itemStyle: { color: ['#FFBC0A', '#D99A00', '#6B7280', '#2D3040', '#FFBC0A', '#D99A00', '#6B7280', '#2D3040'][i] } } }), barMaxWidth: 28,
        label: { show: true, position: 'top', color: '#FFBC0A', fontSize: 9, formatter: '{c}' }, animationDuration: 700, animationEasing: 'bounceOut' }],
      grid: { top: 12, bottom: 36, left: 40, right: 10 }
    })
  }

  el = document.getElementById('mBar2')
  if (el) {
    var sorted2 = data.slice().sort(function (a, b) { return a.acceleration - b.acceleration }).slice(0, 8)
    initChart(el, {
      tooltip: { trigger: 'axis', formatter: function (p) { return p[0].name + '<br/>0-100km/h: ' + p[0].value + 's' } },
      xAxis: { type: 'category', data: sorted2.map(function (d) { return d.name.split(' ').pop() }), axisLabel: { color: '#9CA0B0', fontSize: 10, interval: 0 }, axisLine: { show: false } },
      yAxis: { type: 'value', name: '秒', nameTextStyle: { color: '#5C5F6E', fontSize: 10 }, axisLabel: { color: '#5C5F6E', fontSize: 9 }, splitLine: { lineStyle: { color: 'rgba(240,241,244,0.06)' } } },
      series: [{ type: 'bar', data: sorted2.map(function (d, i) { return { value: d.acceleration, itemStyle: { color: ['#FFBC0A', '#D99A00', '#6B7280', '#2D3040', '#FFBC0A', '#D99A00', '#6B7280', '#2D3040'][i] } } }), barMaxWidth: 28,
        label: { show: true, position: 'top', color: '#FFBC0A', fontSize: 9, formatter: function (p) { return p.value + 's' } }, animationDuration: 700, animationEasing: 'bounceOut' }],
      grid: { top: 12, bottom: 36, left: 36, right: 10 }
    })
  }

  el = document.getElementById('mPie1')
  if (el) {
    var catMap = {}; data.forEach(function (d) { catMap[d.category] = (catMap[d.category] || 0) + 1 })
    var pieData = Object.keys(catMap).map(function (k) { return { name: k, value: catMap[k] } })
    var colors = { '燃油': '#FFBC0A', '混动': '#D99A00', '电动': '#38BDF8' }
    initChart(el, {
      tooltip: { trigger: 'item', formatter: '{b}: {c} 款 ({d}%)' },
      series: [{ type: 'pie', radius: ['20%', '55%'], center: ['50%', '55%'],
        data: pieData.map(function (d) { return { name: d.name, value: d.value, itemStyle: { color: colors[d.name] || '#6B7280' } } }),
        label: { color: '#9CA0B0', fontSize: 11, formatter: '{b}\n{d}%' }, emphasis: { label: { fontSize: 13, fontWeight: 'bold' } }, animationDuration: 800, animationEasing: 'cubicOut' }]
    })
  }

  el = document.getElementById('mRadar')
  if (el) {
    var flagships = ['Hennessy Venom GT', 'Bugatti Chiron', 'Rimac Nevera', 'Koenigsegg Jesko']
    var rd = data.filter(function (d) { return flagships.indexOf(d.name) >= 0 })
    var colorPalette = ['#FFBC0A', '#D99A00', '#38BDF8', '#EF4444']
    initChart(el, {
      tooltip: { trigger: 'item', formatter: function (p) {
          var labels = ['马力', '扭矩(Nm)', '极速(km/h)', '重量(kg)', '售价(万$)']
          var html = '<b>' + p.name + '</b><br/>'
          for (var i = 0; i < labels.length; i++) html += labels[i] + ': ' + p.value[i] + '<br/>'
          return html
        } },
      legend: { data: rd.map(function (d) { return d.name.split(' ').slice(0, 2).join(' ') }), textStyle: { color: '#9CA0B0', fontSize: 10 }, top: 0, left: 'center', itemWidth: 14, itemHeight: 8 },
      radar: { center: ['50%', '55%'], radius: '60%',
        indicator: [{ name: '马力', max: 2000 }, { name: '扭矩(Nm)', max: 2500 }, { name: '极速(km/h)', max: 500 }, { name: '重量(kg)', max: 2500 }, { name: '售价(万$)', max: 400 }],
        axisName: { color: '#9CA0B0', fontSize: 11 }, splitArea: { areaStyle: { color: ['rgba(255,188,10,0.03)', 'rgba(255,188,10,0.08)'] } }, splitLine: { lineStyle: { color: 'rgba(240,241,244,0.06)' } } },
      series: [{ type: 'radar', data: rd.map(function (d, i) { return {
        value: [d.hp, d.torque, d.topSpeed, d.weight, d.price],
        name: d.name.split(' ').slice(0, 2).join(' '),
        lineStyle: { color: colorPalette[i], width: 2 }, areaStyle: { color: colorPalette[i], opacity: 0.08 },
        itemStyle: { color: colorPalette[i] }, emphasis: { lineStyle: { width: 3, color: colorPalette[i] }, areaStyle: { opacity: 0.2 } }
      } }), animationDuration: 800, animationEasing: 'elasticOut' }]
    })
  }

  el = document.getElementById('mLine')
  if (el) {
    var sorted3 = data.slice().sort(function (a, b) { return b.topSpeed - a.topSpeed }).slice(0, 8)
    initChart(el, {
      tooltip: { trigger: 'axis', formatter: function (p) { return p[0].name + '<br/>极速: ' + p[0].value + ' km/h' } },
      xAxis: { type: 'category', data: sorted3.map(function (d) { return d.name.split(' ').pop() }), axisLabel: { color: '#9CA0B0', fontSize: 10, interval: 0 }, axisLine: { lineStyle: { color: 'rgba(240,241,244,0.08)' } } },
      yAxis: { type: 'value', name: 'km/h', nameTextStyle: { color: '#5C5F6E', fontSize: 10 }, axisLabel: { color: '#5C5F6E', fontSize: 9 }, splitLine: { lineStyle: { color: 'rgba(240,241,244,0.06)' } } },
      series: [{ type: 'bar', data: sorted3.map(function (d, i) { return { value: d.topSpeed, itemStyle: { color: ['#FFBC0A', '#D99A00', '#6B7280', '#2D3040', '#FFBC0A', '#D99A00', '#6B7280', '#2D3040'][i] } } }), barMaxWidth: 28,
        label: { show: true, position: 'top', color: '#FFBC0A', fontSize: 9, formatter: '{c}' }, animationDuration: 700, animationEasing: 'bounceOut' }],
      grid: { top: 12, bottom: 36, left: 40, right: 10 }
    })
  }
  setTimeout(function () { window.mockCharts.forEach(function (c) { try { c.resize() } catch (e) { } }) }, 100)
}
