"use client"

import { useState, useEffect } from "react"
import { Card } from "app/components/ui/card"
import { Button } from "app/components/ui/button"
import { LoadingSpinner } from "app/components/ui/loading-spinner"
import { CardSkeleton } from "app/components/ui/loading-skeleton"
import { MobileNav } from "app/components/ui/mobile-nav"
import { DesktopNav } from "app/components/ui/desktop-nav"
import { BackNav } from "app/components/ui/back-nav"
import { formatGHS, formatDate } from "app/lib/localization"

interface ReportData {
  summary: {
    orderTotal: string
    purchaseTotal: string
    orderCount: number
    purchaseCount: number
    netRevenue: string
    totalInventoryValue: string
    lowStockValue: string
  }
  orders: Array<{
    id: string
    title: string
    amount: string
    state: string
    createdAt: string
    customer: {
      name: string
      phone: string
    }
  }>
  purchases: Array<{
    id: string
    qty: number
    total: string
    date: string
    vendor: {
      name: string
    }
    item: {
      name: string
    }
  }>
  dateRange: {
    from: string
    to: string
  }
  // New metrics
  lowStockItems: Array<{
    id: string
    name: string
    currentQty: number
    reorderLevel: number
    unitPrice: string
    value: string
  }>
  overdueOrders: Array<{
    id: string
    title: string
    dueDate: string
    daysOverdue: number
    state: string
    amount: string
    customer: {
      name: string
      phone: string
    }
  }>
  extendedOrders: Array<{
    id: string
    title: string
    originalDueDate: string
    extendedEta: string
    state: string
    amount: string
    customer: {
      name: string
      phone: string
    }
  }>
  topSellingItems: Array<{
    name: string
    count: number
  }>
  inventoryMetrics: {
    totalItems: number
    lowStockCount: number
    overdueCount: number
    extendedCount: number
  }
}

