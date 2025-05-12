// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from './types/database'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient<Database>({ req, res })
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const url = req.nextUrl.clone()

  // 1) Não logado → manda para /login
  if (!session && !url.pathname.startsWith('/login') && !url.pathname.startsWith('/signup')) {
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // 2) Logado → busca status do perfil
if (session) {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('profile_completed, verification_requested')
      .eq('id', session.user.id)
      .single()   // <— aqui

    if (error) {
      console.error('Middleware profile fetch error:', error.message)
      return res   // deixa passar para não bloquear ninguém por um erro inesperado
    }

    // 2a) se já completou ou já solicitou verificação e está em /complete-profile → /
    if (
      url.pathname === '/complete-profile' &&
      (profile.profile_completed || profile.verification_requested)
    ) {
      url.pathname = '/'
      return NextResponse.redirect(url)
    }

    // 2b) se NÃO completou E NÃO solicitou verificação e NÃO está em /complete-profile → /complete-profile
    if (
      !profile.profile_completed &&
      !profile.verification_requested &&
      url.pathname !== '/complete-profile'
    ) {
      url.pathname = '/complete-profile'
      return NextResponse.redirect(url)
    }
  }

  return res
}

export const config = {
  matcher: ['/', '/dashboard/:path*', '/creator/:path*', '/post/:path*', '/complete-profile'],
}
