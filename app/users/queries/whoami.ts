import { resolver } from "@blitzjs/rpc"
import db from "db"

export default resolver.pipe(
  async (_, ctx) => {
    if (!ctx.session?.userId) {
      throw new Error("Not authenticated")
    }

    const user = await db.user.findUnique({
      where: { id: (ctx.session as any).userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        workspaceId: true,
        workspace: {
          select: {
            name: true,
          },
        },
      },
    })

    if (!user) {
      throw new Error("User not found")
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      workspaceId: user.workspaceId,
      workspaceName: user.workspace.name,
    }
  }
)
