// Role-Based Access Control (RBAC) system for InSightify Fashion

export type UserRole = "OWNER" | "STAFF"

export interface Permission {
  resource: string
  actions: string[]
}

export interface RolePermissions {
  OWNER: Permission[]
  STAFF: Permission[]
}

// Define permissions for each role
export const ROLE_PERMISSIONS: RolePermissions = {
  OWNER: [
    // Full access to all resources
    { resource: "customers", actions: ["create", "read", "update", "delete"] },
    { resource: "orders", actions: ["create", "read", "update", "delete", "changeState"] },
    { resource: "inventory", actions: ["create", "read", "update", "delete", "adjustPricing"] },
    { resource: "vendors", actions: ["create", "read", "update", "delete"] },
    { resource: "purchases", actions: ["create", "read", "update", "delete"] },
    { resource: "reports", actions: ["read"] },
    { resource: "dashboard", actions: ["read"] },
    { resource: "users", actions: ["create", "read", "update", "delete"] },
    { resource: "workspace", actions: ["read", "update", "delete"] },
  ],
  STAFF: [
    // Limited access - can view and create, but limited updates
    { resource: "customers", actions: ["create", "read", "update"] },
    { resource: "orders", actions: ["create", "read", "update", "changeState"] },
    { resource: "inventory", actions: ["create", "read", "update"] },
    { resource: "vendors", actions: ["read"] },
    { resource: "purchases", actions: ["create", "read"] },
    { resource: "reports", actions: ["read"] },
    { resource: "dashboard", actions: ["read"] },
    { resource: "users", actions: ["read"] },
    { resource: "workspace", actions: ["read"] },
  ],
}

// Check if a user has permission for a specific action on a resource
export function hasPermission(
  userRole: UserRole,
  resource: string,
  action: string
): boolean {
  const rolePerms = ROLE_PERMISSIONS[userRole]
  if (!rolePerms) return false

  const resourcePerm = rolePerms.find(perm => perm.resource === resource)
  if (!resourcePerm) return false

  return resourcePerm.actions.includes(action)
}

// Check if user can perform owner-only operations
export function isOwner(userRole: UserRole): boolean {
  return userRole === "OWNER"
}

// Check if user can perform staff operations
export function isStaff(userRole: UserRole): boolean {
  return userRole === "STAFF" || userRole === "OWNER"
}

// Get all permissions for a specific role
export function getRolePermissions(userRole: UserRole): Permission[] {
  return ROLE_PERMISSIONS[userRole] || []
}

// Check if user can delete resources (owner-only)
export function canDelete(userRole: UserRole): boolean {
  return isOwner(userRole)
}

// Check if user can adjust pricing (owner-only)
export function canAdjustPricing(userRole: UserRole): boolean {
  return isOwner(userRole)
}

// Check if user can manage users (owner-only)
export function canManageUsers(userRole: UserRole): boolean {
  return isOwner(userRole)
}

// Check if user can manage workspace settings (owner-only)
export function canManageWorkspace(userRole: UserRole): boolean {
  return isOwner(userRole)
}
