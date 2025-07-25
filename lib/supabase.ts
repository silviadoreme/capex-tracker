import { createClient } from "@supabase/supabase-js"

// Check if environment variables are available
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable")
}

if (!supabaseAnonKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable")
}

// Create client with fallback values to prevent crashes
export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-key",
)

// Export a flag to check if Supabase is properly configured
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey)

// Types based on the actual database schema with contributors as comma-separated string
export interface Project {
  id: string
  name: string
  summary: string | null
  status: string
  project_lead_name: string | null
  contributors_list: string | null // Comma-separated string of contributor names
  capex_category: string | null
  jira_link: string | null
  created_at: string
  updated_at: string
}

export interface MonthlyEffort {
  id: number
  project_id: string
  contributor_name: string
  month_year: string
  hours_spent: number
  documentation_links: string | null
  submitted_at: string
  submitted_by: string | null
}
