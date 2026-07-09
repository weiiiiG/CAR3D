import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

const SECRET = process.env.JWT_SECRET || 'car3d_jwt_secret_2026'

export interface JwtPayload { username: string; role: string; sub: number }

export function signAccessToken(payload: JwtPayload) {
  return jwt.sign(payload, SECRET, { expiresIn: '15m' })
}

export function signRefreshToken(payload: JwtPayload) {
  return jwt.sign(payload, SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, SECRET) as JwtPayload
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10)
}

export async function comparePassword(password: string, hash: string) {
  return bcrypt.compare(password, hash)
}

export function getTokensFromCookies(request: Request) {
  const cookie = request.headers.get('cookie') || ''
  const match = cookie.match(/refresh_token=([^;]+)/)
  return match ? match[1] : null
}

export function setRefreshCookie(response: Response, token: string) {
  response.headers.set(
    'Set-Cookie',
    `refresh_token=${token}; HttpOnly; SameSite=Strict; Path=/api/auth; Max-Age=${7 * 24 * 60 * 60}`
  )
}

export function clearRefreshCookie(response: Response) {
  response.headers.set(
    'Set-Cookie',
    'refresh_token=; HttpOnly; SameSite=Strict; Path=/api/auth; Max-Age=0'
  )
}