export default function ReportsPage() {
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(false)
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0],
  })

  useEffect(() => {
    fetchReports()
  }, [dateRange])

  const fetchReports = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("authToken")
      if (!token) {
        console.error("No auth token found")
        return
      }

      const response = await fetch("/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          from: new Date(dateRange.from).toISOString(),
          to: new Date(dateRange.to + "T23:59:59").toISOString(),
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setReportData(data)
      } else {
        console.error("Failed to fetch reports:", response.status)
      }
    } catch (error) {
      console.error("Error fetching reports:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDateChange = (field: 'from' | 'to', value: string) => {
    setDateRange(prev => ({ ...prev, [field]: value }))
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

  if (loading && !reportData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MobileNav currentPage="reports" />
        <DesktopNav currentPage="reports" />
        
        <div className="mt-6 p-4 lg:p-6 space-y-4 lg:space-y-6">
          <BackNav />
          
          {/* Date Range Skeleton */}
          <Card className="p-3 lg:p-4">
            <div className="flex gap-3 lg:gap-4 items-center">
              <div className="h-10 bg-gray-200 rounded w-32 lg:w-40 animate-pulse"></div>
              <div className="h-10 bg-gray-200 rounded w-32 lg:w-40 animate-pulse"></div>
              <div className="h-10 bg-gray-200 rounded w-20 lg:w-24 animate-pulse"></div>
            </div>
          </Card>

          {/* Summary Cards Skeleton */}
          <div className="grid gap-3 lg:gap-4 grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="p-3 lg:p-4">
                <div className="space-y-2">
                  <div className="h-3 lg:h-4 bg-gray-200 rounded w-16 lg:w-20 animate-pulse"></div>
                  <div className="h-6 lg:h-8 bg-gray-200 rounded w-12 lg:w-16 animate-pulse"></div>
                </div>
              </Card>
            ))}
          </div>

          {/* Inventory Metrics Skeleton */}
          <div className="grid gap-3 lg:gap-4 grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="p-3 lg:p-4">
                <div className="space-y-2">
                  <div className="h-3 lg:h-4 bg-gray-200 rounded w-20 lg:w-24 animate-pulse"></div>
                  <div className="h-6 lg:h-8 bg-gray-200 rounded w-16 lg:w-20 animate-pulse"></div>
                </div>
              </Card>
            ))}
          </div>

          {/* Content Skeleton */}
          <div className="grid gap-3 lg:gap-4 grid-cols-1 lg:grid-cols-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <Card key={i} className="p-3 lg:p-4">
                <div className="h-5 lg:h-6 bg-gray-200 rounded w-24 lg:w-32 animate-pulse mb-3 lg:mb-4"></div>
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <div key={j} className="h-16 bg-gray-200 rounded animate-pulse"></div>
                  ))}
                </div>
              </Card>
            ))}
          </div>

          {/* New Metrics Skeleton */}
          <div className="space-y-4 lg:space-y-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="p-3 lg:p-4">
                <div className="h-5 lg:h-6 bg-gray-200 rounded w-32 lg:w-40 animate-pulse mb-3 lg:mb-4"></div>
                <div className="space-y-2">
                  {Array.from({ length: 2 }).map((_, j) => (
                    <div key={j} className="h-16 bg-gray-200 rounded animate-pulse"></div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MobileNav currentPage="reports" />
      <DesktopNav currentPage="reports" />
      
      <div className="mt-6 p-4 lg:p-6 space-y-4 lg:space-y-6">
        <BackNav />
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Reports</h1>
            <p className="text-gray-600 mt-1">View orders and purchases within date ranges</p>
          </div>
        </div>

        {/* Date Range Selector */}
        <Card className="p-3 lg:p-4">
          <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 items-start sm:items-center">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                <input
                  type="date"
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm lg:text-base"
                  value={dateRange.from}
                  onChange={(e) => handleDateChange('from', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                <input
                  type="date"
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm lg:text-base"
                  value={dateRange.to}
                  onChange={(e) => handleDateChange('to', e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-end">
              <Button 
                onClick={fetchReports} 
                disabled={loading}
                className="w-full sm:w-auto"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <LoadingSpinner size="sm" />
                    <span>Loading...</span>
                  </div>
                ) : (
                  "Refresh"
                )}
              </Button>
            </div>
          </div>
        </Card>

        {/* Summary Cards */}
        {reportData && (
          <div className="grid gap-3 lg:gap-4 grid-cols-2 lg:grid-cols-4">
            <Card className="p-3 lg:p-4 border-l-4 border-l-blue-500">
              <div className="text-xs lg:text-sm text-gray-600">Total Orders</div>
              <div className="text-lg lg:text-2xl font-bold text-blue-600">{reportData.summary.orderCount}</div>
              <div className="text-xs lg:text-sm text-gray-500">
                {formatGHS(reportData.summary.orderTotal)}
              </div>
            </Card>
            
            <Card className="p-3 lg:p-4 border-l-4 border-l-green-500">
              <div className="text-xs lg:text-sm text-gray-600">Total Purchases</div>
              <div className="text-lg lg:text-2xl font-bold text-green-600">{reportData.summary.purchaseCount}</div>
              <div className="text-xs lg:text-sm text-gray-500">
                {formatGHS(reportData.summary.purchaseTotal)}
              </div>
            </Card>
            
            <Card className="p-3 lg:p-4 border-l-4 border-l-purple-500">
              <div className="text-xs lg:text-sm text-gray-600">Net Revenue</div>
              <div className={`text-lg lg:text-2xl font-bold ${
                parseFloat(reportData.summary.netRevenue) >= 0 ? 'text-purple-600' : 'text-red-600'
              }`}>
                {formatGHS(reportData.summary.netRevenue)}
              </div>
            </Card>
            
            <Card className="p-3 lg:p-4 border-l-4 border-l-orange-500">
              <div className="text-xs lg:text-sm text-gray-600">Date Range</div>
              <div className="text-xs lg:text-sm text-gray-900">
                {formatDate(reportData.dateRange.from)} - {formatDate(reportData.dateRange.to)}
              </div>
            </Card>
          </div>
        )}

        {/* Inventory Metrics Cards */}
        {reportData && (
          <div className="grid gap-3 lg:gap-4 grid-cols-2 lg:grid-cols-4">
            <Card className="p-3 lg:p-4 border-l-4 border-l-indigo-500">
              <div className="text-xs lg:text-sm text-gray-600">Total Inventory Value</div>
              <div className="text-lg lg:text-2xl font-bold text-indigo-600">
                {formatGHS(reportData.summary.totalInventoryValue)}
              </div>
              <div className="text-xs lg:text-sm text-gray-500">
                {reportData.inventoryMetrics.totalItems} items
              </div>
            </Card>
            
            <Card className="p-3 lg:p-4 border-l-4 border-l-red-500">
              <div className="text-xs lg:text-sm text-gray-600">Low Stock Items</div>
              <div className="text-lg lg:text-2xl font-bold text-red-600">
                {reportData.inventoryMetrics.lowStockCount}
              </div>
              <div className="text-xs lg:text-sm text-gray-500">
                {formatGHS(reportData.summary.lowStockValue)} value
              </div>
            </Card>
            
            <Card className="p-3 lg:p-4 border-l-4 border-l-yellow-500">
              <div className="text-xs lg:text-sm text-gray-600">Overdue Orders</div>
              <div className="text-lg lg:text-2xl font-bold text-yellow-600">
                {reportData.inventoryMetrics.overdueCount}
              </div>
              <div className="text-xs lg:text-sm text-gray-500">
                Need attention
              </div>
            </Card>
            
            <Card className="p-3 lg:p-4 border-l-4 border-l-amber-500">
              <div className="text-xs lg:text-sm text-gray-600">Extended Orders</div>
              <div className="text-lg lg:text-2xl font-bold text-amber-600">
                {reportData.inventoryMetrics.extendedCount}
              </div>
              <div className="text-xs lg:text-sm text-gray-500">
                Past original due date
              </div>
            </Card>
          </div>
        )}

        {/* Orders and Purchases Lists */}
        {reportData && (
          <div className="grid gap-3 lg:gap-4 grid-cols-1 lg:grid-cols-2">
            {/* Orders List */}
            <Card className="p-3 lg:p-4">
              <h3 className="text-base lg:text-lg font-semibold mb-3 lg:mb-4">📋 Orders</h3>
              {reportData.orders.length === 0 ? (
                <p className="text-gray-500 text-sm lg:text-base">No orders in this date range</p>
              ) : (
                <div className="space-y-2 lg:space-y-3">
                  {reportData.orders.map((order) => (
                    <div key={order.id} className="flex justify-between items-center p-2 lg:p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-sm lg:text-base">{order.title}</div>
                        <div className="text-xs lg:text-sm text-gray-600">
                          {order.customer.name} • {order.customer.phone}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatDate(order.createdAt)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-sm lg:text-base">
                          {formatGHS(order.amount)}
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStateColor(order.state)}`}>
                          {order.state}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Purchases List */}
            <Card className="p-3 lg:p-4">
              <h3 className="text-base lg:text-lg font-semibold mb-3 lg:mb-4">🛒 Purchases</h3>
              {reportData.purchases.length === 0 ? (
                <p className="text-gray-500 text-sm lg:text-base">No purchases in this date range</p>
              ) : (
                <div className="space-y-2 lg:space-y-3">
                  {reportData.purchases.map((purchase) => (
                    <div key={purchase.id} className="flex justify-between items-center p-2 lg:p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-sm lg:text-base">{purchase.item.name}</div>
                        <div className="text-xs lg:text-sm text-gray-600">
                          {purchase.vendor.name} • Qty: {purchase.qty}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatDate(purchase.date)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-sm lg:text-base">
                          {formatGHS(purchase.total)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}

        {/* New Metrics Sections */}
        {reportData && (
          <div className="space-y-4 lg:space-y-6">
            {/* Low Stock Items */}
            <Card className="p-3 lg:p-4">
              <h3 className="text-base lg:text-lg font-semibold mb-3 lg:mb-4 text-red-700">
                ⚠️ Low Stock Items ({reportData.inventoryMetrics.lowStockCount})
              </h3>
              {reportData.lowStockItems.length === 0 ? (
                <p className="text-gray-500 text-sm lg:text-base">All items are well stocked!</p>
              ) : (
                <div className="space-y-2 lg:space-y-3">
                  {reportData.lowStockItems.map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-2 lg:p-3 bg-red-50 rounded-lg border border-red-200">
                      <div className="flex-1">
                        <div className="font-medium text-sm lg:text-base text-red-800">{item.name}</div>
                        <div className="text-xs lg:text-sm text-red-600">
                          Current: {item.currentQty} • Reorder Level: {item.reorderLevel}
                        </div>
                        <div className="text-xs text-red-500">
                          Unit Price: {formatGHS(item.unitPrice)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-sm lg:text-base text-red-800">
                          {formatGHS(parseFloat(item.value))}
                        </div>
                        <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
                          Low Stock
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Overdue Orders */}
            <Card className="p-3 lg:p-4">
              <h3 className="text-base lg:text-lg font-semibold mb-3 lg:mb-4 text-yellow-700">
                🚨 Overdue Orders ({reportData.inventoryMetrics.overdueCount})
              </h3>
              {reportData.overdueOrders.length === 0 ? (
                <p className="text-gray-500 text-sm lg:text-base">No overdue orders!</p>
              ) : (
                <div className="space-y-2 lg:space-y-3">
                  {reportData.overdueOrders.map((order) => (
                    <div key={order.id} className="flex justify-between items-center p-2 lg:p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="flex-1">
                        <div className="font-medium text-sm lg:text-base text-yellow-800">{order.title}</div>
                        <div className="text-xs lg:text-sm text-yellow-600">
                          {order.customer.name} • {order.customer.phone}
                        </div>
                        <div className="text-xs text-yellow-500">
                          Due: {formatDate(order.dueDate)} • {order.daysOverdue} days overdue
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-sm lg:text-base text-yellow-800">
                          {formatGHS(order.amount)}
                        </div>
                        <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                          {order.state}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Extended Orders */}
            <Card className="p-3 lg:p-4">
              <h3 className="text-base lg:text-lg font-semibold mb-3 lg:mb-4 text-amber-700">
                ⏰ Extended Orders ({reportData.inventoryMetrics.extendedCount})
              </h3>
              {reportData.extendedOrders.length === 0 ? (
                <p className="text-gray-500 text-sm lg:text-base">No extended orders!</p>
              ) : (
                <div className="space-y-2 lg:space-y-3">
                  {reportData.extendedOrders.map((order) => (
                    <div key={order.id} className="flex justify-between items-center p-2 lg:p-3 bg-amber-50 rounded-lg border border-amber-200">
                      <div className="flex-1">
                        <div className="font-medium text-sm lg:text-base text-amber-800">{order.title}</div>
                        <div className="text-xs lg:text-sm text-amber-600">
                          {order.customer.name} • {order.customer.phone}
                        </div>
                        <div className="text-xs text-amber-500">
                          Original: {formatDate(order.originalDueDate)} • Extended: {formatDate(order.extendedEta)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-sm lg:text-base text-amber-800">
                          {formatGHS(order.amount)}
                        </div>
                        <span className="px-2 py-1 text-xs rounded-full bg-amber-100 text-amber-800">
                          {order.state}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Top Selling Items */}
            <Card className="p-3 lg:p-4">
              <h3 className="text-base lg:text-lg font-semibold mb-3 lg:mb-4 text-blue-700">
                📊 Top Selling Items
              </h3>
              {reportData.topSellingItems.length === 0 ? (
                <p className="text-gray-500 text-sm lg:text-base">No sales data available</p>
              ) : (
                <div className="space-y-2 lg:space-y-3">
                  {reportData.topSellingItems.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-2 lg:p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex-1">
                        <div className="font-medium text-sm lg:text-base text-blue-800">
                          #{index + 1} {item.name}
                        </div>
                        <div className="text-xs lg:text-sm text-blue-600">
                          Total orders: {item.count}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                          {item.count} orders
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}

        {/* No Data Message */}
        {!loading && !reportData && (
          <Card className="p-8 text-center text-gray-500">
            <p>Select a date range to view reports</p>
          </Card>
        )}
      </div>
    </div>
  )
}
