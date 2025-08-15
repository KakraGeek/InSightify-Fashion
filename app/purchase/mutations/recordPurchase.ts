import { resolver } from "@blitzjs/rpc"
import { z } from "zod"
import db from "db"

const RecordPurchaseInput = z.object({
  vendorId: z.string().min(1, "Vendor is required"),
  itemId: z.string().min(1, "Item is required"),
  qty: z.number().min(1, "Quantity must be at least 1"),
  unitPrice: z.number().min(0, "Unit price must be non-negative"),
  date: z.string().min(1, "Purchase date is required"),
  notes: z.string().optional(),
})

export default resolver.pipe(
  resolver.zod(RecordPurchaseInput),
  async (input, ctx) => {
    if (!(ctx.session as any)?.workspaceId) {
      throw new Error("Not authenticated or no workspace")
    }

    // Verify the vendor belongs to the current workspace
    const vendor = await db.vendor.findFirst({
      where: {
        id: input.vendorId,
        workspaceId: (ctx.session as any).workspaceId,
      },
    })

    if (!vendor) {
      throw new Error("Vendor not found")
    }

    // Verify the item belongs to the current workspace
    const item = await db.item.findFirst({
      where: {
        id: input.itemId,
        workspaceId: (ctx.session as any).workspaceId,
      },
    })

    if (!item) {
      throw new Error("Item not found")
    }

    const total = input.qty * input.unitPrice

    // Record the purchase
    const purchase = await db.purchase.create({
      data: {
        workspaceId: (ctx.session as any).workspaceId,
        vendorId: input.vendorId,
        itemId: input.itemId,
        qty: input.qty,
        unitPrice: input.unitPrice,
        total,
        date: new Date(input.date),
      },
      include: {
        vendor: { select: { name: true, phone: true } },
        item: { select: { name: true, description: true } }
      }
    })

    // Update item quantity
    await db.item.update({
      where: { id: input.itemId },
      data: {
        qty: item.qty + input.qty,
      },
    })

    return purchase
  }
)
