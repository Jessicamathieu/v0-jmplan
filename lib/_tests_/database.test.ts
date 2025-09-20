// __tests__/database.test.ts
import { supabase } from "@/lib/supabase"

describe("Supabase connection", () => {
  it("doit récupérer des clients actifs", async () => {
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .eq("actif", true)

    expect(error).toBeNull()
    expect(Array.isArray(data)).toBe(true)
  })

  it("doit récupérer des services actifs", async () => {
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .eq("actif", true)

    expect(error).toBeNull()
    expect(Array.isArray(data)).toBe(true)
  })
})