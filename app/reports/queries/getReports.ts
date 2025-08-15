import { resolver } from "@blitzjs/rpc"
import { z } from "zod"
import db from "db"

const GetReportsInput = z.object({
  from: z.string().datetime(),
  to: z.string().datetime(),
})

export default resolver.pipe(
  resolver.zod(GetReportsInput),
  async (input, ctx) => {
    if (!(ctx.session as any)?.workspaceId) {
      throw new Error("Not authenticated or no workspace")
    }

    const { from, to } = input
    const fromDate = new Date(from)
    const toDate = new Date(to)
    const today = new Date()

    // Get orders in date range
    const orders = await db.order.findMany({
      where: {
        workspaceId: (ctx.session as any).workspaceId,
        createdAt: {
          gte: fromDate,
          lte: toDate,
        },
      },
      include: {
        customer: {
          select: {
            name: true,
            phone: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    // Get purchases in date range
    const purchases = await db.purchase.findMany({
      where: {
        workspaceId: (ctx.session as any).workspaceId,
        date: {
          gte: fromDate,
          lte: toDate,
        },
      },
      include: {
        vendor: {
          select: {
            name: true,
          },
        },
        item: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    })

    // Get all items for inventory analysis
    const allItems = await db.item.findMany({
      where: {
        workspaceId: (ctx.session as any).workspaceId,
      },
      select: {
        id: true,
        name: true,
        qty: true,
        reorderLevel: true,
        unitPrice: true,
      },
    })

    // Get all orders for overdue analysis (not just date range)
    const allOrders = await db.order.findMany({
      where: {
        workspaceId: (ctx.session as any).workspaceId,
      },
      select: {
        id: true,
        title: true,
        state: true,
        dueDate: true,
        extendedEta: true,
        amount: true,
        customer: {
          select: {
            name: true,
            phone: true,
          },
        },
      },
    })

    // Calculate totals
    const orderTotal = orders.reduce((sum, order) => sum + parseFloat(order.amount.toString()), 0)
    const purchaseTotal = purchases.reduce((sum, purchase) => sum + parseFloat(purchase.total.toString()), 0)
    const orderCount = orders.length
    const purchaseCount = purchases.length

    // Calculate low stock items
    const lowStockItems = allItems.filter(item => item.qty <= item.reorderLevel)

    // Calculate overdue orders
    const overdueOrders = allOrders.filter(order => 
      order.dueDate < today && 
      !["CLOSED", "PICKED_UP"].includes(order.state)
    )

    // Calculate extended orders
    const extendedOrders = allOrders.filter(order => order.extendedEta !== null)

    // Calculate top selling items (items with most orders)
    const itemOrderCounts = allOrders.reduce((acc, order) => {
      // For now, we'll count all orders since we don't have item-order relationship
      // In a real system, you might want to track which items are used in which orders
      acc["General Orders"] = (acc["General Orders"] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const topSellingItems = Object.entries(itemOrderCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }))

    // Calculate inventory value
    const totalInventoryValue = allItems.reduce((sum, item) => 
      sum + (item.qty * parseFloat(item.unitPrice.toString())), 0
    )

    // Calculate low stock value
    const lowStockValue = lowStockItems.reduce((sum, item) => 
      sum + (item.qty * parseFloat(item.unitPrice.toString())), 0
    )

    return {
      summary: {
        orderTotal: orderTotal.toFixed(2),
        purchaseTotal: purchaseTotal.toFixed(2),
        orderCount,
        purchaseCount,
        netRevenue: (orderTotal - purchaseTotal).toFixed(2),
        totalInventoryValue: totalInventoryValue.toFixed(2),
        lowStockValue: lowStockValue.toFixed(2),
      },
      orders,
      purchases,
      dateRange: {
        from: fromDate.toISOString(),
        to: toDate.toISOString(),
      },
      // New metrics
      lowStockItems: lowStockItems.map(item => ({
        id: item.id,
        name: item.name,
        currentQty: item.qty,
        reorderLevel: item.reorderLevel,
        unitPrice: item.unitPrice.toString(),
        value: (item.qty * parseFloat(item.unitPrice.toString())).toString(),
      })),
      overdueOrders: overdueOrders.map(order => ({
        id: order.id,
        title: order.title,
        dueDate: order.dueDate.toISOString(),
        daysOverdue: Math.floor((today.getTime() - order.dueDate.getTime()) / (1000 * 60 * 60 * 24)),
        state: order.state,
        amount: order.amount.toString(),
        customer: order.customer,
      })),
      extendedOrders: extendedOrders.map(order => ({
        id: order.id,
        title: order.title,
        originalDueDate: order.dueDate.toISOString(),
        extendedEta: order.extendedEta!.toISOString(),
        state: order.state,
        amount: order.amount.toString(),
        customer: order.customer,
      })),
      topSellingItems,
      inventoryMetrics: {
        totalItems: allItems.length,
        lowStockCount: lowStockItems.length,
        overdueCount: overdueOrders.length,
        extendedCount: extendedOrders.length,
      },
    }
  }
)
