import { supabase } from "./supabase"
import type { Database } from "../types/supabase"

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
export type GoogleToken = Database["public"]["Tables"]["google_calendar_tokens"]["Row"]
export type GoogleTokenInsert = Database["public"]["Tables"]["google_calendar_tokens"]["Insert"]
export type GoogleTokenUpdate = Database["public"]["Tables"]["google_calendar_tokens"]["Update"]

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
    const { data, error } = await supabase.from("clients").insert(client).select().single()

    if (error) throw error
    return data
  }

  static async updateClient(id: number, updates: ClientUpdate) {
    const { data, error } = await supabase.from("clients").update(updates).eq("id", id).select().single()

    if (error) throw error
    return data
  }

  static async deleteClient(id: number) {
    const { error } = await supabase.from("clients").delete().eq("id", id)
    if (error) throw error
    return true
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
    const { data, error } = await supabase.from("services").insert(service).select().single()

    if (error) throw error
    return data
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
      .order("date_heure", { ascending: true })

    if (startDate && endDate) {
      query = query.gte("date_heure", startDate).lte("date_heure", endDate)
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
    const { error } = await supabase.from("rendez_vous").delete().eq("id", id)
    if (error) throw error
    return true
  }

  // Employés et salles
  static async getEmployes() {
    const { data, error } = await supabase
      .from("employes")
      .select("*")
      .eq("actif", true)
      .order("nom", { ascending: true })

    if (error) throw error
    return data
  }

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
    },
  ) {
    const { data, error } = await supabase
      .from("google_calendar_tokens")
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
    const { data, error } = await supabase.from("google_calendar_tokens").select("*").eq("user_id", userId).single()

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

// --- Clients ---
export async function getClients() {
  const { data, error } = await supabase.from("clients").select("*").order("nom", { ascending: true })
  if (error) throw error
  return data as Client[]
}
export async function addClient(client: Omit<Client, "id" | "created_at" | "updated_at">) {
  const { data, error } = await supabase.from("clients").insert(client).select().single()
  if (error) throw error
  return data as Client
}
export async function updateClient(id: number, updates: Partial<Client>) {
  const { data, error } = await supabase.from("clients").update(updates).eq("id", id).select().single()
  if (error) throw error
  return data as Client
}
export async function deleteClient(id: number) {
  const { error } = await supabase.from("clients").delete().eq("id", id)
  if (error) throw error
  return true
}

// --- Services ---
export async function getServices() {
  const { data, error } = await supabase.from("services").select("*").order("nom", { ascending: true })
  if (error) throw error
  return data as Service[]
}

// --- Employés ---
export async function getEmployes() {
  const { data, error } = await supabase.from("employes").select("*").order("nom", { ascending: true })
  if (error) throw error
  return data as Employe[]
}

// --- Salles ---
export async function getSalles() {
  const { data, error } = await supabase.from("salles").select("*").order("nom", { ascending: true })
  if (error) throw error
  return data as Salle[]
}

// --- Rendez-vous ---
export async function getRendezVous() {
  const { data, error } = await supabase.from("rendez_vous").select("*").order("date_heure", { ascending: true })
  if (error) throw error
  return data as RendezVous[]
}
export async function addRendezVous(rv: Omit<RendezVous, "id" | "created_at" | "updated_at">) {
  const { data, error } = await supabase.from("rendez_vous").insert(rv).select().single()
  if (error) throw error
  return data as RendezVous
}
export async function updateRendezVous(id: number, updates: Partial<RendezVous>) {
  const { data, error } = await supabase.from("rendez_vous").update(updates).eq("id", id).select().single()
  if (error) throw error
  return data as RendezVous
}
export async function deleteRendezVous(id: number) {
  const { error } = await supabase.from("rendez_vous").delete().eq("id", id)
  if (error) throw error
  return true
}

// --- Agenda Complet ---
export async function getAgendaComplet(startDate?: string, endDate?: string) {
  let query = supabase
    .from("rendez_vous")
    .select(`
      id,
      date_heure,
      duree,
      statut,
      notes,
      prix,
      google_event_id,
      rappel_envoye,
      confirmation_envoyee,
      clients:client_id (id, nom, prenom, email, telephone),
      services:service_id (id, nom, prix, duree, description),
      employes:employe_id (id, nom, prenom, email),
      salles:salle_id (id, nom, capacite)
    `)
    .order("date_heure", { ascending: true })

  if (startDate && endDate) {
    query = query.gte("date_heure", startDate).lte("date_heure", endDate)
  }

  const { data, error } = await query
  if (error) throw error
  return data
}

// --- Import/Export ---
export async function importClients(clients: Omit<Client, "id" | "created_at" | "updated_at">[]) {
  const { error } = await supabase.from("clients").insert(clients)
  if (error) throw error
  return true
}
export async function importServices(services: Omit<Service, "id" | "created_at" | "updated_at">[]) {
  const { error } = await supabase.from("services").insert(services)
  if (error) throw error
  return true
}

export { supabase }
