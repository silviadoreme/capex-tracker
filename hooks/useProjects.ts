"use client"

import { useState, useEffect } from "react"
import { supabase, type Project, type Contributor, isSupabaseConfigured } from "@/lib/supabase"

export interface ProjectWithContributors extends Project {
  contributorList: string[]
  contributorCount: number
}

export function useProjects() {
  const [projects, setProjects] = useState<ProjectWithContributors[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProjects = async () => {
    try {
      setLoading(true)

      // Check if Supabase is configured
      if (!isSupabaseConfigured) {
        console.warn("Supabase not configured, using mock data")
        // Use mock data when Supabase is not configured
        const mockProjects: ProjectWithContributors[] = [
          {
            id: "SPARK-001",
            name: "SPARK",
            summary:
              "For Content Generators, it's important to have visibility on content usage & performance, to effectively allocate their resources towards what works for content consumers.",
            status: "OPEN",
            lead: "Dragos Ionita",
            contributors: 7,
            capex_category: null,
            jira_url: "https://company.atlassian.net/browse/SPARK-001",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
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
          },
          {
            id: "BQ-002",
            name: "BigQuery Column Lineage Phase 2",
            summary:
              "Complete and ready dashboards, so the lineage will be completed and ready to build applications on top of it.",
            status: "CLOSED",
            lead: "Alex Giurgiu",
            contributors: 3,
            capex_category: "CAPEX",
            jira_url: "https://company.atlassian.net/browse/BQ-002",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            contributorList: ["Mantu Razvan-Viorel", "Vintila Cosmina", "Cristea Ionut"],
            contributorCount: 3,
            activities: ["technical-design", "coding", "testing"],
            activities_saved: true,
          },
          {
            id: "AM-003",
            name: "New Order Model for AM",
            summary: "Create new Order model for AM. This a foundational piece for future enhancements.",
            status: "OPEN",
            lead: "Alex Giurgiu",
            contributors: 4,
            capex_category: "CAPEX R&D",
            jira_url: "https://company.atlassian.net/browse/AM-003",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            contributorList: ["Streche Diana", "Albata Anda", "Giurgiu Alexandru", "Platon Elena"],
            contributorCount: 4,
            activities: ["functional-design", "technical-design"],
            activities_saved: true,
          },
        ]

        setProjects(mockProjects)
        return
      }

      // Fetch projects and their contributors
      const { data: projectsData, error: projectsError } = await supabase
        .from("projects")
        .select(`
          *,
          contributors:contributors(name)
        `)
        .order("created_at", { ascending: false })

      if (projectsError) throw projectsError

      // Transform the data to include contributor information
      const transformedProjects: ProjectWithContributors[] = (projectsData || []).map((project: any) => {
        // Extract contributor names from the joined contributors table
        const contributorList = project.contributors
          ? (project.contributors as Contributor[]).map(c => c.name)
          : []

        return {
          ...project,
          contributorList,
          contributorCount: contributorList.length,
        }
      })

      setProjects(transformedProjects)
    } catch (err) {
      console.error("Error fetching projects:", err)
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const updateProject = async (projectId: string, updates: Partial<Project>) => {
    try {
      const { error } = await supabase.from("projects").update(updates).eq("id", projectId)

      if (error) throw error

      // Fetch updated project data including contributors
      const { data: updatedProject, error: fetchError } = await supabase
        .from("projects")
        .select(`
          *,
          contributors:contributors(name)
        `)
        .eq("id", projectId)
        .single()

      if (fetchError) throw fetchError

      // Update local state
      setProjects((prev) =>
        prev.map((p) =>
          p.id === projectId
            ? {
                ...p,
                ...updatedProject,
                contributorList: updatedProject.contributors
                  ? (updatedProject.contributors as Contributor[]).map(c => c.name)
                  : [],
                contributorCount: updatedProject.contributors
                  ? (updatedProject.contributors as Contributor[]).length
                  : 0,
              }
            : p,
        ),
      )
    } catch (err) {
      console.error("Error updating project:", err)
      setError(err instanceof Error ? err.message : "Failed to update project")
    }
  }

  const updateCapexCategory = async (projectId: string, category: string) => {
    await updateProject(projectId, { capex_category: category })
  }

  const updateProjectActivities = async (projectId: string, activities: string[], saved = false) => {
    await updateProject(projectId, { activities, activities_saved: saved })
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