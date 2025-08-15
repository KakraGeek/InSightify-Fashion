// Enhanced Dashboard smoke test
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

async function testEnhancedDashboard() {
  try {
    console.log('🧪 Testing Enhanced Dashboard Functionality...')
    
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
    
    // Test dashboard data retrieval
    const dashboardResponse = await request('GET', '/api/dashboard', null, {
      'Authorization': `Bearer ${token}`
    })
    
    if (dashboardResponse.status !== 200) {
      throw new Error(`Dashboard data failed: ${dashboardResponse.status}`)
    }
    
    const dashboardData = dashboardResponse.data
    console.log('✅ Dashboard data retrieved successfully')
    
    // Verify dashboard structure
    if (!dashboardData.stats) {
      throw new Error('Dashboard missing stats section')
    }
    
    if (!dashboardData.dueSoon) {
      throw new Error('Dashboard missing dueSoon section')
    }
    
    if (!dashboardData.overdue) {
      throw new Error('Dashboard missing overdue section')
    }
    
    if (!dashboardData.recentOrders) {
      throw new Error('Dashboard missing recentOrders section')
    }
    
    if (dashboardData.monthlyRevenue === undefined) {
      throw new Error('Dashboard missing monthlyRevenue')
    }
    
    console.log('✅ Dashboard structure verified')
    
    // Verify stats are numbers
    const { open, extended, closedThisMonth, pickedUp } = dashboardData.stats
    if (typeof open !== 'number' || typeof extended !== 'number' || 
        typeof closedThisMonth !== 'number' || typeof pickedUp !== 'number') {
      throw new Error('Dashboard stats are not numbers')
    }
    
    console.log('✅ Dashboard stats are properly typed')
    
    // Verify dueSoon orders have customer information
    if (dashboardData.dueSoon.length > 0) {
      const order = dashboardData.dueSoon[0]
      if (!order.customer || !order.customer.name || !order.customer.phone) {
        throw new Error('Due soon orders missing customer information')
      }
    }
    
    // Verify overdue orders have customer information
    if (dashboardData.overdue.length > 0) {
      const order = dashboardData.overdue[0]
      if (!order.customer || !order.customer.name || !order.customer.phone) {
        throw new Error('Overdue orders missing customer information')
      }
    }
    
    // Verify recent orders have customer information
    if (dashboardData.recentOrders.length > 0) {
      const order = dashboardData.recentOrders[0]
      if (!order.customer || !order.customer.name) {
        throw new Error('Recent orders missing customer information')
      }
    }
    
    console.log('✅ Order customer information verified')
    
    // Test dashboard page accessibility
    const dashboardPageResponse = await request('GET', '/', null, {
      'Authorization': `Bearer ${token}`
    })
    
    if (dashboardPageResponse.status !== 200) {
      throw new Error(`Dashboard page failed: ${dashboardPageResponse.status}`)
    }
    
    console.log('✅ Dashboard page accessible')
    
    console.log('🎉 Enhanced Dashboard smoke test PASSED!')
    console.log(`📊 Dashboard Summary:`)
    console.log(`   - Open Orders: ${open}`)
    console.log(`   - Extended Orders: ${extended}`)
    console.log(`   - Closed This Month: ${closedThisMonth}`)
    console.log(`   - Picked Up: ${pickedUp}`)
    console.log(`   - Due Soon: ${dashboardData.dueSoon.length}`)
    console.log(`   - Overdue: ${dashboardData.overdue.length}`)
    console.log(`   - Recent Orders: ${dashboardData.recentOrders.length}`)
    console.log(`   - Monthly Revenue: GH₵${parseFloat(dashboardData.monthlyRevenue).toFixed(2)}`)
    
    return true
    
  } catch (error) {
    console.error('❌ Enhanced Dashboard smoke test FAILED:', error.message)
    return false
  }
}

// Run the test
testEnhancedDashboard().then(success => {
  process.exit(success ? 0 : 1)
})
