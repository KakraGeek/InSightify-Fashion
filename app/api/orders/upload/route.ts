import { NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { createMockContext } from "app/lib/mock-context"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll("files") as File[]
    const orderId = formData.get("orderId") as string
    const descriptions = formData.getAll("descriptions") as string[]
    const categories = formData.getAll("categories") as string[]
    
    if (!files || files.length === 0) {
      return NextResponse.json(
        { message: "No files provided" },
        { status: 400 }
      )
    }

    if (!orderId) {
      return NextResponse.json(
        { message: "Order ID is required" },
        { status: 400 }
      )
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), "uploads", "orders", orderId)
    await mkdir(uploadsDir, { recursive: true })

    const uploadedFiles = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const description = descriptions[i] || ""
      const category = categories[i] || "reference"

      // Validate file type
      if (!file.type.startsWith("image/")) {
        return NextResponse.json(
          { message: "Only image files are allowed" },
          { status: 400 }
        )
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json(
          { message: "File size must be less than 10MB" },
          { status: 400 }
        )
      }

      // Generate unique filename
      const timestamp = Date.now()
      const randomString = Math.random().toString(36).substring(2, 15)
      const fileExtension = file.name.split(".").pop()
      const fileName = `${timestamp}_${randomString}.${fileExtension}`
      const filePath = join(uploadsDir, fileName)

      // Convert file to buffer and save
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      await writeFile(filePath, buffer)

      // Create file record in database
      const mockContext = createMockContext()
      
      // For now, return file info - in a real app, you'd save to database
      uploadedFiles.push({
        fileName,
        originalName: file.name,
        fileType: file.type,
        fileSize: file.size,
        filePath: `uploads/orders/${orderId}/${fileName}`,
        description,
        category,
        orderId
      })
    }

    return NextResponse.json({
      message: "Files uploaded successfully",
      files: uploadedFiles
    })

  } catch (error) {
    console.error("File upload error:", error)
    return NextResponse.json(
      { message: "Failed to upload files" },
      { status: 500 }
    )
  }
}
