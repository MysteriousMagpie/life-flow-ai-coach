
const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

export const sendChatMessage = async (message: string, messages: any[] = [], userId: string) => {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/gpt-chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({ message, messages, userId })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('API Error:', error)
    throw error
  }
}
