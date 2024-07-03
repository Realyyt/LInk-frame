import { EditProfile } from './components/EditProfile'
import { LoginButton } from './components/LoginButton'
import { UserProfile } from './components/UserProfile'

export default function Home() {
  return (
    <>
      <header className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between">
          <UserProfile />
          <LoginButton />
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-6 py-8">
        <EditProfile />
      </main>
    </>
  )
}
