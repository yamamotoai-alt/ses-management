import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { type Role, canAccess } from '@/lib/role'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options as Parameters<typeof supabaseResponse.cookies.set>[2])
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname
  const isLoginPage = path.startsWith('/login')
  const isApiRoute = path.startsWith('/api')
  const isStatic = path.startsWith('/_next') || path.startsWith('/favicon')

  const isPartnerPublic = path.startsWith('/partner')
  const isIntakePublic = path.startsWith('/intake')

  if (isStatic || isApiRoute || isPartnerPublic || isIntakePublic) return supabaseResponse

  if (!user && !isLoginPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (user && isLoginPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  if (user && !isLoginPage) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    const role = (profile?.role ?? 'sales') as Role

    if (!canAccess(role, path)) {
      const url = request.nextUrl.clone()
      url.pathname = role === 'partner' ? '/engineers' : '/'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
