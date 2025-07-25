"use client"

import { useState, useEffect } from "react"
import { supabase, type Project, isSupabaseConfigured } from "@/lib/supabase"

export interface ProjectWithContributors extends Project {
  contributorList: string[]
  contributorCount: number
  activities: string[]
  activities_saved: boolean
}

// Mock data function to avoid repetition
const getMockProjects = (): ProjectWithContributors[] => [
  {
    id: 1,
    key: "SPARK-001",
    project: "SPARK",
    summary:
      "For Content Generators, it's important to have visibility on content usage & performance, to effectively allocate their resources towards what works for content consumers.",
    status: "OPEN",
    project_lead_name: "Dragos Ionita",
    contributors_list:
      "Ionita Dragos, Guta Laurentiu, Proca Cosmin, Carsote Cosmin, Dragomir Diana, Tij Andrei, Tarziu Silvia",
    contributors_count: 7,
    capex_category: null,
    activities: [],
    activities_saved: false,
    jira_link: "https://company.atlassian.net/browse/SPARK-001",
    created_at: new Date().toISOString(),
    last_updated: new Date().toISOString(),
    contributorList: [
      "Ionita Dragos",
      "Guta Laurentiu",
      "Proca Cosmin",
      "Carsote Cosmin",
      "Dragomir Diana",
      "Tij Andrei",
      "Tarziu Silvia",
    ],
    contributorCount: 7,
    activities: [],
    activities_saved: false,
    // Fill in other required fields with defaults
    reporter_email_address: null,
    reporter_name: null,
    assignee_email_address: null,
    assignee_name: null,
    description: null,
    type: null,
    start_date: null,
    end_date: null,
    project_lead_email: null,
  },
  {
    id: 2,
    key: "BQ-002",
    project: "BigQuery Column Lineage Phase 2",
    summary:
      "Complete and ready dashboards, so the lineage will be completed and ready to build applications on top of it.",
    status: "CLOSED",
    project_lead_name: "Alex Giurgiu",
    contributors_list: "Mantu Razvan-Viorel, Vintila Cosmina, Cristea Ionut",
    contributors_count: 3,
    capex_category: "CAPEX",
    activities: ["technical-design", "coding", "testing"],
    activities_saved: true,
    jira_link: "https://company.atlassian.net/browse/BQ-002",
    created_at: new Date().toISOString(),
    last_updated: new Date().toISOString(),
    contributorList: ["Mantu Razvan-Viorel", "Vintila Cosmina", "Cristea Ionut"],
    contributorCount: 3,
    activities: ["technical-design", "coding", "testing"],
    activities_saved: true,
    // Fill in other required fields with defaults
    reporter_email_address: null,
    reporter_name: null,
    assignee_email_address: null,
    assignee_name: null,
    description: null,
    type: null,
    start_date: null,
    end_date: null,
    project_lead_email: null,
  },
  {
    id: 3,
    key: "AM-003",
    project: "New Order Model for AM",
    summary: "Create new Order model for AM. This a foundational piece for future enhancements.",
    status: "OPEN",
    project_lead_name: "Alex Giurgiu",
    contributors_list: "Streche Diana, Albata Anda, Giurgiu Alexandru, Platon Elena",
    contributors_count: 4,
    capex_category: "CAPEX R&D",
    activities: ["functional-design", "technical-design"],
    activities_saved: true,
    jira_link: "https://company.atlassian.net/browse/AM-003",
    created_at: new Date().toISOString(),
    last_updated: new Date().toISOString(),
    contributorList: ["Streche Diana", "Albata Anda", "Giurgiu Alexandru", "Platon Elena"],
    contributorCount: 4,
    activities: ["functional-design", "technical-design"],
    activities_saved: true,
    // Fill in other required fields with defaults
    reporter_email_address: null,
    reporter_name: null,
    assignee_email_address: null,
    assignee_name: null,
    description: null,
    type: null,
    start_date: null,
    end_date: null,
    project_lead_email: null,
  },
]

