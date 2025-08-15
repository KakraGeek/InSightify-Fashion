// Simple API smoke to check server is up. Extend to auth-protected checks later.
const http = require('node:http')

function get(path) {
  return new Promise((resolve, reject) => {
    const req = http.request({ hostname: 'localhost', port: 3000, path, method: 'GET' }, res => {
      let data = ''
      res.on('data', c => data += c)
      res.on('end', () => resolve({ status: res.statusCode, data }))
    })
    req.on('error', reject)
    req.end()
  })
}

;(async () => {
  try {
    const health = await get('/api/health')
    if (health.status !== 200) throw new Error('Health check failed: ' + health.status)
    console.log('API smoke OK:', health.status)
  } catch (e) {
    console.error('API smoke failed:', e.message)
    process.exit(1)
  }
})()