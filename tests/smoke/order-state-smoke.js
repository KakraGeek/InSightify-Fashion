// Order State Management smoke test
const http = require('node:http')

function request(method, path, data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    }

    const req = http.request(options, res => {
      let responseData = ''
      res.on('data', chunk => responseData += chunk)
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData)
          resolve({ status: res.statusCode, data: parsed })
        } catch (e) {
          resolve({ status: res.statusCode, data: responseData })
        }
      })
    })

    req.on('error', reject)
    
    if (data) {
      req.write(JSON.stringify(data))
    }
    
    req.end()
  })
}

async function testOrderStateManagement() {
  try {
    console.log('🧪 Testing Order State Management...')
    
    // First, test login to get a token
    const loginResponse = await request('POST', '/api/auth/login', {
      email: 'owner@example.com',
      password: 'Password123!'
    })
    
    if (loginResponse.status !== 200) {
      throw new Error(`Login failed: ${loginResponse.status}`)
    }
    
    const token = loginResponse.data.token
    console.log('✅ Login successful, token received')
    
    // Create a test customer first
    const customerData = {
      name: 'State Test Customer',
      phone: '0240000006',
      notes: 'Customer for state management testing'
    }
    
    const customerResponse = await request('POST', '/api/customers', customerData, {
      'Authorization': `Bearer ${token}`
    })
    
    if (customerResponse.status !== 200) {
      throw new Error(`Customer creation failed: ${customerResponse.status}`)
    }
    
    const customerId = customerResponse.data.id
    console.log('✅ Customer created successfully:', customerId)
    
    // Create a test order
    const orderData = {
      customerId: customerId,
      title: 'State Test Order',
      dueDate: '2025-08-30',
      amount: 75.00
    }
    
    const orderResponse = await request('POST', '/api/orders', orderData, {
      'Authorization': `Bearer ${token}`
    })
    
    if (orderResponse.status !== 200) {
      throw new Error(`Order creation failed: ${orderResponse.status}`)
    }
    
    const orderId = orderResponse.data.id
    console.log('✅ Order created successfully with job number:', orderResponse.data.jobNumber)
    console.log('✅ Initial order state:', orderResponse.data.state)
    console.log('✅ Order ID for state changes:', orderId)
    
    // Test state transition: OPEN -> EXTENDED
    const extendData = {
      newState: 'EXTENDED',
      extendedEta: '2025-09-05',
      notes: 'Customer requested extension'
    }
    
    const extendResponse = await request('PATCH', `/api/orders/${orderId}/state`, extendData, {
      'Authorization': `Bearer ${token}`
    })
    
    if (extendResponse.status !== 200) {
      throw new Error(`State transition to EXTENDED failed: ${extendResponse.status}`)
    }
    
    console.log('✅ Order state changed to EXTENDED')
    
    // Test state transition: EXTENDED -> CLOSED
    const closeData = {
      newState: 'CLOSED',
      notes: 'Order completed and ready for pickup'
    }
    
    const closeResponse = await request('PATCH', `/api/orders/${orderId}/state`, closeData, {
      'Authorization': `Bearer ${token}`
    })
    
    if (closeResponse.status !== 200) {
      throw new Error(`State transition to CLOSED failed: ${closeResponse.status}`)
    }
    
    console.log('✅ Order state changed to CLOSED')
    
    // Test state transition: CLOSED -> PICKED_UP
    const pickupData = {
      newState: 'PICKED_UP',
      notes: 'Customer picked up the order'
    }
    
    const pickupResponse = await request('PATCH', `/api/orders/${orderId}/state`, pickupData, {
      'Authorization': `Bearer ${token}`
    })
    
    if (pickupResponse.status !== 200) {
      throw new Error(`State transition to PICKED_UP failed: ${pickupResponse.status}`)
    }
    
    console.log('✅ Order state changed to PICKED_UP')
    
    // Test invalid state transition (should fail)
    const invalidData = {
      newState: 'OPEN',
      notes: 'This should fail - cannot go back from PICKED_UP'
    }
    
    const invalidResponse = await request('PATCH', `/api/orders/${orderId}/state`, invalidData, {
      'Authorization': `Bearer ${token}`
    })
    
    if (invalidResponse.status === 200) {
      throw new Error('Invalid state transition should have failed')
    }
    
    console.log('✅ Invalid state transition correctly rejected')
    
    // Test getting order history
    const historyResponse = await request('GET', `/api/orders/${orderId}/history`, null, {
      'Authorization': `Bearer ${token}`
    })
    
    if (historyResponse.status !== 200) {
      throw new Error(`Order history retrieval failed: ${historyResponse.status}`)
    }
    
    const history = historyResponse.data
    console.log('✅ Order history retrieved successfully')
    console.log(`   - Total state changes: ${history.length}`)
    
    // Verify the state change log
    if (history.length < 3) {
      throw new Error('Expected at least 3 state changes in history')
    }
    
    // Verify the state transitions are logged correctly
    // Note: history is returned in reverse chronological order (newest first)
    const expectedTransitions = [
      { from: 'CLOSED', to: 'PICKED_UP' },
      { from: 'EXTENDED', to: 'CLOSED' },
      { from: 'OPEN', to: 'EXTENDED' }
    ]
    
    for (let i = 0; i < expectedTransitions.length; i++) {
      const logEntry = history[i]
      const expected = expectedTransitions[i]
      
      if (logEntry.fromState !== expected.from || logEntry.toState !== expected.to) {
        throw new Error(`State transition log mismatch at index ${i}: expected ${expected.from}→${expected.to}, got ${logEntry.fromState}→${logEntry.toState}`)
      }
    }
    
    console.log('✅ State transition history verified correctly')
    
    // Test that the order appears in the orders list with updated state
    const ordersResponse = await request('GET', '/api/orders', null, {
      'Authorization': `Bearer ${token}`
    })
    
    if (ordersResponse.status !== 200) {
      throw new Error(`Orders list failed: ${ordersResponse.status}`)
    }
    
    const orders = ordersResponse.data
    const testOrder = orders.find(o => o.id === orderId)
    
    if (!testOrder) {
      throw new Error('Updated order not found in orders list')
    }
    
    if (testOrder.state !== 'PICKED_UP') {
      throw new Error(`Order state not updated correctly: ${testOrder.state}`)
    }
    
    console.log('✅ Order state updated in orders list')
    
    console.log('🎉 Order State Management smoke test PASSED!')
    console.log(`📊 State Transition Summary:`)
    console.log(`   - OPEN → EXTENDED → CLOSED → PICKED_UP`)
    console.log(`   - Total state changes: ${history.length}`)
    console.log(`   - Invalid transitions correctly rejected`)
    
    return true
    
  } catch (error) {
    console.error('❌ Order State Management smoke test FAILED:', error.message)
    return false
  }
}

// Run the test
testOrderStateManagement().then(success => {
  process.exit(success ? 0 : 1)
})
