import { createClient } from "@supabase/supabase-js"

// Force refresh environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log("🔄 REFRESHING SUPABASE CONFIGURATION")
console.log("=".repeat(60))
console.log("🔧 Environment check:")
console.log("🔧 - NODE_ENV:", process.env.NODE_ENV)
console.log("🔧 - NEXT_PUBLIC_SUPABASE_URL:", supabaseUrl)
console.log(
  "🔧 - NEXT_PUBLIC_SUPABASE_ANON_KEY:",
  supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : "NOT SET",
)
console.log("🔧 - URL is valid:", supabaseUrl ? "✓" : "✗")
console.log("🔧 - Key is valid:", supabaseAnonKey ? "✓" : "✗")

// Parse URL details
let urlDetails = "Could not parse"
if (supabaseUrl) {
  try {
    const url = new URL(supabaseUrl)
    const projectId = url.hostname.split(".")[0]
    urlDetails = `Project: ${projectId}, Host: ${url.hostname}, Protocol: ${url.protocol}`
  } catch (e) {
    urlDetails = `Invalid URL format: ${e}`
  }
}
console.log("🔧 - URL details:", urlDetails)

// Check all environment variables
console.log("🔧 All environment variables:")
Object.keys(process.env)
  .filter((key) => key.startsWith("NEXT_PUBLIC") || key.includes("SUPABASE"))
  .forEach((key) => {
    const value = process.env[key]
    const displayValue =
      key.includes("KEY") || key.includes("SECRET")
        ? value
          ? `${value.substring(0, 20)}...`
          : "NOT SET"
        : value || "NOT SET"
    console.log(`🔧   ${key}: ${displayValue}`)
  })

console.log("=".repeat(60))

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey)

// Create client with error handling
let supabaseClient
try {
  if (isSupabaseConfigured) {
    supabaseClient = createClient(supabaseUrl!, supabaseAnonKey!)
    console.log("✅ Supabase client created successfully")
    console.log("✅ Client URL:", supabaseClient.supabaseUrl)
    console.log("✅ Client key (first 20):", supabaseClient.supabaseKey?.substring(0, 20) + "...")
  } else {
    console.log("⚠️ Supabase not configured, creating placeholder client")
    supabaseClient = createClient("https://placeholder.supabase.co", "placeholder-key")
  }
} catch (error) {
  console.error("❌ Error creating Supabase client:", error)
  supabaseClient = createClient("https://placeholder.supabase.co", "placeholder-key")
}

export const supabase = supabaseClient

// Updated interface to match your actual database schema
export interface Project {
  id: number // bigint in your schema
  key: string // This is the project key like "SPARK-001"
  summary: string | null
  created_at: string | null
  reporter_email_address: string | null
  reporter_name: string | null
  assignee_email_address: string | null
  assignee_name: string | null
  project: string | null // This is the project name
  description: string | null
  status: string | null
  type: string | null
  start_date: string | null
  end_date: string | null
  project_lead_email: string | null
  project_lead_name: string | null
  jira_link: string | null
  contributors_list: string | null
  contributors_count: number | null
  last_updated: string | null
  // Add fields for our app
  capex_category?: string | null
  activities?: string[] | null
  activities_saved?: boolean | null
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

export async function safeSupabaseOperation<T>(operation: () => Promise<T>, defaultValue: T): Promise<T> {
  if (!isSupabaseConfigured) {
    console.log("Supabase not configured, returning default value")
    return defaultValue
  }

  try {
    return await operation()
  } catch (error) {
    console.error("Supabase operation failed:", error)
    return defaultValue
  }
}

// Test connection function
export async function testSupabaseConnection() {
  console.log("🧪 Testing Supabase connection...")

  if (!isSupabaseConfigured) {
    console.log("❌ Cannot test - Supabase not configured")
    return { success: false, error: "Not configured" }
  }

  try {
    // Simple connection test
    const { data, error } = await supabase.from("information_schema.tables").select("table_name").limit(1)

    if (error) {
      console.log("❌ Connection test failed:", error.message)
      return { success: false, error: error.message }
    }

    console.log("✅ Connection test successful")
    return { success: true, data }
  } catch (err) {
    console.log("❌ Connection test exception:", err)
    return { success: false, error: String(err) }
  }
}
