"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, Database, Search, RefreshCw } from "lucide-react"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"

export default function QueryTestPage() {
  const [loading, setLoading] = useState(false)
  const [logs, setLogs] = useState<string[]>([])
  const [queryResults, setQueryResults] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const addLog = (message: string) => {
    console.log(message)
    setLogs((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const queryProjects = async () => {
    setLoading(true)
    setLogs([])
    setQueryResults(null)
    setError(null)

    try {
      addLog("🔍 Starting fresh projects query...")

      // Get database info
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      let databaseName = "Unknown"
      if (supabaseUrl) {
        try {
          const url = new URL(supabaseUrl)
          databaseName = url.hostname.split(".")[0]
        } catch (e) {
          databaseName = "Invalid URL"
        }
      }
      addLog(`🏢 Database: ${databaseName}`)
      addLog(`🔧 Configured: ${isSupabaseConfigured}`)

      if (!isSupabaseConfigured) {
        addLog("❌ Supabase not configured")
        setError("Supabase not configured")
        return
      }

      // STEP 1: Test basic connection
      addLog("🔌 STEP 1: Testing basic connection...")
      try {
        const { data: connectionTest, error: connectionError } = await supabase
          .from("information_schema.tables")
          .select("table_name")
          .limit(1)

        if (connectionError) {
          addLog(`❌ Connection failed: ${connectionError.message}`)
          setError(connectionError.message)
          return
        }
        addLog("✅ Connection successful")
      } catch (e) {
        addLog(`❌ Connection exception: ${e}`)
        setError(String(e))
        return
      }

      // STEP 2: List all tables
      addLog("📋 STEP 2: Listing all tables...")
      try {
        const { data: tables, error: tablesError } = await supabase
          .from("information_schema.tables")
          .select("table_name")
          .eq("table_schema", "public")
          .order("table_name")

        if (tablesError) {
          addLog(`⚠️ Could not list tables: ${tablesError.message}`)
        } else {
          const tableNames = tables?.map((t) => t.table_name) || []
          addLog(`📋 Found ${tableNames.length} tables: ${tableNames.join(", ")}`)

          const hasProjects = tableNames.includes("projects")
          addLog(`📋 'projects' table exists: ${hasProjects ? "✅ YES" : "❌ NO"}`)

          if (!hasProjects) {
            addLog("❌ Projects table not found - cannot query projects")
            setError("Projects table does not exist")
            return
          }
        }
      } catch (e) {
        addLog(`⚠️ Table listing exception: ${e}`)
      }

      // STEP 3: Get projects table structure
      addLog("🏗️ STEP 3: Checking projects table structure...")
      try {
        const { data: columns, error: columnsError } = await supabase
          .from("information_schema.columns")
          .select("column_name, data_type, is_nullable")
          .eq("table_name", "projects")
          .order("ordinal_position")

        if (columnsError) {
          addLog(`⚠️ Could not get columns: ${columnsError.message}`)
        } else {
          addLog(`🏗️ Projects table has ${columns?.length || 0} columns:`)
          columns?.forEach((col) => {
            addLog(
              `🏗️   - ${col.column_name}: ${col.data_type} (${col.is_nullable === "YES" ? "nullable" : "not null"})`,
            )
          })
        }
      } catch (e) {
        addLog(`⚠️ Column info exception: ${e}`)
      }

      // STEP 4: Count projects
      addLog("🔢 STEP 4: Counting projects...")
      try {
        const { count, error: countError } = await supabase.from("projects").select("*", { count: "exact", head: true })

        if (countError) {
          addLog(`❌ Count failed: ${countError.message}`)
          addLog(`❌ Error code: ${countError.code}`)
          addLog(`❌ Error details: ${countError.details}`)
        } else {
          addLog(`🔢 Total projects count: ${count}`)
        }
      } catch (e) {
        addLog(`❌ Count exception: ${e}`)
      }

      // STEP 5: Query all projects
      addLog("📊 STEP 5: Querying all projects...")
      try {
        const { data: projects, error: queryError } = await supabase
          .from("projects")
          .select("*")
          .order("created_at", { ascending: false })

        if (queryError) {
          addLog(`❌ Query failed: ${queryError.message}`)
          addLog(`❌ Error code: ${queryError.code}`)
          addLog(`❌ Error details: ${queryError.details}`)
          addLog(`❌ Error hint: ${queryError.hint}`)
          setError(queryError.message)
        } else {
          addLog(`📊 Query successful! Retrieved ${projects?.length || 0} projects`)

          if (projects && projects.length > 0) {
            addLog("📊 First project sample:")
            addLog(`📊   ID: ${projects[0].id}`)
            addLog(`📊   Key: ${projects[0].key || "N/A"}`)
            addLog(`📊   Name: ${projects[0].name || projects[0].project || "N/A"}`)
            addLog(`📊   Status: ${projects[0].status || "N/A"}`)
            addLog(`📊   Lead: ${projects[0].lead || projects[0].project_lead_name || "N/A"}`)
            addLog(`📊   CAPEX: ${projects[0].capex_category || "Not set"}`)

            // Show all column names
            const columnNames = Object.keys(projects[0])
            addLog(`📊 Available columns: ${columnNames.join(", ")}`)
          } else {
            addLog("📊 No projects found in the table")
          }

          setQueryResults(projects)
        }
      } catch (e) {
        addLog(`❌ Query exception: ${e}`)
        setError(String(e))
      }

      // STEP 6: Try alternative queries
      addLog("🔄 STEP 6: Trying alternative query methods...")

      // Method A: Simple select
      try {
        const { data: methodA, error: errorA } = await supabase.from("projects").select()
        addLog(`🔄 Method A (select()): ${errorA ? `Error: ${errorA.message}` : `Success: ${methodA?.length} records`}`)
      } catch (e) {
        addLog(`🔄 Method A exception: ${e}`)
      }

      // Method B: Select specific columns
      try {
        const { data: methodB, error: errorB } = await supabase
          .from("projects")
          .select("id, name, status, capex_category")
        addLog(
          `🔄 Method B (specific columns): ${errorB ? `Error: ${errorB.message}` : `Success: ${methodB?.length} records`}`,
        )
      } catch (e) {
        addLog(`🔄 Method B exception: ${e}`)
      }

      // Method C: With limit
      try {
        const { data: methodC, error: errorC } = await supabase.from("projects").select("*").limit(5)
        addLog(`🔄 Method C (limit 5): ${errorC ? `Error: ${errorC.message}` : `Success: ${methodC?.length} records`}`)

        if (methodC && methodC.length > 0) {
          addLog("🔄 Method C sample data:")
          methodC.forEach((project, index) => {
            addLog(
              `🔄   ${index + 1}. ${project.name || project.project || project.key || project.id} (${project.status || "No status"})`,
            )
          })
        }
      } catch (e) {
        addLog(`🔄 Method C exception: ${e}`)
      }

      addLog("✅ Query test completed!")
    } catch (err) {
      addLog(`❌ Overall query test failed: ${err}`)
      setError(String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Search className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Projects Query Test</h1>
              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                Live Query
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={queryProjects}
                disabled={loading}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                <span>{loading ? "Querying..." : "Query Projects"}</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 space-y-6">
        {/* Query Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="w-5 h-5" />
              <span>Query Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="font-medium text-gray-900">Database</p>
                <p className="text-sm text-gray-600">
                  {process.env.NEXT_PUBLIC_SUPABASE_URL
                    ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname.split(".")[0]
                    : "Not configured"}
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-900">Status</p>
                <p className="text-sm text-gray-600">
                  {loading ? "⏳ Querying..." : error ? "❌ Error" : queryResults ? "✅ Success" : "⏸️ Ready"}
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-900">Results</p>
                <p className="text-sm text-gray-600">
                  {queryResults ? `${queryResults.length} projects found` : "No data yet"}
                </p>
              </div>
            </div>
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                <p className="text-red-800 text-sm font-medium">Error: {error}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Query Results */}
        {queryResults && (
          <Card>
            <CardHeader>
              <CardTitle>Query Results ({queryResults.length} projects)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-96 overflow-auto">
                <pre className="bg-gray-100 p-4 rounded text-xs overflow-x-auto">
                  {JSON.stringify(queryResults, null, 2)}
                </pre>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Execution Logs */}
        <Card>
          <CardHeader>
            <CardTitle>Query Execution Log</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm max-h-96 overflow-y-auto">
              {logs.length === 0 ? (
                <div className="text-gray-500">Click "Query Projects" to start...</div>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="mb-1">
                    {log}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
