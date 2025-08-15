# Hardening Features - InSightify Fashion

## Overview

This document describes the comprehensive security and hardening features implemented in InSightify Fashion to make it production-ready with enterprise-grade security.

## 🔐 Role-Based Access Control (RBAC)

### Overview
The RBAC system provides fine-grained access control based on user roles and permissions. Users are assigned either "OWNER" or "STAFF" roles with different levels of access to system resources.

### User Roles

#### OWNER Role
- **Full Access**: Can perform all operations on all resources
- **User Management**: Can create, update, and delete users
- **Workspace Management**: Can modify workspace settings
- **Sensitive Operations**: Can delete resources, adjust pricing, manage system settings

#### STAFF Role
- **Limited Access**: Can view and create most resources
- **Restricted Operations**: Cannot delete resources or modify sensitive settings
- **Read Access**: Can view all data within their workspace
- **Create/Update**: Can create and update orders, customers, and inventory

### Permission Matrix

| Resource | Action | OWNER | STAFF |
|----------|--------|-------|-------|
| customers | create | ✅ | ✅ |
| customers | read | ✅ | ✅ |
| customers | update | ✅ | ✅ |
| customers | delete | ✅ | ❌ |
| orders | create | ✅ | ✅ |
| orders | read | ✅ | ✅ |
| orders | update | ✅ | ✅ |
| orders | delete | ✅ | ❌ |
| inventory | create | ✅ | ✅ |
| inventory | read | ✅ | ✅ |
| inventory | update | ✅ | ✅ |
| inventory | delete | ✅ | ❌ |
| inventory | adjustPricing | ✅ | ❌ |
| users | manage | ✅ | ❌ |
| workspace | manage | ✅ | ❌ |

### Usage Examples

```typescript
import { hasPermission, isOwner, canDelete } from 'app/lib/rbac'

// Check specific permission
if (hasPermission(userRole, 'customers', 'delete')) {
  // User can delete customers
}

// Check owner status
if (isOwner(userRole)) {
  // User has owner privileges
}

// Check delete capability
if (canDelete(userRole)) {
  // User can delete resources
}
```

## ✅ Input Validation

### Overview
Comprehensive input validation using Zod schemas ensures data integrity and prevents malicious input. All resolver inputs are validated before processing.

### Validation Schemas

#### Customer Validation
```typescript
import { CreateCustomerSchema, UpdateCustomerSchema } from 'app/lib/validation'

// Create customer with validation
const validatedData = CreateCustomerSchema.parse(inputData)

// Update customer with validation
const validatedData = UpdateCustomerSchema.parse(inputData)
```

#### Order Validation
```typescript
import { CreateOrderSchema, UpdateOrderStateSchema } from 'app/lib/validation'

// Create order with validation
const validatedData = CreateOrderSchema.parse(inputData)

// Update order state with validation
const validatedData = UpdateOrderStateSchema.parse(inputData)
```

#### Item Validation
```typescript
import { CreateItemSchema, UpdateItemSchema } from 'app/lib/validation'

// Create item with validation
const validatedData = CreateItemSchema.parse(inputData)

// Update item with validation
const validatedData = UpdateItemSchema.parse(inputData)
```

### Validation Rules

#### Required Fields
- **Name**: 1-100 characters
- **Phone**: Ghana phone number format (+233 or 0 followed by 9 digits)
- **Email**: Valid email format (optional)
- **Workspace ID**: Valid CUID format

#### Measurement Validation
- **Height**: 50-250 cm
- **Weight**: 20-200 kg
- **Chest**: 50-200 cm
- **Waist**: 40-200 cm
- **Hips**: 50-200 cm
- **Shoulder**: 30-150 cm
- **Sleeve Length**: 20-100 cm
- **Neck**: 20-80 cm
- **Armhole**: 20-100 cm
- **Inseam**: 20-150 cm
- **Thigh**: 20-150 cm
- **Knee**: 20-100 cm
- **Calf**: 20-100 cm
- **Ankle**: 20-50 cm
- **Back Length**: 20-150 cm
- **Crotch**: 20-100 cm

#### Business Logic Validation
- **Date Ranges**: From date must be before or equal to to date
- **Quantities**: Cannot be negative
- **Prices**: Must be positive numbers
- **Phone Numbers**: Must match Ghana format

## ⏱️ Rate Limiting

### Overview
Rate limiting protects the API from abuse and ensures fair usage. Different operations have different rate limits based on their sensitivity and resource consumption.

