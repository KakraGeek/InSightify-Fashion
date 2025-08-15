import { resolver } from "@blitzjs/rpc"
import { z } from "zod"
import db from "db"

const UpsertItemInput = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  description: z.string().nullable().optional(),
  qty: z.number().min(0, "Quantity must be non-negative"),
  unitPrice: z.union([z.number(), z.string()]).transform(val => typeof val === 'string' ? parseFloat(val) : val).refine(val => !isNaN(val) && val >= 0, "Unit price must be a valid non-negative number"),
  reorderLevel: z.number().min(0, "Reorder level must be non-negative"),
  vendorId: z.string().optional(),
})

export default resolver.pipe(
  resolver.zod(UpsertItemInput),
  async (input, ctx) => {
    if (!(ctx.session as any)?.workspaceId) {
      throw new Error("Not authenticated or no workspace")
    }

    const data = {
      ...input,
      workspaceId: (ctx.session as any).workspaceId,
    }

    if (input.id) {
      // Update existing item
      return db.item.update({
        where: { id: input.id },
        data,
        include: {
          vendor: { select: { name: true, phone: true } }
        }
      })
    } else {
      // Create new item
      return db.item.create({
        data,
        include: {
          vendor: { select: { name: true, phone: true } }
        }
      })
    }
  }
)
