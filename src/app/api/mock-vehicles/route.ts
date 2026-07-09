import { NextResponse } from 'next/server'
import { prisma } from '@/lib'

export async function GET() {
  const data = await prisma.mockVehicle.findMany()
  return NextResponse.json(data)
}
