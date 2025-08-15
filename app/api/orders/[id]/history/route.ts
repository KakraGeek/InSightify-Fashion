import { NextRequest, NextResponse } from "next/server"
import getOrderHistory from "app/orders/queries/getOrderHistory"
import { createMockContext } from "app/lib/mock-context"

// Mark this route as dynamic since it uses request.headers
export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { message: "Authorization header required" },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    
    // For now, we'll create a mock session context
    // In a real implementation, you'd verify the token and create a proper session
    const mockSession = {
      userId: "cmecsmio50002vqkorq7m5b3v", // Use the real user ID from seeded data
      workspaceId: "cmecsmini0000vqko6pzuks0i", // Use the seeded workspace ID
    }

    // Call the Blitz RPC resolver
    const result = await getOrderHistory(
      { orderId: params.id },
      createMockContext(mockSession)
    )

    return NextResponse.json(result)
  } catch (error) {
    console.error("Order history error:", error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { message: error.message },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
