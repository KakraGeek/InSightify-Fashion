"use client"

import { useState, useEffect } from "react"
import { Card } from "app/components/ui/card"
import { Button } from "app/components/ui/button"
import { Badge } from "app/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "app/components/ui/dialog"
import { FileUpload } from "app/components/ui/file-upload"
import { LoadingSpinner } from "app/components/ui/loading-spinner"
import { OrderSkeleton, CardSkeleton } from "app/components/ui/loading-skeleton"
import { LoadingButton } from "app/components/ui/loading-progress"
import { MobileNav } from "app/components/ui/mobile-nav"
import { DesktopNav } from "app/components/ui/desktop-nav"
import { BackNav } from "app/components/ui/back-nav"
import { formatGHS, formatDate } from "app/lib/localization"

interface Order {
  id: string
  jobNumber: number
  title: string
  state: string
  dueDate: string
  amount: number | string // Can be number or string (from Prisma Decimal)
  customer: {
    name: string
    phone: string
  }
  createdAt: string
}

interface Customer {
  id: string
  name: string
  phone: string
}

interface UploadedFile {
  id: string
  file: File
  description: string
  category: string
  preview?: string
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [formData, setFormData] = useState({
    customerId: "",
    title: "",
    dueDate: "",
    amount: "",
  })
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [stateChangeData, setStateChangeData] = useState({
    newState: "",
    extendedEta: "",
    notes: "",
  })

