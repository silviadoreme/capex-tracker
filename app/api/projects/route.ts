import { NextResponse } from "next/server"

// Mock API endpoint - in real app this would connect to MySQL
export async function GET() {
  // This would query the MySQL database with Jira integration
  const projects = [
    {
      id: "PROJ-123",
      name: "Customer Portal Redesign",
      summary: "Complete overhaul of customer-facing portal with new UI/UX",
      status: "In Progress",
      lead: "Sarah Johnson",
      contributors: ["Sarah Johnson", "Mike Chen", "Lisa Wang", "David Kim"],
      capexCategory: "CAPEX",
      lastUpdated: "2024-01-15",
      jiraUrl: "https://company.atlassian.net/browse/PROJ-123",
    },
    // ... more projects
  ]

  return NextResponse.json(projects)
}

export async function PUT(request: Request) {
  const { projectId, capexCategory } = await request.json()

  // In real app, this would update the database
  // UPDATE projects SET capex_category = ? WHERE id = ?

  // Trigger Slack notification to Finance if CAPEX category is set
  if (capexCategory === "CAPEX" || capexCategory === "CAPEX R&D") {
    // Send Slack notification to Finance channel
    console.log(`Notifying Finance: Project ${projectId} marked as ${capexCategory}`)
  }

  return NextResponse.json({ success: true })
}
