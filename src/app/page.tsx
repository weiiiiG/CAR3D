'use client'

import dynamic from 'next/dynamic'

const ScenePage = dynamic(() => import('@/views/ScenePage'), { ssr: false })

export default function Home() {
  return <ScenePage />
}
