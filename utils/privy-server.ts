import { PrivyClient } from '@privy-io/server-auth'

const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID!
const appSecret = process.env.PRIVY_APP_SECRET!

export const privy = new PrivyClient(appId, appSecret)

export async function verifyPrivyToken(authToken: string) {
  try {
    const verifiedClaims = await privy.verifyAuthToken(authToken)
    return verifiedClaims
  } catch (error) {
    console.log(`Token verification failed with error ${error}.`)
  }
}
