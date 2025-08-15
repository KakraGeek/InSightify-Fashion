import { resolver } from "@blitzjs/rpc"
import db from "db"

export default resolver.pipe(
  async (_, ctx) => {
    if (!ctx.session?.userId) {
      throw new Error("Not authenticated")
    }

    // Delete the session
    await db.session.deleteMany({
      where: { userId: ctx.session.userId },
    })

    return { success: true }
  }
)
