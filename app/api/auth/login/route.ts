import { NextRequest, NextResponse } from "next/server"
import login from "app/auth/mutations/login"
import { createMockContext } from "app/lib/mock-context"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      )
    }

    // Call the Blitz RPC resolver with a mock context
    const result = await login({ email, password }, createMockContext())

    return NextResponse.json(result)
  } catch (error) {
    console.error("Login error:", error)
    
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
