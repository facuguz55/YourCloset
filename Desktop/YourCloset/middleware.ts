import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PUBLIC_ROUTES = ['/', '/sign-in', '/sign-up', '/auth/callback']
const STORE_ROUTES = ['/dashboard']
const FOUNDER_ROUTES = ['/founders']

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })
  const { pathname } = request.nextUrl

  // Capa 1: rutas publicas sin verificacion
  if (PUBLIC_ROUTES.some((r) => pathname === r || pathname.startsWith(r + '/'))) {
    return supabaseResponse
  }
  if (pathname.startsWith('/auth/')) return supabaseResponse

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Capa 2: verificar sesion
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    const url = request.nextUrl.clone()
    url.pathname = '/sign-in'
    return NextResponse.redirect(url)
  }

  // app_metadata es solo editable por admin/service-role, user_metadata puede ser modificado por el usuario
  const role = (user.app_metadata?.role as string) ?? (user.user_metadata?.role as string) ?? 'user'

  // Capa 3: rutas de Founders solo admin, redirige silenciosamente a /home
  if (FOUNDER_ROUTES.some((r) => pathname.startsWith(r))) {
    if (role !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/home'
      return NextResponse.redirect(url)
    }
    // Registrar acceso al panel de Founders (fire-and-forget)
    void supabase
      .from('admin_access_log')
      .insert({ user_id: user.id, path: pathname })
  }

  // Capa 4: dashboard solo store_owner o admin
  if (STORE_ROUTES.some((r) => pathname.startsWith(r))) {
    if (role !== 'store_owner' && role !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/home'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
