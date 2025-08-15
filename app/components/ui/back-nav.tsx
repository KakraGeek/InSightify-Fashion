"use client"

import Link from "next/link"

export function BackNav() {
  return (
    <Link 
      href="/" 
      className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 transition-colors mb-4 lg:mb-6"
    >
      <svg 
        className="w-4 h-4" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M15 19l-7-7 7-7" 
        />
      </svg>
      <span>Back to Dashboard</span>
    </Link>
  )
}
