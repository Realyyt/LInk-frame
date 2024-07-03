'use server'

import { verifyPrivyToken } from '@/utils/privy-server'
import { createSupabaseAdmin } from '@/utils/supabase/admin'
import { revalidatePath } from 'next/cache'

const supabaseAdmin = createSupabaseAdmin()

export async function saveProfile(fid: number, formData: FormData) {
  const verified = await verifyPrivyToken()

  if (!verified) {
    throw new Error('User not verified')
  }

  const website = formData.get('website')

  try {
    const { data: user, error: selectError } = await supabaseAdmin
      .from('users')
      .select()
      .eq('fid', fid)
      .limit(1)
      .maybeSingle()

    if (selectError) {
      throw new Error(selectError.message)
    }

    // New User - Add user and link to database
    if (!user) {
      const { error: insertUserError } = await supabaseAdmin
        .from('users')
        .insert({
          fid,
        })

      const { error: insertLinksError } = await supabaseAdmin
        .from('links')
        .insert([
          {
            website,
            user_fid: fid,
          },
        ])

      if (insertUserError || insertLinksError) {
        throw new Error('Error creating user')
      }

      return
    }

    const { error: updateError } = await supabaseAdmin
      .from('links')
      .update({
        website,
      })
      .eq('user_fid', fid)

    if (updateError) {
      throw new Error(updateError.message)
    }
  } catch (error) {
    throw new Error('Failed to save profile')
  }

  revalidatePath('/')
}
