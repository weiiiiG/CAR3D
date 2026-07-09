import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib'

export async function GET() {
  const overrides = await prisma.viewOverride.findMany()
  return NextResponse.json(overrides)
}
