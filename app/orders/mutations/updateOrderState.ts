import { resolver } from "@blitzjs/rpc"
import { z } from "zod"
import db from "db"

const UpdateOrderStateInput = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  newState: z.enum(["OPEN", "EXTENDED", "CLOSED", "PICKED_UP"], {
    errorMap: () => ({ message: "Invalid order state" })
  }),
  extendedEta: z.string().optional(), // Required when transitioning to EXTENDED
  notes: z.string().optional(),
})

export default resolver.pipe(
  resolver.zod(UpdateOrderStateInput),
  async (input, ctx) => {
    if (!(ctx.session as any)?.workspaceId) {
      throw new Error("Not authenticated or no workspace")
    }

    // Get the current order
    const currentOrder = await db.order.findFirst({
      where: {
        id: input.orderId,
        workspaceId: (ctx.session as any).workspaceId,
      },
      include: {
        customer: { select: { name: true, phone: true } }
      }
    })

    if (!currentOrder) {
      throw new Error("Order not found")
    }

    // Validate state transition
    const validTransitions: Record<string, string[]> = {
      OPEN: ["EXTENDED", "CLOSED"],
      EXTENDED: ["OPEN", "CLOSED"],
      CLOSED: ["PICKED_UP"],
      PICKED_UP: [] // Terminal state
    }

    const allowedStates = validTransitions[currentOrder.state] || []
    if (!allowedStates.includes(input.newState)) {
      throw new Error(`Cannot transition from ${currentOrder.state} to ${input.newState}`)
    }

    // Validate extendedEta when transitioning to EXTENDED
    if (input.newState === "EXTENDED" && !input.extendedEta) {
      throw new Error("Extended ETA is required when extending an order")
    }

    // Update the order state
    const updatedOrder = await db.order.update({
      where: { id: input.orderId },
      data: {
        state: input.newState,
        extendedEta: input.newState === "EXTENDED" ? new Date(input.extendedEta!) : null,
        updatedAt: new Date(),
      },
      include: {
        customer: { select: { name: true, phone: true } }
      }
    })

    // Log the state change
    await db.orderStateLog.create({
      data: {
        orderId: input.orderId,
        fromState: currentOrder.state,
        toState: input.newState,
        changedBy: (ctx.session as any).userId,
        notes: input.notes || `State changed from ${currentOrder.state} to ${input.newState}`,
        extendedEta: input.newState === "EXTENDED" ? new Date(input.extendedEta!) : null,
      }
    })

    return updatedOrder
  }
)
