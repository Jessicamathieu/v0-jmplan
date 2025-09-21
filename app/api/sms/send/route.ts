import { NextResponse } from "next/server"
import twilio from "twilio"

const client = twilio(process.env.TWILIO_SID!, process.env.TWILIO_AUTH!)

export async function POST(req: Request) {
  const { to, message } = await req.json()
  await client.messages.create({
    body: message,
    from: process.env.TWILIO_PHONE!,
    to,
  })
  return NextResponse.json({ success: true })
}
