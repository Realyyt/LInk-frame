'use server'

import { createSupabaseAdmin } from '@/utils/supabase/admin'
import { revalidatePath } from 'next/cache'

const supabaseAdmin = createSupabaseAdmin()

export async function saveProfile({ fid, formData }: { fid: number, formData: FormData }) {
  const website = formData.get('website') as string

  try {
    console.log('Saving profile for FID:', fid)
    
    const { data: users, error: selectError } = await supabaseAdmin
      .from('users')
      .select()
      .eq('fid', fid)
      .limit(1)

    if (selectError) {
      console.error('Error selecting user:', selectError)
      throw new Error(selectError.message)
    }

    const user = users?.[0]

    if (!user) {
      const { error: insertError } = await supabaseAdmin
        .from('users')
        .insert({ fid })

      if (insertError) {
        console.error('Error inserting user:', insertError)
        throw new Error(insertError.message)
      }
    }

    const { error: upsertError } = await supabaseAdmin
      .from('links')
      .upsert({ user_fid: fid, website }, { onConflict: 'user_fid' })

    if (upsertError) {
      console.error('Error upserting link:', upsertError)
      throw new Error(upsertError.message)
    }

    console.log('Profile saved successfully')
    revalidatePath('/')
  } catch (error) {
    console.error('Failed to save profile:', error)
    throw error
  }
}