"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Download, Save, HelpCircle, Calendar, BarChart3, Clock, Loader2 } from "lucide-react"
import Link from "next/link"
import { useTimesheet } from "@/hooks/useTimesheet"
import { useToast } from "@/hooks/use-toast"

export default function Timesheet() {
  const { timesheetData, loading, error, updateContributorEffort, saveTimesheet } = useTimesheet()
  const [currentMonth, setCurrentMonth] = useState("July 2025")
  const [showGuidance, setShowGuidance] = useState(false)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  const handleSave = async () => {
    setSaving(true)
    try {
      const monthYear = "2025-07" // This should be derived from the month selector
      const result = await saveTimesheet(monthYear)

      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        })
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to save timesheet",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "open":
        return "bg-amber-100 text-amber-800 border-amber-200"
      case "closed":
        return "bg-green-100 text-green-800 border-green-200"
      case "in progress":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getCapexColor = (category: string) => {
    switch (category) {
      case "CAPEX":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "CAPEX R&D":
        return "bg-purple-100 text-purple-800 border-purple-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-gray-600">Loading timesheet data from database...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-2">Error loading timesheet data</div>
          <div className="text-gray-600 text-sm">{error}</div>
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
              <BarChart3 className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">CAPEX Tracker</h1>
              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                Live Data
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Link href="/">
                <Button variant="ghost" className="text-gray-600">
                  Dashboard
                </Button>
              </Link>
              <Button variant="outline" className="flex items-center space-x-2 bg-blue-50 border-blue-200">
                <Clock className="w-4 h-4" />
                <span>Timesheet</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Monthly Timesheet</h2>
            <p className="text-gray-600">Submit effort estimates for CAPEX tracking from live database</p>
          </div>
          <div className="flex items-center space-x-3">
            <Dialog open={showGuidance} onOpenChange={setShowGuidance}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="flex items-center space-x-2 bg-blue-50 border-blue-200 text-blue-700"
                >
                  <HelpCircle className="w-4 h-4" />
                  <span>CAPEX Guidance</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl">CAPEX vs OPEX Guidance</DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-bold text-sm">$</span>
                      </div>
                      <h3 className="text-xl font-semibold text-blue-600">CAPEX (Capital Expenditure)</h3>
                    </div>
                    <p className="text-gray-700 mb-4">
                      CAPEX refers to funds used to acquire, upgrade, and maintain physical assets such as property,
                      buildings, technology, or equipment that will provide benefits for more than one year.
                    </p>
                    <div>
                      <p className="font-medium text-gray-900 mb-2">Examples include:</p>
                      <ul className="space-y-1 text-gray-700">
                        <li>• Development of new software platforms or products</li>
                        <li>• Major system upgrades or infrastructure improvements</li>
                        <li>• Building new features that create long-term value</li>
                        <li>• Technology acquisitions or implementations</li>
                        <li>• Development of intellectual property</li>
                      </ul>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                        <HelpCircle className="w-4 h-4 text-purple-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-purple-600">CAPEX R&D (Research & Development)</h3>
                    </div>
                    <p className="text-gray-700 mb-4">
                      CAPEX R&D represents investments in research and development activities that are expected to
                      generate future economic benefits and can be capitalized.
                    </p>
                    <div>
                      <p className="font-medium text-gray-900 mb-2">Examples include:</p>
                      <ul className="space-y-1 text-gray-700">
                        <li>• Research for new product development</li>
                        <li>• Prototype development and testing</li>
                        <li>• Experimental technology initiatives</li>
                        <li>• Innovation projects with uncertain outcomes</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="outline" className="flex items-center space-x-2 bg-transparent">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{saving ? "Saving..." : "Save"}</span>
            </Button>
          </div>
        </div>

        {/* Month Selector */}
        <Card className="mb-8 border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-gray-600" />
              <label className="text-sm font-medium text-gray-700">Reporting Month:</label>
              <div className="flex items-center space-x-2">
                <Input
                  type="month"
                  value="2025-07"
                  className="w-40"
                  onChange={(e) => {
                    const date = new Date(e.target.value + "-01")
                    setCurrentMonth(date.toLocaleDateString("en-US", { month: "long", year: "numeric" }))
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timesheet Table */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left p-4 font-medium text-gray-700 text-sm">JIRA LINK</th>
                    <th className="text-left p-4 font-medium text-gray-700 text-sm">LEAD</th>
                    <th className="text-left p-4 font-medium text-gray-700 text-sm">SUMMARY</th>
                    <th className="text-left p-4 font-medium text-gray-700 text-sm">STATUS</th>
                    <th className="text-left p-4 font-medium text-gray-700 text-sm">CAPEX</th>
                    <th className="text-left p-4 font-medium text-gray-700 text-sm">CONTRIBUTORS</th>
                  </tr>
                </thead>
                <tbody>
                  {timesheetData.map((epic, epicIndex) => (
                    <tr key={epic.epicId} className="border-b border-gray-100">
                      <td className="p-4 align-top">
                        <a href={epic.link} target="_blank" className="text-blue-600 font-medium">{epic.epicId}</a>
                      </td>
                      <td className="p-4 align-top">
                        <span className="font-medium text-gray-900">{epic.lead}</span>
                      </td>
                      <td className="p-4 align-top max-w-xs">
                        <span className="text-gray-600 text-sm">
                          {epic.summary.length > 100 ? `${epic.summary.substring(0, 100)}...` : epic.summary}
                        </span>
                      </td>
                      <td className="p-4 align-top">
                        <Badge className={`${getStatusColor(epic.status)} font-medium`}>{epic.status}</Badge>
                      </td>
                      <td className="p-4 align-top">
                        <Badge className={`${getCapexColor(epic.capex)} font-medium`}>{epic.capex}</Badge>
                      </td>
                      <td className="p-4 align-top">
                        <div className="space-y-2 min-w-[300px]">
                          {epic.contributors.map((contributor: any, contributorIndex: any) => (
                            <div key={contributorIndex} className="flex items-center justify-between">
                              <span className="text-sm text-gray-700 flex-1">{contributor.name}</span>
                              <div className="flex items-center space-x-2">
                                <Input
                                  type="number"
                                  value={contributor.effort || ""}
                                  onChange={(e) =>
                                    updateContributorEffort(
                                      epicIndex,
                                      contributorIndex,
                                      Number.parseInt(e.target.value) || 0,
                                    )
                                  }
                                  className="w-16 h-8 text-center text-sm"
                                  min="0"
                                  max="100"
                                  placeholder="0"
                                />
                                <span className="text-sm text-gray-500">%</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {timesheetData.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-2">No CAPEX projects found for timesheet</div>
            <div className="text-sm text-gray-400">
              Projects need to have a CAPEX category assigned to appear in the timesheet
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
