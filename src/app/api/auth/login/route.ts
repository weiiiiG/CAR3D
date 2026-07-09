import { NextRequest, NextResponse } from 'next/server'
import { prisma, comparePassword, signAccessToken, signRefreshToken, setRefreshCookie } from '@/lib'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()
    const user = await prisma.user.findUnique({ where: { username } })
    if (!user || !(await comparePassword(password, user.password))) {
      return NextResponse.json({ message: '用户名或密码错误' }, { status: 401 })
    }
    const payload = { username: user.username, role: user.role, sub: user.id }
    const accessToken = signAccessToken(payload)
    const refreshToken = signRefreshToken(payload)
    const response = NextResponse.json({ access_token: accessToken })
    setRefreshCookie(response, refreshToken)
    return response
  } catch { return NextResponse.json({ message: '服务器错误' }, { status: 500 }) }
}
