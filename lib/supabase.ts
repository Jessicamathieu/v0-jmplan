// tests/database.test.ts
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

describe("Database tests", () => {
  it("should fetch active clients", async () => {
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .eq("actif", true)

    expect(error).toBeNull()
    expect(Array.isArray(data)).toBe(true)
  })

  it("should fetch active services", async () => {
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .eq("actif", true)

    expect(error).toBeNull()
    expect(Array.isArray(data)).toBe(true)
  })
})

