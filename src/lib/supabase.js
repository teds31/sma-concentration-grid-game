import { createClient } from '@supabase/supabase-js'
import { env } from '$env/dynamic/public'
import { browser } from '$app/environment'

// Get environment variables dynamically to avoid build-time errors
const getSupabaseUrl = () => env.PUBLIC_SUPABASE_URL || ''
const getSupabaseKey = () => env.PUBLIC_SUPABASE_ANON_KEY || ''

// Create Supabase client only if environment variables are available and we're in browser
let supabaseClient = null

if (browser) {
	const url = getSupabaseUrl()
	const key = getSupabaseKey()
	
	if (url && key) {
		supabaseClient = createClient(url, key)
	}
}

export const supabase = supabaseClient