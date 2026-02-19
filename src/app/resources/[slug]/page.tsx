import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/integrations/supabase/types'
import ResourceDetail from '@/views/ResourceDetail'

type Props = { params: Promise<{ slug: string }> }

async function getResource(slug: string) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return null
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
  const { data } = await supabase
    .from('resources')
    .select('slug,title,excerpt,category,published_at')
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle()
  return data
}

export async function generateStaticParams() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return []
  }
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
  const { data } = await supabase.from('resources').select('slug').eq('published', true)
  return (data ?? []).map((r) => ({ slug: r.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const resource = await getResource(slug)
  if (!resource) return { title: 'Article Not Found' }

  return {
    title: resource.title,
    description: resource.excerpt,
    openGraph: {
      title: resource.title,
      description: resource.excerpt,
      type: 'article',
      ...(resource.published_at && { publishedTime: resource.published_at }),
    },
  }
}

export default async function ResourceDetailPage({ params }: Props) {
  const { slug } = await params
  const resource = await getResource(slug)
  if (!resource) notFound()

  return <ResourceDetail />
}
