
const SUPABASE_URL = "https://ceeobnncvfsqqliojsxn.supabase.co"

export const sendChatMessage = async (message: string, messages: any[] = [], userId: string) => {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/gpt-chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlZW9ibm5jdmZzcXFsaW9qc3huIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxOTkwODksImV4cCI6MjA2Mzc3NTA4OX0.UJShCgS3BdR0KUKN5OPS_WJbjJgUKJhIMm1pbmXv9Bw'}`
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
