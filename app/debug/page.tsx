"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, Database, AlertCircle, CheckCircle, RefreshCw } from "lucide-react"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"

export default function DebugPage() {
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [logs, setLogs] = useState<string[]>([])
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<string>("Not tested")

  const addLog = (message: string) => {
    console.log(message)
    setLogs((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const runDiagnostics = async () => {
    const isRefresh = !loading
    if (isRefresh) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }

    setLogs([])
    setError(null)
    setData(null)

    try {
      addLog("🔍 Starting database diagnostics...")

      // Check environment variables
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      addLog(`📋 NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? "✓ Set" : "✗ Missing"}`)
      addLog(`📋 NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseKey ? "✓ Set" : "✗ Missing"}`)
      addLog(`📋 isSupabaseConfigured: ${isSupabaseConfigured}`)

      if (!isSupabaseConfigured) {
        addLog("❌ Supabase not configured - stopping diagnostics")
        setConnectionStatus("Not configured")
        return
      }

      // Test basic connection
      addLog("🔌 Testing basic connection...")
      try {
        const { data: healthCheck, error: healthError } = await supabase
          .from("projects")
          .select("count", { count: "exact", head: true })

        if (healthError) {
          addLog(`❌ Health check failed: ${healthError.message}`)
          addLog(`❌ Error code: ${healthError.code}`)
          addLog(`❌ Error details: ${healthError.details}`)
          addLog(`❌ Error hint: ${healthError.hint}`)
          setConnectionStatus(`Failed: ${healthError.message}`)
          setError(healthError.message)
          return
        }

        addLog("✅ Basic connection successful!")
        setConnectionStatus("Connected")

        // Test table access
        addLog("📊 Testing table access...")
        const {
          data: tableData,
          error: tableError,
          count,
        } = await supabase.from("projects").select("*", { count: "exact" })

        addLog(`📊 Query executed`)
        addLog(`📊 Error: ${tableError ? JSON.stringify(tableError) : "null"}`)
        addLog(`📊 Count: ${count}`)
        addLog(`📊 Data length: ${tableData ? tableData.length : "null"}`)
        addLog(`📊 Data type: ${typeof tableData}`)
        addLog(`📊 Data is array: ${Array.isArray(tableData)}`)

        if (tableError) {
          addLog(`❌ Table query failed: ${tableError.message}`)
          addLog(`❌ Table error code: ${tableError.code}`)
          addLog(`❌ Table error details: ${tableError.details}`)
          setError(tableError.message)
          return
        }

        if (tableData) {
          addLog(`✅ Query successful! Found ${tableData.length} records`)
          if (tableData.length > 0) {
            addLog(`📋 First record ID: ${tableData[0]?.id}`)
            addLog(`📋 First record name: ${tableData[0]?.name}`)
            addLog(`📋 Sample record: ${JSON.stringify(tableData[0], null, 2)}`)
          }
          setData(tableData)
        } else {
          addLog("⚠️ Query returned null data")
          setData([])
        }

        // Test different query approaches
        addLog("🔍 Testing alternative query methods...")

        // Method 1: Simple select all
        const { data: method1, error: error1 } = await supabase.from("projects").select()
        addLog(`Method 1 (select()): ${error1 ? error1.message : `${method1?.length} records`}`)

        // Method 2: Select specific columns
        const { data: method2, error: error2 } = await supabase.from("projects").select("id, name, status")
        addLog(`Method 2 (select columns): ${error2 ? error2.message : `${method2?.length} records`}`)

        // Method 3: With limit
        const { data: method3, error: error3 } = await supabase.from("projects").select("*").limit(1)
        addLog(`Method 3 (with limit): ${error3 ? error3.message : `${method3?.length} records`}`)
      } catch (connectionError) {
        addLog(`❌ Connection test failed with exception: ${connectionError}`)
        setConnectionStatus(`Exception: ${connectionError}`)
        setError(String(connectionError))
      }
    } catch (error) {
      addLog(`❌ Diagnostics failed: ${error}`)
      setError(String(error))
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    runDiagnostics()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-gray-600">Running detailed diagnostics...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Database className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Database Debug Console</h1>
              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                Detailed Diagnostics
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={runDiagnostics}
                disabled={refreshing}
                variant="outline"
                className="flex items-center space-x-2 bg-transparent"
              >
                {refreshing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 space-y-6">
        {/* Connection Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>Connection Status</span>
              {connectionStatus === "Connected" ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-medium">{connectionStatus}</p>
            {error && (
              <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded">
                <p className="text-red-800 text-sm">
                  <strong>Error:</strong> {error}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Detailed Logs */}
        <Card>
          <CardHeader>
            <CardTitle>Detailed Execution Log</CardTitle>
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

        {/* Data Display */}
        {data && (
          <Card>
            <CardHeader>
              <CardTitle>Retrieved Data ({data.length} records)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-96 overflow-auto">
                <pre className="bg-gray-100 p-4 rounded text-xs overflow-x-auto">{JSON.stringify(data, null, 2)}</pre>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
