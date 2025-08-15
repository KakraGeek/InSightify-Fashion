"use client"

import { useState, useEffect } from "react"
import { Card } from "app/components/ui/card"
import { Button } from "app/components/ui/button"
import { useRouter } from "next/navigation"
import { LoadingSpinner } from "app/components/ui/loading-spinner"
import { CustomerSkeleton, OrderSkeleton } from "app/components/ui/loading-skeleton"

interface Customer {
  id: string
  name: string
  phone: string
  email?: string
  address?: string
  notes?: string
  
  // Basic measurements
  height?: number
  weight?: number
  
  // Upper body measurements
  chest?: number
  waist?: number
  hips?: number
  shoulder?: number
  sleeveLength?: number
  neck?: number
  armhole?: number
  
  // Lower body measurements
  inseam?: number
  thigh?: number
  knee?: number
  calf?: number
  ankle?: number
  
  // Special measurements
  backLength?: number
  crotch?: number
  
  // Preferences
  preferredFit?: string
  fabricPreferences?: string
  
  createdAt: string
}

interface Order {
  id: string
  jobNumber: number
  title: string
  state: string
  dueDate: string
  amount: number
  createdAt: string
}

export default function CustomerDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState<Partial<Customer>>({})

  useEffect(() => {
    fetchCustomerDetails()
    fetchCustomerOrders()
  }, [params.id])

  const fetchCustomerDetails = async () => {
    try {
      const token = localStorage.getItem("authToken")
      if (!token) return

      const response = await fetch(`/api/customers/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setCustomer(data)
        setFormData(data)
      }
    } catch (error) {
      console.error("Failed to fetch customer details:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCustomerOrders = async () => {
    try {
      const token = localStorage.getItem("authToken")
      if (!token) return

      const response = await fetch(`/api/orders?customerId=${params.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setOrders(data)
      }
    } catch (error) {
      console.error("Failed to fetch customer orders:", error)
    }
  }

  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem("authToken")
      if (!token) return

      const response = await fetch(`/api/customers/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setCustomer(formData as Customer)
        setEditing(false)
        alert("Customer updated successfully!")
      } else {
        const errorData = await response.json()
        alert(`Failed to update customer: ${errorData.message || "Unknown error"}`)
      }
    } catch (error) {
      console.error("Failed to update customer:", error)
      alert(`Error updating customer: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  const getStateColor = (state: string) => {
    switch (state.toLowerCase()) {
      case 'open': return 'bg-blue-100 text-blue-800'
      case 'in_progress': return 'bg-yellow-100 text-yellow-800'
      case 'ready': return 'bg-green-100 text-green-800'
      case 'picked_up': return 'bg-gray-100 text-gray-800'
      case 'closed': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        {/* Header Skeleton */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div>
              <div className="h-8 bg-gray-200 rounded w-32 animate-pulse"></div>
              <div className="h-5 bg-gray-200 rounded w-20 animate-pulse mt-1"></div>
            </div>
            <div className="h-8 w-px bg-gray-300"></div>
            <div>
              <div className="h-7 bg-gray-200 rounded w-40 animate-pulse"></div>
              <div className="h-5 bg-gray-200 rounded w-32 animate-pulse mt-1"></div>
            </div>
          </div>
          <div className="flex gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-10 bg-gray-200 rounded w-24 animate-pulse"></div>
            ))}
          </div>
        </div>

        {/* Customer Information Skeleton */}
        <Card className="p-6">
          <div className="space-y-6">
            <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                  <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Orders Skeleton */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="h-6 bg-gray-200 rounded w-24 animate-pulse"></div>
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <OrderSkeleton key={i} />
              ))}
            </div>
          </div>
        </Card>
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="p-6">
        <div className="text-center text-red-600">Customer not found</div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-indigo-600">InSightify</h1>
            <p className="text-lg text-gray-600 font-medium">Fashion</p>
          </div>
          <div className="h-8 w-px bg-gray-300"></div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Customer Details</h2>
            <p className="text-gray-600">{customer.name}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => router.push("/customers")}
            variant="outline"
          >
            Back to Customers
          </Button>
          <Button
            onClick={() => setEditing(!editing)}
            variant={editing ? "outline" : "default"}
          >
            {editing ? "Cancel Edit" : "Edit Customer"}
          </Button>
          <Button
            onClick={() => router.push(`/orders/new?customerId=${customer.id}`)}
            className="bg-green-600 hover:bg-green-700"
          >
            Create Order
          </Button>
        </div>
      </div>

      {/* Customer Information */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            {editing ? (
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            ) : (
              <p className="text-gray-900">{customer.name}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            {editing ? (
              <input
                type="tel"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={formData.phone || ""}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            ) : (
              <p className="text-gray-900">{customer.phone}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            {editing ? (
              <input
                type="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={formData.email || ""}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            ) : (
              <p className="text-gray-900">{customer.email || "Not provided"}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Address</label>
            {editing ? (
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={formData.address || ""}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            ) : (
              <p className="text-gray-900">{customer.address || "Not provided"}</p>
            )}
          </div>
        </div>
        
        {editing && (
          <div className="mt-4">
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              rows={3}
              value={formData.notes || ""}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>
        )}

        {editing && (
          <div className="mt-4 flex gap-2">
            <Button onClick={handleUpdate}>Save Changes</Button>
          </div>
        )}
      </Card>

      {/* Measurements */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Measurements</h3>
        
        {/* Basic Measurements */}
        <div className="mb-6">
          <h4 className="text-md font-medium mb-3 text-gray-700">Basic Measurements</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Height (cm)</label>
              {editing ? (
                <input
                  type="number"
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={formData.height || ""}
                  onChange={(e) => setFormData({ ...formData, height: parseFloat(e.target.value) || undefined })}
                />
              ) : (
                <p className="text-gray-900">{customer.height ? `${customer.height} cm` : "Not measured"}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Weight (kg)</label>
              {editing ? (
                <input
                  type="number"
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={formData.weight || ""}
                  onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) || undefined })}
                />
              ) : (
                <p className="text-gray-900">{customer.weight ? `${customer.weight} kg` : "Not measured"}</p>
              )}
            </div>
          </div>
        </div>

        {/* Upper Body Measurements */}
        <div className="mb-6">
          <h4 className="text-md font-medium mb-3 text-gray-700">Upper Body (cm)</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { key: 'chest', label: 'Chest' },
              { key: 'waist', label: 'Waist' },
              { key: 'hips', label: 'Hips' },
              { key: 'shoulder', label: 'Shoulder' },
              { key: 'sleeveLength', label: 'Sleeve Length' },
              { key: 'neck', label: 'Neck' },
              { key: 'armhole', label: 'Armhole' }
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="block text-sm font-medium mb-1">{label}</label>
                {editing ? (
                  <input
                    type="number"
                    step="0.1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={formData[key as keyof Customer] || ""}
                    onChange={(e) => setFormData({ ...formData, [key]: parseFloat(e.target.value) || undefined })}
                  />
                ) : (
                  <p className="text-gray-900">
                    {(customer as any)[key] ? `${(customer as any)[key]} cm` : "Not measured"}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Lower Body Measurements */}
        <div className="mb-6">
          <h4 className="text-md font-medium mb-3 text-gray-700">Lower Body (cm)</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { key: 'inseam', label: 'Inseam' },
              { key: 'thigh', label: 'Thigh' },
              { key: 'knee', label: 'Knee' },
              { key: 'calf', label: 'Calf' },
              { key: 'ankle', label: 'Ankle' }
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="block text-sm font-medium mb-1">{label}</label>
                {editing ? (
                  <input
                    type="number"
                    step="0.1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={formData[key as keyof Customer] || ""}
                    onChange={(e) => setFormData({ ...formData, [key]: parseFloat(e.target.value) || undefined })}
                  />
                ) : (
                  <p className="text-gray-900">
                    {(customer as any)[key] ? `${(customer as any)[key]} cm` : "Not measured"}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Special Measurements */}
        <div className="mb-6">
          <h4 className="text-md font-medium mb-3 text-gray-700">Special Measurements (cm)</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { key: 'backLength', label: 'Back Length' },
              { key: 'crotch', label: 'Crotch' }
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="block text-sm font-medium mb-1">{label}</label>
                {editing ? (
                  <input
                    type="number"
                    step="0.1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={formData[key as keyof Customer] || ""}
                    onChange={(e) => setFormData({ ...formData, [key]: parseFloat(e.target.value) || undefined })}
                  />
                ) : (
                  <p className="text-gray-900">
                    {(customer as any)[key] ? `${(customer as any)[key]} cm` : "Not measured"}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Preferences */}
        <div>
          <h4 className="text-md font-medium mb-3 text-gray-700">Preferences</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Preferred Fit</label>
              {editing ? (
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={formData.preferredFit || ""}
                  onChange={(e) => setFormData({ ...formData, preferredFit: e.target.value })}
                >
                  <option value="">Select fit preference</option>
                  <option value="loose">Loose</option>
                  <option value="regular">Regular</option>
                  <option value="tight">Tight</option>
                  <option value="custom">Custom</option>
                </select>
              ) : (
                <p className="text-gray-900">{customer.preferredFit || "Not specified"}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Fabric Preferences</label>
              {editing ? (
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={formData.fabricPreferences || ""}
                  onChange={(e) => setFormData({ ...formData, fabricPreferences: e.target.value })}
                />
              ) : (
                <p className="text-gray-900">{customer.fabricPreferences || "Not specified"}</p>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Order History */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Order History</h3>
        {orders.length > 0 ? (
          <div className="space-y-3">
            {orders.map((order) => (
              <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">#{order.jobNumber} - {order.title}</h4>
                    <p className="text-sm text-gray-600">
                      Due: {new Date(order.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStateColor(order.state)}`}>
                      {order.state.replace('_', ' ').toUpperCase()}
                    </span>
                    <p className="text-sm font-medium mt-1">GHS {order.amount}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No orders found for this customer</p>
        )}
      </Card>

      {/* Customer Notes */}
      {customer.notes && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Additional Notes</h3>
          <p className="text-gray-700">{customer.notes}</p>
        </Card>
      )}
    </div>
  )
}
