// Comprehensive authorization middleware for InSightify Fashion

import { NextRequest, NextResponse } from "next/server"
import { hasPermission, isOwner, canDelete, canAdjustPricing, canManageUsers, canManageWorkspace } from "./rbac"
import { checkRateLimit } from "./rate-limiter"
import { logger, logSecurity, logApi } from "./logger"
import { z } from "zod"

export interface AuthContext {
  userId: string
  workspaceId: string
  role: "OWNER" | "STAFF"
  email: string
  name?: string
}

export interface AuthorizationConfig {
  resource: string
  action: string
  requireAuth: boolean
  rateLimit?: string
  validateInput?: z.ZodSchema<any>
  ownerOnly?: boolean
  staffAllowed?: boolean
}

/**
 * Create authorization middleware for API routes
 */
export function createAuthMiddleware(config: AuthorizationConfig) {
  return async function authMiddleware(
    request: NextRequest,
    handler: (req: NextRequest, context: AuthContext) => Promise<NextResponse>
  ): Promise<NextResponse> {
    const startTime = Date.now()
    const requestId = request.headers.get('x-request-id') || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Create request logger
    const requestLogger = logger.withContext({ requestId })
    
    try {
      // Log API request
      logApi(request.method, request.url, undefined, undefined, {
        requestId,
        userAgent: request.headers.get('user-agent'),
        ip: request.headers.get('x-forwarded-for') || 'unknown'
      })

      // Rate limiting check
      if (config.rateLimit) {
        const identifier = request.headers.get('x-forwarded-for') || 
                          request.ip || 
                          'anonymous'
        
        const rateLimitResult = checkRateLimit(identifier, config.rateLimit)
        
        if (!rateLimitResult.isAllowed) {
          logSecurity('Rate limit exceeded', undefined, undefined, {
            operation: config.rateLimit,
            identifier,
            requestId
          })
          
          return NextResponse.json(
            {
              error: 'Too Many Requests',
              message: `Rate limit exceeded for ${config.resource}:${config.action}`,
              retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000),
              resetTime: new Date(rateLimitResult.resetTime).toISOString()
            },
            { 
              status: 429,
              headers: {
                'X-RateLimit-Limit': '100',
                'X-RateLimit-Remaining': '0',
                'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString(),
                'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString()
              }
            }
          )
        }
      }

      // Authentication check
      if (config.requireAuth) {
        const authHeader = request.headers.get('authorization')
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          logSecurity('Missing or invalid authorization header', undefined, undefined, {
            operation: `${config.resource}:${config.action}`,
            requestId
          })
          
          return NextResponse.json(
            { error: 'Unauthorized', message: 'Missing or invalid authorization token' },
            { status: 401 }
          )
        }

        const token = authHeader.substring(7)
        const context = await validateToken(token)
        
        if (!context) {
          logSecurity('Invalid or expired token', undefined, undefined, {
            operation: `${config.resource}:${config.action}`,
            requestId
          })
          
          return NextResponse.json(
            { error: 'Unauthorized', message: 'Invalid or expired token' },
            { status: 401 }
          )
        }

        // Role-based access control
        if (!hasPermission(context.role, config.resource, config.action)) {
          logSecurity('Insufficient permissions', context.userId, context.workspaceId, {
            operation: `${config.resource}:${config.action}`,
            userRole: context.role,
            requestId
          })
          
          return NextResponse.json(
            { error: 'Forbidden', message: 'Insufficient permissions for this operation' },
            { status: 403 }
          )
        }

        // Owner-only operations
        if (config.ownerOnly && !isOwner(context.role)) {
          logSecurity('Owner-only operation attempted by non-owner', context.userId, context.workspaceId, {
            operation: `${config.resource}:${config.action}`,
            userRole: context.role,
            requestId
          })
          
          return NextResponse.json(
            { error: 'Forbidden', message: 'This operation requires owner privileges' },
            { status: 403 }
          )
        }

        // Staff restrictions
        if (config.staffAllowed === false && context.role === 'STAFF') {
          logSecurity('Staff operation blocked', context.userId, context.workspaceId, {
            operation: `${config.resource}:${config.action}`,
            userRole: context.role,
            requestId
          })
          
          return NextResponse.json(
            { error: 'Forbidden', message: 'This operation is not available to staff members' },
            { status: 403 }
          )
        }

        // Input validation
        if (config.validateInput) {
          try {
            let body
            if (request.method !== 'GET') {
              body = await request.json()
            }
            
            const validatedData = config.validateInput.parse(body || {})
            
            // Replace request body with validated data
            if (body) {
              request = new NextRequest(request.url, {
                method: request.method,
                headers: request.headers,
                body: JSON.stringify(validatedData)
              })
            }
          } catch (validationError) {
            if (validationError instanceof z.ZodError) {
              logSecurity('Input validation failed', context.userId, context.workspaceId, {
                operation: `${config.resource}:${config.action}`,
                errors: validationError.errors,
                requestId
              })
              
              return NextResponse.json(
                { 
                  error: 'Bad Request', 
                  message: 'Input validation failed',
                  details: validationError.errors 
                },
                { status: 400 }
              )
            }
            throw validationError
          }
        }

        // Execute the handler with authenticated context
        const response = await handler(request, context)
        
        // Log successful operation
        const duration = Date.now() - startTime
        logger.performance(`${config.resource}:${config.action}`, duration, context.userId, context.workspaceId, {
          requestId,
          status: response.status
        })
        
        return response
      } else {
        // No authentication required, execute handler directly
        const mockContext: AuthContext = {
          userId: 'anonymous',
          workspaceId: 'anonymous',
          role: 'STAFF',
          email: 'anonymous@example.com'
        }
        
        const response = await handler(request, mockContext)
        
        const duration = Date.now() - startTime
        logger.performance(`${config.resource}:${config.action}`, duration, undefined, undefined, {
          requestId,
          status: response.status
        })
        
        return response
      }
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Log error
      logger.error(`Authorization middleware error: ${error instanceof Error ? error.message : 'Unknown error'}`, 
        error instanceof Error ? error : undefined, 
        { 
          operation: `${config.resource}:${config.action}`,
          requestId,
          duration
        }
      )
      
      return NextResponse.json(
        { 
          error: 'Internal Server Error', 
          message: 'An unexpected error occurred',
          requestId 
        },
        { status: 500 }
      )
    }
  }
}

