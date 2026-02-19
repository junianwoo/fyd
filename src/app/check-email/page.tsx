import { Suspense } from 'react'
import CheckEmail from '@/views/CheckEmail'
export default function Page() {
  return (
    <Suspense>
      <CheckEmail />
    </Suspense>
  )
}
