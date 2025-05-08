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

  // 1) Sem login → vai para /login
  if (!session && !url.pathname.startsWith('/login') && !url.pathname.startsWith('/signup')) {
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // 2) Se logado mas sem perfil completo → vai para /complete-profile
  if (session) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('profile_completed')
      .eq('id', session.user.id)
      .single()

    if (!profile?.profile_completed && !req.nextUrl.pathname.startsWith('/complete-profile')) {
      const url = req.nextUrl.clone()
      url.pathname = '/complete-profile'
      return NextResponse.redirect(url)
    }
  }
  return res
}

export const config = {
  matcher: ['/', '/dashboard/:path*', '/creator/:path*', '/post/:path*'], 
}
