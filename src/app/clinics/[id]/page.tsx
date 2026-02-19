import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/integrations/supabase/types'
import ClinicDetails from '@/views/ClinicDetails'

export const revalidate = 300
export const dynamicParams = true

type Props = { params: Promise<{ id: string }> }

async function getClinic(id: string) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return null
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
  const { data } = await supabase.from('clinics').select('id,name,address,city,province').eq('id', id).maybeSingle()
  return data
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const clinic = await getClinic(id)
  if (!clinic) return { title: 'Clinic Not Found' }

  const status = (clinic as any).accepting_status ?? 'unknown'
  const statusLabel = status === 'accepting' ? 'Accepting Patients' : status === 'waitlist' ? 'Waitlist Open' : 'Not Accepting'

  return {
    title: `${clinic.name} – ${statusLabel} | ${clinic.city}, Ontario`,
    description: `${clinic.name} is located at ${clinic.address}, ${clinic.city}, Ontario. Current status: ${statusLabel}. Find more family doctors accepting patients near you on FindYourDoctor.ca.`,
    openGraph: {
      title: `${clinic.name} – ${statusLabel}`,
      description: `Family doctor clinic in ${clinic.city}, Ontario.`,
    },
  }
}

export default async function ClinicDetailPage({ params }: Props) {
  const { id } = await params
  const clinic = await getClinic(id)
  if (!clinic) notFound()

  return <ClinicDetails />
}
