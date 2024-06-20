import { createSupabaseServer } from '@/utils/supabase/server'
import { getSSLHubRpcClient, isUserDataAddMessage } from '@farcaster/hub-nodejs'

type FarcasterUser = {
  pfp: string
  displayName: string
  bio: string
}

const DEFAULT_FARCASTER_USER = {
  pfp: '',
  displayName: '',
  bio: '',
}

const farcasterClient = getSSLHubRpcClient('hub-grpc.pinata.cloud')

async function getFarcasterUser(fid: number): Promise<FarcasterUser> {
  const result = await farcasterClient.getAllUserDataMessagesByFid({ fid })

  // https://github.com/farcasterxyz/hub-monorepo/blob/main/packages/hub-nodejs/examples/chron-feed/index.ts
  const user = result.match(
    (data) => {
      return data.messages.reduce((acc: FarcasterUser, message) => {
        if (isUserDataAddMessage(message)) {
          // https://docs.farcaster.xyz/reference/hubble/httpapi/userdata

          // Profile Picture
          if (message.data.userDataBody.type === 1) {
            acc.pfp = message.data.userDataBody.value
          }

          // Display Name
          if (message.data.userDataBody.type === 2) {
            acc.displayName = message.data.userDataBody.value
          }

          // Bio
          if (message.data.userDataBody.type === 3) {
            acc.bio = message.data.userDataBody.value
          }
        }

        return acc
      }, DEFAULT_FARCASTER_USER)
    },
    () => DEFAULT_FARCASTER_USER
  )

  return user
}

export default async function UserPage({
  params,
}: {
  params: { fid: string }
}) {
  const { fid } = params

  const supabase = createSupabaseServer()
  const { data: linksData } = await supabase
    .from('links')
    .select()
    .eq('fid', fid)
    .limit(1)
    .maybeSingle()

  const farcasterUser = await getFarcasterUser(parseInt(fid))

  if (!farcasterUser.pfp) {
    return <div className="max-w-3xl mx-auto py-8 px-6">User Not Found</div>
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-6">
      <img className="w-24 h-24 rounded-full" src={farcasterUser.pfp} alt="" />
      <p className="mt-4">{farcasterUser.displayName}</p>
      <p>{farcasterUser.bio}</p>
      {!linksData && <p className="mt-4">😭 No Links Found</p>}
      {linksData && (
        <p className="mt-4">
          Website:{' '}
          <a className="underline hover:no-underline" href={linksData.website}>
            {linksData.website}
          </a>
        </p>
      )}
    </div>
  )
}
