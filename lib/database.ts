import { supabase } from "./supabase"
import type { Database } from "./supabase"

copilot/vscode1758422801650
Re-export supabase client for other modules
Export supabase client for direct use
main
export { supabase }

// Types pour les tables
export type Client = Database["public"]["Tables"]["clients"]["Row"]
export type ClientInsert = Database["public"]["Tables"]["clients"]["Insert"]
export type ClientUpdate = Database["public"]["Tables"]["clients"]["Update"]

export type Service = Database["public"]["Tables"]["services"]["Row"]
export type ServiceInsert = Database["public"]["Tables"]["services"]["Insert"]
export type ServiceUpdate = Database["public"]["Tables"]["services"]["Update"]

export type RendezVous = Database["public"]["Tables"]["rendez_vous"]["Row"]
export type RendezVousInsert = Database["public"]["Tables"]["rendez_vous"]["Insert"]
export type RendezVousUpdate = Database["public"]["Tables"]["rendez_vous"]["Update"]

export type Employe = Database["public"]["Tables"]["employes"]["Row"]
export type Salle = Database["public"]["Tables"]["salles"]["Row"]
export type GoogleToken = Database["public"]["Tables"]["google_tokens"]["Row"]

// Fonctions utilitaires pour la base de données
export class DatabaseService {
  // Clients
  static async getClients() {
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .eq("actif", true)
      .order("nom", { ascending: true })
    if (error) throw error
    return data
  }

  static async createClient(client: ClientInsert) {
    const { data, error } = await supabase
      .from("clients")
      .insert(client)
      .select()
      .single()
    if (error) throw error
    return data
  }

  static async updateClient(id: number, updates: ClientUpdate) {
    const { data, error } = await supabase
      .from("clients")
      .update(updates)
      .eq("id", id)
      .select()
      .single()
    if (error) throw error
    return data
  }

  static async deleteClient(id: number) {
    const { error } = await supabase
      .from("clients")
      .update({ actif: false })
      .eq("id", id)
    if (error) throw error
  }

  // Services
  static async getServices() {
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .eq("actif", true)
      .order("nom", { ascending: true })
    if (error) throw error
    return data
  }

  static async createService(service: ServiceInsert) {
    const { data, error } = await supabase
      .from("services")
      .insert(service)
      .select()
      .single()
    if (error) throw error
    return data
  }

  static async updateService(id: number, updates: ServiceUpdate) {
    const { data, error } = await supabase
      .from("services")
      .update(updates)
      .eq("id", id)
      .select()
      .single()
    if (error) throw error
    return data
  }

  static async deleteService(id: number) {
    const { error } = await supabase
      .from("services")
      .update({ actif: false })
      .eq("id", id)
    if (error) throw error
  }

  // Rendez-vous
  static async getRendezVous(startDate?: string, endDate?: string) {
    let query = supabase
      .from("rendez_vous")
      .select(`
        *,
        client:clients(*),
        service:services(*),
        employe:employes(*),
        salle:salles(*)
      `)
      .neq("statut", "annule")
      .order("date_heure", { ascending: true })

    if (startDate) {
      query = query.gte("date_heure", startDate)
    }
    if (endDate) {
      query = query.lte("date_heure", endDate)
    }

    const { data, error } = await query
    if (error) throw error
    return data
  }

  static async createRendezVous(rendezVous: RendezVousInsert) {
    const { data, error } = await supabase
      .from("rendez_vous")
      .insert(rendezVous)
      .select(`
        *,
        client:clients(*),
        service:services(*),
        employe:employes(*),
        salle:salles(*)
      `)
      .single()
    if (error) throw error
    return data
  }

  static async updateRendezVous(id: number, updates: RendezVousUpdate) {
    const { data, error } = await supabase
      .from("rendez_vous")
      .update(updates)
      .eq("id", id)
      .select(`
        *,
        client:clients(*),
        service:services(*),
        employe:employes(*),
        salle:salles(*)
      `)
      .single()
    if (error) throw error
    return data
  }

  static async deleteRendezVous(id: number) {
    const { error } = await supabase
      .from("rendez_vous")
      .update({ statut: "annule" })
      .eq("id", id)
    if (error) throw error
  }

  // Employés
  static async getEmployes() {
    const { data, error } = await supabase
      .from("employes")
      .select("*")
      .eq("actif", true)
      .order("nom", { ascending: true })
    if (error) throw error
    return data
  }

  // Salles
  static async getSalles() {
    const { data, error } = await supabase
      .from("salles")
      .select("*")
      .eq("actif", true)
      .order("nom", { ascending: true })
    if (error) throw error
    return data
  }

  // Google Tokens
  static async saveGoogleTokens(
    userId: string,
    tokens: {
      access_token: string
      refresh_token?: string
      expires_at: string
      scope: string
    }
  ) {
    const { data, error } = await supabase
      .from("google_tokens")
      .upsert({
        user_id: userId,
        ...tokens,
      })
      .select()
      .single()
    if (error) throw error
    return data
  }

  static async getGoogleTokens(userId: string) {
    const { data, error } = await supabase
      .from("google_tokens")
      .select("*")
      .eq("user_id", userId)
      .single()
    if (error && error.code !== "PGRST116") throw error
    return data
  }

  // Import en batch
  static async batchInsertClients(clients: ClientInsert[]) {
    const { data, error } = await supabase
      .from("clients")
      .upsert(clients, {
        onConflict: "email",
        ignoreDuplicates: false,
      })
      .select()
    if (error) throw error
    return data
  }

  static async batchInsertServices(services: ServiceInsert[]) {
    const { data, error } = await supabase
      .from("services")
      .upsert(services, {
        onConflict: "nom",
        ignoreDuplicates: false,
      })
      .select()
    if (error) throw error
    return data
  }
}
