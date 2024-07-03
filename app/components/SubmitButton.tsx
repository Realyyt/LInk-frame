'use client'

import { useFormStatus } from 'react-dom'

export function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="px-6 py-2 bg-pink-700 rounded-md disabled:bg-gray-500"
    >
      {pending ? 'Saving...' : 'Save'}
    </button>
  )
}
