import { createClient } from '@supabase/supabase-js'

export function createSupabaseAdmin() {
  // Create a supabase client on the browser with project's credentials
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE!
  )
}
