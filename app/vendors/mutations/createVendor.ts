import { resolver } from "@blitzjs/rpc"
import { z } from "zod"
import db from "db"

const CreateVendorInput = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),
  notes: z.string().optional(),
})

export default resolver.pipe(
  resolver.zod(CreateVendorInput),
  async (input, ctx) => {
    if (!(ctx.session as any)?.workspaceId) {
      throw new Error("Not authenticated or no workspace")
    }

    const vendor = await db.vendor.create({
      data: {
        ...input,
        workspaceId: (ctx.session as any).workspaceId,
      },
    })

    return vendor
  }
)