### Rate Limit Configuration

#### Sensitive Operations (Stricter Limits)
- **Authentication**: 5 attempts per 15 minutes
- **Registration**: 3 attempts per hour
- **Order Creation**: 10 orders per minute
- **Order Updates**: 20 updates per minute
- **Inventory Updates**: 15 updates per minute
- **Customer Creation**: 10 customers per minute

#### Read Operations (More Lenient)
- **Default**: 100 requests per minute
- **Reports**: 50 requests per minute
- **Dashboard**: 100 requests per minute

### Rate Limit Headers
All API responses include rate limit information:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 2025-01-15T10:30:00.000Z
Retry-After: 45
```

### Rate Limit Responses
When rate limits are exceeded:
```json
{
  "error": "Too Many Requests",
  "message": "Rate limit exceeded for customers:create",
  "retryAfter": 45,
  "resetTime": "2025-01-15T10:30:00.000Z"
}
```

### Usage Examples

```typescript
import { checkRateLimit, getRateLimitInfo } from 'app/lib/rate-limiter'

// Check if request is allowed
const result = checkRateLimit('user-123', 'customers:create')
if (!result.isAllowed) {
  // Handle rate limit exceeded
}

// Get rate limit information
const info = getRateLimitInfo('user-123', 'customers:create')
console.log(`Remaining requests: ${info.remaining}`)
```

## 📝 Comprehensive Logging

### Overview
The logging system provides detailed tracking of all system activities with structured context including user information, workspace details, and operation metadata.

### Log Levels
- **DEBUG**: Detailed debugging information
- **INFO**: General information about operations
- **WARN**: Warning messages for potential issues
- **ERROR**: Error messages with full context

### Log Categories

#### Authentication Logs
```typescript
import { logAuth } from 'app/lib/logger'

logAuth('User login successful', userId, workspaceId, {
  ip: '192.168.1.1',
  userAgent: 'Mozilla/5.0...'
})
```

#### Database Operation Logs
```typescript
import { logDb } from 'app/lib/logger'

logDb('create', 'customers', userId, workspaceId, {
  customerId: 'cust_123',
  customerName: 'John Doe'
})
```

#### API Request Logs
```typescript
import { logApi } from 'app/lib/logger'

logApi('POST', '/api/customers', userId, workspaceId, {
  requestId: 'req_123',
  duration: 150
})
```

#### Business Operation Logs
```typescript
import { logBusiness } from 'app/lib/logger'

logBusiness('order_created', 'orders', userId, workspaceId, {
  orderId: 'ord_123',
  amount: '150.00',
  customerId: 'cust_123'
})
```

#### Security Event Logs
```typescript
import { logSecurity } from 'app/lib/logger'

logSecurity('Unauthorized access attempt', userId, workspaceId, {
  ip: '192.168.1.100',
  resource: '/api/customers',
  userAgent: 'Mozilla/5.0...'
})
```

#### Performance Logs
```typescript
import { logPerformance } from 'app/lib/logger'

logPerformance('customer_creation', 150, userId, workspaceId, {
  requestId: 'req_123',
  customerData: { name: 'John Doe' }
})
```

### Log Context
All logs include structured context:
- **User ID**: Identifier of the user performing the operation
- **Workspace ID**: Workspace context for multi-tenancy
- **Operation**: Type of operation being performed
- **Request ID**: Unique identifier for request tracking
- **IP Address**: Client IP address for security tracking
- **User Agent**: Client browser/application information
- **Session ID**: Session identifier for user tracking

### Log Output Format
```
[2025-01-15T10:30:00.000Z] INFO: [BUSINESS] order_created orders | User: user_123 | Workspace: ws_456 | Operation: business:order_created | Data: {"orderId":"ord_123","amount":"150.00"}
```

## 🛡️ Security Features

### Input Sanitization
- **XSS Prevention**: HTML and script tags are rejected
- **SQL Injection Prevention**: Input validation and parameterized queries
- **Data Type Validation**: Strict type checking for all inputs

### Authentication & Authorization
- **JWT Tokens**: Secure token-based authentication
- **Session Management**: Secure session handling with expiration
- **Permission Checks**: Role-based access control on all endpoints

### API Security
- **Rate Limiting**: Protection against abuse and DoS attacks
- **CORS Configuration**: Controlled cross-origin access
- **Security Headers**: XSS protection, content type options, frame options

### Error Handling
- **Safe Error Messages**: No sensitive information in error responses
- **Request ID Tracking**: Unique identifiers for error tracking
- **Structured Error Responses**: Consistent error format across all endpoints

## 🚀 Implementation Guide

### Adding RBAC to New Endpoints

```typescript
import { createAuthMiddleware, readOnly } from 'app/lib/authorization'

