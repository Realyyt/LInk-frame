import { createSupabaseServer } from '@/utils/supabase/server'
import { PrivyClient } from '@privy-io/server-auth'
import { cookies } from 'next/headers'

const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID!
const appSecret = process.env.PRIVY_APP_SECRET!

const privy = new PrivyClient(appId, appSecret)

async function verifyToken(authToken: string) {
  try {
    const verifiedClaims = await privy.verifyAuthToken(authToken)
    return verifiedClaims
  } catch (error) {
    console.log(`Token verification failed with error ${error}.`)
  }
}

export async function EditProfile() {
  const accessToken = cookies().get('privy-token')

  let verified

  if (accessToken?.value) {
    verified = await verifyToken(accessToken?.value)
  }

  if (!accessToken || !verified) {
    return null
  }

  const user = await privy.getUser(verified?.userId)

  const supabase = createSupabaseServer()

  const { data: linksData } = await supabase
    .from('links')
    .select()
    .eq('user_fid', user.farcaster?.fid)
    .limit(1)
    .maybeSingle()

  return (
    <div>
      <h1 className="text-2xl lg:text-4xl font-semibold">Edit Profile</h1>
      <div className="mt-8">
        <form>
          {linksData.website && (
            <div className="my-4 flex flex-col gap-2 w-60">
              <label>Website:</label>
              <input
                className="px-2 py-1 text-gray-800"
                type="text"
                defaultValue={linksData.website}
              />
            </div>
          )}
          <button
            className="mt-8 px-6 py-2 bg-pink-700 rounded-md"
            type="submit"
          >
            Save
          </button>
        </form>
      </div>
    </div>
  )
}
