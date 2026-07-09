'use client'

import dynamic from 'next/dynamic'

const ViewsPage = dynamic(() => import('@/views/admin/ViewsPage'), { ssr: false })

export default function Views() {
  return <ViewsPage />
}