// Read-only endpoint
const authConfig = readOnly({
  resource: 'reports',
  requireAuth: true,
  rateLimit: 'reports:read'
})

export const GET = createAuthMiddleware(authConfig)(async (req, context) => {
  // Your endpoint logic here
  // context contains authenticated user information
})
```

### Adding Validation to New Schemas

```typescript
import { z } from 'zod'

export const NewResourceSchema = z.object({
  name: z.string().min(1, "Name is required").max(200, "Name too long"),
  description: z.string().max(1000, "Description too long").optional(),
  workspaceId: z.string().cuid().min(1, "Workspace ID is required")
})
```

### Adding Rate Limiting

```typescript
import { updateRateLimit } from 'app/lib/rate-limiter'

// Update rate limit for new operation
updateRateLimit('new:operation', {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 20 // 20 requests per minute
})
```

### Adding Custom Logging

```typescript
import { logger } from 'app/lib/logger'

// Create operation-specific logger
const operationLogger = logger.withContext({ operation: 'custom_operation' })

// Log operation details
operationLogger.info('Custom operation started', { data: 'operation data' })
```

## 🧪 Testing

### Running Hardening Tests
```bash
# Run all hardening tests
npm run smoke:hardening

# Run specific test categories
node tests/smoke/hardening-smoke.js
```

### Test Categories
1. **RBAC Tests**: Verify role-based access control
2. **Validation Tests**: Test input validation and rejection
3. **Rate Limiting Tests**: Verify API protection
4. **Logging Tests**: Ensure comprehensive logging
5. **Security Tests**: Test security features and headers

### Test Environment
- **Base URL**: Configurable via `BASE_URL` environment variable
- **Test Tokens**: Mock tokens for testing different user roles
- **Request Tracking**: Unique request IDs for test correlation

## 📊 Monitoring & Alerting

### Log Aggregation
- **Structured Logs**: JSON-formatted logs for easy parsing
- **Context Enrichment**: Rich metadata for debugging and monitoring
- **Performance Metrics**: Operation timing and resource usage

### Security Monitoring
- **Failed Authentication**: Track and alert on failed login attempts
- **Permission Violations**: Monitor unauthorized access attempts
- **Rate Limit Exceeded**: Track API abuse patterns
- **Input Validation Failures**: Monitor malicious input attempts

### Performance Monitoring
- **Response Times**: Track API endpoint performance
- **Resource Usage**: Monitor database and system resource consumption
- **Error Rates**: Track and alert on error patterns

## 🔧 Configuration

### Environment Variables
```bash
# Logging
LOG_LEVEL=info  # debug, info, warn, error

# Rate Limiting
RATE_LIMIT_ENABLED=true
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100

# Security
JWT_SECRET=your-secret-key
SESSION_SECRET=your-session-secret
```

### Customization
- **Rate Limits**: Adjust limits based on business requirements
- **Log Levels**: Configure logging verbosity for different environments
- **Permissions**: Customize role permissions for specific use cases
- **Validation Rules**: Add custom validation rules for business logic

## 🚀 Production Deployment

### Security Checklist
- [ ] Environment variables configured
- [ ] Database connections secured
- [ ] SSL/TLS enabled
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] Logging configured for production
- [ ] Monitoring and alerting set up
- [ ] Backup and recovery procedures in place

### Performance Considerations
- **Rate Limiting**: Balance security with user experience
- **Logging**: Ensure logging doesn't impact performance
- **Validation**: Optimize validation schemas for common operations
- **Caching**: Implement caching for frequently accessed data

### Monitoring Setup
- **Application Monitoring**: Track application performance and errors
- **Security Monitoring**: Monitor for security threats and violations
- **Business Metrics**: Track business operations and user behavior
- **Infrastructure Monitoring**: Monitor system resources and health

---

## 📚 Additional Resources

- [RBAC Implementation Guide](./rbac-implementation.md)
- [Validation Schema Reference](./validation-schemas.md)
- [Rate Limiting Configuration](./rate-limiting-config.md)
- [Logging Best Practices](./logging-best-practices.md)
- [Security Hardening Checklist](./security-checklist.md)
