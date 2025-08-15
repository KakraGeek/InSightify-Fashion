import { resolver } from "@blitzjs/rpc"
import { z } from "zod"
import db from "db"

const CreateOrderInput = z.object({
  customerId: z.string().min(1, "Customer is required"),
  title: z.string().min(1, "Title is required"),
  dueDate: z.string().min(1, "Due date is required"),
  amount: z.number().min(0, "Amount must be non-negative"),
})

export default resolver.pipe(
  resolver.zod(CreateOrderInput),
  async (input, ctx) => {
    if (!(ctx.session as any)?.workspaceId) {
      throw new Error("Not authenticated or no workspace")
    }

    // Get the next job number for this workspace
    const lastOrder = await db.order.findFirst({
      where: { workspaceId: (ctx.session as any).workspaceId },
      orderBy: { jobNumber: "desc" },
      select: { jobNumber: true },
    })

    const nextJobNumber = (lastOrder?.jobNumber || 1000) + 1

    const order = await db.order.create({
      data: {
        ...input,
        workspaceId: (ctx.session as any).workspaceId,
        jobNumber: nextJobNumber,
        dueDate: new Date(input.dueDate),
        amount: input.amount,
        state: "OPEN",
      },
      include: {
        customer: true,
      },
    })

    return order
  }
)
