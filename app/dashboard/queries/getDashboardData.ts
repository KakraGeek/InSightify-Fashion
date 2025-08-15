import { resolver } from "@blitzjs/rpc"
import db from "db"

export default resolver.pipe(
  async (_, ctx) => {
    if (!(ctx.session as any)?.workspaceId) {
      throw new Error("Not authenticated or no workspace")
    }

    const now = new Date()
    const fortyEightHoursFromNow = new Date(now.getTime() + 48 * 60 * 60 * 1000)
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    // Get order counts by state
    const [open, extended, closedThisMonth, pickedUp] = await Promise.all([
      db.order.count({
        where: { 
          workspaceId: (ctx.session as any).workspaceId,
          state: "OPEN"
        }
      }),
      db.order.count({
        where: { 
          workspaceId: (ctx.session as any).workspaceId,
          state: "EXTENDED"
        }
      }),
      db.order.count({
        where: { 
          workspaceId: (ctx.session as any).workspaceId,
          state: "CLOSED",
          updatedAt: { gte: startOfMonth }
        }
      }),
      db.order.count({
        where: { 
          workspaceId: (ctx.session as any).workspaceId,
          state: "PICKED_UP"
        }
      })
    ])

    // Get orders due soon (≤48h) with customer details
    const dueSoon = await db.order.findMany({
      where: {
        workspaceId: (ctx.session as any).workspaceId,
        state: { in: ["OPEN", "EXTENDED"] },
        dueDate: { lte: fortyEightHoursFromNow, gte: now }
      },
      include: {
        customer: { select: { name: true, phone: true } }
      },
      orderBy: { dueDate: "asc" },
      take: 10
    })

    // Get overdue orders with customer details
    const overdue = await db.order.findMany({
      where: {
        workspaceId: (ctx.session as any).workspaceId,
        state: { in: ["OPEN", "EXTENDED"] },
        dueDate: { lt: now }
      },
      include: {
        customer: { select: { name: true, phone: true } }
      },
      orderBy: { dueDate: "asc" },
      take: 10
    })

    // Get recent orders for activity feed
    const recentOrders = await db.order.findMany({
      where: {
        workspaceId: (ctx.session as any).workspaceId
      },
      include: {
        customer: { select: { name: true } }
      },
      orderBy: { createdAt: "desc" },
      take: 5
    })

    // Calculate total revenue for current month
    const monthlyRevenue = await db.order.aggregate({
      where: {
        workspaceId: (ctx.session as any).workspaceId,
        state: "CLOSED",
        updatedAt: { gte: startOfMonth }
      },
      _sum: { amount: true }
    })

    return {
      stats: {
        open,
        extended,
        closedThisMonth,
        pickedUp
      },
      dueSoon,
      overdue,
      recentOrders,
      monthlyRevenue: (monthlyRevenue._sum.amount || 0).toString()
    }
  }
)
