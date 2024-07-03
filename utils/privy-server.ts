import { PrivyClient } from '@privy-io/server-auth'
import { cookies } from 'next/headers'

const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID!
const appSecret = process.env.PRIVY_APP_SECRET!

export const privy = new PrivyClient(appId, appSecret)

export async function verifyPrivyToken() {
  try {
    // Gets the Privy accessToken and verifies it
    const accessToken = cookies().get('privy-token')

    if (!accessToken?.value) {
      return null
    }

    const verifiedClaims = await privy.verifyAuthToken(accessToken?.value)
    return verifiedClaims
  } catch (error) {
    console.log(`Token verification failed with error ${error}.`)
    return null
  }
}
