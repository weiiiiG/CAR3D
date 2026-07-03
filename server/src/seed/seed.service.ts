import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const SEED_DATA = [
  {
    key: 'front', label: '前脸', description: '激进车身套件搭配碳纤维进气口。', spec: '1,244 hp',
    specCategory: 'POWERTRAIN', sortOrder: 1,
    posX: 0, posY: 1.8, posZ: 9.5, targetX: -0.8, targetY: 0.6, targetZ: 0,
    chartConfig: {
      radar: {
        indicator: [
          { name: 'Horsepower', max: 1500 }, { name: 'Torque', max: 1200 },
          { name: 'Top Speed', max: 350 }, { name: '0-60', max: 3.5 }, { name: 'Downforce', max: 500 },
        ],
        axisName: { color: '#92949E', fontSize: 9 },
        splitArea: { areaStyle: { color: ['rgba(255,188,10,0.04)','rgba(255,188,10,0.10)'] } },
        splitLine: { lineStyle: { color: 'rgba(228,229,235,0.12)' } },
        axisLine: { lineStyle: { color: 'rgba(228,229,235,0.12)' } },
      },
      series: [{
        type: 'radar',
        data: [{ value: [1244, 1155, 301, 2.7, 450] }],
        areaStyle: { color: 'rgba(255,188,10,0.28)' },
        lineStyle: { color: '#FFBC0A', width: 2 },
        itemStyle: { color: '#FFBC0A' },
      }],
    },
  },
  {
    key: 'side', label: '侧颜', description: '风洞打磨的流畅空气动力学轮廓。', spec: 'Cd 0.35',
    specCategory: 'AERODYNAMICS', sortOrder: 2,
    posX: 11, posY: 1.7, posZ: 0.1, targetX: -0.8, targetY: 0.6, targetZ: 0,
    chartConfig: {
      xAxis: { type: 'category', data: ['Length','Width','Height','Wheelbase'], axisLabel: { color:'#92949E', fontSize:9 }, axisLine: { lineStyle: { color:'rgba(228,229,235,0.18)' } } },
      yAxis: { type: 'value', axisLabel: { color:'#6B7280' }, splitLine: { lineStyle: { color:'rgba(228,229,235,0.08)' } } },
      series: [{ type: 'bar', data: [4650,1960,1130,2800], itemStyle: { color:'#FFBC0A' } }],
    },
  },
  {
    key: '45', label: '座舱', description: '以驾驶者为中心的座舱预览。', spec: 'RWD 底盘',
    specCategory: 'COCKPIT', sortOrder: 3,
    posX: 7, posY: 3, posZ: 7, targetX: -0.8, targetY: 0.6, targetZ: 0,
    chartConfig: {
      tooltip: { trigger: 'item' },
      series: [{
        type: 'pie', radius: ['40%','60%'],
        data: [
          { value:45, name:'Carbon Fibre', itemStyle:{ color:'#2D3040' } },
          { value:30, name:'Alcantara', itemStyle:{ color:'#6B7280' } },
          { value:15, name:'Leather', itemStyle:{ color:'#FFBC0A' } },
          { value:10, name:'Aluminium', itemStyle:{ color:'#D99A00' } },
        ],
        label: { color:'#92949E', fontSize:9 },
      }],
    },
  },
  {
    key: 'interior', label: '内饰', description: 'Alcantara 翻毛皮与碳纤维座舱。', spec: '单座布局',
    specCategory: 'INTERIOR', sortOrder: 4,
    posX: -0.05, posY: 0.58, posZ: 0.35, targetX: 0, targetY: 0.3, targetZ: 3.2,
    chartConfig: {
      xAxis: { type: 'category', data: ['1k','2k','3k','4k','5k','6k','7k'], axisLabel: { color:'#92949E', fontSize:9 }, axisLine: { lineStyle: { color:'rgba(228,229,235,0.18)' } } },
      yAxis: { type: 'value', name: 'RPM', nameTextStyle: { color:'#6B7280' }, axisLabel: { color:'#6B7280' }, splitLine: { lineStyle: { color:'rgba(228,229,235,0.08)' } } },
      series: [{ type:'line', data:[15,40,80,140,200,270,301], smooth:true, areaStyle: { color:'rgba(255,188,10,0.18)' }, lineStyle: { color:'#FFBC0A', width:2 }, itemStyle: { color:'#FFBC0A' } }],
    },
  },
  {
    key: 'doors', label: '鸥翼门', description: '向上开启的碳纤维车门。', spec: '单扇 2.7 kg',
    specCategory: 'DOORS', sortOrder: 5,
    posX: 3.5, posY: 1.6, posZ: 2.4, targetX: 0.2, targetY: 0.5, targetZ: 0,
    chartConfig: {
      xAxis: { type: 'category', data: ['Carbon','Steel','Aluminium'], axisLabel: { color:'#92949E', fontSize:9 }, axisLine: { lineStyle: { color:'rgba(228,229,235,0.18)' } } },
      yAxis: { type: 'value', name: 'kg', nameTextStyle: { color:'#6B7280' }, axisLabel: { color:'#6B7280' }, splitLine: { lineStyle: { color:'rgba(228,229,235,0.08)' } } },
      series: [{ type:'bar', data:[2.7,8.5,5.1], itemStyle: { color:(p:any)=>['#FFBC0A','#6B7280','#8B8FA0'][p.dataIndex] } }],
    },
  },
  {
    key: 'wheels', label: '轮毂', description: '20 英寸锻造合金轮毂。', spec: 'Pilot Sport Cup 2',
    specCategory: 'WHEELS', sortOrder: 6,
    posX: 4.0, posY: 0.9, posZ: 5.0, targetX: 0.4, targetY: 0.3, targetZ: 1.8,
    chartConfig: {
      series: [{
        type: 'gauge', startAngle: 180, endAngle: 0, min: 0, max: 320,
        axisLine: { lineStyle: { width:8, color:[[0.3,'#6B7280'],[0.7,'#FFBC0A'],[1,'#D99A00']] } },
        axisLabel: { color:'#6B7280', fontSize:9 },
        detail: { formatter:'{value} km/h', color:'#E4E5EB', fontSize:11 },
        title: { color:'#92949E' },
        data: [{ value:196, name:'Top Speed Locked' }],
      }],
    },
  },
];

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    const count = await this.prisma.view.count();
    if (count > 0) {
      console.log(`[Seed] views 表已有 ${count} 条数据，跳过 seed`);
      return;
    }
    console.log('[Seed] 初始化视角数据...');
    for (const data of SEED_DATA) {
      await this.prisma.view.create({ data: data as any });
    }
    console.log(`[Seed] 成功导入 ${SEED_DATA.length} 个视角`);
  }

  async reSeed() {
    await this.prisma.view.deleteMany();
    for (const data of SEED_DATA) {
      await this.prisma.view.create({ data: data as any });
    }
    return { message: `重新导入 ${SEED_DATA.length} 个视角` };
  }
}
