'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import supabase from '../../lib/supabase'

export function Header() {
  const router = useRouter()
  const pathname = usePathname()
  const isCompleteProfile = pathname === '/complete-profile'

  // 1) Sempre chame o state e o effect antes de qualquer return condicional
  const [session, setSession] = useState<any>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => setSession(session)
    )
    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  // 2) Só ao final, depois de todos os Hooks, faça o early return
  if (isCompleteProfile) {
    return null
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <nav className="p-4 bg-gray-100 flex items-center">
      <Link href="/" className="mr-4">
        Home
      </Link>

      {!session ? (
        <>
          <Link href="/signup" className="mr-4">
            Sign Up
          </Link>
          <Link href="/login">Log In</Link>
        </>
      ) : (
        <button
          onClick={handleLogout}
          className="ml-auto bg-red-600 text-white px-3 py-1 rounded"
        >
          Log Out
        </button>
      )}
    </nav>
  )
}
