import { createClient } from '@supabase/supabase-js'

const url = process.env.SUPABASE_URL ?? 'https://placeholder.supabase.co'
const key = process.env.SUPABASE_ANON_KEY ?? 'placeholder-key'

export const supabase = createClient(url, key)
