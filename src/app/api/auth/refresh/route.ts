import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, signAccessToken, setRefreshCookie, getTokensFromCookies, signRefreshToken } from '@/lib'

export async function POST(request: NextRequest) {
  const token = getTokensFromCookies(request)
  if (!token) return NextResponse.json({ message: 'No refresh token' }, { status: 401 })
  try {
    const payload = verifyToken(token)
    const newPayload = { username: payload.username, role: payload.role, sub: payload.sub }
    const accessToken = signAccessToken(newPayload)
    const refreshToken = signRefreshToken(newPayload)
    const response = NextResponse.json({ access_token: accessToken })
    setRefreshCookie(response, refreshToken)
    return response
  } catch { return NextResponse.json({ message: 'Invalid refresh token' }, { status: 401 }) }
}
