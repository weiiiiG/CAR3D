import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib'

export async function GET() {
  const views = await prisma.view.findMany({ orderBy: { sortOrder: 'asc' } })
  const overrides = await prisma.viewOverride.findMany()
  const ovMap: Record<string, any> = {}
  overrides.forEach(o => { ovMap[o.viewKey] = o })
  const result = views.map(v => ({
    ...v, chartConfig: v.chartConfig || undefined,
    effectivePos: ovMap[v.key] ? [ovMap[v.key].posX, ovMap[v.key].posY, ovMap[v.key].posZ] : [v.posX, v.posY, v.posZ],
    effectiveTarget: ovMap[v.key] ? [ovMap[v.key].targetX, ovMap[v.key].targetY, ovMap[v.key].targetZ] : [v.targetX, v.targetY, v.targetZ],
  }))
  return NextResponse.json(result)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const view = await prisma.view.create({ data: body })
  return NextResponse.json(view, { status: 201 })
}
