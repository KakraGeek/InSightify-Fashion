"use client"

import { useState } from "react"
import { Button } from "./button"
import { Card } from "./card"

interface MobileNavProps {
  currentPage?: string
}

export function MobileNav({ currentPage = "dashboard" }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false)

  const navigationItems = [
    { name: "Dashboard", href: "/", icon: "🏠" },
    { name: "Customers", href: "/customers", icon: "👥" },
    { name: "Orders", href: "/orders", icon: "📋" },
    { name: "Inventory", href: "/inventory", icon: "📦" },
    { name: "Reports", href: "/reports", icon: "📊" },
  ]

  const handleLogout = () => {
    localStorage.removeItem("authToken")
    window.location.href = "/login"
  }

  return (
    <div className="lg:hidden">
      {/* Mobile Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              aria-label="Toggle navigation menu"
            >
              <div className="w-6 h-6 flex flex-col justify-center items-center">
                <span className={`block w-5 h-0.5 bg-current transition-all duration-300 ${
                  isOpen ? 'rotate-45 translate-y-1' : '-translate-y-1'
                }`}></span>
                <span className={`block w-5 h-0.5 bg-current transition-all duration-300 ${
                  isOpen ? 'opacity-0' : 'opacity-100'
                }`}></span>
                <span className={`block w-5 h-0.5 bg-current transition-all duration-300 ${
                  isOpen ? '-rotate-45 -translate-y-1' : 'translate-y-1'
                }`}></span>
              </div>
            </button>
            <div>
              <h1 className="text-xl font-bold text-indigo-600">InSightify</h1>
              <p className="text-sm text-gray-600">Fashion</p>
            </div>
          </div>
          <div className="text-sm text-gray-500 capitalize">
            {currentPage}
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <div className={`fixed top-0 left-0 z-40 w-64 h-full bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="pt-20 px-4 pb-4 h-full flex flex-col">
          {/* Navigation Links */}
          <nav className="flex-1 space-y-2">
            {navigationItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  currentPage === item.name.toLowerCase()
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium">{item.name}</span>
              </a>
            ))}
          </nav>

          {/* Logout Button */}
          <div className="pt-4 border-t border-gray-200">
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full justify-start gap-3 text-red-600 border-red-200 hover:bg-red-50"
            >
              <span>🚪</span>
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Spacer for fixed header */}
      <div className="h-16"></div>
    </div>
  )
}
