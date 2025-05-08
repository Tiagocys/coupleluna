'use client'
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from 'react'
import supabase from '../../lib/supabase'

interface Profile {
  id: string
  username: string
  display_name: string | null
  bio: string | null
  avatar_url: string | null
  is_creator: boolean
  created_at: string
}

export default function Home() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    supabase
      .from<any, Profile>('profiles')
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
