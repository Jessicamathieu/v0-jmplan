export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import twilio from "twilio"

const SID = process.env.TWILIO_SID
const AUTH = process.env.TWILIO_AUTH
const FROM = process.env.TWILIO_PHONE

// Entrée attendue:
// { "to":"+1XXXXXXXXXX", "message":"Texte...", "mediaUrl"?: "https://..." }
export async function POST(req: Request) {
  try {
    if (!SID || !AUTH || !FROM) {
      return NextResponse.json({ error: "Twilio credentials missing" }, { status: 500 })
    }
    const { to, message, mediaUrl } = await req.json()

    if (!to || !message) {
      return NextResponse.json({ error: "Paramètres 'to' et 'message' requis" }, { status: 400 })
    }

    const client = twilio(SID, AUTH)
    const payload: any = { body: message, from: FROM, to }
    if (mediaUrl) payload.mediaUrl = mediaUrl

    const res = await client.messages.create(payload)
    return NextResponse.json({ success: true, sid: res.sid })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "SMS error" }, { status: 500 })
  }
}
