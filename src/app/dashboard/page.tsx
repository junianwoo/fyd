export const dynamic = 'force-dynamic'
import { Suspense } from 'react'
import Dashboard from '@/views/Dashboard'

export const metadata = { title: 'Dashboard' }

export default function DashboardPage() {
  return (
    <Suspense>
      <Dashboard />
    </Suspense>
  )
}
