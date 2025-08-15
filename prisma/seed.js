const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// Simple password hashing for seed script
async function hashPassword(password) {
  const crypto = require('crypto')
  return crypto.createHash('sha256').update(password).digest('hex')
}

async function main() {
  // Clean up existing data - delete in order of dependencies
  await prisma.$transaction([
    prisma.orderStateLog.deleteMany(),
    prisma.session.deleteMany(),
    prisma.order.deleteMany(),
    prisma.customer.deleteMany(),
    prisma.purchase.deleteMany(),
    prisma.item.deleteMany(),
    prisma.vendor.deleteMany(),
    prisma.user.deleteMany(),
    prisma.workspace.deleteMany(),
  ])

  const ws = await prisma.workspace.create({ data: { name: 'Insightify Fashion Studio' } })

  const hashedPassword = await hashPassword('Password123!')
  const user = await prisma.user.create({
    data: {
      email: 'owner@example.com',
      password: hashedPassword,
      name: 'Owner',
      role: 'OWNER',
      workspaceId: ws.id
    }
  })

  const v1 = await prisma.vendor.create({ data: { name: 'Makola Fabrics & Notions', workspaceId: ws.id } })

  await prisma.$transaction([
    prisma.item.create({ data: { name: 'Ankara Fabric', qty: 20, reorderLevel: 10, unitPrice: 25, vendorId: v1.id, workspaceId: ws.id } }),
    prisma.item.create({ data: { name: 'Thread (Black)', qty: 50, reorderLevel: 20, unitPrice: 2, vendorId: v1.id, workspaceId: ws.id } }),
    prisma.item.create({ data: { name: 'Zippers (Assorted)', qty: 30, reorderLevel: 15, unitPrice: 5, vendorId: v1.id, workspaceId: ws.id } }),
    prisma.item.create({ data: { name: 'Fusible Interfacing', qty: 12, reorderLevel: 8, unitPrice: 10, vendorId: v1.id, workspaceId: ws.id } }),
    prisma.item.create({ data: { name: 'Lining Fabric', qty: 18, reorderLevel: 10, unitPrice: 8, vendorId: v1.id, workspaceId: ws.id } }),
  ])

  let jobNo = 1001
  const [c1, c2, c3] = await prisma.$transaction([
    prisma.customer.create({ data: { name: 'Ama', phone: '0240000001', workspaceId: ws.id } }),
    prisma.customer.create({ data: { name: 'Kofi', phone: '0240000002', workspaceId: ws.id } }),
    prisma.customer.create({ data: { name: 'Akosua', phone: '0240000003', workspaceId: ws.id } }),
  ])

  await prisma.$transaction([
    prisma.order.create({ data: { workspaceId: ws.id, customerId: c1.id, jobNumber: jobNo++, title: 'Ladies Kente Dress', state: 'OPEN',   dueDate: new Date(Date.now()+3*86400000), amount: 450 } }),
    prisma.order.create({ data: { workspaceId: ws.id, customerId: c2.id, jobNumber: jobNo++, title: 'School Uniform (3 sets)', state: 'EXTENDED', dueDate: new Date(Date.now()+2*86400000), extendedEta: new Date(Date.now()+5*86400000), amount: 300 } }),
    prisma.order.create({ data: { workspaceId: ws.id, customerId: c3.id, jobNumber: jobNo++, title: 'Men Suit Alteration', state: 'CLOSED', dueDate: new Date(Date.now()-1*86400000), amount: 120 } }),
    prisma.order.create({ data: { workspaceId: ws.id, customerId: c1.id, jobNumber: jobNo++, title: 'Ankara Shirt (L)', state: 'PICKED_UP', dueDate: new Date(Date.now()-5*86400000), amount: 180 } }),
    prisma.order.create({ data: { workspaceId: ws.id, customerId: c2.id, jobNumber: jobNo++, title: 'Beaded Kaba & Slit', state: 'OPEN', dueDate: new Date(Date.now()+1*86400000), amount: 520 } }),
  ])

  console.log('Seed complete for Insightify - Fashion. Workspace:', ws.id, 'User:', user.id)
}

main().catch(e => {
  console.error(e)
  process.exit(1)
}).finally(async () => {
  await prisma.$disconnect()
})