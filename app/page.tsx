import LoginButton from '../components/LoginButton'
export default function Home() {
  return (
    <main className="mx-auto max-w-xl p-6">
      <h1 className="text-2xl font-semibold">Smart Bookmark App</h1>
      <p className="mt-2 text-sm text-gray-600">
        Sign in with Google to manage private bookmarks.
      </p>
      <div className="mt-6">
        <LoginButton />
      </div>
    </main>
  )
}