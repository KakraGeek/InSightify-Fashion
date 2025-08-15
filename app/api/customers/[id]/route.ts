import { NextRequest, NextResponse } from "next/server"
import { createMockContext } from "app/lib/mock-context"
import db from "db"

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
      userId: "cmeczuj150002yvqwmik8ecmq", // Use the real user ID from seeded data
      workspaceId: "cmeczuiuq0000yvqwnrr50qdd", // Use the seeded workspace ID
    }

    // Get customer details from database
    const customer = await db.customer.findFirst({
      where: {
        id: params.id,
        workspaceId: mockSession.workspaceId,
      },
    })

    if (!customer) {
      return NextResponse.json(
        { message: "Customer not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(customer)
  } catch (error) {
    console.error("Customer details error:", error)
    
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

export async function PUT(
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
    const body = await request.json()
    
    // For now, we'll create a mock session context
    // In a real implementation, you'd verify the token and create a proper session
    const mockSession = {
      userId: "cmeczuj150002yvqwmik8ecmq", // Use the real user ID from seeded data
      workspaceId: "cmeczuiuq0000yvqwnrr50qdd", // Use the seeded workspace ID
    }

    // Update customer in database
    const updatedCustomer = await db.customer.update({
      where: {
        id: params.id,
        workspaceId: mockSession.workspaceId,
      },
      data: body,
    })

    return NextResponse.json(updatedCustomer)
  } catch (error) {
    console.error("Customer update error:", error)
    
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
