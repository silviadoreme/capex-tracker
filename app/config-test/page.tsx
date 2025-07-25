"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckCircle, AlertCircle, RefreshCw, Settings } from "lucide-react"
import { supabase, isSupabaseConfigured, testSupabaseConnection } from "@/lib/supabase"

export default function ConfigTestPage() {
  const [loading, setLoading] = useState(false)
  const [logs, setLogs] = useState<string[]>([])
  const [connectionResult, setConnectionResult] = useState<any>(null)

  const addLog = (message: string) => {
    console.log(message)
    setLogs((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const runConfigTest = async () => {
    setLoading(true)
    setLogs([])
    setConnectionResult(null)

    try {
      addLog("🔄 Starting configuration test...")

      // Test 1: Environment Variables
      addLog("📋 STEP 1: Checking environment variables...")
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      addLog(`📋 NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? "✓ Set" : "✗ Missing"}`)
      addLog(`📋 NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseKey ? "✓ Set" : "✗ Missing"}`)
      addLog(`📋 isSupabaseConfigured: ${isSupabaseConfigured}`)

      if (supabaseUrl) {
        try {
          const url = new URL(supabaseUrl)
          const projectId = url.hostname.split(".")[0]
          addLog(`📋 Project ID: ${projectId}`)
          addLog(`📋 Hostname: ${url.hostname}`)
          addLog(`📋 Protocol: ${url.protocol}`)
        } catch (e) {
          addLog(`❌ Invalid URL format: ${e}`)
        }
      }

      // Test 2: Client Creation
      addLog("🔧 STEP 2: Testing client creation...")
      addLog(`🔧 Supabase client exists: ${!!supabase}`)
      if (supabase) {
        addLog(`🔧 Client URL: ${supabase.supabaseUrl}`)
        addLog(`🔧 Client key (first 20): ${supabase.supabaseKey?.substring(0, 20)}...`)
      }

      // Test 3: Connection Test
      addLog("🔌 STEP 3: Testing database connection...")
      const connectionTest = await testSupabaseConnection()
      setConnectionResult(connectionTest)

      if (connectionTest.success) {
        addLog("✅ Connection test successful!")
        addLog(`✅ Response data: ${JSON.stringify(connectionTest.data)}`)
      } else {
        addLog(`❌ Connection test failed: ${connectionTest.error}`)
      }

      // Test 4: Projects Table Access
      if (connectionTest.success) {
        addLog("📊 STEP 4: Testing projects table access...")
        try {
          const { data, error, count } = await supabase.from("projects").select("*", { count: "exact", head: true })

          if (error) {
            addLog(`❌ Projects table access failed: ${error.message}`)
            addLog(`❌ Error code: ${error.code}`)
            addLog(`❌ Error details: ${error.details}`)
          } else {
            addLog(`✅ Projects table accessible! Count: ${count}`)
          }
        } catch (e) {
          addLog(`❌ Projects table test exception: ${e}`)
        }
      }

      addLog("🎉 Configuration test complete!")
    } catch (err) {
      addLog(`❌ Configuration test failed: ${err}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Auto-run test on page load
    runConfigTest()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Settings className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Configuration Test</h1>
              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                Environment Check
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={runConfigTest}
                disabled={loading}
                variant="outline"
                className="flex items-center space-x-2 bg-transparent"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                <span>{loading ? "Testing..." : "Retest"}</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 space-y-6">
        {/* Configuration Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>Configuration Status</span>
              {isSupabaseConfigured ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="font-medium text-gray-900">Supabase URL</p>
                <p className="text-sm text-gray-600">
                  {process.env.NEXT_PUBLIC_SUPABASE_URL ? "✓ Configured" : "✗ Missing"}
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-900">Supabase Key</p>
                <p className="text-sm text-gray-600">
                  {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✓ Configured" : "✗ Missing"}
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-900">Client Status</p>
                <p className="text-sm text-gray-600">{isSupabaseConfigured ? "✓ Ready" : "✗ Not configured"}</p>
              </div>
              <div>
                <p className="font-medium text-gray-900">Connection</p>
                <p className="text-sm text-gray-600">
                  {connectionResult === null ? "⏳ Testing..." : connectionResult.success ? "✓ Connected" : "✗ Failed"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Connection Result */}
        {connectionResult && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>Connection Test Result</span>
                {connectionResult.success ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600" />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="font-medium">Status: {connectionResult.success ? "✅ Success" : "❌ Failed"}</p>
                {connectionResult.error && <p className="text-red-600 text-sm">Error: {connectionResult.error}</p>}
                {connectionResult.data && (
                  <div>
                    <p className="font-medium text-sm">Response Data:</p>
                    <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">
                      {JSON.stringify(connectionResult.data, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Detailed Logs */}
        <Card>
          <CardHeader>
            <CardTitle>Test Execution Log</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm max-h-96 overflow-y-auto">
              {logs.length === 0 ? (
                <div className="text-gray-500">No logs yet...</div>
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

        {/* Environment Variables Display */}
        <Card>
          <CardHeader>
            <CardTitle>Environment Variables</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <p className="font-medium text-sm">NEXT_PUBLIC_SUPABASE_URL:</p>
                <p className="text-xs bg-gray-100 p-2 rounded font-mono">
                  {process.env.NEXT_PUBLIC_SUPABASE_URL || "NOT SET"}
                </p>
              </div>
              <div>
                <p className="font-medium text-sm">NEXT_PUBLIC_SUPABASE_ANON_KEY:</p>
                <p className="text-xs bg-gray-100 p-2 rounded font-mono">
                  {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
                    ? `${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 20)}...`
                    : "NOT SET"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
