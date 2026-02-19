export const dynamic = 'force-dynamic'
import { Suspense } from 'react'
import AssistedAccessConfirmation from '@/views/AssistedAccessConfirmation'

export const metadata = { title: 'Application Submitted' }

export default function Page() {
  return (
    <Suspense>
      <AssistedAccessConfirmation />
    </Suspense>
  )
}
