'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import supabase from '../../lib/supabase'

export function Header() {
  const router = useRouter()
  const pathname = usePathname()
  const isCompleteProfile = pathname === '/complete-profile'
  const [session, setSession] = useState<any>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => setSession(session)
    )
    return () => listener.subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <nav className="p-4 bg-gray-100 flex items-center">
      {/* Se NÃO for complete-profile, mostra links públicos */}
      {!isCompleteProfile && (
        <>
          <Link href="/" className="mr-4">Home</Link>
          {!session ? (
            <>
              <Link href="/signup" className="mr-4">Sign Up</Link>
              <Link href="/login">Log In</Link>
            </>
          ) : null}
        </>
      )}

      {/* Se estiver logado, sempre mostra Logout (mesmo em complete-profile) */}
      {session && (
        <button
          onClick={handleLogout}
          className={isCompleteProfile ? "ml-auto bg-red-600 text-white px-3 py-1 rounded" : "ml-auto bg-red-600 text-white px-3 py-1 rounded"}
        >
          Log Out
        </button>
      )}
    </nav>
  )
}
