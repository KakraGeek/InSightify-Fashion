// Comprehensive validation schemas using Zod for InSightify Fashion

import { z } from "zod"

// Common validation patterns
export const phoneRegex = /^(\+233|0)[0-9]{9}$/
export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Base schemas
export const BaseIdSchema = z.object({
  id: z.string().cuid().min(1, "ID is required"),
})

export const WorkspaceIdSchema = z.object({
  workspaceId: z.string().cuid().min(1, "Workspace ID is required"),
})

// User validation schemas
export const CreateUserSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  role: z.enum(["OWNER", "STAFF"]).default("STAFF"),
  workspaceId: z.string().cuid().min(1, "Workspace ID is required"),
})

export const UpdateUserSchema = BaseIdSchema.extend({
  email: z.string().email("Invalid email format").optional(),
  name: z.string().min(1, "Name is required").max(100, "Name too long").optional(),
  role: z.enum(["OWNER", "STAFF"]).optional(),
})

export const LoginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
})

// Customer validation schemas
export const CreateCustomerSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  phone: z.string().regex(phoneRegex, "Invalid phone number format"),
  email: z.string().email("Invalid email format").optional().or(z.literal("")),
  address: z.string().max(500, "Address too long").optional().or(z.literal("")),
  notes: z.string().max(1000, "Notes too long").optional().or(z.literal("")),
  
  // Measurements (all optional)
  height: z.number().min(50, "Height must be at least 50cm").max(250, "Height must be less than 250cm").optional(),
  weight: z.number().min(20, "Weight must be at least 20kg").max(200, "Weight must be less than 200kg").optional(),
  chest: z.number().min(50, "Chest measurement must be at least 50cm").max(200, "Chest measurement too large").optional(),
  waist: z.number().min(40, "Waist measurement must be at least 40cm").max(200, "Waist measurement too large").optional(),
  hips: z.number().min(50, "Hips measurement must be at least 50cm").max(200, "Hips measurement too large").optional(),
  shoulder: z.number().min(30, "Shoulder measurement must be at least 30cm").max(150, "Shoulder measurement too large").optional(),
  sleeveLength: z.number().min(20, "Sleeve length must be at least 20cm").max(100, "Sleeve length too long").optional(),
  neck: z.number().min(20, "Neck measurement must be at least 20cm").max(80, "Neck measurement too large").optional(),
  armhole: z.number().min(20, "Armhole measurement must be at least 20cm").max(100, "Armhole measurement too large").optional(),
  inseam: z.number().min(20, "Inseam measurement must be at least 20cm").max(150, "Inseam measurement too long").optional(),
  thigh: z.number().min(20, "Thigh measurement must be at least 20cm").max(150, "Thigh measurement too large").optional(),
  knee: z.number().min(20, "Knee measurement must be at least 20cm").max(100, "Knee measurement too large").optional(),
  calf: z.number().min(20, "Calf measurement must be at least 20cm").max(100, "Calf measurement too large").optional(),
  ankle: z.number().min(20, "Ankle measurement must be at least 20cm").max(50, "Ankle measurement too large").optional(),
  backLength: z.number().min(20, "Back length must be at least 20cm").max(150, "Back length too long").optional(),
  crotch: z.number().min(20, "Crotch measurement must be at least 20cm").max(100, "Crotch measurement too large").optional(),
  
  // Preferences
  preferredFit: z.enum(["loose", "regular", "tight"]).optional(),
  fabricPreferences: z.string().max(200, "Fabric preferences too long").optional().or(z.literal("")),
  
  workspaceId: z.string().cuid().min(1, "Workspace ID is required"),
})

export const UpdateCustomerSchema = BaseIdSchema.extend({
  name: z.string().min(1, "Name is required").max(100, "Name too long").optional(),
  phone: z.string().regex(phoneRegex, "Invalid phone number format").optional(),
  email: z.string().email("Invalid email format").optional().or(z.literal("")),
  address: z.string().max(500, "Address too long").optional().or(z.literal("")),
  notes: z.string().max(1000, "Notes too long").optional().or(z.literal("")),
  
  // All measurement fields are optional for updates
  height: z.number().min(50, "Height must be at least 50cm").max(250, "Height must be less than 250cm").optional(),
  weight: z.number().min(20, "Weight must be at least 20kg").max(200, "Weight must be less than 200kg").optional(),
  chest: z.number().min(50, "Chest measurement must be at least 50cm").max(200, "Chest measurement too large").optional(),
  waist: z.number().min(40, "Waist measurement must be at least 40cm").max(200, "Waist measurement too large").optional(),
  hips: z.number().min(50, "Hips measurement must be at least 50cm").max(200, "Hips measurement too large").optional(),
  shoulder: z.number().min(30, "Shoulder measurement must be at least 30cm").max(150, "Shoulder measurement too large").optional(),
  sleeveLength: z.number().min(20, "Sleeve length must be at least 20cm").max(100, "Sleeve length too long").optional(),
  neck: z.number().min(20, "Neck measurement must be at least 20cm").max(80, "Neck measurement too large").optional(),
  armhole: z.number().min(20, "Armhole measurement must be at least 20cm").max(100, "Armhole measurement too large").optional(),
  inseam: z.number().min(20, "Inseam measurement must be at least 20cm").max(150, "Inseam measurement too long").optional(),
  thigh: z.number().min(20, "Thigh measurement must be at least 20cm").max(150, "Thigh measurement too large").optional(),
  knee: z.number().min(20, "Knee measurement must be at least 20cm").max(100, "Knee measurement too large").optional(),
  calf: z.number().min(20, "Calf measurement must be at least 20cm").max(100, "Calf measurement too large").optional(),
  ankle: z.number().min(20, "Ankle measurement must be at least 20cm").max(50, "Ankle measurement too large").optional(),
  backLength: z.number().min(20, "Back length must be at least 20cm").max(150, "Back length too long").optional(),
  crotch: z.number().min(20, "Crotch measurement must be at least 20cm").max(100, "Crotch measurement too large").optional(),
  
  preferredFit: z.enum(["loose", "regular", "tight"]).optional(),
  fabricPreferences: z.string().max(200, "Fabric preferences too long").optional().or(z.literal("")),
})

