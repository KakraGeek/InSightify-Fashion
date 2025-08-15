import { NextRequest, NextResponse } from "next/server"
import { createMockContext } from "app/lib/mock-context"
import getReports from "app/reports/queries/getReports"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { from, to } = body

    if (!from || !to) {
      return NextResponse.json(
        { message: "From and to dates are required" },
        { status: 400 }
      )
    }

    // Create mock session context
    const mockSession = {
      userId: "cmed3onzk0003pxx5hu6ilaud", // Seeded user ID
      workspaceId: "cmed3onzk0003pxx5hu6ilaud", // Seeded workspace ID
      role: "OWNER"
    }

    const ctx = createMockContext(mockSession)

    // Call the Blitz RPC resolver
    const result = await getReports({ from, to }, ctx)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Reports API error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
