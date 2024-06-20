import { createSupabaseServer } from '@/utils/supabase/server'
import { addTodo } from './actions'

export default async function Notes() {
  const supabase = createSupabaseServer()
  const { data: notes } = await supabase.from('notes').select()

  return (
    <div>
      <pre>{JSON.stringify(notes, null, 2)}</pre>

      <form action={addTodo}>
        <input className="text-gray-800" name="title" />
        <button type="submit">submit</button>
      </form>
    </div>
  )
}
