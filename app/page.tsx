"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Calendar, Users, ExternalLink, HelpCircle, BarChart3, Clock, Settings, Loader2 } from "lucide-react"
import Link from "next/link"
import { useProjects } from "@/hooks/useProjects"

// Simplified activity types without emojis
const activityTypes = [
  { id: "functional-design", name: "Functional Design" },
  { id: "technical-design", name: "Technical Design" },
  { id: "software-config", name: "Software Config" },
  { id: "interface-dev", name: "Interface Dev" },
  { id: "coding", name: "Coding" },
  { id: "hardware", name: "Hardware" },
  { id: "testing", name: "Testing" },
]

export default function Dashboard() {
  const { projects, loading, error, updateCapexCategory, updateProjectActivities } = useProjects()
  const [filter, setFilter] = useState("All")
  const [showGuidance, setShowGuidance] = useState(false)
  const [editingActivities, setEditingActivities] = useState<string | null>(null)

  const toggleActivity = (projectId: string, activityId: string) => {
    const project = projects.find((p) => p.id === projectId)
    if (!project) return

    const currentActivities = project.activities || []
    const newActivities = currentActivities.includes(activityId)
      ? currentActivities.filter((id) => id !== activityId)
      : [...currentActivities, activityId]

    updateProjectActivities(projectId, newActivities, false)
  }

  const saveActivities = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId)
    if (!project) return

    updateProjectActivities(projectId, project.activities || [], true)
    setEditingActivities(null)
  }

  const editActivities = (projectId: string) => {
    setEditingActivities(projectId)
  }

  const filteredProjects = projects
    .filter((project) => {
      if (filter === "All") return true
      if (filter === "CAPEX") return project.capex_category === "CAPEX"
      if (filter === "CAPEX R&D") return project.capex_category === "CAPEX R&D"
      if (filter === "OPEX") return project.capex_category === "OPEX"
      return true
    })
    .sort((a, b) => {
      // Sort projects without category first
      if (!a.capex_category && b.capex_category) return -1
      if (a.capex_category && !b.capex_category) return 1
      return 0
    })

  const stats = {
    total: projects.length,
    capex: projects.filter((p) => p.capex_category === "CAPEX").length,
    capexRd: projects.filter((p) => p.capex_category === "CAPEX R&D").length,
    opex: projects.filter((p) => p.capex_category === "OPEX").length,
    open: projects.filter((p) => p.status?.toLowerCase() === "open").length,
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
      case "OPEX":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const shouldShowActivities = (project: any) => {
    return project.capex_category === "CAPEX" || project.capex_category === "CAPEX R&D"
  }

  const needsActivities = (project: any) => {
    return (
      shouldShowActivities(project) &&
      (!project.activities || project.activities.length === 0 || !project.activities_saved)
    )
  }

  const isEditingProject = (projectId: string) => {
    return editingActivities === projectId
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-gray-600">Loading projects from database...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-2">Error loading projects from database</div>
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
              <Button variant="ghost" className="text-gray-600">
                Dashboard
              </Button>
              <Link href="/timesheet">
                <Button variant="outline" className="flex items-center space-x-2 bg-transparent">
                  <Clock className="w-4 h-4" />
                  <span>Timesheet</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Project Dashboard</h2>
            <p className="text-gray-600">Track and manage CAPEX-eligible projects from Supabase database</p>
          </div>
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

                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 font-bold text-sm">O</span>
                    </div>
                    <h3 className="text-xl font-semibold text-green-600">OPEX (Operating Expenditure)</h3>
                  </div>
                  <p className="text-gray-700 mb-4">
                    OPEX refers to the ongoing costs for running a business, including day-to-day operations,
                    maintenance, and activities that don't create long-term assets.
                  </p>
                  <div>
                    <p className="font-medium text-gray-900 mb-2">Examples include:</p>
                    <ul className="space-y-1 text-gray-700">
                      <li>• Regular maintenance and bug fixes</li>
                      <li>• Day-to-day operational activities</li>
                      <li>• Minor updates and patches</li>
                      <li>• Support and customer service</li>
                      <li>• Routine administrative tasks</li>
                    </ul>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6 text-center">
              <p className="text-3xl font-bold text-gray-900 mb-1">{stats.total}</p>
              <p className="text-sm text-gray-600">Total Projects</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6 text-center">
              <p className="text-3xl font-bold text-blue-600 mb-1">{stats.capex}</p>
              <p className="text-sm text-gray-600">CAPEX</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6 text-center">
              <p className="text-3xl font-bold text-purple-600 mb-1">{stats.capexRd}</p>
              <p className="text-sm text-gray-600">CAPEX R&D</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6 text-center">
              <p className="text-3xl font-bold text-green-600 mb-1">{stats.opex}</p>
              <p className="text-sm text-gray-600">OPEX</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6 text-center">
              <p className="text-3xl font-bold text-amber-600 mb-1">{stats.open}</p>
              <p className="text-sm text-gray-600">Open</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Filter:</span>
            {["All", "CAPEX", "CAPEX R&D", "OPEX"].map((filterOption) => (
              <Button
                key={filterOption}
                variant={filter === filterOption ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(filterOption)}
                className={filter === filterOption ? "bg-blue-600 hover:bg-blue-700" : ""}
              >
                {filterOption}
              </Button>
            ))}
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <Card
              key={project.id}
              className={`border-0 shadow-sm hover:shadow-md transition-shadow ${
                !project.capex_category || needsActivities(project) ? "ring-2 ring-amber-300 bg-amber-50 shadow-lg" : ""
              }`}
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between mb-3">
                  <CardTitle className="text-lg">
                    {project.jira_url ? (
                      <a
                        href={project.jira_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 flex items-center"
                      >
                        {project.name}
                        <ExternalLink className="w-4 h-4 ml-1" />
                      </a>
                    ) : (
                      <span className="text-gray-900">{project.name}</span>
                    )}
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Badge className={`${getStatusColor(project.status)} font-medium`}>{project.status}</Badge>
                    {project.capex_category && (
                      <Badge className={`${getCapexColor(project.capex_category)} font-medium`}>
                        {project.capex_category}
                      </Badge>
                    )}
                  </div>
                </div>
                <CardDescription className="text-gray-600 leading-relaxed">
                  {project.summary || "No summary available"}
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="space-y-4">
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Lead:</span> {project.lead || "Not assigned"}
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>{project.contributorCount} contributors</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>Created {formatDate(project.created_at)}</span>
                    </div>
                  </div>

                  {/* Show contributor names */}
                  {project.contributorList.length > 0 && (
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Contributors:</span>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {project.contributorList.slice(0, 3).map((contributor, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {contributor}
                          </Badge>
                        ))}
                        {project.contributorList.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{project.contributorList.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <label className="text-sm font-medium text-gray-700">Project Category:</label>
                      <HelpCircle
                        className="w-4 h-4 text-gray-400 cursor-pointer"
                        onClick={() => setShowGuidance(true)}
                      />
                    </div>
                    <Select
                      value={project.capex_category || ""}
                      onValueChange={(value) => updateCapexCategory(project.id, value)}
                    >
                      <SelectTrigger
                        className={`w-full ${!project.capex_category ? "border-amber-400 bg-amber-100" : ""}`}
                      >
                        <SelectValue placeholder="Select project category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CAPEX">CAPEX</SelectItem>
                        <SelectItem value="CAPEX R&D">CAPEX R&D</SelectItem>
                        <SelectItem value="OPEX">OPEX</SelectItem>
                      </SelectContent>
                    </Select>
                    {!project.capex_category && (
                      <div className="mt-2 p-3 bg-amber-100 border border-amber-300 rounded-md">
                        <p className="text-sm text-amber-800 font-medium">
                          ⚠️ Please select a project category to continue
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Activities Section */}
                  {shouldShowActivities(project) && (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-sm font-medium text-gray-700">Project Activities:</label>
                        {project.activities_saved && !isEditingProject(project.id) && (
                          <button
                            onClick={() => editActivities(project.id)}
                            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <Settings className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {/* Editing Mode */}
                      {(!project.activities_saved || isEditingProject(project.id)) && (
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-2">
                            {activityTypes.map((activity) => (
                              <button
                                key={activity.id}
                                onClick={() => toggleActivity(project.id, activity.id)}
                                className={`px-3 py-2 rounded-full text-xs font-medium transition-all ${
                                  project.activities?.includes(activity.id)
                                    ? "bg-blue-600 text-white shadow-md"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                              >
                                {activity.name}
                              </button>
                            ))}
                          </div>
                          <Button
                            onClick={() => saveActivities(project.id)}
                            size="sm"
                            className="w-full bg-blue-600 hover:bg-blue-700"
                          >
                            Save Activities
                          </Button>
                        </div>
                      )}

                      {/* Saved Mode - Show only selected activities */}
                      {project.activities_saved && !isEditingProject(project.id) && (
                        <div>
                          {project.activities && project.activities.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {project.activities.map((activityId) => {
                                const activity = activityTypes.find((a) => a.id === activityId)
                                return (
                                  <Badge key={activityId} variant="outline" className="text-xs">
                                    {activity?.name}
                                  </Badge>
                                )
                              })}
                            </div>
                          ) : (
                            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                              <p className="text-sm text-blue-800 font-medium">
                                💡 Select activities for this {project.capex_category} project
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {projects.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-2">No projects found in the database</div>
            <div className="text-sm text-gray-400">
              Check your Supabase connection and ensure the projects table has data
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
