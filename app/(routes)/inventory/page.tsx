"use client"

import { useState, useEffect, useMemo } from "react"
import { Card } from "app/components/ui/card"
import { Button } from "app/components/ui/button"
import { Badge } from "app/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "app/components/ui/dialog"
import { LoadingSpinner } from "app/components/ui/loading-spinner"
import { InventoryItemSkeleton, CardSkeleton } from "app/components/ui/loading-skeleton"
import { MobileNav } from "app/components/ui/mobile-nav"
import { DesktopNav } from "app/components/ui/desktop-nav"
import { BackNav } from "app/components/ui/back-nav"
import { formatGHS, formatDate } from "app/lib/localization"

interface Item {
  id: string
  name: string
  description?: string
  qty: number
  unitPrice: number | string
  reorderLevel: number
  vendor?: { name: string; phone: string }
  status: string
  value: string
}

interface Vendor {
  id: string
  name: string
  phone?: string
  _count: { items: number; purchases: number }
}

interface Purchase {
  id: string
  qty: number
  unitPrice: number | string
  total: number | string
  date: string
  vendor: { name: string }
  item: { name: string }
}

interface InventoryStatus {
  summary: {
    totalItems: number
    lowStockItems: number
    outOfStockItems: number
    totalValue: string
  }
  items: Item[]
  lowStockItems: Item[]
  recentPurchases: Purchase[]
  vendorSummary: Vendor[]
}

