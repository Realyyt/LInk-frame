'use server'

import { createSupabaseServer } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

const supabase = createSupabaseServer()

export async function addTodo(formData: FormData) {
  const title = formData.get('title')
  const { error } = await supabase.from('links').upsert({ website: title })

  if (error) {
    console.error(error)
  }

  revalidatePath('/notes')
}
