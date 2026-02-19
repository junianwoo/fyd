import { Suspense } from 'react'
import Auth from '@/views/Auth'
export default function LoginPage() {
  return (
    <Suspense>
      <Auth />
    </Suspense>
  )
}
