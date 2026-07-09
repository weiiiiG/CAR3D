'use client'

import dynamic from 'next/dynamic'

const SettingsPage = dynamic(() => import('@/pages/admin/SettingsPage'), { ssr: false })

export default function Settings() {
  return <SettingsPage />
}
