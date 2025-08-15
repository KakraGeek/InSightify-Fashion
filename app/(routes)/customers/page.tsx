"use client"

import { useState, useEffect } from "react"
import { Card } from "app/components/ui/card"
import { Button } from "app/components/ui/button"
import { LoadingSpinner } from "app/components/ui/loading-spinner"
import { CustomerSkeleton, CardSkeleton } from "app/components/ui/loading-skeleton"
import { MobileNav } from "app/components/ui/mobile-nav"
import { DesktopNav } from "app/components/ui/desktop-nav"
import { BackNav } from "app/components/ui/back-nav"
import { formatDate } from "app/lib/localization"


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

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    notes: "",
    
    // Basic measurements
    height: "",
    weight: "",
    
    // Upper body measurements
    chest: "",
    waist: "",
    hips: "",
    shoulder: "",
    sleeveLength: "",
    neck: "",
    armhole: "",
    
    // Lower body measurements
    inseam: "",
    thigh: "",
    knee: "",
    calf: "",
    ankle: "",
    
    // Special measurements
    backLength: "",
    crotch: "",
    
    // Preferences
    preferredFit: "",
    fabricPreferences: "",
  })

  useEffect(() => {
    fetchCustomers()
  }, [])

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredCustomers(customers)
    } else {
      const filtered = customers.filter(customer =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.includes(searchTerm) ||
        (customer.notes && customer.notes.toLowerCase().includes(searchTerm.toLowerCase()))
      )
      setFilteredCustomers(filtered)
    }
  }, [searchTerm, customers])

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
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const token = localStorage.getItem("authToken")
      
      if (!token) {
        alert("Please log in to create customers")
        return
      }

      // Convert measurement fields from strings to numbers
      const submitData = {
        ...formData,
        height: formData.height ? parseFloat(formData.height) : undefined,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        chest: formData.chest ? parseFloat(formData.chest) : undefined,
        waist: formData.waist ? parseFloat(formData.waist) : undefined,
        hips: formData.hips ? parseFloat(formData.hips) : undefined,
        shoulder: formData.shoulder ? parseFloat(formData.shoulder) : undefined,
        sleeveLength: formData.sleeveLength ? parseFloat(formData.sleeveLength) : undefined,
        neck: formData.neck ? parseFloat(formData.neck) : undefined,
        armhole: formData.armhole ? parseFloat(formData.armhole) : undefined,
        inseam: formData.inseam ? parseFloat(formData.inseam) : undefined,
        thigh: formData.thigh ? parseFloat(formData.thigh) : undefined,
        knee: formData.knee ? parseFloat(formData.knee) : undefined,
        calf: formData.calf ? parseFloat(formData.calf) : undefined,
        ankle: formData.ankle ? parseFloat(formData.ankle) : undefined,
        backLength: formData.backLength ? parseFloat(formData.backLength) : undefined,
        crotch: formData.crotch ? parseFloat(formData.crotch) : undefined,
      }

      const response = await fetch("/api/customers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(submitData),
      })

      if (response.ok) {
        const result = await response.json()
        
        setFormData({
          name: "",
          phone: "",
          email: "",
          address: "",
          notes: "",
          height: "",
          weight: "",
          chest: "",
          waist: "",
          hips: "",
          shoulder: "",
          sleeveLength: "",
          neck: "",
          armhole: "",
          inseam: "",
          thigh: "",
          knee: "",
          calf: "",
          ankle: "",
          backLength: "",
          crotch: "",
          preferredFit: "",
          fabricPreferences: "",
        })
        setShowForm(false)
        fetchCustomers()
        alert("Customer created successfully!")
      } else {
        const errorData = await response.json()
        alert(`Failed to create customer: ${errorData.message || "Unknown error"}`)
      }
    } catch (error) {
      console.error("Failed to create customer:", error)
      alert(`Error creating customer: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MobileNav currentPage="customers" />
        <DesktopNav currentPage="customers" />
        
        <div className="mt-6 p-4 lg:p-6 space-y-4 lg:space-y-6">
          <BackNav />
          {/* Search Bar Skeleton */}
          <Card className="p-3 lg:p-4">
            <div className="flex gap-3 lg:gap-4 items-center">
              <div className="flex-1 h-10 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-16 lg:w-20 animate-pulse"></div>
            </div>
          </Card>

          {/* Customers Skeleton */}
          <div className="grid gap-3 lg:gap-4 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <CustomerSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MobileNav currentPage="customers" />
      <DesktopNav currentPage="customers" />
      
      <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
        <BackNav />
        {/* Action Buttons - Mobile Stacked, Desktop Horizontal */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Button onClick={() => setShowForm(true)} className="w-full sm:w-auto">
            Add Customer
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
                placeholder="Search customers..."
                className="flex-1 py-2 pr-3 border-none outline-none focus:ring-0 text-sm lg:text-base"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="text-xs lg:text-sm text-gray-600">
                {filteredCustomers.length} of {customers.length} customers
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

        {/* Customer Form */}
        {showForm && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Add New Customer</h2>
          <form 
            onSubmit={(e) => {
              handleSubmit(e)
            }} 
            className="space-y-6"
          >
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name *</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone *</label>
                <input
                  type="tel"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Address</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
            </div>

            {/* Basic Measurements */}
            <div className="border-t pt-4">
              <h3 className="text-md font-medium mb-3 text-gray-700">Basic Measurements</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Height (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Upper Body Measurements */}
            <div className="border-t pt-4">
              <h3 className="text-md font-medium mb-3 text-gray-700">Upper Body Measurements (cm)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Chest</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={formData.chest}
                    onChange={(e) => setFormData({ ...formData, chest: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Waist</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={formData.waist}
                    onChange={(e) => setFormData({ ...formData, waist: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Hips</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={formData.hips}
                    onChange={(e) => setFormData({ ...formData, hips: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Shoulder</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={formData.shoulder}
                    onChange={(e) => setFormData({ ...formData, shoulder: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Sleeve Length</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={formData.sleeveLength}
                    onChange={(e) => setFormData({ ...formData, sleeveLength: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Neck</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={formData.neck}
                    onChange={(e) => setFormData({ ...formData, neck: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Armhole</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={formData.armhole}
                    onChange={(e) => setFormData({ ...formData, armhole: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Lower Body Measurements */}
            <div className="border-t pt-4">
              <h3 className="text-md font-medium mb-3 text-gray-700">Lower Body Measurements (cm)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Inseam</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={formData.inseam}
                    onChange={(e) => setFormData({ ...formData, inseam: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Thigh</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={formData.thigh}
                    onChange={(e) => setFormData({ ...formData, thigh: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Knee</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={formData.knee}
                    onChange={(e) => setFormData({ ...formData, knee: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Calf</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={formData.calf}
                    onChange={(e) => setFormData({ ...formData, calf: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Ankle</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={formData.ankle}
                    onChange={(e) => setFormData({ ...formData, ankle: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Special Measurements */}
            <div className="border-t pt-4">
              <h3 className="text-md font-medium mb-3 text-gray-700">Special Measurements (cm)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Back Length</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={formData.backLength}
                    onChange={(e) => setFormData({ ...formData, backLength: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Crotch</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={formData.crotch}
                    onChange={(e) => setFormData({ ...formData, crotch: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Preferences */}
            <div className="border-t pt-4">
              <h3 className="text-md font-medium mb-3 text-gray-700">Preferences</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Preferred Fit</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={formData.preferredFit}
                    onChange={(e) => setFormData({ ...formData, preferredFit: e.target.value })}
                  >
                    <option value="">Select fit preference</option>
                    <option value="loose">Loose</option>
                    <option value="regular">Regular</option>
                    <option value="tight">Tight</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Fabric Preferences</label>
                  <input
                    type="text"
                    placeholder="e.g., cotton, linen, silk"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={formData.fabricPreferences}
                    onChange={(e) => setFormData({ ...formData, fabricPreferences: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium mb-1">Additional Notes</label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={3}
                placeholder="Any additional information about the customer..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1">
                Create Customer
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

        {/* Customer List */}
        <div className="grid gap-3 lg:gap-4 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
          {filteredCustomers.map((customer) => (
            <Card key={customer.id} className="p-3 lg:p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg">{customer.name}</h3>
                    {customer.preferredFit && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {customer.preferredFit}
                      </span>
                    )}
                  </div>
                  
                  {/* Contact Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-gray-600 flex items-center gap-2">
                        <span className="text-gray-400">📞</span> {customer.phone}
                      </p>
                      {customer.email && (
                        <p className="text-gray-600 flex items-center gap-2">
                          <span className="text-gray-400">✉️</span> {customer.email}
                        </p>
                      )}
                      {customer.address && (
                        <p className="text-gray-600 flex items-center gap-2">
                          <span className="text-gray-400">📍</span> {customer.address}
                        </p>
                      )}
                    </div>
                    
                    {/* Key Measurements */}
                    <div className="text-sm">
                      {(customer.height || customer.weight) && (
                        <div className="mb-2">
                          {customer.height && <span className="mr-3">H: {customer.height}cm</span>}
                          {customer.weight && <span>W: {customer.weight}kg</span>}
                        </div>
                      )}
                      {(customer.chest || customer.waist || customer.hips) && (
                        <div className="text-gray-600">
                          {customer.chest && <span className="mr-2">Chest: {customer.chest}cm</span>}
                          {customer.waist && <span className="mr-2">Waist: {customer.waist}cm</span>}
                          {customer.hips && <span>Hips: {customer.hips}cm</span>}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Additional Info */}
                  {customer.fabricPreferences && (
                    <p className="text-gray-600 text-sm mb-2">
                      <span className="text-gray-400">🧵</span> Prefers: {customer.fabricPreferences}
                    </p>
                  )}
                  {customer.notes && (
                    <p className="text-gray-500 text-sm">{customer.notes}</p>
                  )}
                </div>
                
                <div className="text-right">
                  <span className="text-xs text-gray-400 block">
                                            {formatDate(customer.createdAt)}
                  </span>
                  <button 
                    onClick={() => window.location.href = `/customers/${customer.id}`}
                    className="mt-2 text-xs text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </Card>
          ))}
          {filteredCustomers.length === 0 && searchTerm.trim() !== "" && (
            <Card className="p-8 text-center text-gray-500">
              No customers found matching "{searchTerm}"
            </Card>
          )}
          {filteredCustomers.length === 0 && searchTerm.trim() === "" && customers.length === 0 && (
            <Card className="p-8 text-center text-gray-500">
              No customers yet. Add your first customer to get started.
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
