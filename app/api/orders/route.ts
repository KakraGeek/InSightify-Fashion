import { NextRequest, NextResponse } from "next/server"
import listOrders from "app/orders/queries/listOrders"
import createOrder from "app/orders/mutations/createOrder"
import { createMockContext } from "app/lib/mock-context"

export async function GET(request: NextRequest) {
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
      userId: "cmeczuj150002yvqwmik8ecmq", // Use the real user ID from seeded data
      workspaceId: "cmeczuiuq0000yvqwnrr50qdd", // Use the seeded workspace ID
    }

    // Call the Blitz RPC resolver
    const result = await listOrders(null, createMockContext(mockSession))

    return NextResponse.json(result)
  } catch (error) {
    console.error("Orders list error:", error)
    
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

export async function POST(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { message: "Authorization header required" },
        { status: 400 }
      )
    }

    const token = authHeader.substring(7)
    const body = await request.json()
    
    // For now, we'll create a mock session context
    // In a real implementation, you'd verify the token and create a proper session
    const mockSession = {
      userId: "cmeczuj150002yvqwmik8ecmq", // Use the real user ID from seeded data
      workspaceId: "cmeczuiuq0000yvqwnrr50qdd", // Use the seeded workspace ID
    }

    // Call the Blitz RPC resolver
    const result = await createOrder(body, createMockContext(mockSession))

    return NextResponse.json(result)
  } catch (error) {
    console.error("Order creation error:", error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { message: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
