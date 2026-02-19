export const dynamic = 'force-dynamic'
import { Suspense } from 'react'
import Admin from '@/views/Admin'

export const metadata = { title: 'Admin' }

export default function AdminPage() {
  return (
    <Suspense>
      <Admin />
    </Suspense>
  )
}
