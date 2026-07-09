import { NextResponse } from 'next/server'
import { prisma } from '@/lib'

export async function GET() {
  const configs = await prisma.dashboardConfig.findMany()
  const result: Record<string, any> = {}
  configs.forEach(c => { result[c.key] = c.data })
  return NextResponse.json(result)
}
