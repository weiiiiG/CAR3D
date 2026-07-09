import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib'

export async function GET(_: NextRequest, { params }: { params: Promise<{ key: string }> }) {
  const { key } = await params
  const view = await prisma.view.findUnique({ where: { key }, include: { overrides: true } })
  if (!view) return NextResponse.json({ message: 'Not found' }, { status: 404 })
  return NextResponse.json({
    ...view, chartConfig: view.chartConfig || undefined,
    effectivePos: view.overrides.length ? [view.overrides[0].posX, view.overrides[0].posY, view.overrides[0].posZ] : [view.posX, view.posY, view.posZ],
    effectiveTarget: view.overrides.length ? [view.overrides[0].targetX, view.overrides[0].targetY, view.overrides[0].targetZ] : [view.targetX, view.targetY, view.targetZ],
  })
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ key: string }> }) {
  const { key } = await params; const body = await request.json()
  const view = await prisma.view.update({ where: { key }, data: body })
  return NextResponse.json(view)
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ key: string }> }) {
  const { key } = await params
  await prisma.view.delete({ where: { key } })
  return NextResponse.json({ ok: true })
}