  useEffect(() => {
    fetchOrders()
    fetchCustomers()
  }, [])

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredOrders(orders)
    } else {
      const filtered = orders.filter(order =>
        order.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.jobNumber.toString().includes(searchTerm) ||
        order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer.phone.includes(searchTerm) ||
        order.state.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredOrders(filtered)
    }
  }, [searchTerm, orders])

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("authToken")
      if (!token) return

      const response = await fetch("/api/orders", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setOrders(data)
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem("authToken")
      if (!token) return

      const response = await fetch("/api/customers", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setCustomers(data)
      }
    } catch (error) {
      console.error("Failed to fetch customers:", error)
    }
  }

  const handleFileChange = (files: UploadedFile[]) => {
    setUploadedFiles(files)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Form submitted with data:", formData)
    try {
      const token = localStorage.getItem("authToken")
      if (!token) {
        console.error("No auth token found")
        return
      }

      // First, create the order
      console.log("Making API call to create order...")
      const orderResponse = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
        }),
      })
      
      console.log("Order creation response status:", orderResponse.status)

      if (orderResponse.ok) {
        const orderData = await orderResponse.json()
        console.log("Order created successfully:", orderData)
        
        // If there are files to upload, upload them
        if (uploadedFiles.length > 0) {
          const formData = new FormData()
          formData.append("orderId", orderData.id)
          
          uploadedFiles.forEach((file, index) => {
            formData.append("files", file.file)
            formData.append("descriptions", file.description)
            formData.append("categories", file.category)
          })

          try {
            const uploadResponse = await fetch("/api/orders/upload", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
              },
              body: formData,
            })

            if (uploadResponse.ok) {
              console.log("Files uploaded successfully")
            } else {
              console.error("File upload failed")
            }
          } catch (uploadError) {
            console.error("File upload error:", uploadError)
          }
        }

        // Reset form and refresh orders
        setFormData({ customerId: "", title: "", dueDate: "", amount: "" })
        setUploadedFiles([])
        setShowForm(false)
        fetchOrders()
        alert("Order created successfully!")
      } else {
        const errorData = await orderResponse.json()
        console.error("Order creation failed:", errorData)
        alert(`Failed to create order: ${errorData.message || "Unknown error"}`)
      }
    } catch (error) {
      console.error("Failed to create order:", error)
      alert(`Error creating order: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  const handleStateChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedOrder) return

    try {
      const token = localStorage.getItem("authToken")
      if (!token) return

      const response = await fetch(`/api/orders/${selectedOrder.id}/state`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(stateChangeData),
      })

      if (response.ok) {
        setStateChangeData({ newState: "", extendedEta: "", notes: "" })
        setSelectedOrder(null)
        fetchOrders()
      }
    } catch (error) {
      console.error("Failed to update order state:", error)
    }
  }

  const getAvailableStates = (currentState: string) => {
    const validTransitions = {
      OPEN: ["EXTENDED", "CLOSED"],
      EXTENDED: ["OPEN", "CLOSED"],
      CLOSED: ["PICKED_UP"],
      PICKED_UP: []
    }
    return validTransitions[currentState as keyof typeof validTransitions] || []
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
        <MobileNav currentPage="orders" />
        <DesktopNav currentPage="orders" />
        
        <div className="mt-6 p-4 lg:p-6 space-y-4 lg:space-y-6">
          <BackNav />
          {/* Search Bar Skeleton */}
          <Card className="p-3 lg:p-4">
            <div className="flex gap-3 lg:gap-4 items-center">
              <div className="flex-1 h-10 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-16 lg:w-20 animate-pulse"></div>
            </div>
          </Card>

          {/* Orders Skeleton */}
          <div className="space-y-3 lg:space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <OrderSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MobileNav currentPage="orders" />
      <DesktopNav currentPage="orders" />
      
      <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
        <BackNav />
        {/* Action Buttons - Mobile Stacked, Desktop Horizontal */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Button onClick={() => setShowForm(true)} className="w-full sm:w-auto">
            Create Order
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
                placeholder="Search orders..."
                className="flex-1 py-2 pr-3 border-none outline-none focus:ring-0 text-sm lg:text-base"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="text-xs lg:text-sm text-gray-600">
                {filteredOrders.length} of {orders.length} orders
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

        {/* Order Form */}
        {showForm && (
        <Card className="p-3 lg:p-6">
          <h2 className="text-base lg:text-lg font-semibold mb-3 lg:mb-4">Create New Order</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Customer *</label>
              <select
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={formData.customerId}
                onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
              >
                <option value="">Select a customer</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} - {customer.phone}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Title *</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Due Date *</label>
              <input
                type="date"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Amount *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              />
            </div>
            
            {/* File Upload Section */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Attachments (Fabric Samples, Sketches, etc.)
              </label>
              <FileUpload
                onFilesChange={handleFileChange}
                maxFiles={10}
                acceptedTypes={["image/jpeg", "image/jpg", "image/png"]}
                maxSize={10}
              />
            </div>
            
            <div className="flex gap-2">
              <Button type="submit">Create Order</Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* State Change Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Order State</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleStateChange} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Current State</label>
              <div className="p-2 bg-gray-100 rounded">
                <Badge className={getStateColor(selectedOrder?.state || "")}>
                  {selectedOrder?.state}
                </Badge>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">New State *</label>
              <select
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={stateChangeData.newState}
                onChange={(e) => setStateChangeData({ ...stateChangeData, newState: e.target.value })}
              >
                <option value="">Select new state</option>
                {selectedOrder && getAvailableStates(selectedOrder.state).map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>
            {stateChangeData.newState === "EXTENDED" && (
              <div>
                <label className="block text-sm font-medium mb-1">Extended ETA *</label>
                <input
                  type="date"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={stateChangeData.extendedEta}
                  onChange={(e) => setStateChangeData({ ...stateChangeData, extendedEta: e.target.value })}
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-1">Notes</label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={3}
                value={stateChangeData.notes}
                onChange={(e) => setStateChangeData({ ...stateChangeData, notes: e.target.value })}
                placeholder="Optional notes about this state change..."
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit">Update State</Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setSelectedOrder(null)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

        {/* Orders List */}
        <div className="grid gap-3 lg:gap-4">
          {filteredOrders.map((order) => (
            <Card key={order.id} className="p-3 lg:p-4">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <h3 className="font-semibold text-sm lg:text-base">#{order.jobNumber} - {order.title}</h3>
                    <Badge className={`text-xs lg:text-sm ${getStateColor(order.state)}`}>
                      {order.state}
                    </Badge>
                  </div>
                  <p className="text-gray-600 text-xs lg:text-sm">
                    Customer: {order.customer.name} ({order.customer.phone})
                  </p>
                  <p className="text-gray-500 text-xs lg:text-sm">
                      Due: {formatDate(order.dueDate)} | 
                                            Amount: {formatGHS(order.amount)}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="text-xs text-gray-400">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                  {order.state !== "PICKED_UP" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedOrder(order)}
                    >
                      Change State
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
          {filteredOrders.length === 0 && searchTerm.trim() !== "" && (
            <Card className="p-8 text-center text-gray-500">
              No orders found matching "{searchTerm}"
            </Card>
          )}
          {filteredOrders.length === 0 && searchTerm.trim() === "" && orders.length === 0 && (
            <Card className="p-8 text-center text-gray-500">
              No orders yet. Create your first order to get started.
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}