import { resolver } from "@blitzjs/rpc"
import { z } from "zod"
import db from "db"
import { hash256, generateToken } from "@blitzjs/auth"
import crypto from "crypto"

const LoginInput = z.object({
  email: z.string().email(),
  password: z.string(),
})

export default resolver.pipe(
  resolver.zod(LoginInput),
  async ({ email, password }, ctx) => {
    // Find user by email
    const user = await db.user.findFirst({
      where: { email: email.toLowerCase() },
      include: { workspace: true },
    })

    if (!user) {
      throw new Error("Invalid email or password")
    }

    // Verify password (simple hash for now)
    const hashedInput = crypto.createHash('sha256').update(password).digest('hex')
    if (hashedInput !== user.password) {
      throw new Error("Invalid email or password")
    }

    // Create session
    const token = await generateToken()
    const hashedToken = hash256(token)

    await db.session.upsert({
      where: { userId: user.id },
      update: { tokenHash: hashedToken, expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30) }, // 30 days
      create: {
        userId: user.id,
        tokenHash: hashedToken,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      },
    })

    // Return session data
    return {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      workspaceId: user.workspaceId,
      workspaceName: user.workspace.name,
      token,
    }
  }
)
