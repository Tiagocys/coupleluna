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

  // 1) Sem login → /login
  if (!session && !url.pathname.startsWith('/login') && !url.pathname.startsWith('/signup')) {
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // 2) Se logado, busca profile_completed e verification_requested
  if (session) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('profile_completed, verification_requested')
      .eq('id', session.user.id)
      .single()

    const needsComplete =
      !profile?.profile_completed && !profile?.verification_requested

    if (needsComplete && !url.pathname.startsWith('/complete-profile')) {
      url.pathname = '/complete-profile'
      return NextResponse.redirect(url)
    }
  }

  return res
}

export const config = {
  matcher: ['/', '/dashboard/:path*', '/creator/:path*', '/post/:path*', '/complete-profile'],
}
