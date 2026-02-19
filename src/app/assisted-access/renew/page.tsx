export const dynamic = 'force-dynamic'
import { Suspense } from 'react'
import AssistedAccessRenewal from '@/views/AssistedAccessRenewal'

export const metadata = { title: 'Renew Assisted Access' }

export default function Page() {
  return (
    <Suspense>
      <AssistedAccessRenewal />
    </Suspense>
  )
}
