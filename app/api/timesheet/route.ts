import { NextResponse } from "next/server"

// Mock API endpoint for timesheet submission
export async function POST(request: Request) {
  const timesheetData = await request.json()

  // In real app, this would:
  // 1. Save to monthly_efforts table
  // 2. Send Slack notification to Finance
  // 3. Send confirmation to PM

  console.log("Timesheet submitted:", timesheetData)

  // Mock Slack notification
  const slackMessage = {
    channel: "#finance-capex",
    text: `📊 Monthly CAPEX timesheet submitted for ${timesheetData.month}`,
    attachments: [
      {
        color: "good",
        fields: [
          {
            title: "Projects",
            value: timesheetData.projects.length.toString(),
            short: true,
          },
          {
            title: "Total Hours",
            value: timesheetData.totalHours.toString(),
            short: true,
          },
        ],
      },
    ],
  }

  return NextResponse.json({
    success: true,
    message: "Timesheet submitted successfully",
    slackNotification: slackMessage,
  })
}
