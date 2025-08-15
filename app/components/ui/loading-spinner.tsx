import React from "react"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl"
  color?: "primary" | "secondary" | "white"
  text?: string
  className?: string
}

const sizeClasses = {
  sm: "w-4 h-4",
  md: "w-6 h-6",
  lg: "w-8 h-8",
  xl: "w-12 h-12"
}

const colorClasses = {
  primary: "text-indigo-600",
  secondary: "text-gray-600",
  white: "text-white"
}

export function LoadingSpinner({ 
  size = "md", 
  color = "primary", 
  text,
  className = ""
}: LoadingSpinnerProps) {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className={`animate-spin rounded-full border-2 border-gray-200 border-t-current ${sizeClasses[size]} ${colorClasses[color]}`} />
      {text && (
        <p className={`mt-2 text-sm font-medium ${colorClasses[color]}`}>
          {text}
        </p>
      )}
    </div>
  )
}
