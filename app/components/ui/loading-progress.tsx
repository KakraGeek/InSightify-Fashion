import React from "react"

interface LoadingProgressProps {
  progress?: number // 0-100
  steps?: string[]
  currentStep?: number
  showPercentage?: boolean
  className?: string
}

export function LoadingProgress({ 
  progress = 0,
  steps,
  currentStep = 0,
  showPercentage = true,
  className = ""
}: LoadingProgressProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-indigo-600 h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        ></div>
      </div>
      
      {/* Progress Info */}
      <div className="flex justify-between items-center">
        {showPercentage && (
          <span className="text-sm font-medium text-gray-700">
            {Math.round(progress)}%
          </span>
        )}
        
        {steps && steps.length > 0 && (
          <span className="text-sm text-gray-500">
            Step {currentStep + 1} of {steps.length}
          </span>
        )}
      </div>
      
      {/* Step Indicators */}
      {steps && steps.length > 0 && (
        <div className="space-y-2">
          {steps.map((step, index) => (
            <div 
              key={index}
              className={`flex items-center space-x-2 text-sm ${
                index <= currentStep ? 'text-gray-900' : 'text-gray-400'
              }`}
            >
              <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                index < currentStep 
                  ? 'bg-green-500 text-white' 
                  : index === currentStep 
                    ? 'bg-indigo-500 text-white' 
                    : 'bg-gray-200 text-gray-400'
              }`}>
                {index < currentStep ? (
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <span className="text-xs font-bold">{index + 1}</span>
                )}
              </div>
              <span className={index <= currentStep ? 'font-medium' : ''}>
                {step}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Simple progress bar for basic operations
export function SimpleProgress({ 
  progress = 0, 
  className = "" 
}: { 
  progress?: number
  className?: string 
}) {
  return (
    <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
      <div 
        className="bg-indigo-600 h-2 rounded-full transition-all duration-300 ease-out"
        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
      ></div>
    </div>
  )
}

// Loading button with spinner
export function LoadingButton({ 
  children, 
  loading = false, 
  className = "",
  ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { 
  loading?: boolean 
}) {
  return (
    <button 
      className={`flex items-center justify-center space-x-2 ${className}`}
      disabled={loading}
      {...props}
    >
      {loading && (
        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      )}
      <span>{children}</span>
    </button>
  )
}