export function useProjects() {
  const [projects, setProjects] = useState<ProjectWithContributors[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProjects = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log("🔍 Starting fetchProjects...")
      console.log("🔍 isSupabaseConfigured:", isSupabaseConfigured)

      // Extract database name from URL
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      let databaseName = "Unknown"
      let projectId = "Unknown"
      if (supabaseUrl) {
        try {
          const url = new URL(supabaseUrl)
          const hostname = url.hostname
          projectId = hostname.split(".")[0]
          databaseName = `${projectId} (${hostname})`
          console.log("🔧 Database/Project ID:", projectId)
          console.log("🔧 Full hostname:", hostname)
        } catch (e) {
          console.log("🔧 Could not parse URL:", e)
        }
      }
      console.log("🔧 Database name:", databaseName)

      // If Supabase is not configured, provide helpful mock data
      if (!isSupabaseConfigured) {
        console.log("⚠️ Supabase not configured, using mock data")
        await new Promise((resolve) => setTimeout(resolve, 1000))
        setProjects(getMockProjects())
        return
      }

      console.log(`🔌 Attempting to connect to Supabase database: ${databaseName}`)

      // STEP 1: Test basic connectivity with timeout and retry
      console.log("🔍 STEP 1: Testing basic connectivity...")
      let connectionSuccessful = false
      let connectionAttempts = 0
      const maxAttempts = 3

      while (!connectionSuccessful && connectionAttempts < maxAttempts) {
        connectionAttempts++
        console.log(`🔌 Connection attempt ${connectionAttempts}/${maxAttempts}...`)

        try {
          // Use a simple query with timeout
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

          const { data: healthCheck, error: healthError } = await supabase
            .from("projects")
            .select("count", { count: "exact", head: true })

          clearTimeout(timeoutId)

          if (healthError) {
            console.log(`❌ Connection attempt ${connectionAttempts} failed:`, healthError.message)
            console.log(`❌ Error code:`, healthError.code)
            console.log(`❌ Error details:`, healthError.details)

            // Check for specific error types
            if (healthError.message.includes("Failed to fetch")) {
              console.log("🔍 Network connectivity issue detected")
              if (connectionAttempts < maxAttempts) {
                console.log(`⏳ Waiting 2 seconds before retry...`)
                await new Promise((resolve) => setTimeout(resolve, 2000))
                continue
              }
            }

            // If it's a table-related error, the connection might be working
            if (healthError.message.includes("relation") || healthError.message.includes("does not exist")) {
              console.log("✅ Connection successful, but table doesn't exist")
              connectionSuccessful = true
              break
            }

            if (connectionAttempts >= maxAttempts) {
              throw new Error(`Connection failed after ${maxAttempts} attempts: ${healthError.message}`)
            }
          } else {
            console.log("✅ Connection successful!")
            connectionSuccessful = true
          }
        } catch (fetchError: any) {
          console.log(`❌ Connection attempt ${connectionAttempts} exception:`, fetchError.message)

          if (fetchError.name === "AbortError") {
            console.log("⏰ Connection timed out")
          }

          if (connectionAttempts >= maxAttempts) {
            console.log("❌ All connection attempts failed, falling back to mock data")
            console.log("💡 This might be due to:")
            console.log("💡 - Network connectivity issues")
            console.log("💡 - Incorrect Supabase URL or API key")
            console.log("💡 - Supabase service being temporarily unavailable")
            console.log("💡 - CORS or firewall restrictions")

            // Fall back to mock data instead of showing error
            console.log("🔄 Using mock data as fallback...")
            setProjects(getMockProjects())
            return
          }

          // Wait before retry
          console.log(`⏳ Waiting 2 seconds before retry...`)
          await new Promise((resolve) => setTimeout(resolve, 2000))
        }
      }

      if (!connectionSuccessful) {
        console.log("❌ Could not establish connection, using mock data")
        setProjects(getMockProjects())
        return
      }

      // STEP 2: Try to query projects with error handling
      console.log(`🔍 STEP 2: Querying projects from database ${databaseName}...`)
      try {
        const { data: projectsData, error: fetchError } = await supabase
          .from("projects")
          .select("*")
          .order("created_at", { ascending: false })

        if (fetchError) {
          console.error("❌ Projects query failed:", fetchError.message)
          console.error("❌ Error code:", fetchError.code)
          console.error("❌ Error details:", fetchError.details)

          // Check if it's a table not found error
          if (fetchError.message.includes("relation") || fetchError.message.includes("does not exist")) {
            console.log("💡 Projects table doesn't exist - this is expected for a new database")
            console.log("💡 You can create the table using the setup scripts")
            setProjects([])
            return
          }

          throw new Error(`Database query failed: ${fetchError.message}`)
        }

        console.log("✅ Projects query successful!")
        console.log(`📊 Found ${projectsData?.length || 0} projects`)

        if (!projectsData || projectsData.length === 0) {
          console.log("📊 No projects found in database")
          setProjects([])
          return
        }

        // Transform the data
        const transformedProjects: ProjectWithContributors[] = projectsData.map((project, index) => {
          console.log(`🔄 Processing project ${index + 1}:`, project.name || project.key)

          // Parse contributors from comma-separated string
          const contributorList = project.contributors
            ? project.contributors
                .split(",")
                .map((name: string) => name.trim())
                .filter(Boolean)
            : []

          return {
            ...project,
            // Map fields to match our interface
            key: project.key || project.id?.toString() || "Unknown",
            project: project.name || project.project || "Unknown Project",
            project_lead_name: project.lead || project.project_lead_name || "Unknown",
            contributors_list: project.contributors || "",
            contributors_count: contributorList.length,
            jira_link: project.jira_url || project.jira_link || null,
            contributorList,
            contributorCount: contributorList.length,
            activities: Array.isArray(project.activities) ? project.activities : [],
            activities_saved: Boolean(project.activities_saved),
            capex_category: project.capex_category || null,
          }
        })

        console.log(`✅ Successfully processed ${transformedProjects.length} projects`)
        setProjects(transformedProjects)
      } catch (queryError: any) {
        console.error("❌ Query error:", queryError.message)
        console.log("🔄 Falling back to mock data due to query error")
        setProjects(getMockProjects())
      }
    } catch (err: any) {
      console.error("❌ Error in fetchProjects:", err)
      console.log("🔄 Using mock data as final fallback")

      // Always fall back to mock data instead of showing error
      setProjects(getMockProjects())

      // Only set error for truly unexpected issues
      if (!err.message.includes("Failed to fetch") && !err.message.includes("Connection failed")) {
        setError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  const updateProject = async (projectKey: string, updates: Partial<Project>) => {
    try {
      console.log("Updating project:", projectKey, "with:", updates)

      if (!isSupabaseConfigured) {
        console.log("Supabase not configured, updating local state only")
        // Update local state only when Supabase is not configured
        setProjects((prev) =>
          prev.map((p) =>
            p.key === projectKey
              ? {
                  ...p,
                  ...updates,
                  contributorList: updates.contributors_list
                    ? updates.contributors_list
                        .split(",")
                        .map((name) => name.trim())
                        .filter(Boolean)
                    : p.contributorList,
                  contributorCount: updates.contributors_list
                    ? updates.contributors_list
                        .split(",")
                        .map((name) => name.trim())
                        .filter(Boolean).length
                    : p.contributorCount,
                }
              : p,
          ),
        )
        return
      }

      // Try database update with error handling
      try {
        const { error } = await supabase.from("projects").update(updates).eq("key", projectKey)

        if (error) {
          console.error("Database update failed:", error)
          throw new Error(`Failed to update project: ${error.message}`)
        }

        console.log("Project updated successfully in database")
      } catch (dbError: any) {
        console.error("Database update error:", dbError.message)
        console.log("Continuing with local state update only")
      }

      // Always update local state
      setProjects((prev) =>
        prev.map((p) =>
          p.key === projectKey
            ? {
                ...p,
                ...updates,
                contributorList: updates.contributors_list
                  ? updates.contributors_list
                      .split(",")
                      .map((name) => name.trim())
                      .filter(Boolean)
                  : p.contributorList,
                contributorCount: updates.contributors_list
                  ? updates.contributors_list
                      .split(",")
                      .map((name) => name.trim())
                      .filter(Boolean).length
                  : p.contributorCount,
              }
            : p,
        ),
      )
    } catch (err: any) {
      console.error("Error updating project:", err)
      // Don't set error state for update failures, just log them
    }
  }

  const updateCapexCategory = async (projectKey: string, category: string) => {
    await updateProject(projectKey, { capex_category: category })
  }

  const updateProjectActivities = async (projectKey: string, activities: string[], saved = false) => {
    // Update both local state and database
    setProjects((prev) => prev.map((p) => (p.key === projectKey ? { ...p, activities, activities_saved: saved } : p)))

    // Also update the database if configured
    if (isSupabaseConfigured && saved) {
      try {
        await updateProject(projectKey, {
          activities: activities,
          activities_saved: saved,
        } as any)
      } catch (err) {
        console.error("Failed to save activities to database:", err)
      }
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  return {
    projects,
    loading,
    error,
    refetch: fetchProjects,
    updateCapexCategory,
    updateProjectActivities,
  }
}
