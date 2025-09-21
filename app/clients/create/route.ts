import { NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database"

export async function POST(req: Request) {
  const body = await req.json()
  const client = await DatabaseService.createClient(body)
  return NextResponse.json(client)
}
