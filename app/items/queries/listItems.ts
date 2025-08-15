import { resolver } from "@blitzjs/rpc"
import db from "db"

export default resolver.pipe(
  async (_, ctx) => {
    if (!(ctx.session as any)?.workspaceId) {
      throw new Error("Not authenticated or no workspace")
    }

    const items = await db.item.findMany({ 
      where: { workspaceId: (ctx.session as any).workspaceId }, 
      include: { vendor: true }, 
      orderBy: { name: "asc" } 
    })
    const alerts = items.filter(i => i.qty <= i.reorderLevel).map(i => i.id)
    return { items, alerts }
  }
)
