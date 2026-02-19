import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PROTECTED_PATHS = ['/dashboard', '/assisted-access', '/claim-verify']
const ADMIN_PATHS = ['/admin']

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) =>
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          ),
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname

  if (PROTECTED_PATHS.some((p) => path.startsWith(p)) && !user) {
    return NextResponse.redirect(new URL('/auth', request.url))
  }

  if (ADMIN_PATHS.some((p) => path.startsWith(p))) {
    if (!user) return NextResponse.redirect(new URL('/auth', request.url))
    // Full admin role check happens inside the Admin page component
  }

  return response
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/assisted-access/:path*',
    '/claim-verify/:path*',
    '/admin/:path*',
  ],
}
