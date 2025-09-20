import { supabase } from "./supabase"
import type { Database } from "../types/supabase"

// --- Types ---
export type Client = Database["public"]["Tables"]["clients"]["Row"]
export type Service = Database["public"]["Tables"]["services"]["Row"]
export type Employe = Database["public"]["Tables"]["employes"]["Row"]
export type Salle = Database["public"]["Tables"]["salles"]["Row"]
export type RendezVous = Database["public"]["Tables"]["rendez_vous"]["Row"]

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
