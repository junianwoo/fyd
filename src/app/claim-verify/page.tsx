export const dynamic = 'force-dynamic'
import { Suspense } from 'react'
import ClaimVerify from '@/views/ClaimVerify'

export const metadata = { title: 'Claim Verify' }

export default function Page() {
  return (
    <Suspense>
      <ClaimVerify />
    </Suspense>
  )
}
