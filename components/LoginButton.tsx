'use client'

import { createSupabaseBrowserClient } from "../lib/supabase/browser"
export default function LoginButton() {
  const handleLogin = async () => {
    const supabase = createSupabaseBrowserClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    })
  }

  return (
    <button
      onClick={handleLogin}
      className="rounded-md bg-black px-4 py-2 text-white"
    >
      Continue with Google
    </button>
  )
}