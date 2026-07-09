import { NextResponse } from 'next/server'
import { clearRefreshCookie } from '@/lib'

export async function POST() {
  const response = NextResponse.json({ ok: true })
  clearRefreshCookie(response)
  return response
}
