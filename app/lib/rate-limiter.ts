// Rate limiting system for InSightify Fashion API

interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
}

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

// Default rate limit configurations
export const RATE_LIMITS: Record<string, RateLimitConfig> = {
  // Sensitive mutations - stricter limits
  "auth:login": { windowMs: 15 * 60 * 1000, maxRequests: 5 }, // 5 attempts per 15 minutes
  "auth:register": { windowMs: 60 * 60 * 1000, maxRequests: 3 }, // 3 attempts per hour
  "orders:create": { windowMs: 60 * 1000, maxRequests: 10 }, // 10 orders per minute
  "orders:update": { windowMs: 60 * 1000, maxRequests: 20 }, // 20 updates per minute
  "inventory:update": { windowMs: 60 * 1000, maxRequests: 15 }, // 15 updates per minute
  "customers:create": { windowMs: 60 * 1000, maxRequests: 10 }, // 10 customers per minute
  
  // Read operations - more lenient limits
  "default": { windowMs: 60 * 1000, maxRequests: 100 }, // 100 requests per minute
}

// In-memory store for rate limiting (in production, use Redis or similar)
const rateLimitStore: RateLimitStore = {}

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  Object.keys(rateLimitStore).forEach(key => {
    if (rateLimitStore[key].resetTime < now) {
      delete rateLimitStore[key]
    }
  })
}, 5 * 60 * 1000)

/**
 * Check if a request is within rate limits
 * @param identifier - Unique identifier for the request (e.g., IP, userId, or operation)
 * @param operation - The operation being performed
 * @returns Object with isAllowed boolean and remaining requests
 */
export function checkRateLimit(
  identifier: string,
  operation: string = "default"
): { isAllowed: boolean; remaining: number; resetTime: number } {
  const config = RATE_LIMITS[operation] || RATE_LIMITS.default
  const key = `${identifier}:${operation}`
  const now = Date.now()
  
  // Initialize or get existing entry
  if (!rateLimitStore[key] || rateLimitStore[key].resetTime < now) {
    rateLimitStore[key] = {
      count: 0,
      resetTime: now + config.windowMs
    }
  }
  
  const entry = rateLimitStore[key]
  
  // Check if limit exceeded
  if (entry.count >= config.maxRequests) {
    return {
      isAllowed: false,
      remaining: 0,
      resetTime: entry.resetTime
    }
  }
  
  // Increment counter
  entry.count++
  
  return {
    isAllowed: true,
    remaining: config.maxRequests - entry.count,
    resetTime: entry.resetTime
  }
}

/**
 * Get rate limit information for an operation
 * @param identifier - Unique identifier for the request
 * @param operation - The operation being performed
 * @returns Rate limit information
 */
export function getRateLimitInfo(
  identifier: string,
  operation: string = "default"
): { remaining: number; resetTime: number; limit: number } {
  const config = RATE_LIMITS[operation] || RATE_LIMITS.default
  const key = `${identifier}:${operation}`
  const now = Date.now()
  
  if (!rateLimitStore[key] || rateLimitStore[key].resetTime < now) {
    return {
      remaining: config.maxRequests,
      resetTime: now + config.windowMs,
      limit: config.maxRequests
    }
  }
  
  const entry = rateLimitStore[key]
  return {
    remaining: Math.max(0, config.maxRequests - entry.count),
    resetTime: entry.resetTime,
    limit: config.maxRequests
  }
}

/**
 * Reset rate limit for an identifier and operation
 * @param identifier - Unique identifier for the request
 * @param operation - The operation being performed
 */
export function resetRateLimit(identifier: string, operation: string = "default"): void {
  const key = `${identifier}:${operation}`
  delete rateLimitStore[key]
}

/**
 * Get all rate limit configurations
 * @returns Object with all rate limit configurations
 */
export function getAllRateLimits(): Record<string, RateLimitConfig> {
  return { ...RATE_LIMITS }
}

/**
 * Update rate limit configuration for an operation
 * @param operation - The operation to update
 * @param config - New rate limit configuration
 */
export function updateRateLimit(
  operation: string,
  config: RateLimitConfig
): void {
  RATE_LIMITS[operation] = config
}

/**
 * Create a rate limit middleware function for API routes
 * @param operation - The operation to rate limit
 * @returns Middleware function
 */
export function createRateLimitMiddleware(operation: string) {
  return function rateLimitMiddleware(req: any, res: any, next: any) {
    // Extract identifier (IP address, user ID, or session ID)
    const identifier = req.headers['x-forwarded-for'] || 
                      req.connection.remoteAddress || 
                      req.session?.userId || 
                      'anonymous'
    
    const result = checkRateLimit(identifier, operation)
    
    if (!result.isAllowed) {
      return res.status(429).json({
        error: 'Too Many Requests',
        message: `Rate limit exceeded for ${operation}`,
        retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
        resetTime: new Date(result.resetTime).toISOString()
      })
    }
    
    // Add rate limit headers
    res.set({
      'X-RateLimit-Limit': RATE_LIMITS[operation]?.maxRequests || RATE_LIMITS.default.maxRequests,
      'X-RateLimit-Remaining': result.remaining,
      'X-RateLimit-Reset': new Date(result.resetTime).toISOString()
    })
    
    next()
  }
}
