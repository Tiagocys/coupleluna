'use client'

import { useEffect, useState } from 'react'
import supabase from '../../lib/supabase'
import type { Database } from '../../types/database'

type Profile = Database['public']['Tables']['profiles']['Row']

export default function Home() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    supabase
      .from('profiles')
      .select('*')
      .then(({ data, error }) => {
        if (error) setError(error.message)
        else setProfiles(data ?? [])
      })
  }, [])

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">Perfis cadastrados</h1>
      {error && <p className="text-red-500">Erro: {error}</p>}
      <pre className="bg-gray-100 p-4 rounded">
        {JSON.stringify(profiles, null, 2)}
      </pre>
    </main>
  )
}
