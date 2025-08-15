"use client"

import { useState, useEffect } from "react"
import { Card } from "app/components/ui/card"
import { Badge } from "app/components/ui/badge"
import { LoadingSpinner } from "app/components/ui/loading-spinner"
import { CardSkeleton, OrderSkeleton } from "app/components/ui/loading-skeleton"
import { MobileNav } from "app/components/ui/mobile-nav"
import { DesktopNav } from "app/components/ui/desktop-nav"
import { formatGHS, formatDate, formatDateTime } from "app/lib/localization"

interface DashboardData {
  stats: {
    open: number
    extended: number
    closedThisMonth: number
    pickedUp: number
  }
  dueSoon: Array<{
    id: string
    jobNumber: number
    title: string
    dueDate: string
    amount: string
    customer: { name: string; phone: string }
  }>
  overdue: Array<{
    id: string
    jobNumber: number
    title: string
    dueDate: string
    amount: string
    customer: { name: string; phone: string }
  }>
  recentOrders: Array<{
    id: string
    jobNumber: number
    title: string
    state: string
    createdAt: string
    customer: { name: string }
  }>
  monthlyRevenue: string
}

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const token = localStorage.getItem("authToken")
    if (!token) {
      window.location.href = "/login"
      return
    }

    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("authToken")
      if (!token) return

      const response = await fetch("/api/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setDashboardData(data)
      } else {
        setError("Failed to fetch dashboard data")
      }
    } catch (error) {
      setError("Error fetching dashboard data")
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("authToken")
    window.location.href = "/login"
  }

  const getUrgencyColor = (dueDate: string) => {
    const due = new Date(dueDate)
    const now = new Date()
    const hoursUntilDue = (due.getTime() - now.getTime()) / (1000 * 60 * 60)
    
    if (hoursUntilDue < 0) return "text-red-600" // Overdue
    if (hoursUntilDue < 24) return "text-orange-600" // Due today
    if (hoursUntilDue < 48) return "text-yellow-600" // Due tomorrow
    return "text-blue-600" // Due later
  }

  const getStateColor = (state: string) => {
    switch (state) {
      case "OPEN":
        return "bg-blue-100 text-blue-800"
      case "EXTENDED":
        return "bg-yellow-100 text-yellow-800"
      case "CLOSED":
        return "bg-green-100 text-green-800"
      case "PICKED_UP":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MobileNav currentPage="dashboard" />
        <DesktopNav currentPage="dashboard" />
        
        <div className="mt-6 p-4 lg:p-6 space-y-4 lg:space-y-6">
          {/* Metrics Cards Skeleton */}
          <div className="grid gap-3 lg:gap-4 grid-cols-2 lg:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Card key={i} className="p-3 lg:p-4">
                <div className="space-y-2">
                  <div className="h-3 lg:h-4 bg-gray-200 rounded w-16 lg:w-20 animate-pulse"></div>
                  <div className="h-6 lg:h-8 bg-gray-200 rounded w-12 lg:w-16 animate-pulse"></div>
                </div>
              </Card>
            ))}
          </div>

          {/* Content Sections Skeleton */}
          <div className="grid gap-4 lg:gap-6 grid-cols-1 lg:grid-cols-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <Card key={i} className="p-3 lg:p-4">
                <div className="space-y-3 lg:space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="h-5 lg:h-6 bg-gray-200 rounded w-24 lg:w-32 animate-pulse"></div>
                    <div className="h-5 lg:h-6 bg-gray-200 rounded w-6 lg:w-8 animate-pulse"></div>
                  </div>
                  <div className="space-y-2 lg:space-y-3">
                    {Array.from({ length: 3 }).map((_, j) => (
                      <OrderSkeleton key={j} />
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-red-600">Error: {error}</div>
      </div>
    )
  }

  if (!dashboardData) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MobileNav currentPage="dashboard" />
      <DesktopNav currentPage="dashboard" />
      
              <div className="mt-6 p-4 lg:p-6 space-y-4 lg:space-y-6">
          {/* Key Metrics Cards */}
          <div className="grid gap-3 lg:gap-4 grid-cols-2 lg:grid-cols-5">
          <Card className="p-3 lg:p-4 border-l-4 border-l-blue-500">
            <div className="text-xs lg:text-sm text-gray-600">Open Orders</div>
            <div className="text-lg lg:text-2xl font-bold text-blue-600">{dashboardData.stats.open}</div>
          </Card>
          <Card className="p-3 lg:p-4 border-l-4 border-l-yellow-500">
            <div className="text-xs lg:text-sm text-gray-600">Extended</div>
            <div className="text-lg lg:text-2xl font-bold text-yellow-600">{dashboardData.stats.extended}</div>
          </Card>
          <Card className="p-3 lg:p-4 border-l-4 border-l-green-500">
            <div className="text-xs lg:text-sm text-gray-600">Closed (Month)</div>
            <div className="text-lg lg:text-2xl font-bold text-green-600">{dashboardData.stats.closedThisMonth}</div>
          </Card>
          <Card className="p-3 lg:p-4 border-l-4 border-l-purple-500">
            <div className="text-xs lg:text-sm text-gray-600">Picked Up</div>
            <div className="text-lg lg:text-2xl font-bold text-purple-600">{dashboardData.stats.pickedUp}</div>
          </Card>
          <Card className="p-3 lg:p-4 border-l-4 border-l-emerald-500">
            <div className="text-xs lg:text-sm text-gray-600">Monthly Revenue</div>
            <div className="text-lg lg:text-2xl font-bold text-emerald-600">
              {formatGHS(dashboardData.monthlyRevenue)}
            </div>
          </Card>
        </div>

        {/* Operational Awareness Section */}
        <div className="grid gap-4 lg:gap-6 grid-cols-1 lg:grid-cols-2">
          {/* Due Soon Orders */}
        <Card className="p-3 lg:p-4">
          <div className="flex items-center justify-between mb-3 lg:mb-4">
            <h3 className="text-base lg:text-lg font-semibold text-amber-700">⚠️ Due Soon (≤48h)</h3>
            <Badge className="bg-amber-100 text-amber-800 text-xs lg:text-sm">
              {dashboardData.dueSoon.length}
            </Badge>
          </div>
          {dashboardData.dueSoon.length === 0 ? (
            <p className="text-gray-500">No orders due soon</p>
          ) : (
            <ul className="space-y-3">
              {dashboardData.dueSoon.map((order) => (
                <li key={order.id} className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        #{order.jobNumber} - {order.title}
                      </div>
                      <div className="text-sm text-gray-600">
                        Customer: {order.customer.name} ({order.customer.phone})
                      </div>
                      <div className="text-sm text-gray-500">
                        Amount: {formatGHS(order.amount)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-medium ${getUrgencyColor(order.dueDate)}`}>
                        Due: {formatDate(order.dueDate)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(order.dueDate).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Overdue Orders */}
        <Card className="p-3 lg:p-4">
          <div className="flex items-center justify-between mb-3 lg:mb-4">
            <h3 className="text-base lg:text-lg font-semibold text-red-700">🚨 Overdue Orders</h3>
            <Badge className="bg-red-100 text-red-800 text-xs lg:text-sm">
              {dashboardData.overdue.length}
            </Badge>
          </div>
          {dashboardData.overdue.length === 0 ? (
            <p className="text-gray-500">No overdue orders</p>
          ) : (
            <ul className="space-y-3">
              {dashboardData.overdue.map((order) => (
                <li key={order.id} className="p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        #{order.jobNumber} - {order.title}
                      </div>
                      <div className="text-sm text-gray-600">
                        Customer: {order.customer.name} ({order.customer.phone})
                      </div>
                      <div className="text-sm text-gray-500">
                        Amount: {formatGHS(order.amount)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-red-600">
                        Overdue: {formatDate(order.dueDate)}
                      </div>
                      <div className="text-xs text-red-500">
                        {Math.ceil((new Date().getTime() - new Date(order.dueDate).getTime()) / (1000 * 60 * 60 * 24))} days late
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

        {/* Recent Activity */}
        <Card className="p-3 lg:p-4">
          <h3 className="text-base lg:text-lg font-semibold mb-3 lg:mb-4">📋 Recent Activity</h3>
          {dashboardData.recentOrders.length === 0 ? (
            <p className="text-gray-500">No recent orders</p>
          ) : (
            <div className="space-y-3">
              {dashboardData.recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="text-lg">#{order.jobNumber}</div>
                    <div>
                      <div className="font-medium">{order.title}</div>
                      <div className="text-sm text-gray-600">
                        Customer: {order.customer.name}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={getStateColor(order.state)}>
                      {order.state}
                    </Badge>
                    <div className="text-xs text-gray-500 mt-1">
                      {formatDate(order.createdAt)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}