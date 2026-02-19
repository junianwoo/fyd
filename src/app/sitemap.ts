import type { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/integrations/supabase/types'

const BASE_URL = 'https://findyourdoctor.ca'

const staticRoutes: MetadataRoute.Sitemap = [
  { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
  { url: `${BASE_URL}/clinics`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
  { url: `${BASE_URL}/how-it-works`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
  { url: `${BASE_URL}/pricing`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
  { url: `${BASE_URL}/faq`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
  { url: `${BASE_URL}/resources`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
  { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  { url: `${BASE_URL}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  { url: `${BASE_URL}/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  { url: `${BASE_URL}/terms`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return staticRoutes
  }
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  const [clinicsResult, resourcesResult] = await Promise.all([
    supabase.from('clinics').select('id, status_last_updated_at'),
    supabase.from('resources').select('slug, updated_at').eq('published', true),
  ])

  const clinicUrls: MetadataRoute.Sitemap = (clinicsResult.data ?? []).map((c) => ({
    url: `${BASE_URL}/clinics/${c.id}`,
    lastModified: c.status_last_updated_at ? new Date(c.status_last_updated_at) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.6,
  }))

  const resourceUrls: MetadataRoute.Sitemap = (resourcesResult.data ?? []).map((r) => ({
    url: `${BASE_URL}/resources/${r.slug}`,
    lastModified: r.updated_at ? new Date(r.updated_at) : new Date(),
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  return [...staticRoutes, ...clinicUrls, ...resourceUrls]
}
