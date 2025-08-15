import { resolver } from "@blitzjs/rpc"
import db from "db"

export default resolver.pipe(
  async (_, ctx) => {
    if (!(ctx.session as any)?.workspaceId) {
      throw new Error("Not authenticated or no workspace")
    }

    // Get all items with their current status
    const items = await db.item.findMany({
      where: { workspaceId: (ctx.session as any).workspaceId },
      include: {
        vendor: { select: { name: true, phone: true } },
        purchases: {
          orderBy: { date: "desc" },
          take: 5,
        }
      },
      orderBy: { name: "asc" },
    })

    // Calculate inventory metrics
    const totalItems = items.length
    const lowStockItems = items.filter(item => item.qty <= item.reorderLevel)
    const outOfStockItems = items.filter(item => item.qty === 0)
    const totalValue = items.reduce((sum, item) => sum + (item.qty * parseFloat(item.unitPrice.toString())), 0)

    // Get recent purchases for the workspace
    const recentPurchases = await db.purchase.findMany({
      where: { workspaceId: (ctx.session as any).workspaceId },
      include: {
        vendor: { select: { name: true } },
        item: { select: { name: true } }
      },
      orderBy: { date: "desc" },
      take: 10,
    })

    // Get vendor summary
    const vendorSummary = await db.vendor.findMany({
      where: { workspaceId: (ctx.session as any).workspaceId },
      include: {
        _count: {
          select: { items: true, purchases: true }
        }
      },
      orderBy: { name: "asc" },
    })

    return {
      summary: {
        totalItems,
        lowStockItems: lowStockItems.length,
        outOfStockItems: outOfStockItems.length,
        totalValue: totalValue.toFixed(2),
      },
      items: items.map(item => ({
        ...item,
        status: item.qty === 0 ? "OUT_OF_STOCK" : 
                item.qty <= item.reorderLevel ? "LOW_STOCK" : "IN_STOCK",
        value: (item.qty * parseFloat(item.unitPrice.toString())).toFixed(2),
      })),
      lowStockItems: lowStockItems.map(item => ({
        ...item,
        value: (item.qty * parseFloat(item.unitPrice.toString())).toFixed(2),
      })),
      recentPurchases,
      vendorSummary,
    }
  }
)
