
import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

const supabaseUrl = 'https://ceeobnncvfsqqliojsxn.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlZW9ibm5jdmZzcXFsaW9qc3huIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxOTkwODksImV4cCI6MjA2Mzc3NTA4OX0.UJShCgS3BdR0KUKN5OPS_WJbjJgUKJhIMm1pbmXv9Bw'

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
})
