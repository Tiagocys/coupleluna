// src/app/admin/verification-requests/page.tsx
import type { Database } from '../../../../types/database'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import Link from 'next/link'

const PAGE_SIZE = 10

export default async function AdminVerificationPage({ searchParams }: { searchParams?: { page?: string } }) {
  const supabase = createServerComponentClient<Database>({ cookies })
  const page = parseInt(searchParams?.page || '1', 10)
  const from = (page - 1) * PAGE_SIZE

  const { data: requests, count } = await supabase
    .from('profiles')
    .select(
    'id, username, display_name, created_at',
    { count: 'exact' }
    )
    .eq('verification_requested', true)
    .order('created_at', { ascending: true })
    .range(from, from + PAGE_SIZE - 1)

  return (
    <main className="p-8">
      <h1 className="text-2xl mb-4">Identity Verification Requests</h1>
      <table className="w-full mb-4">
        <thead>
          <tr>
            <th>Requested At</th>
            <th>User</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {requests?.map(r => (
            <tr key={r.id} className="border-t">
              <td>
                {r.created_at
                    ? new Date(r.created_at).toLocaleString()
                    : '—'}
              </td>
              <td>{r.display_name} ({r.username})</td>
              <td className="space-x-2">
                <Link href={`/admin/verification-requests/approve/${r.id}`}>
                  <button className="bg-green-600 text-white px-2 py-1 rounded">Approve</button>
                </Link>
                <Link href={`/admin/verification-requests/reject/${r.id}`}>
                  <button className="bg-red-600 text-white px-2 py-1 rounded">Reject</button>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Paginação */}
      <div className="flex justify-between">
        {page > 1 ? (
          <Link href={`/admin/verification-requests?page=${page - 1}`}>
            <button className="px-3 py-1 bg-gray-200 rounded">‹ Prev</button>
          </Link>
        ) : <span />}

        {from + PAGE_SIZE < (count || 0) && (
          <Link href={`/admin/verification-requests?page=${page + 1}`}>
            <button className="px-3 py-1 bg-gray-200 rounded">Next ›</button>
          </Link>
        )}
      </div>
    </main>
  )
}
