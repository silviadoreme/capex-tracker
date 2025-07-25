"use client"

import { useState, useEffect } from "react"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"

export interface TimesheetProject {
  epicId: string
  epicName: string
  summary: string
  status: string
  capex: string
  contributors: Array<{
    name: string
    effort: number
  }>
}

export function useTimesheet() {
  const [timesheetData, setTimesheetData] = useState<TimesheetProject[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTimesheetData = async () => {
    try {
      setLoading(true)

      // Check if Supabase is configured
      if (!isSupabaseConfigured) {
        console.warn("Supabase not configured, using mock data")
        // Use mock data when Supabase is not configured
        const mockTimesheetData: TimesheetProject[] = [
          {
            epicId: "BQ-002",
            epicName: "BigQuery Column Lineage Phase 2",
            summary:
              "Complete and ready dashboards, so the lineage will be completed and ready to build applications on top of it.",
            status: "CLOSED",
            capex: "CAPEX",
            contributors: [
              { name: "Mantu Razvan-Viorel", effort: 0 },
              { name: "Vintila Cosmina", effort: 0 },
              { name: "Cristea Ionut", effort: 0 },
            ],
          },
          {
            epicId: "AM-003",
            epicName: "New Order Model for AM",
            summary: "Create new Order model for AM. This a foundational piece for future enhancements.",
            status: "OPEN",
            capex: "CAPEX R&D",
            contributors: [
              { name: "Streche Diana", effort: 0 },
              { name: "Albata Anda", effort: 0 },
              { name: "Giurgiu Alexandru", effort: 0 },
              { name: "Platon Elena", effort: 0 },
            ],
          },
        ]

        setTimesheetData(mockTimesheetData)
        return
      }

      // Fetch projects with CAPEX categories from the single table
      const { data: projectsData, error: projectsError } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false })

      if (projectsError) throw projectsError

      // Transform data for timesheet format
      const transformedData: TimesheetProject[] = (projectsData || []).map((project) => {
        // Parse contributors from comma-separated string
        const contributorList = project.contributors_list
          ? project.contributors_list
              .split(",")
              .map((name) => name.trim())
              .filter(Boolean)
          : []

        return {
          epicId: project.id,
          epicName: project.name,
          summary: project.summary || "",
          status: project.status,
          capex: "CAPEX",
          contributors: contributorList.map((name) => ({
            name,
            effort: 0, // Default effort, will be loaded from monthly_efforts if available
          })),
        }
      })

      setTimesheetData(transformedData)
    } catch (err) {
      console.error("Error fetching timesheet data:", err)
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const updateContributorEffort = (epicIndex: number, contributorIndex: number, effort: number) => {
    const newData = [...timesheetData]
    newData[epicIndex].contributors[contributorIndex].effort = effort
    setTimesheetData(newData)
  }

  const saveTimesheet = async (monthYear: string) => {
    try {
      // Save efforts to monthly_efforts table
      const effortsToSave = []

      for (const project of timesheetData) {
        for (const contributor of project.contributors) {
          if (contributor.effort > 0) {
            effortsToSave.push({
              project_id: project.epicId,
              contributor_name: contributor.name,
              month_year: monthYear,
              hours_spent: contributor.effort,
              submitted_by: "current_user", // Replace with actual user
            })
          }
        }
      }

      if (effortsToSave.length > 0) {
        const { error } = await supabase.from("monthly_efforts").upsert(effortsToSave, {
          onConflict: "project_id,contributor_name,month_year",
        })

        if (error) throw error
      }

      return { success: true, message: "Timesheet saved successfully" }
    } catch (err) {
      console.error("Error saving timesheet:", err)
      return { success: false, message: "Failed to save timesheet" }
    }
  }

  useEffect(() => {
    fetchTimesheetData()
  }, [])

  return {
    timesheetData,
    loading,
    error,
    updateContributorEffort,
    saveTimesheet,
    refetch: fetchTimesheetData,
  }
}
