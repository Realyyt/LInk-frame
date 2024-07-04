'use client'

import { usePrivy } from '@privy-io/react-auth'

export function LoginButton() {
  const { ready, authenticated, login, logout } = usePrivy()
  // Disable login when Privy is not ready or the user is already authenticated
  const disableLogin = !ready || (ready && authenticated)

  if (ready && !authenticated) {
    return (
      <button
        disabled={disableLogin}
        onClick={login}
        className="ml-auto px-6 py-2 bg-pink-700 rounded-md disabled:bg-gray-500"
      >
        Log in
      </button>
    )
  }

  if (ready && authenticated) {
    return (
      <button
        onClick={logout}
        className="ml-auto px-6 py-2 bg-pink-700 rounded-md disabled:bg-gray-500"
      >
        Log Out
      </button>
    )
  }

  return null
}
