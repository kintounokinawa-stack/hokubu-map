import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://edkxwzfhgfkhlcfzwnrt.supabase.co'
const supabaseAnonKey = 'sb_publishable_KMv74LRKVHo5ROeu_lFlhA_xhCH9lbB'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)