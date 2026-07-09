'use client'

import dynamic from 'next/dynamic'

const DashboardPage = dynamic(() => import('@/pages/admin/DashboardPage'), { ssr: false })

export default function Dashboard() {
  return <DashboardPage />
}
