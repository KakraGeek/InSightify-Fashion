import { resolver } from "@blitzjs/rpc"
import { z } from "zod"
import db from "db"

const CreateCustomerInput = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(1, "Phone is required"),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),
  notes: z.string().optional(),
  
  // Basic measurements
  height: z.number().positive().optional(),
  weight: z.number().positive().optional(),
  
  // Upper body measurements
  chest: z.number().positive().optional(),
  waist: z.number().positive().optional(),
  hips: z.number().positive().optional(),
  shoulder: z.number().positive().optional(),
  sleeveLength: z.number().positive().optional(),
  neck: z.number().positive().optional(),
  armhole: z.number().positive().optional(),
  
  // Lower body measurements
  inseam: z.number().positive().optional(),
  thigh: z.number().positive().optional(),
  knee: z.number().positive().optional(),
  calf: z.number().positive().optional(),
  ankle: z.number().positive().optional(),
  
  // Special measurements
  backLength: z.number().positive().optional(),
  crotch: z.number().positive().optional(),
  
  // Preferences
  preferredFit: z.string().optional(),
  fabricPreferences: z.string().optional(),
})

export default resolver.pipe(
  resolver.zod(CreateCustomerInput),
  async (input, ctx) => {
    if (!(ctx.session as any)?.workspaceId) {
      throw new Error("Not authenticated or no workspace")
    }

    const customer = await db.customer.create({
      data: {
        ...input,
        workspaceId: (ctx.session as any).workspaceId,
      },
    })

    return customer
  }
)
