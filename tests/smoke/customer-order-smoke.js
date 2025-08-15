// Customer and Order creation smoke test
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

async function testCustomerOrderFlow() {
  try {
    console.log('🧪 Testing Customer and Order Creation Flow...')
    
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
    
    // Test customer creation
    const customerData = {
      name: 'Smoke Test Customer',
      phone: '0240000005',
      notes: 'Customer created during smoke test'
    }
    
    const customerResponse = await request('POST', '/api/customers', customerData, {
      'Authorization': `Bearer ${token}`
    })
    
    if (customerResponse.status !== 200) {
      throw new Error(`Customer creation failed: ${customerResponse.status}`)
    }
    
    const customerId = customerResponse.data.id
    console.log('✅ Customer created successfully:', customerId)
    
    // Test order creation
    const orderData = {
      customerId: customerId,
      title: 'Smoke Test Order',
      dueDate: '2025-08-30',
      amount: 99.99
    }
    
    const orderResponse = await request('POST', '/api/orders', orderData, {
      'Authorization': `Bearer ${token}`
    })
    
    if (orderResponse.status !== 200) {
      throw new Error(`Order creation failed: ${orderResponse.status}`)
    }
    
    console.log('✅ Order created successfully with job number:', orderResponse.data.jobNumber)
    
    // Test that the order appears in the orders list
    const ordersResponse = await request('GET', '/api/orders', null, {
      'Authorization': `Bearer ${token}`
    })
    
    if (ordersResponse.status !== 200) {
      throw new Error(`Orders list failed: ${ordersResponse.status}`)
    }
    
    const orders = ordersResponse.data
    const testOrder = orders.find(o => o.title === 'Smoke Test Order')
    
    if (!testOrder) {
      throw new Error('Created order not found in orders list')
    }
    
    console.log('✅ Order found in orders list')
    
    // Test that the customer appears in the customers list
    const customersResponse = await request('GET', '/api/customers', null, {
      'Authorization': `Bearer ${token}`
    })
    
    if (customersResponse.status !== 200) {
      throw new Error(`Customers list failed: ${customersResponse.status}`)
    }
    
    const customers = customersResponse.data
    const testCustomer = customers.find(c => c.name === 'Smoke Test Customer')
    
    if (!testCustomer) {
      throw new Error('Created customer not found in customers list')
    }
    
    console.log('✅ Customer found in customers list')
    
    console.log('🎉 Customer and Order smoke test PASSED!')
    return true
    
  } catch (error) {
    console.error('❌ Customer and Order smoke test FAILED:', error.message)
    return false
  }
}

// Run the test
testCustomerOrderFlow().then(success => {
  process.exit(success ? 0 : 1)
})
