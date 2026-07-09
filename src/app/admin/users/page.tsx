'use client'

import dynamic from 'next/dynamic'

const UsersPage = dynamic(() => import('@/pages/admin/UsersPage'), { ssr: false })

export default function Users() {
  return <UsersPage />
}
