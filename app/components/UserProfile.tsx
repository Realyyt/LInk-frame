'use client'

import { usePrivy } from '@privy-io/react-auth'

export function UserProfile() {
  const { ready, authenticated, user } = usePrivy()

  if (!ready) {
    return null
  }

  if (ready && authenticated) {
    return (
      <div className="flex items-center gap-3">
        {user?.farcaster?.pfp && (
          <img
            className="w-12 h-12 rounded-full"
            src={user?.farcaster?.pfp}
            alt={user?.farcaster?.displayName || ''}
          />
        )}
        <p>{user?.farcaster?.displayName}</p>
      </div>
    )
  }
}
