import { resolver } from "@blitzjs/rpc"
import db from "db"

export default resolver.pipe(
  async (_, ctx) => {
    if (!(ctx.session as any)?.workspaceId) {
      throw new Error("Not authenticated or no workspace")
    }

    return db.vendor.findMany({
      where: { workspaceId: (ctx.session as any).workspaceId },
      include: {
        _count: {
          select: { items: true, purchases: true }
        }
      },
      orderBy: { name: "asc" },
    })
  }
)
