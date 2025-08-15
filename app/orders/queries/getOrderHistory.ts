import { resolver } from "@blitzjs/rpc"
import { z } from "zod"
import db from "db"

const GetOrderHistoryInput = z.object({
  orderId: z.string().min(1, "Order ID is required"),
})

export default resolver.pipe(
  resolver.zod(GetOrderHistoryInput),
  async (input, ctx) => {
    if (!(ctx.session as any)?.workspaceId) {
      throw new Error("Not authenticated or no workspace")
    }

    // Verify the order belongs to the current workspace
    const order = await db.order.findFirst({
      where: {
        id: input.orderId,
        workspaceId: (ctx.session as any).workspaceId,
      },
    })

    if (!order) {
      throw new Error("Order not found")
    }

    // Get the state change history
    const stateHistory = await db.orderStateLog.findMany({
      where: { orderId: input.orderId },
      include: {
        user: { select: { name: true, email: true } }
      },
      orderBy: { createdAt: "desc" },
    })

    return stateHistory
  }
)
