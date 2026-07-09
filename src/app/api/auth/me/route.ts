import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, getTokensFromCookies } from '@/lib'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const auth = request.headers.get('authorization')
  if (!auth?.startsWith('Bearer ')) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  try {
    const payload = verifyToken(auth.slice(7))
    const user = await prisma.user.findUnique({ where: { id: payload.sub } })
    if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 })
    return NextResponse.json({ id: user.id, username: user.username, role: user.role, createdAt: user.createdAt })
  } catch { return NextResponse.json({ message: 'Invalid token' }, { status: 401 }) }
}
