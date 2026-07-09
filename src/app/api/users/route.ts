import { NextRequest, NextResponse } from 'next/server'
import { prisma, verifyToken } from '@/lib'

const requireAdmin = async (request: NextRequest) => {
  const auth = request.headers.get('authorization')
  if (!auth?.startsWith('Bearer ')) return null
  try {
    const payload = verifyToken(auth.slice(7))
    if (payload.role !== 'super_admin' && payload.role !== 'admin') return null
    return payload
  } catch { return null }
}

export async function GET(request: NextRequest) {
  const users = await prisma.user.findMany({ select: { id: true, username: true, role: true, createdAt: true } })
  return NextResponse.json(users)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { hashPassword } = await import('@/lib')
  const user = await prisma.user.create({ data: { ...body, password: await hashPassword(body.password) } })
  return NextResponse.json({ id: user.id, username: user.username, role: user.role }, { status: 201 })
}
