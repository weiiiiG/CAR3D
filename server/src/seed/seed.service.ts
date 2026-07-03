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
      series: [{ type:'bar', data:[2.7,8.5,5.1], itemStyle: { color:'#FFBC0A' } }],
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

const MOCK_VEHICLE_DATA = [
  { name:'Hennessy Venom GT', brand:'Hennessy', country:'USA', year:2010, hp:1244, torque:1155, acceleration:2.7, topSpeed:301, weight:1350, engine:'V8 双涡轮', price:95, fuelConsumption:19.8, displacement:6.6, driveType:'后驱', category:'燃油' },
  { name:'Koenigsegg Agera RS', brand:'Koenigsegg', country:'Sweden', year:2015, hp:1360, torque:1011, acceleration:2.8, topSpeed:447, weight:1395, engine:'V8 双涡轮', price:250, fuelConsumption:18.5, displacement:5.0, driveType:'后驱', category:'燃油' },
  { name:'Bugatti Chiron', brand:'Bugatti', country:'France', year:2016, hp:1579, torque:1600, acceleration:2.4, topSpeed:420, weight:1995, engine:'W16 四涡轮', price:300, fuelConsumption:22.5, displacement:8.0, driveType:'四驱', category:'燃油' },
  { name:'Koenigsegg Jesko', brand:'Koenigsegg', country:'Sweden', year:2020, hp:1603, torque:1500, acceleration:2.5, topSpeed:483, weight:1420, engine:'V8 双涡轮', price:280, fuelConsumption:17.0, displacement:5.0, driveType:'后驱', category:'燃油' },
  { name:'Rimac Nevera', brand:'Rimac', country:'Croatia', year:2021, hp:1914, torque:2360, acceleration:1.8, topSpeed:412, weight:2150, engine:'电动四电机', price:240, fuelConsumption:0, displacement:0, driveType:'四驱', category:'电动' },
  { name:'SSC Tuatara', brand:'SSC', country:'USA', year:2020, hp:1750, torque:1340, acceleration:2.5, topSpeed:455, weight:1247, engine:'V8 双涡轮', price:190, fuelConsumption:16.5, displacement:6.9, driveType:'后驱', category:'燃油' },
  { name:'McLaren Speedtail', brand:'McLaren', country:'UK', year:2019, hp:1070, torque:1150, acceleration:2.9, topSpeed:403, weight:1430, engine:'V8 混动', price:225, fuelConsumption:11.5, displacement:4.0, driveType:'后驱', category:'混动' },
  { name:'Aston Martin Valkyrie', brand:'Aston Martin', country:'UK', year:2021, hp:1160, torque:900, acceleration:2.5, topSpeed:362, weight:1030, engine:'V12 自吸', price:320, fuelConsumption:15.2, displacement:6.5, driveType:'后驱', category:'混动' },
  { name:'Porsche 918 Spyder', brand:'Porsche', country:'Germany', year:2013, hp:887, torque:940, acceleration:2.6, topSpeed:345, weight:1634, engine:'V8 混动', price:185, fuelConsumption:8.5, displacement:4.6, driveType:'四驱', category:'混动' },
  { name:'Ferrari LaFerrari', brand:'Ferrari', country:'Italy', year:2013, hp:963, torque:900, acceleration:2.6, topSpeed:349, weight:1585, engine:'V12 混动', price:220, fuelConsumption:12.8, displacement:6.3, driveType:'后驱', category:'混动' },
  { name:'McLaren P1', brand:'McLaren', country:'UK', year:2013, hp:916, torque:900, acceleration:2.8, topSpeed:350, weight:1495, engine:'V8 混动', price:186, fuelConsumption:10.2, displacement:3.8, driveType:'后驱', category:'混动' },
  { name:'Lamborghini Revuelto', brand:'Lamborghini', country:'Italy', year:2023, hp:1015, torque:1062, acceleration:2.5, topSpeed:350, weight:1772, engine:'V12 混动', price:160, fuelConsumption:14.5, displacement:6.5, driveType:'四驱', category:'混动' },
];

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    const count = await this.prisma.view.count();
    if (count > 0) {
      console.log(`[Seed] views 表已有 ${count} 条数据，跳过 seed`);
    } else {
      console.log('[Seed] 初始化视角数据...');
      for (const data of SEED_DATA) {
        await this.prisma.view.create({ data: data as any });
      }
      console.log(`[Seed] 成功导入 ${SEED_DATA.length} 个视角`);
    }

    const mvCount = await this.prisma.mockVehicle.count();
    if (mvCount === 0) {
      console.log('[Seed] 初始化模拟车辆数据...');
      await this.prisma.mockVehicle.createMany({ data: MOCK_VEHICLE_DATA });
      console.log(`[Seed] 成功导入 ${MOCK_VEHICLE_DATA.length} 辆模拟车辆`);
    } else {
      console.log(`[Seed] mock_vehicles 表已有 ${mvCount} 条数据，跳过 seed`);
    }
  }

  async reSeed() {
    await this.prisma.view.deleteMany();
    for (const data of SEED_DATA) {
      await this.prisma.view.create({ data: data as any });
    }

    await this.prisma.mockVehicle.deleteMany();
    await this.prisma.mockVehicle.createMany({ data: MOCK_VEHICLE_DATA });

    return { message: `重新导入 ${SEED_DATA.length} 个视角、${MOCK_VEHICLE_DATA.length} 辆模拟车辆` };
  }
}
