'use client'

import { createSupabaseBrowser } from '@/utils/supabase/browser'
import { usePrivy } from '@privy-io/react-auth'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { useFormStatus } from 'react-dom'
import { saveProfile } from '../actions'
import { SubmitButton } from './SubmitButton'

const supabase = createSupabaseBrowser()

export function EditProfile() {
  const { ready, authenticated, user } = usePrivy()
  const { pending } = useFormStatus()

  const { data: linksData } = useQuery({
    queryKey: ['links', user?.farcaster?.fid],
    queryFn: async () => {
      const { data } = await supabase
        .from('links')
        .select('website')
        .eq('user_fid', user?.farcaster?.fid)
        .limit(1)
        .maybeSingle()

      return data
    },
  })

  if (!ready) {
    return null
  }

  if ((ready && !authenticated) || !user?.farcaster?.fid) {
    return (
      <h1 className="text-center text-xl lg:text-3xl font-semibold">
        Log in to edit your profile
      </h1>
    )
  }

  const saveProfileWithFid = (formData: FormData) => {
    const fid = user?.farcaster?.fid
    if (typeof fid !== 'number') {
      console.error('Invalid FID:', fid)
      // Handle the error, e.g., show a message to the user
      return
    }
    return saveProfile({ fid, formData })
  }

  return (
    <div>
      <h1 className="text-2xl lg:text-4xl font-semibold">Edit Profile</h1>
      <div className="mt-8">
        <form action={saveProfileWithFid}>
          <div className="my-4 flex flex-col gap-2 w-60">
            <label>Website:</label>
            <input
              name="website"
              type="text"
              defaultValue={linksData?.website}
              className="px-2 py-1 text-gray-800"
              disabled={pending}
            />
          </div>
          <div className="flex items-center gap-4 mt-8">
            <SubmitButton />
            <button type="submit">Submit (Test)</button> {/* Add this line */}
            <Link href={`/user/${user.farcaster.fid}`}>View Profile</Link>
          </div>
        </form>
      </div>
    </div>
  )
}