import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ viewKey: string }> }) {
  const { viewKey } = await params; const body = await request.json()
  const { posX, posY, posZ, targetX, targetY, targetZ } = body
  const override = await prisma.viewOverride.upsert({
    where: { viewKey }, create: { viewKey, posX, posY, posZ, targetX, targetY, targetZ },
    update: { posX, posY, posZ, targetX, targetY, targetZ },
  })
  return NextResponse.json(override)
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ viewKey: string }> }) {
  const { viewKey } = await params
  try { await prisma.viewOverride.delete({ where: { viewKey } }) } catch {}
  return NextResponse.json({ ok: true })
}
