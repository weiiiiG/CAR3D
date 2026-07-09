import { NextResponse } from 'next/server'
import { prisma, hashPassword } from '@/lib'

export async function POST() {
  await prisma.viewOverride.deleteMany()
  await prisma.view.deleteMany()
  await prisma.dashboardConfig.deleteMany()
  await prisma.mockVehicle.deleteMany()
  await prisma.user.deleteMany()

  await prisma.user.createMany({ data: [
    { username: 'admin', password: await hashPassword('123456'), role: 'super_admin' },
    { username: 'editor', password: await hashPassword('123456'), role: 'admin' },
    { username: 'viewer', password: await hashPassword('123456'), role: 'user' },
  ]})

  await prisma.view.createMany({ data: [
    { key: 'front', label: '前脸', description: '激进车身套件搭配碳纤维进气口。', spec: '1,244 hp', specCategory: 'POWERTRAIN', posX: 0, posY: 1.8, posZ: 9.5, targetX: -0.8, targetY: 0.6, targetZ: 0, sortOrder: 1 },
    { key: 'side', label: '侧颜', description: '风洞打磨的流畅空气动力学轮廓。', spec: 'Cd 0.35', specCategory: 'AERODYNAMICS', posX: 11, posY: 1.7, posZ: 0.1, targetX: -0.8, targetY: 0.6, targetZ: 0, sortOrder: 2 },
    { key: '45', label: '座舱', description: '以驾驶者为中心的座舱预览。', spec: 'RWD 底盘', specCategory: 'COCKPIT', posX: 7, posY: 3, posZ: 7, targetX: -0.8, targetY: 0.6, targetZ: 0, sortOrder: 3 },
    { key: 'interior', label: '内饰', description: 'Alcantara 翻毛皮与碳纤维座舱。', spec: '单座布局', specCategory: 'INTERIOR', posX: -0.05, posY: 0.58, posZ: 0.35, targetX: 0, targetY: 0.3, targetZ: 3.2, sortOrder: 4 },
    { key: 'doors', label: '鸥翼门', description: '向上开启的碳纤维车门。', spec: '单扇 2.7 kg', specCategory: 'DOORS', posX: 3.5, posY: 1.6, posZ: 2.4, targetX: 0.2, targetY: 0.5, targetZ: 0, sortOrder: 5 },
    { key: 'wheels', label: '轮毂', description: '20 英寸锻造合金轮毂。', spec: 'Pilot Sport Cup 2', specCategory: 'WHEELS', posX: 4.0, posY: 0.9, posZ: 5.0, targetX: 0.4, targetY: 0.3, targetZ: 1.8, sortOrder: 6 },
  ]})

  await prisma.mockVehicle.createMany({ data: [
    { name: 'Hennessy Venom GT', brand: 'Hennessey', country: '美国', year: 2010, hp: 1244, torque: 1155, acceleration: 2.7, topSpeed: 301, weight: 1244, engine: 'V8 双涡轮 6.2L', price: 120, fuelConsumption: 16.2, displacement: 6.2, driveType: '后驱', category: '燃油' },
    { name: 'Bugatti Chiron', brand: 'Bugatti', country: '法国', year: 2016, hp: 1500, torque: 1600, acceleration: 2.4, topSpeed: 420, weight: 1995, engine: 'W16 四涡轮 8.0L', price: 299, fuelConsumption: 22.5, displacement: 8.0, driveType: '四驱', category: '燃油' },
    { name: 'Rimac Nevera', brand: 'Rimac', country: '克罗地亚', year: 2022, hp: 1914, torque: 2360, acceleration: 1.85, topSpeed: 412, weight: 2150, engine: '四电机电动', price: 220, fuelConsumption: 0, displacement: 0, driveType: '四驱', category: '电动' },
    { name: 'Koenigsegg Jesko', brand: 'Koenigsegg', country: '瑞典', year: 2021, hp: 1600, torque: 1500, acceleration: 2.5, topSpeed: 482, weight: 1420, engine: 'V8 双涡轮 5.0L', price: 280, fuelConsumption: 18.5, displacement: 5.0, driveType: '后驱', category: '燃油' },
    { name: 'Ferrari SF90 Stradale', brand: 'Ferrari', country: '意大利', year: 2019, hp: 986, torque: 800, acceleration: 2.5, topSpeed: 340, weight: 1570, engine: 'V8 双涡轮 4.0L + 三电机', price: 62, fuelConsumption: 6.1, displacement: 4.0, driveType: '四驱', category: '混动' },
    { name: 'Porsche 911 Turbo S', brand: 'Porsche', country: '德国', year: 2020, hp: 640, torque: 800, acceleration: 2.7, topSpeed: 330, weight: 1640, engine: 'H6 双涡轮 3.7L', price: 48, fuelConsumption: 12.3, displacement: 3.7, driveType: '四驱', category: '燃油' },
    { name: 'McLaren P1', brand: 'McLaren', country: '英国', year: 2013, hp: 903, torque: 720, acceleration: 2.8, topSpeed: 350, weight: 1490, engine: 'V8 双涡轮 3.8L + 电机', price: 115, fuelConsumption: 8.3, displacement: 3.8, driveType: '后驱', category: '混动' },
    { name: 'Lamborghini Aventador SVJ', brand: 'Lamborghini', country: '意大利', year: 2018, hp: 759, torque: 720, acceleration: 2.8, topSpeed: 350, weight: 1525, engine: 'V12 6.5L', price: 77, fuelConsumption: 19.5, displacement: 6.5, driveType: '四驱', category: '燃油' },
    { name: 'Aston Martin Valkyrie', brand: 'Aston Martin', country: '英国', year: 2022, hp: 1160, torque: 900, acceleration: 2.5, topSpeed: 362, weight: 1030, engine: 'V12 6.5L + 电机', price: 320, fuelConsumption: 15.0, displacement: 6.5, driveType: '后驱', category: '混动' },
    { name: 'Pininfarina Battista', brand: 'Pininfarina', country: '意大利', year: 2022, hp: 1900, torque: 2300, acceleration: 1.86, topSpeed: 350, weight: 2200, engine: '四电机电动', price: 220, fuelConsumption: 0, displacement: 0, driveType: '四驱', category: '电动' },
    { name: 'Tesla Roadster', brand: 'Tesla', country: '美国', year: 2025, hp: 1000, torque: 1000, acceleration: 2.1, topSpeed: 400, weight: 1300, engine: '三电机电动', price: 20, fuelConsumption: 0, displacement: 0, driveType: '四驱', category: '电动' },
    { name: 'Mercedes-AMG One', brand: 'Mercedes', country: '德国', year: 2022, hp: 1063, torque: 800, acceleration: 2.9, topSpeed: 352, weight: 1695, engine: 'V6 1.6L + 四电机', price: 290, fuelConsumption: 8.0, displacement: 1.6, driveType: '四驱', category: '混动' },
  ]})

  await prisma.dashboardConfig.createMany({ data: [
    { key: 'dimensions', data: { labels: ['车长', '车宽', '车高', '轴距'], values: [4650, 1960, 1130, 2800] } },
    { key: 'materials', data: { labels: ['碳纤维', 'Alcantara', '皮革', '铝合金'], values: [45, 30, 15, 10] } },
    { key: 'trend', data: { months: ['1月', '2月', '3月', '4月', '5月', '6月'], series: [{ name: '展示', data: [120, 180, 150, 220, 280, 350] }, { name: '交互', data: [80, 120, 110, 160, 200, 270] }] } },
  ]})

  return NextResponse.json({ ok: true })
}
