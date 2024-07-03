import { privy, verifyPrivyToken } from '@/utils/privy-server'
import { createSupabaseServer } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { saveProfile } from '../actions'

export async function EditProfile() {
  // Gets the Privy accessToken and verifies it
  const accessToken = cookies().get('privy-token')
  let verified

  if (accessToken?.value) {
    verified = await verifyPrivyToken(accessToken?.value)
  }

  if (!accessToken || !verified) {
    return null
  }

  // Gets the Privy user once the accessToken is verified
  const user = await privy.getUser(verified?.userId)

  if (!user.farcaster?.fid) {
    return null
  }

  // Looks in the database to find links associated with the Farcaster ID
  const supabase = createSupabaseServer()
  const { data: linksData } = await supabase
    .from('links')
    .select()
    .eq('user_fid', user.farcaster.fid)
    .limit(1)
    .maybeSingle()

  const saveProfileWithFid = saveProfile.bind(null, user.farcaster.fid)

  return (
    <div>
      <h1 className="text-2xl lg:text-4xl font-semibold">Edit Profile</h1>
      <div className="mt-8">
        <form action={saveProfileWithFid}>
          {linksData.website && (
            <div className="my-4 flex flex-col gap-2 w-60">
              <label>Website:</label>
              <input
                name="website"
                type="text"
                defaultValue={linksData.website}
                className="px-2 py-1 text-gray-800"
              />
            </div>
          )}
          <div className="flex items-center gap-4 mt-8">
            <button className="px-6 py-2 bg-pink-700 rounded-md" type="submit">
              Save
            </button>

            <Link href={`/user/${user.farcaster.fid}`}>View Profile</Link>
          </div>
        </form>
      </div>
    </div>
  )
}
