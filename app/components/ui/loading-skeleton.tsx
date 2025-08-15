import React from "react"

interface LoadingSkeletonProps {
  type?: "card" | "line" | "circle" | "text"
  className?: string
  lines?: number
}

export function LoadingSkeleton({ 
  type = "card", 
  className = "",
  lines = 1
}: LoadingSkeletonProps) {
  const renderSkeleton = () => {
    switch (type) {
      case "card":
        return (
          <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`}>
            <div className="h-4 bg-gray-300 rounded mb-2"></div>
            <div className="h-3 bg-gray-300 rounded mb-2"></div>
            <div className="h-3 bg-gray-300 rounded w-3/4"></div>
          </div>
        )
      
      case "line":
        return (
          <div className={`animate-pulse bg-gray-200 rounded h-4 ${className}`}></div>
        )
      
      case "circle":
        return (
          <div className={`animate-pulse bg-gray-200 rounded-full ${className}`}></div>
        )
      
      case "text":
        return (
          <div className="space-y-2">
            {Array.from({ length: lines }).map((_, index) => (
              <div 
                key={index} 
                className={`animate-pulse bg-gray-200 rounded h-3 ${index === lines - 1 ? 'w-3/4' : 'w-full'} ${className}`}
              ></div>
            ))}
          </div>
        )
      
      default:
        return null
    }
  }

  return renderSkeleton()
}

// Specialized skeleton components for common use cases
export function CardSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`p-4 border rounded-lg ${className}`}>
      <div className="animate-pulse space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-3 bg-gray-200 rounded"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      </div>
    </div>
  )
}

export function InventoryItemSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`p-4 border rounded-lg ${className}`}>
      <div className="animate-pulse space-y-3">
        <div className="flex justify-between items-start">
          <div className="h-5 bg-gray-200 rounded w-2/3"></div>
          <div className="h-6 bg-gray-200 rounded w-16"></div>
        </div>
        <div className="h-3 bg-gray-200 rounded w-full"></div>
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded w-1/3"></div>
          <div className="h-3 bg-gray-200 rounded w-1/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    </div>
  )
}

export function OrderSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`p-4 border rounded-lg ${className}`}>
      <div className="animate-pulse space-y-3">
        <div className="flex justify-between items-start">
          <div className="h-5 bg-gray-200 rounded w-1/2"></div>
          <div className="h-6 bg-gray-200 rounded w-20"></div>
        </div>
        <div className="h-3 bg-gray-200 rounded w-3/4"></div>
        <div className="h-3 bg-gray-200 rounded w-1/3"></div>
      </div>
    </div>
  )
}

export function CustomerSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`p-4 border rounded-lg ${className}`}>
      <div className="animate-pulse space-y-3">
        <div className="h-5 bg-gray-200 rounded w-2/3"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        <div className="h-3 bg-gray-200 rounded w-3/4"></div>
        <div className="h-3 bg-gray-200 rounded w-1/3"></div>
      </div>
    </div>
  )
}
