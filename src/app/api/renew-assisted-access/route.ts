import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

async function handleRenewal(userId: string | null) {
  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
    })

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('email, status, assisted_renewed_count, assisted_expires_at')
      .eq('user_id', userId)
      .maybeSingle()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    if (profile.status !== 'assisted_access') {
      return NextResponse.json({ error: 'User is not on Assisted Access plan' }, { status: 400 })
    }

    const newExpiryDate = new Date()
    newExpiryDate.setMonth(newExpiryDate.getMonth() + 6)

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        assisted_expires_at: newExpiryDate.toISOString(),
        assisted_renewed_count: (profile.assisted_renewed_count || 0) + 1,
      })
      .eq('user_id', userId)

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Assisted Access renewed successfully',
      newExpiryDate: newExpiryDate.toISOString(),
    })
  } catch (error: any) {
    console.error('Renew assisted access error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  return handleRenewal(searchParams.get('userId'))
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}))
  return handleRenewal(body?.userId ?? null)
}
