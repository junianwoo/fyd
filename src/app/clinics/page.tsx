import { Suspense } from 'react'
import Clinics from '@/views/Clinics'

export const metadata = { title: 'Find Family Doctors Accepting Patients in Ontario' }

export default function ClinicsPage() {
  return (
    <Suspense>
      <Clinics />
    </Suspense>
  )
}
