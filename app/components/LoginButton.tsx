'use client'

import { usePrivy } from '@privy-io/react-auth'

export function LoginButton() {
  const { ready, authenticated, login, logout } = usePrivy()
  // Disable login when Privy is not ready or the user is already authenticated
  const disableLogin = !ready || (ready && authenticated)

  if (ready && !authenticated) {
    return (
      <button disabled={disableLogin} onClick={login}>
        Log in
      </button>
    )
  }

  if (ready && authenticated) {
    return (
      <button disabled={disableLogin} onClick={logout}>
        Log Out
      </button>
    )
  }

  return null
}
