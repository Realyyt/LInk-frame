'use client'

import { PrivyProvider } from '@privy-io/react-auth'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId="clv0dfab702dlh9ntk739djui"
      config={{
        appearance: {
          theme: 'dark',
        },
      }}
    >
      {children}
    </PrivyProvider>
  )
}