/**
 * Validate JWT token and return user context
 */
async function validateToken(token: string): Promise<AuthContext | null> {
  try {
    // In a real implementation, you would verify the JWT token
    // For now, we'll use a mock validation that checks the database
    
    // This is a placeholder - replace with actual JWT validation
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/whoami`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (!response.ok) {
      return null
    }
    
    const userData = await response.json()
    
    return {
      userId: userData.userId,
      workspaceId: userData.workspaceId,
      role: userData.role,
      email: userData.email,
      name: userData.name
    }
  } catch (error) {
    logger.error('Token validation error', error instanceof Error ? error : undefined)
    return null
  }
}

/**
 * Convenience function for owner-only operations
 */
export function ownerOnly(config: Omit<AuthorizationConfig, 'ownerOnly'>): AuthorizationConfig {
  return { ...config, ownerOnly: true }
}

/**
 * Convenience function for staff-restricted operations
 */
export function staffRestricted(config: Omit<AuthorizationConfig, 'staffAllowed'>): AuthorizationConfig {
  return { ...config, staffAllowed: false }
}

/**
 * Convenience function for read-only operations
 */
export function readOnly(config: Omit<AuthorizationConfig, 'action'>): AuthorizationConfig {
  return { ...config, action: 'read' }
}

/**
 * Convenience function for create operations
 */
export function createOnly(config: Omit<AuthorizationConfig, 'action'>): AuthorizationConfig {
  return { ...config, action: 'create' }
}

/**
 * Convenience function for update operations
 */
export function updateOnly(config: Omit<AuthorizationConfig, 'action'>): AuthorizationConfig {
  return { ...config, action: 'update' }
}

/**
 * Convenience function for delete operations
 */
export function deleteOnly(config: Omit<AuthorizationConfig, 'action'>): AuthorizationConfig {
  return { ...config, action: 'delete' }
}
