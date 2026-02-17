'use client'

import { useEffect, useMemo, useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase/browser'

type Bookmark = {
  id: string
  user_id: string
  title: string
  url: string
  created_at: string
}

export default function BookmarkApp() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), [])
  const [items, setItems] = useState<Bookmark[]>([])
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  // Load bookmarks from DB (ONLY current user)
  const load = async (uid?: string | null) => {
    const effectiveUid = uid ?? userId
    if (!effectiveUid) return

    const { data, error } = await supabase
      .from('bookmarks')
      .select('*')
      .eq('user_id', effectiveUid)
      .order('created_at', { ascending: false })

    if (error) {
      console.log('LOAD ERROR:', error)
      return
    }

    setItems((data as Bookmark[]) ?? [])
  }

  useEffect(() => {
    const init = async () => {
      const { data, error } = await supabase.auth.getUser()
      if (error) console.log('GET USER ERROR:', error)

      const uid = data.user?.id ?? null
      setUserId(uid)

      if (uid) {
        await load(uid)
      }

      setLoading(false)
      if (!uid) return

      // Subscribe to realtime changes for this user's bookmarks
      const channel = supabase
        .channel(`bookmarks-changes-${uid}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'bookmarks',
            filter: `user_id=eq.${uid}`,
          },
          async () => {
            await load(uid)
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }

    const cleanupPromise = init()
    return () => {
      cleanupPromise.then((cleanup) => cleanup && cleanup())
    }
  }, [supabase])

  const addBookmark = async () => {
    if (!userId) return

    const t = title.trim()
    const u = url.trim()
    if (!t || !u) return

    try {
      new URL(u)
    } catch {
      alert('Please enter a valid URL including https://')
      return
    }

    const { error } = await supabase.from('bookmarks').insert({
      user_id: userId,
      title: t,
      url: u,
    })

    if (error) {
      alert(error.message)
      console.log('INSERT ERROR:', error)
      return
    }

    setTitle('')
    setUrl('')
    // optional immediate refresh (realtime will also update)
    await load(userId)
  }

  const removeBookmark = async (id: string) => {
    console.log('DELETE START:', id)

    const { data, error } = await supabase
      .from('bookmarks')
      .delete()
      .eq('id', id)
      .select()

    console.log('DELETE RESULT:', { data, error })

    if (error) {
      alert(error.message)
      return
    }

    // Update UI immediately (even if realtime is slow)
    setItems((prev) => prev.filter((x) => x.id !== id))
  }

  const logout = async () => {
    await supabase.auth.signOut()
    location.href = '/'
  }

  if (loading) return <div className="p-6">Loading…</div>

  return (
    <div className="mx-auto max-w-2xl p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Your Bookmarks</h2>
        <button type="button" onClick={logout} className="text-sm underline">
          Logout
        </button>
      </div>

      <div className="mt-6 grid gap-2">
        <input
          className="rounded border p-2"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          className="rounded border p-2"
          placeholder="URL (https://...)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button
          type="button"
          onClick={addBookmark}
          className="rounded bg-black px-4 py-2 text-white"
        >
          Add bookmark
        </button>
      </div>

      <ul className="mt-8 space-y-3">
        {items.map((b) => (
          <li key={b.id} className="rounded border p-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-medium">{b.title}</div>
                <a
                  href={b.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-blue-600 underline break-all"
                >
                  {b.url}
                </a>
              </div>

              <button
                type="button"
                onClick={() => {
                  console.log('DELETE CLICKED:', b.id)
                  removeBookmark(b.id)
                }}
                className="text-sm text-red-600 underline"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}