'use client'

import dynamic from 'next/dynamic'

const DataPage = dynamic(() => import('@/views/admin/DataPage'), { ssr: false })

export default function Data() {
  return <DataPage />
}
