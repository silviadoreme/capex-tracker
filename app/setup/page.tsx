"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, Database, CheckCircle, AlertTriangle } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function SetupPage() {
  const [logs, setLogs] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<"idle" | "checking" | "creating" | "seeding" | "complete">("idle")

  const addLog = (message: string) => {
    console.log(message)
    setLogs((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const checkTableStructure = async () => {
    addLog("🔍 Checking existing table structure...")

    try {
      // Try to get table info using Supabase's system tables
      const { data, error } = await supabase.rpc("get_table_columns", { table_name: "projects" }).single()

      if (error) {
        addLog(`⚠️ Could not get table structure: ${error.message}`)
        // Try alternative method
        const { data: altData, error: altError } = await supabase
          .from("information_schema.columns")
          .select("column_name, data_type")
          .eq("table_name", "projects")

        if (altError) {
          addLog(`⚠️ Alternative method failed: ${altError.message}`)
          return null
        }
        return altData
      }

      return data
    } catch (err) {
      addLog(`❌ Error checking table structure: ${err}`)
      return null
    }
  }

  const createTables = async () => {
    addLog("🏗️ Creating/updating tables...")

    const createTableSQL = `
      -- Drop and recreate projects table to ensure correct structure
      DROP TABLE IF EXISTS monthly_efforts CASCADE;
      DROP TABLE IF EXISTS contributors CASCADE;
      DROP TABLE IF EXISTS projects CASCADE;
      
      -- Create projects table with correct structure
      CREATE TABLE projects (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          summary TEXT,
          status TEXT DEFAULT 'OPEN',
          lead TEXT,
          contributors TEXT,
          start_date DATE,
          capex_category TEXT,
          activities TEXT[] DEFAULT '{}',
          activities_saved BOOLEAN DEFAULT FALSE,
          jira_url TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      -- Create contributors table
      CREATE TABLE contributors (
          id SERIAL PRIMARY KEY,
          project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
          name TEXT NOT NULL,
          email TEXT,
          role TEXT
      );
      
      -- Create monthly_efforts table
      CREATE TABLE monthly_efforts (
          id SERIAL PRIMARY KEY,
          project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
          contributor_name TEXT,
          month_year TEXT,
          hours_spent DECIMAL(5,2) DEFAULT 0,
          documentation_links TEXT,
          submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          submitted_by TEXT,
          UNIQUE(project_id, contributor_name, month_year)
      );
    `

    try {
      const { error } = await supabase.rpc("exec_sql", { sql: createTableSQL })

      if (error) {
        addLog(`❌ Failed to create tables: ${error.message}`)
        return false
      }

      addLog("✅ Tables created successfully!")
      return true
    } catch (err) {
      addLog(`❌ Exception creating tables: ${err}`)

      // Try alternative approach - create tables one by one
      try {
        addLog("🔄 Trying alternative table creation...")

        // Create projects table
        const { error: projectsError } = await supabase.rpc("exec_sql", {
          sql: `
            CREATE TABLE IF NOT EXISTS projects (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                summary TEXT,
                status TEXT DEFAULT 'OPEN',
                lead TEXT,
                contributors TEXT,
                capex_category TEXT,
                activities TEXT[] DEFAULT '{}',
                activities_saved BOOLEAN DEFAULT FALSE,
                jira_url TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
          `,
        })

        if (projectsError) {
          addLog(`❌ Failed to create projects table: ${projectsError.message}`)
          return false
        }

        addLog("✅ Projects table created!")
        return true
      } catch (altErr) {
        addLog(`❌ Alternative creation failed: ${altErr}`)
        return false
      }
    }
  }

  const seedData = async () => {
    addLog("🌱 Seeding sample data...")

    const sampleProjects = [
      {
        id: "SPARK-001",
        name: "SPARK",
        summary:
          "For Content Generators, it's important to have visibility on content usage & performance, to effectively allocate their resources towards what works for content consumers.",
        status: "OPEN",
        lead: "Dragos Ionita",
        contributors:
          "Ionita Dragos, Guta Laurentiu, Proca Cosmin, Carsote Cosmin, Dragomir Diana, Tij Andrei, Tarziu Silvia",
        capex_category: null,
        activities: [],
        activities_saved: false,
        jira_url: "https://company.atlassian.net/browse/SPARK-001",
      },
      {
        id: "BQ-002",
        name: "BigQuery Column Lineage Phase 2",
        summary:
          "Complete and ready dashboards, so the lineage will be completed and ready to build applications on top of it.",
        status: "CLOSED",
        lead: "Alex Giurgiu",
        contributors: "Mantu Razvan-Viorel, Vintila Cosmina, Cristea Ionut",
        capex_category: "CAPEX",
        activities: ["technical-design", "coding", "testing"],
        activities_saved: true,
        jira_url: "https://company.atlassian.net/browse/BQ-002",
      },
      {
        id: "AM-003",
        name: "New Order Model for AM",
        summary: "Create new Order model for AM. This a foundational piece for future enhancements.",
        status: "OPEN",
        lead: "Alex Giurgiu",
        contributors: "Streche Diana, Albata Anda, Giurgiu Alexandru, Platon Elena",
        capex_category: "CAPEX R&D",
        activities: ["functional-design", "technical-design"],
        activities_saved: true,
        jira_url: "https://company.atlassian.net/browse/AM-003",
      },
    ]

    try {
      const { data, error } = await supabase.from("projects").upsert(sampleProjects, { onConflict: "id" }).select()

      if (error) {
        addLog(`❌ Failed to seed data: ${error.message}`)
        addLog(`❌ Error details: ${JSON.stringify(error)}`)
        return false
      }

      addLog(`✅ Successfully seeded ${data?.length || 0} projects!`)
      return true
    } catch (err) {
      addLog(`❌ Exception seeding data: ${err}`)
      return false
    }
  }

  const runSetup = async () => {
    setLoading(true)
    setLogs([])

    try {
      setStep("checking")
      addLog("🚀 Starting database setup...")

      // Check current structure
      await checkTableStructure()

      setStep("creating")
      // Create/update tables
      const tablesCreated = await createTables()
      if (!tablesCreated) {
        addLog("❌ Setup failed at table creation")
        return
      }

      setStep("seeding")
      // Seed data
      const dataSeeded = await seedData()
      if (!dataSeeded) {
        addLog("❌ Setup failed at data seeding")
        return
      }

      setStep("complete")
      addLog("🎉 Database setup complete!")
      addLog("✅ You can now go back to the main dashboard")
    } catch (err) {
      addLog(`❌ Setup failed: ${err}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center space-x-3">
            <Database className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Database Setup</h1>
            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
              Setup Wizard
            </Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>Database Setup</span>
              {step === "complete" ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-600">This will create the necessary tables and populate them with sample data.</p>

              <Button
                onClick={runSetup}
                disabled={loading}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
                <span>{loading ? "Setting up..." : "Run Database Setup"}</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {logs.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Setup Log</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm max-h-96 overflow-y-auto">
                {logs.map((log, index) => (
                  <div key={index} className="mb-1">
                    {log}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
