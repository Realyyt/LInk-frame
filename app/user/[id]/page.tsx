import {
  getFarcasterIdByUsername,
  getFarcasterUser,
} from '@/utils/fetch-farcaster-user'
import { createSupabaseServer } from '@/utils/supabase/server'
import { getFrameMetadata } from 'frog/next'
import type { Metadata } from 'next'

type Props = {
  params: { id: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const BASE_URL = process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'http://localhost:3000'

  const { id } = params
  const frameMetadata = await getFrameMetadata(`${BASE_URL}/frame/user/${id}`)

  return {
    other: frameMetadata,
  }
}

export default async function UserPage({ params }: Props) {
  const { id } = params
  const supabase = createSupabaseServer()

  let fid = id

  // Test to see if `id` is potentially a username
  const isNumbersOnly = new RegExp('^[0-9]+$')
  if (!isNumbersOnly.test(id)) {
    fid = await getFarcasterIdByUsername(id)
  }

  const { data: linksData } = await supabase
    .from('links')
    .select()
    .eq('user_fid', fid)
    .limit(1)
    .maybeSingle()

  const farcasterUser = await getFarcasterUser(Number(fid))

  if (!farcasterUser.username) {
    return <div className="max-w-3xl mx-auto py-8 px-6">User Not Found</div>
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-6">
      <img
        className="w-24 h-24 rounded-full object-cover"
        src={farcasterUser.pfp}
        alt={farcasterUser.displayName}
      />
      <p className="mt-4">{farcasterUser.displayName}</p>
      <p>{farcasterUser.bio}</p>
      <p className="mt-4">
        <a
          className="inline-block"
          href={`https://warpcast.com/${farcasterUser.username}`}
        >
          <svg
            className="w-8 h-8"
            viewBox="0 0 1000 1000"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="1000" height="1000" fill="#855DCD" />
            <path
              d="M257.778 155.556H742.222V844.444H671.111V528.889H670.414C662.554 441.677 589.258 373.333 500 373.333C410.742 373.333 337.446 441.677 329.586 528.889H328.889V844.444H257.778V155.556Z"
              fill="white"
            />
            <path
              d="M128.889 253.333L157.778 351.111H182.222V746.667C169.949 746.667 160 756.616 160 768.889V795.556H155.556C143.283 795.556 133.333 805.505 133.333 817.778V844.444H382.222V817.778C382.222 805.505 372.273 795.556 360 795.556H355.556V768.889C355.556 756.616 345.606 746.667 333.333 746.667H306.667V253.333H128.889Z"
              fill="white"
            />
            <path
              d="M675.555 746.667C663.282 746.667 653.333 756.616 653.333 768.889V795.556H648.889C636.616 795.556 626.667 805.505 626.667 817.778V844.444H875.555V817.778C875.555 805.505 865.606 795.556 853.333 795.556H848.889V768.889C848.889 756.616 838.94 746.667 826.667 746.667V351.111H851.111L880 253.333H702.222V746.667H675.555Z"
              fill="white"
            />
          </svg>
        </a>
      </p>
      {!linksData?.website && <p className="mt-4">😭 No Links Found</p>}
      {linksData?.website && (
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
