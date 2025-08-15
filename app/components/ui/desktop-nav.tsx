"use client"

import { Button } from "./button"

interface DesktopNavProps {
  currentPage?: string
}

export function DesktopNav({ currentPage = "dashboard" }: DesktopNavProps) {
  const handleLogout = () => {
    localStorage.removeItem("authToken")
    window.location.href = "/login"
  }

  return (
    <div className="hidden lg:block">
      <div className="flex justify-between items-center px-6 lg:px-8 xl:px-12 py-4">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-indigo-600">InSightify</h1>
            <p className="text-lg text-gray-600 font-medium">Fashion</p>
          </div>
          <div className="h-8 w-px bg-gray-300"></div>
          <h2 className="text-2xl font-bold text-gray-800 capitalize">
            {currentPage}
          </h2>
        </div>
        <div className="flex gap-4">
          <a
            href="/customers"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Customers
          </a>
          <a
            href="/orders"
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            Orders
          </a>
          <a
            href="/inventory"
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
          >
            Inventory
          </a>
          <a
            href="/reports"
            className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors"
          >
            Reports
          </a>
          <Button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700"
          >
            Logout
          </Button>
        </div>
      </div>
    </div>
  )
}
