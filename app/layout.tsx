import "./globals.css"
import React from "react"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <title>InSightify - Fashion</title>
        <meta name="description" content="Professional fashion business management platform" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="bg-gray-50 text-gray-900">{children}</body>
    </html>
  )
}