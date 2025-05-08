'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import supabase from '../../lib/supabase'

export function Header() {
  const router = useRouter()
  const [session, setSession] = useState<any>(null)

  useEffect(() => {
    // carrega sessão inicial
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
    })

    // escuta mudanças de auth
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)

        // Se entrou (signup ou login via OAuth)
        if (event === 'SIGNED_IN' && session) {
          const { user } = session

          // Verifica se já existe profile
          const { data: existing } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', user.id)
            .single()

          if (!existing) {
            // Cria novo profile
            await supabase.from('profiles').insert({
              id: user.id,
              username: user.email!.split('@')[0],
              display_name:
                (user.user_metadata as any).full_name || user.email,
              avatar_url:
                (user.user_metadata as any).avatar_url || null,
            })
          }
        }
      }
    )

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

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