// Order validation schemas
export const CreateOrderSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  description: z.string().max(1000, "Description too long").optional().or(z.literal("")),
  amount: z.string().min(1, "Amount is required"),
  dueDate: z.string().datetime("Invalid due date format"),
  customerId: z.string().cuid().min(1, "Customer ID is required"),
  workspaceId: z.string().cuid().min(1, "Workspace ID is required"),
})

export const UpdateOrderSchema = BaseIdSchema.extend({
  title: z.string().min(1, "Title is required").max(200, "Title too long").optional(),
  description: z.string().max(1000, "Description too long").optional().or(z.literal("")),
  amount: z.string().min(1, "Amount is required").optional(),
  dueDate: z.string().datetime("Invalid due date format").optional(),
  customerId: z.string().cuid().min(1, "Customer ID is required").optional(),
})

export const UpdateOrderStateSchema = BaseIdSchema.extend({
  state: z.enum(["OPEN", "EXTENDED", "CLOSED", "PICKED_UP"]),
  extendedEta: z.string().datetime("Invalid extended ETA format").optional(),
  notes: z.string().max(500, "Notes too long").optional().or(z.literal("")),
})

// Item validation schemas
export const CreateItemSchema = z.object({
  name: z.string().min(1, "Name is required").max(200, "Name too long"),
  description: z.string().max(1000, "Description too long").optional().or(z.literal("")),
  qty: z.number().min(0, "Quantity cannot be negative"),
  unitPrice: z.string().min(1, "Unit price is required"),
  reorderLevel: z.number().min(0, "Reorder level cannot be negative"),
  vendorId: z.string().cuid().optional(),
  workspaceId: z.string().cuid().min(1, "Workspace ID is required"),
})

export const UpdateItemSchema = BaseIdSchema.extend({
  name: z.string().min(1, "Name is required").max(200, "Name too long").optional(),
  description: z.string().max(1000, "Description too long").optional().or(z.literal("")),
  qty: z.number().min(0, "Quantity cannot be negative").optional(),
  unitPrice: z.string().min(1, "Unit price is required").optional(),
  reorderLevel: z.number().min(0, "Reorder level cannot be negative").optional(),
  vendorId: z.string().cuid().optional(),
})

// Vendor validation schemas
export const CreateVendorSchema = z.object({
  name: z.string().min(1, "Name is required").max(200, "Name too long"),
  phone: z.string().regex(phoneRegex, "Invalid phone number format").optional().or(z.literal("")),
  email: z.string().email("Invalid email format").optional().or(z.literal("")),
  address: z.string().max(500, "Address too long").optional().or(z.literal("")),
  notes: z.string().max(1000, "Notes too long").optional().or(z.literal("")),
  workspaceId: z.string().cuid().min(1, "Workspace ID is required"),
})

export const UpdateVendorSchema = BaseIdSchema.extend({
  name: z.string().min(1, "Name is required").max(200, "Name too long").optional(),
  phone: z.string().regex(phoneRegex, "Invalid phone number format").optional().or(z.literal("")),
  email: z.string().email("Invalid email format").optional().or(z.literal("")),
  address: z.string().max(500, "Address too long").optional().or(z.literal("")),
  notes: z.string().max(1000, "Notes too long").optional().or(z.literal("")),
})

// Purchase validation schemas
export const CreatePurchaseSchema = z.object({
  itemId: z.string().cuid().min(1, "Item ID is required"),
  qty: z.number().min(1, "Quantity must be at least 1"),
  unitPrice: z.string().min(1, "Unit price is required"),
  vendorId: z.string().cuid().min(1, "Vendor ID is required"),
  notes: z.string().max(500, "Notes too long").optional().or(z.literal("")),
  workspaceId: z.string().cuid().min(1, "Workspace ID is required"),
})

// Report validation schemas
export const GetReportsSchema = z.object({
  from: z.string().datetime("Invalid from date format"),
  to: z.string().datetime("Invalid to date format"),
  workspaceId: z.string().cuid().min(1, "Workspace ID is required"),
})

// Date range validation
export const DateRangeSchema = z.object({
  from: z.string().datetime("Invalid from date format"),
  to: z.string().datetime("Invalid to date format"),
}).refine((data) => {
  const fromDate = new Date(data.from)
  const toDate = new Date(data.to)
  return fromDate <= toDate
}, {
  message: "From date must be before or equal to to date",
  path: ["from"]
})

// Pagination schema
export const PaginationSchema = z.object({
  page: z.number().min(1, "Page must be at least 1").default(1),
  limit: z.number().min(1, "Limit must be at least 1").max(100, "Limit cannot exceed 100").default(20),
})

// Search schema
export const SearchSchema = z.object({
  query: z.string().max(100, "Search query too long").optional().or(z.literal("")),
  ...PaginationSchema.shape,
})
