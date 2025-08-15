const http = require('http')

const testCustomerMeasurements = async () => {
  console.log('🧪 Testing Customer Measurements Creation...')
  
  try {
    // Test customer creation with comprehensive measurements
    const customerData = {
      name: "Ama Osei",
      phone: "0241234567",
      email: "ama.osei@example.com",
      address: "123 High Street, Accra",
      
      // Basic measurements
      height: 165.5,
      weight: 58.2,
      
      // Upper body measurements
      chest: 88.0,
      waist: 72.5,
      hips: 94.0,
      shoulder: 42.0,
      sleeveLength: 58.5,
      neck: 36.0,
      armhole: 44.0,
      
      // Lower body measurements
      inseam: 78.0,
      thigh: 58.0,
      knee: 38.0,
      calf: 35.0,
      ankle: 22.0,
      
      // Special measurements
      backLength: 62.0,
      crotch: 28.0,
      
      // Preferences
      preferredFit: "regular",
      fabricPreferences: "cotton, linen",
      
      notes: "Customer prefers natural fabrics and regular fit"
    }

    const postData = JSON.stringify(customerData)
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/customers',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }

    const req = http.request(options, (res) => {
      let data = ''
      
      res.on('data', (chunk) => {
        data += chunk
      })
      
      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          console.log('✅ Customer with measurements created successfully!')
          console.log('📊 Response:', JSON.parse(data))
        } else {
          console.log('❌ Customer creation failed:', res.statusCode)
          console.log('📄 Response:', data)
        }
      })
    })

    req.on('error', (e) => {
      console.error('❌ Request error:', e.message)
    })

    req.write(postData)
    req.end()

  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

// Run the test
testCustomerMeasurements()