export default function InventoryPage() {
  const [inventoryData, setInventoryData] = useState<InventoryStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [showItemForm, setShowItemForm] = useState(false)
  const [showVendorForm, setShowVendorForm] = useState(false)
  const [showPurchaseForm, setShowPurchaseForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [submittingItem, setSubmittingItem] = useState(false)
  const [submittingVendor, setSubmittingVendor] = useState(false)
  const [submittingPurchase, setSubmittingPurchase] = useState(false)
  const [itemFormData, setItemFormData] = useState({
    name: "",
    description: "",
    qty: "",
    unitPrice: "",
    reorderLevel: "",
    vendorId: "",
  })
  const [vendorFormData, setVendorFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    notes: "",
  })
  const [purchaseFormData, setPurchaseFormData] = useState({
    vendorId: "",
    itemId: "",
    qty: "",
    unitPrice: "",
    date: "",
    notes: "",
  })
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [items, setItems] = useState<Item[]>([])

  useEffect(() => {
    fetchInventoryData()
    fetchVendors()
    fetchItems()
  }, [])

  // Filter inventory data based on search term
  const filteredInventoryData = useMemo(() => {
    if (!inventoryData || searchTerm.trim() === "") {
      return inventoryData
    }

    const searchLower = searchTerm.toLowerCase()
    
    const filteredItems = inventoryData.items.filter(item =>
      item.name.toLowerCase().includes(searchLower) ||
      (item.description && item.description.toLowerCase().includes(searchLower)) ||
      (item.vendor && item.vendor.name.toLowerCase().includes(searchLower))
    )

    const filteredLowStockItems = inventoryData.lowStockItems.filter(item =>
      item.name.toLowerCase().includes(searchLower) ||
      (item.description && item.description.toLowerCase().includes(searchLower)) ||
      (item.vendor && item.vendor.name.toLowerCase().includes(searchLower))
    )

    const filteredRecentPurchases = inventoryData.recentPurchases.filter(purchase =>
      purchase.item.name.toLowerCase().includes(searchLower) ||
      purchase.vendor.name.toLowerCase().includes(searchLower)
    )

    const filteredVendorSummary = inventoryData.vendorSummary.filter(vendor =>
      vendor.name.toLowerCase().includes(searchLower)
    )

    return {
      ...inventoryData,
      items: filteredItems,
      lowStockItems: filteredLowStockItems,
      recentPurchases: filteredRecentPurchases,
      vendorSummary: filteredVendorSummary,
      summary: {
        ...inventoryData.summary,
        totalItems: filteredItems.length,
        lowStockItems: filteredLowStockItems.length,
        outOfStockItems: filteredItems.filter(item => item.qty === 0).length,
        totalValue: filteredItems.reduce((sum, item) => sum + (item.qty * parseFloat(String(item.unitPrice))), 0).toFixed(2)
      }
    }
  }, [inventoryData, searchTerm])

  const fetchInventoryData = async () => {
    try {
      const token = localStorage.getItem("authToken")
      if (!token) {
        console.error("No auth token found for inventory data")
        return
      }

      console.log("Fetching inventory data...")
      const response = await fetch("/api/inventory/status", {
        headers: { Authorization: `Bearer ${token}` },
      })
      console.log("Inventory data response status:", response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log("Inventory data received:", data)
        setInventoryData(data)
      } else {
        const errorData = await response.json()
        console.error("Failed to fetch inventory data:", errorData)
      }
    } catch (error) {
      console.error("Failed to fetch inventory data:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchVendors = async () => {
    try {
      const token = localStorage.getItem("authToken")
      if (!token) {
        console.error("No auth token found for vendors")
        return
      }

      console.log("Fetching vendors...")
      const response = await fetch("/api/vendors", {
        headers: { Authorization: `Bearer ${token}` },
      })
      console.log("Vendors response status:", response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log("Vendors data received:", data)
        setVendors(data)
      } else {
        const errorData = await response.json()
        console.error("Failed to fetch vendors:", errorData)
      }
    } catch (error) {
      console.error("Failed to fetch vendors:", error)
    }
  }

  const fetchItems = async () => {
    try {
      const token = localStorage.getItem("authToken")
      if (!token) {
        console.error("No auth token found for items")
        return
      }

      console.log("Fetching items...")
      const response = await fetch("/api/items", {
        headers: { Authorization: `Bearer ${token}` },
      })
      console.log("Items response status:", response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log("Items data received:", data)
        setItems(data.items)
      } else {
        const errorData = await response.json()
        console.error("Failed to fetch items:", errorData)
      }
    } catch (error) {
      console.error("Failed to fetch items:", error)
    }
  }

  const handleItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Submitting item form with data:", itemFormData)
    
    // Basic validation
    if (!itemFormData.name.trim()) {
      alert("Item name is required")
      return
    }
    if (!itemFormData.qty || parseFloat(itemFormData.qty) < 0) {
      alert("Quantity must be a positive number")
      return
    }
    if (!itemFormData.unitPrice || parseFloat(itemFormData.unitPrice) < 0) {
      alert("Unit price must be a positive number")
      return
    }
    
    setSubmittingItem(true)
    try {
      const token = localStorage.getItem("authToken")
      if (!token) {
        alert("Please log in to create items")
        return
      }

      const response = await fetch("/api/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ...itemFormData,
          qty: parseFloat(itemFormData.qty),
          unitPrice: parseFloat(itemFormData.unitPrice),
          reorderLevel: parseFloat(itemFormData.reorderLevel),
        }),
      })

      if (response.ok) {
        const result = await response.json()
        console.log("Item created successfully:", result)
        setItemFormData({ name: "", description: "", qty: "", unitPrice: "", reorderLevel: "", vendorId: "" })
        setShowItemForm(false)
        fetchInventoryData()
        fetchItems()
        alert("Item created successfully!")
      } else {
        const errorData = await response.json()
        console.error("Item creation failed:", errorData)
        alert(`Failed to create item: ${errorData.message || "Unknown error"}`)
      }
    } catch (error) {
      console.error("Failed to create item:", error)
      alert(`Error creating item: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setSubmittingItem(false)
    }
  }

  const handleVendorSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Submitting vendor form with data:", vendorFormData)
    
    // Basic validation
    if (!vendorFormData.name.trim()) {
      alert("Vendor name is required")
      return
    }
    if (!vendorFormData.phone.trim()) {
      alert("Vendor phone number is required")
      return
    }
    
    setSubmittingVendor(true)
    try {
      const token = localStorage.getItem("authToken")
      if (!token) {
        alert("Please log in to create vendors")
        return
      }

      const response = await fetch("/api/vendors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` },
        body: JSON.stringify(vendorFormData),
      })

      if (response.ok) {
        const result = await response.json()
        console.log("Vendor created successfully:", result)
        setVendorFormData({ name: "", phone: "", email: "", address: "", notes: "" })
        setShowVendorForm(false)
        fetchVendors()
        fetchInventoryData()
        alert("Vendor created successfully!")
      } else {
        const errorData = await response.json()
        console.error("Vendor creation failed:", errorData)
        alert(`Failed to create vendor: ${errorData.message || "Unknown error"}`)
      }
    } catch (error) {
      console.error("Failed to create vendor:", error)
      alert(`Error creating vendor: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setSubmittingVendor(false)
    }
  }

  const handlePurchaseSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Submitting purchase form with data:", purchaseFormData)
    
    // Basic validation
    if (!purchaseFormData.vendorId) {
      alert("Please select a vendor")
      return
    }
    if (!purchaseFormData.itemId) {
      alert("Please select an item")
      return
    }
    if (!purchaseFormData.qty || parseFloat(purchaseFormData.qty) <= 0) {
      alert("Quantity must be a positive number")
      return
    }
    if (!purchaseFormData.unitPrice || parseFloat(purchaseFormData.unitPrice) < 0) {
      alert("Unit price must be a positive number")
      return
    }
    if (!purchaseFormData.date) {
      alert("Purchase date is required")
      return
    }
    
    setSubmittingPurchase(true)
    try {
      const token = localStorage.getItem("authToken")
      if (!token) {
        alert("Please log in to record purchases")
        return
      }

      const response = await fetch("/api/purchases", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ...purchaseFormData,
          qty: parseFloat(purchaseFormData.qty),
          unitPrice: parseFloat(purchaseFormData.unitPrice),
        }),
      })

      if (response.ok) {
        const result = await response.json()
        console.log("Purchase recorded successfully:", result)
        setPurchaseFormData({ vendorId: "", itemId: "", qty: "", unitPrice: "", date: "", notes: "" })
        setShowPurchaseForm(false)
        fetchInventoryData()
        alert("Purchase recorded successfully!")
      } else {
        const errorData = await response.json()
        console.error("Purchase recording failed:", errorData)
        alert(`Failed to record purchase: ${errorData.message || "Unknown error"}`)
      }
    } catch (error) {
      console.error("Failed to record purchase:", error)
      alert(`Error recording purchase: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setSubmittingPurchase(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "OUT_OF_STOCK":
        return "bg-red-100 text-red-800"
      case "LOW_STOCK":
        return "bg-yellow-100 text-yellow-800"
      case "IN_STOCK":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }



  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MobileNav currentPage="inventory" />
        <DesktopNav currentPage="inventory" />
        
        <div className="mt-6 p-4 lg:p-6 space-y-4 lg:space-y-6">
          <BackNav />
          {/* Search Bar Skeleton */}
          <Card className="p-3 lg:p-4">
            <div className="flex gap-3 lg:gap-4 items-center">
              <div className="flex-1 h-10 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-16 lg:w-20 animate-pulse"></div>
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

          {/* Inventory Items Skeleton */}
          <Card className="p-3 lg:p-4">
            <div className="h-5 lg:h-6 bg-gray-200 rounded w-24 lg:w-32 animate-pulse mb-3 lg:mb-4"></div>
            <div className="grid gap-3 lg:gap-4 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <InventoryItemSkeleton key={i} />
              ))}
            </div>
          </Card>

          {/* Vendors Skeleton */}
          <Card className="p-3 lg:p-4">
            <div className="h-5 lg:h-6 bg-gray-200 rounded w-16 lg:w-20 animate-pulse mb-3 lg:mb-4"></div>
            <div className="grid gap-3 lg:gap-4 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          </Card>
        </div>
      </div>
    )
  }

  if (!inventoryData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MobileNav currentPage="inventory" />
        <DesktopNav currentPage="inventory" />
        <div className="p-6">
          <div className="text-center text-red-600">Failed to load inventory data</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MobileNav currentPage="inventory" />
      <DesktopNav currentPage="inventory" />
      
      <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
        <BackNav />
        {/* Action Buttons - Mobile Stacked, Desktop Horizontal */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Button onClick={() => setShowItemForm(true)} className="w-full sm:w-auto">
            Add Item
          </Button>
          <Button onClick={() => setShowVendorForm(true)} variant="outline" className="w-full sm:w-auto">
            Add Vendor
          </Button>
          <Button onClick={() => setShowPurchaseForm(true)} variant="outline" className="w-full sm:w-auto">
            Record Purchase
          </Button>
        </div>

        {/* Search Bar */}
        <Card className="p-3 lg:p-4">
          <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 items-start sm:items-center">
            <div className="flex-1 flex items-center border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-indigo-500">
              <div className="pl-3 pr-2 flex items-center">
                <span className="text-gray-600 text-lg font-bold">🔍</span>
              </div>
              <input
                type="text"
                placeholder="Search inventory..."
                className="flex-1 py-2 pr-3 border-none outline-none focus:ring-0 text-sm lg:text-base"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="text-xs lg:text-sm text-gray-600">
                {filteredInventoryData?.summary.totalItems || 0} of {inventoryData?.summary.totalItems || 0} items
              </div>
              {searchTerm.trim() !== "" && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="px-2 lg:px-3 py-1 lg:py-2 text-xs lg:text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </Card>

        {/* Inventory Summary Cards */}
        <div className="grid gap-3 lg:gap-4 grid-cols-2 lg:grid-cols-4">
          <Card className="p-3 lg:p-4 border-l-4 border-l-blue-500">
            <div className="text-xs lg:text-sm text-gray-600">Total Items</div>
            <div className="text-lg lg:text-2xl font-bold text-blue-600">{filteredInventoryData?.summary.totalItems || 0}</div>
          </Card>
          <Card className="p-3 lg:p-4 border-l-4 border-l-yellow-500">
            <div className="text-xs lg:text-sm text-gray-600">Low Stock</div>
            <div className="text-lg lg:text-2xl font-bold text-yellow-600">{filteredInventoryData?.summary.lowStockItems || 0}</div>
          </Card>
          <Card className="p-3 lg:p-4 border-l-4 border-l-red-500">
            <div className="text-xs lg:text-sm text-gray-600">Out of Stock</div>
            <div className="text-lg lg:text-2xl font-bold text-red-600">{filteredInventoryData?.summary.outOfStockItems || 0}</div>
          </Card>
          <Card className="p-3 lg:p-4 border-l-4 border-l-green-500">
            <div className="text-xs lg:text-sm text-gray-600">Total Value</div>
            <div className="text-lg lg:text-2xl font-bold text-green-600">{formatGHS(filteredInventoryData?.summary.totalValue || "0.00")}</div>
          </Card>
        </div>

        {/* Low Stock Alerts */}
        {filteredInventoryData?.lowStockItems && filteredInventoryData.lowStockItems.length > 0 && (
          <Card className="p-3 lg:p-4">
            <div className="flex items-center justify-between mb-3 lg:mb-4">
              <h3 className="text-base lg:text-lg font-semibold text-amber-700">⚠️ Low Stock Alerts</h3>
              <Badge className="bg-amber-100 text-amber-800 text-xs lg:text-sm">
                {filteredInventoryData.lowStockItems.length}
              </Badge>
            </div>
            <div className="grid gap-3 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
              {filteredInventoryData.lowStockItems.map((item) => (
                <div key={item.id} className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="font-medium text-gray-900">{item.name}</div>
                  <div className="text-sm text-gray-600">
                    Current: {item.qty} | Reorder Level: {item.reorderLevel}
                  </div>
                  <div className="text-sm text-gray-500">
                    Value: {formatGHS(item.value)} | Vendor: {item.vendor?.name || "None"}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Inventory Items */}
        <Card className="p-3 lg:p-4">
          <h3 className="text-base lg:text-lg font-semibold mb-3 lg:mb-4">📦 Inventory Items</h3>
          <div className="grid gap-3 lg:gap-4 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
            {filteredInventoryData?.items && filteredInventoryData.items.map((item) => (
              <div key={item.id} className="p-3 lg:p-4 border rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-sm lg:text-base">{item.name}</h4>
                  <Badge className={`text-xs lg:text-sm ${getStatusColor(item.status)}`}>
                    {item.status.replace("_", " ")}
                  </Badge>
                </div>
                {item.description && (
                  <p className="text-xs lg:text-sm text-gray-600 mb-2">{item.description}</p>
                )}
                <div className="space-y-1 text-xs lg:text-sm">
                  <div>Quantity: {item.qty}</div>
                                      <div>Unit Price: {formatGHS(item.unitPrice)}</div>
                  <div>Total Value: {formatGHS(item.value)}</div>
                  <div>Reorder Level: {item.reorderLevel}</div>
                  {item.vendor && (
                    <div>Vendor: {item.vendor.name}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Purchases */}
        <Card className="p-3 lg:p-4">
          <h3 className="text-base lg:text-lg font-semibold mb-3 lg:mb-4">🛒 Recent Purchases</h3>
          {!filteredInventoryData?.recentPurchases || filteredInventoryData.recentPurchases.length === 0 ? (
            <p className="text-gray-500 text-sm lg:text-base">No recent purchases</p>
          ) : (
            <div className="space-y-2 lg:space-y-3">
              {filteredInventoryData.recentPurchases.map((purchase) => (
                <div key={purchase.id} className="flex justify-between items-center p-2 lg:p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-sm lg:text-base">{purchase.item.name}</div>
                    <div className="text-xs lg:text-sm text-gray-600">
                      {purchase.qty} × {formatGHS(purchase.unitPrice)} = {formatGHS(purchase.total)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs lg:text-sm text-gray-600">{purchase.vendor.name}</div>
                    <div className="text-xs text-gray-500">
                                              {formatDate(purchase.date)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Vendor Summary */}
        <Card className="p-3 lg:p-4">
          <h3 className="text-base lg:text-lg font-semibold mb-3 lg:mb-4">🏢 Vendors</h3>
          <div className="grid gap-3 lg:gap-4 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
            {filteredInventoryData?.vendorSummary && filteredInventoryData.vendorSummary.map((vendor) => (
              <div key={vendor.id} className="p-3 lg:p-4 border rounded-lg">
                <h4 className="font-medium mb-2 text-sm lg:text-base">{vendor.name}</h4>
                <div className="space-y-1 text-xs lg:text-sm text-gray-600">
                  <div>Items: {vendor._count.items}</div>
                  <div>Purchases: {vendor._count.purchases}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Item Creation Dialog */}
        <Dialog open={showItemForm} onOpenChange={setShowItemForm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Item</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleItemSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name *</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={itemFormData.name}
                  onChange={(e) => setItemFormData({ ...itemFormData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
                  value={itemFormData.description}
                  onChange={(e) => setItemFormData({ ...itemFormData, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Quantity *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={itemFormData.qty}
                    onChange={(e) => setItemFormData({ ...itemFormData, qty: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Unit Price *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={itemFormData.unitPrice}
                    onChange={(e) => setItemFormData({ ...itemFormData, unitPrice: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Reorder Level *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={itemFormData.reorderLevel}
                    onChange={(e) => setItemFormData({ ...itemFormData, reorderLevel: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Vendor</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={itemFormData.vendorId}
                    onChange={(e) => setItemFormData({ ...itemFormData, vendorId: e.target.value })}
                  >
                    <option value="">Select vendor</option>
                    {vendors.map((vendor) => (
                      <option key={vendor.id} value={vendor.id}>
                        {vendor.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={submittingItem}>
                  {submittingItem ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Creating...</span>
                    </div>
                  ) : (
                    "Create Item"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowItemForm(false)}
                  disabled={submittingItem}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Vendor Creation Dialog */}
        <Dialog open={showVendorForm} onOpenChange={setShowVendorForm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Vendor</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleVendorSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name *</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={vendorFormData.name}
                  onChange={(e) => setVendorFormData({ ...vendorFormData, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <input
                    type="tel"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={vendorFormData.phone}
                    onChange={(e) => setVendorFormData({ ...vendorFormData, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={vendorFormData.email}
                    onChange={(e) => setVendorFormData({ ...vendorFormData, email: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Address</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={2}
                  value={vendorFormData.address}
                  onChange={(e) => setVendorFormData({ ...vendorFormData, address: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
                  value={vendorFormData.notes}
                  onChange={(e) => setVendorFormData({ ...vendorFormData, notes: e.target.value })}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={submittingVendor}>
                  {submittingVendor ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Creating...</span>
                    </div>
                  ) : (
                    "Create Vendor"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowVendorForm(false)}
                  disabled={submittingVendor}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Purchase Recording Dialog */}
        <Dialog open={showPurchaseForm} onOpenChange={setShowPurchaseForm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record Purchase</DialogTitle>
            </DialogHeader>
            <form onSubmit={handlePurchaseSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Vendor *</label>
                  <select
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={purchaseFormData.vendorId}
                    onChange={(e) => setPurchaseFormData({ ...purchaseFormData, vendorId: e.target.value })}
                  >
                    <option value="">Select vendor</option>
                    {vendors.map((vendor) => (
                      <option key={vendor.id} value={vendor.id}>
                        {vendor.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Item *</label>
                  <select
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={purchaseFormData.itemId}
                    onChange={(e) => setPurchaseFormData({ ...purchaseFormData, itemId: e.target.value })}
                  >
                    <option value="">Select item</option>
                    {items.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Quantity *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={purchaseFormData.qty}
                    onChange={(e) => setPurchaseFormData({ ...purchaseFormData, qty: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Unit Price *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={purchaseFormData.unitPrice}
                    onChange={(e) => setPurchaseFormData({ ...purchaseFormData, unitPrice: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Purchase Date *</label>
                <input
                  type="date"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={purchaseFormData.date}
                  onChange={(e) => setPurchaseFormData({ ...purchaseFormData, date: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
                  value={purchaseFormData.notes}
                  onChange={(e) => setPurchaseFormData({ ...purchaseFormData, notes: e.target.value })}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={submittingPurchase}>
                  {submittingPurchase ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Recording...</span>
                    </div>
                  ) : (
                    "Record Purchase"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowPurchaseForm(false)}
                  disabled={submittingPurchase}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* No Search Results Message */}
        {searchTerm.trim() !== "" && filteredInventoryData && 
         filteredInventoryData.items.length === 0 && 
         filteredInventoryData.vendorSummary.length === 0 && (
          <Card className="p-8 text-center text-gray-500">
            <p>No inventory items or vendors found matching "{searchTerm}"</p>
          </Card>
        )}
      </div>
    </div>
  )
}
