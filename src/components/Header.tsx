'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import supabase from '../../lib/supabase'

export function Header() {
  const router = useRouter()
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
      <Link href="/" className="mr-4">Home</Link>
      {!session ? (
        <>
          <Link href="/signup" className="mr-4">Signup</Link>
          <Link href="/login">Login</Link>
        </>
      ) : (
        <button
          onClick={handleLogout}
          className="ml-auto bg-red-600 text-white px-3 py-1 rounded"
        >
          Logout
        </button>
      )}
    </nav>
  )
}
