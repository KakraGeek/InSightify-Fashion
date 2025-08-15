export async function sendSms(phone: string, message: string) {
  const provider = process.env.SMS_PROVIDER || "mock"
  const senderId = process.env.SMS_SENDER_ID || "INSIGHTIFY"

  if (provider === "hubtel") {
    console.log(`[HUBTEL SMS] ${senderId} -> ${phone}: ${message}`)
    return { ok: true }
  }
  if (provider === "africastalking") {
    console.log(`[AT SMS] ${senderId} -> ${phone}: ${message}`)
    return { ok: true }
  }
  console.log(`[MOCK SMS] ${senderId} -> ${phone}: ${message}`)
  return { ok: true }
}