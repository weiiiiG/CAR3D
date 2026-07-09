import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const body = await request.json()
  const user = await prisma.user.update({ where: { id: parseInt(id) }, data: body })
  return NextResponse.json({ id: user.id, username: user.username, role: user.role })
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.user.delete({ where: { id: parseInt(id) } })
  return NextResponse.json({ ok: true })
}
