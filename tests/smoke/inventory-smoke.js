// Inventory Management smoke test
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

async function testInventoryManagement() {
  try {
    console.log('🧪 Testing Inventory Management System...')
    
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
    
    // Test vendor creation
    const vendorData = {
      name: 'Inventory Test Vendor',
      phone: '0240000007',
      email: 'vendor@test.com',
      address: '123 Test Street, Accra',
      notes: 'Vendor created during inventory smoke test'
    }
    
    const vendorResponse = await request('POST', '/api/vendors', vendorData, {
      'Authorization': `Bearer ${token}`
    })
    
    if (vendorResponse.status !== 200) {
      throw new Error(`Vendor creation failed: ${vendorResponse.status}`)
    }
    
    const vendorId = vendorResponse.data.id
    console.log('✅ Vendor created successfully:', vendorId)
    
    // Test item creation
    const itemData = {
      name: 'Smoke Test Fabric',
      description: 'High-quality fabric for testing',
      qty: 50,
      unitPrice: 25.99,
      reorderLevel: 10,
      vendorId: vendorId
    }
    
    const itemResponse = await request('POST', '/api/items', itemData, {
      'Authorization': `Bearer ${token}`
    })
    
    if (itemResponse.status !== 200) {
      throw new Error(`Item creation failed: ${itemResponse.status}`)
    }
    
    const itemId = itemResponse.data.id
    console.log('✅ Item created successfully:', itemId)
    console.log('✅ Initial item quantity:', itemResponse.data.qty)
    
    // Test purchase recording
    const purchaseData = {
      vendorId: vendorId,
      itemId: itemId,
      qty: 25,
      unitPrice: 24.50,
      date: '2025-08-15',
      notes: 'Purchase recorded during smoke test'
    }
    
    const purchaseResponse = await request('POST', '/api/purchases', purchaseData, {
      'Authorization': `Bearer ${token}`
    })
    
    if (purchaseResponse.status !== 200) {
      throw new Error(`Purchase recording failed: ${purchaseResponse.status}`)
    }
    
    console.log('✅ Purchase recorded successfully')
    console.log('✅ Purchase total:', purchaseResponse.data.total)
    
    // Test inventory status retrieval
    const inventoryResponse = await request('GET', '/api/inventory/status', null, {
      'Authorization': `Bearer ${token}`
    })
    
    if (inventoryResponse.status !== 200) {
      throw new Error(`Inventory status failed: ${inventoryResponse.status}`)
    }
    
    const inventoryData = inventoryResponse.data
    console.log('✅ Inventory status retrieved successfully')
    
    // Verify inventory structure
    if (!inventoryData.summary) {
      throw new Error('Inventory missing summary section')
    }
    
    if (!inventoryData.items) {
      throw new Error('Inventory missing items section')
    }
    
    if (!inventoryData.lowStockItems) {
      throw new Error('Inventory missing lowStockItems section')
    }
    
    if (!inventoryData.recentPurchases) {
      throw new Error('Inventory missing recentPurchases section')
    }
    
    if (!inventoryData.vendorSummary) {
      throw new Error('Inventory missing vendorSummary section')
    }
    
    console.log('✅ Inventory structure verified')
    
    // Verify summary metrics
    const { totalItems, lowStockItems, outOfStockItems, totalValue } = inventoryData.summary
    if (typeof totalItems !== 'number' || typeof lowStockItems !== 'number' || 
        typeof outOfStockItems !== 'number' || typeof totalValue !== 'string') {
      throw new Error('Inventory summary metrics are not properly typed')
    }
    
    console.log('✅ Inventory summary metrics verified')
    
    // Verify the created item appears in inventory
    const createdItem = inventoryData.items.find(item => item.id === itemId)
    if (!createdItem) {
      throw new Error('Created item not found in inventory')
    }
    
    // Verify the item quantity was updated after purchase (50 + 25 = 75)
    if (createdItem.qty !== 75) {
      throw new Error(`Item quantity not updated correctly: expected 75, got ${createdItem.qty}`)
    }
    
    console.log('✅ Item quantity updated correctly after purchase')
    
    // Verify the created vendor appears in vendor summary
    const createdVendor = inventoryData.vendorSummary.find(vendor => vendor.id === vendorId)
    if (!createdVendor) {
      throw new Error('Created vendor not found in vendor summary')
    }
    
    console.log('✅ Vendor appears in vendor summary')
    
    // Verify recent purchases include the recorded purchase
    const recordedPurchase = inventoryData.recentPurchases.find(purchase => 
      purchase.vendor.name === 'Inventory Test Vendor' && 
      purchase.item.name === 'Smoke Test Fabric'
    )
    
    if (!recordedPurchase) {
      throw new Error('Recorded purchase not found in recent purchases')
    }
    
    console.log('✅ Purchase appears in recent purchases')
    
    // Test items list API
    const itemsResponse = await request('GET', '/api/items', null, {
      'Authorization': `Bearer ${token}`
    })
    
    if (itemsResponse.status !== 200) {
      throw new Error(`Items list failed: ${itemsResponse.status}`)
    }
    
         const items = itemsResponse.data.items
     const testItem = items.find(item => item.name === 'Smoke Test Fabric')
    
    if (!testItem) {
      throw new Error('Created item not found in items list')
    }
    
    console.log('✅ Item found in items list')
    
    // Test vendors list API
    const vendorsResponse = await request('GET', '/api/vendors', null, {
      'Authorization': `Bearer ${token}`
    })
    
    if (vendorsResponse.status !== 200) {
      throw new Error(`Vendors list failed: ${vendorsResponse.status}`)
    }
    
    const vendors = vendorsResponse.data
    const testVendor = vendors.find(vendor => vendor.name === 'Inventory Test Vendor')
    
    if (!testVendor) {
      throw new Error('Created vendor not found in vendors list')
    }
    
    console.log('✅ Vendor found in vendors list')
    
    console.log('🎉 Inventory Management smoke test PASSED!')
    console.log(`📊 Inventory Summary:`)
    console.log(`   - Total Items: ${totalItems}`)
    console.log(`   - Low Stock Items: ${lowStockItems}`)
    console.log(`   - Out of Stock Items: ${outOfStockItems}`)
    console.log(`   - Total Value: GH₵${totalValue}`)
    console.log(`   - Created Item Quantity: ${createdItem.qty}`)
    console.log(`   - Purchase Total: GH₵${purchaseResponse.data.total}`)
    
    return true
    
  } catch (error) {
    console.error('❌ Inventory Management smoke test FAILED:', error.message)
    return false
  }
}

// Run the test
testInventoryManagement().then(success => {
  process.exit(success ? 0 : 1)
})
