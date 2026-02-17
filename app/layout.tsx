import './globals.css'
import type { ReactNode } from 'react'

export const metadata = {
  title: 'Smart Bookmark App',
  description: 'Bookmark manager with realtime sync using Supabase and Next.js',
}

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}