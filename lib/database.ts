import { supabase } from "./supabase"se/supabase-js"
import type { Database } from "./supabase" // 👈 "type" ici
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
// Types pour les tablesprocess.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
export type Client = Database["public"]["Tables"]["clients"]["Row"]
export type ClientInsert = Database["public"]["Tables"]["clients"]["Insert"]
export type ClientUpdate = Database["public"]["Tables"]["clients"]["Update"]
// Ici, Database est un type
export type Service = Database["public"]["Tables"]["services"]["Row"]
export type ServiceInsert = Database["public"]["Tables"]["services"]["Insert"]
export type ServiceUpdate = Database["public"]["Tables"]["services"]["Update"]
      clients: {
export type RendezVous = Database["public"]["Tables"]["rendez_vous"]["Row"]
export type RendezVousInsert = Database["public"]["Tables"]["rendez_vous"]["Insert"]
export type RendezVousUpdate = Database["public"]["Tables"]["rendez_vous"]["Update"]
          prenom: string
export type Employe = Database["public"]["Tables"]["employes"]["Row"]
export type Salle = Database["public"]["Tables"]["salles"]["Row"]
export type GoogleToken = Database["public"]["Tables"]["google_tokens"]["Row"]
          date_naissance: string | null
// Fonctions utilitaires pour la base de données
export class DatabaseService {ber
  // Clientstif: boolean
  static async getClients() {
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .eq("actif", true)
      .order("nom", { ascending: true })
          email?: string | null
    if (error) throw errorng | null
    return datase?: string | null
  }       date_naissance?: string | null
          notes?: string | null
  static async createClient(client: ClientInsert) {
    const { data, error } = await supabase.from("clients").insert(client).select().single()
        }
    if (error) throw error
    return data string
  }       prenom?: string
          email?: string | null
  static async updateClient(id: number, updates: ClientUpdate) {
    const { data, error } = await supabase.from("clients").update(updates).eq("id", id).select().single()
          date_naissance?: string | null
    if (error) throw error null
    return datas_fidelite?: number
  }       actif?: boolean
        }
  static async deleteClient(id: number) {
    const { error } = await supabase.from("clients").update({ actif: false }).eq("id", id)
        Row: {
    if (error) throw error
  }       nom: string
          description: string | null
  // Servicesx: number
  static async getServices() {
    const { data, error } = await supabase
      .from("services")n
      .select("*")at: string
      .eq("actif", true)ring
      .order("nom", { ascending: true })
        Insert: {
    if (error) throw error
    return dataiption?: string | null
  }       prix: number
          duree: number
  static async createService(service: ServiceInsert) {
    const { data, error } = await supabase.from("services").insert(service).select().single()
        }
    if (error) throw error
    return data string
  }       description?: string | null
          prix?: number
  // Rendez-vous: number
  static async getRendezVous(startDate?: string, endDate?: string) {
    let query = supabasen
      .from("rendez_vous")
      .select(`
        *,oyes: {
        client:clients(*),
        service:services(*),
        employe:employes(*),
        salle:salles(*)g
      `)  email: string
      .neq("statut", "annule")null
      .order("date_heure", { ascending: true })
          actif: boolean
    if (startDate) {: string
      query = query.gte("date_heure", startDate)
    }   }
    if (endDate) {
      query = query.lte("date_heure", endDate)
    }     prenom: string
          email: string
    const { data, error } = await query
    if (error) throw errorring[]
    return data?: boolean
  }     }
        Update: {
  static async createRendezVous(rendezVous: RendezVousInsert) {
    const { data, error } = await supabase
      .from("rendez_vous")
      .insert(rendezVous)ing | null
      .select(`alites?: string[]
        *,actif?: boolean
        client:clients(*),
        service:services(*),
        employe:employes(*),
        salle:salles(*)
      `)  id: number
      .single()string
          capacite: number
    if (error) throw erroring[]
    return data: boolean
  }       created_at: string
          updated_at: string
  static async updateRendezVous(id: number, updates: RendezVousUpdate) {
    const { data, error } = await supabase
      .from("rendez_vous")
      .update(updates)umber
      .eq("id", id)ts?: string[]
      .select(`?: boolean
        *,
        client:clients(*),
        service:services(*),
        employe:employes(*),
        salle:salles(*) string[]
      `)  actif?: boolean
      .single()
      }
    if (error) throw error
    return data
  }       id: number
          client_id: number
  static async deleteRendezVous(id: number) {
    const { error } = await supabase.from("rendez_vous").update({ statut: "annule" }).eq("id", id)
          salle_id: number | null
    if (error) throw errorng
  }       duree: number
          statut: string
  // Employés et salles | null
  static async getEmployes() {
    const { data, error } = await supabase
      .from("employes"): boolean
      .select("*")tion_envoyee: boolean
      .eq("actif", true)ring
      .order("nom", { ascending: true })
        }
    if (error) throw error
    return datat_id: number
  }       service_id: number
          employe_id?: number | null
  static async getSalles() {| null
    const { data, error } = await supabase
      .from("salles")er
      .select("*") string
      .eq("actif", true) | null
      .order("nom", { ascending: true })
          google_event_id?: string | null
    if (error) throw errorboolean
    return datarmation_envoyee?: boolean
  }     }
        Update: {
  // Google Tokensd?: number
  static async saveGoogleTokens(
    userId: string,d?: number | null
    tokens: {le_id?: number | null
      access_token: stringing
      refresh_token?: string
      expires_at: stringg
      scope: stringtring | null
    },    prix?: number | null
  ) {     google_event_id?: string | null
    const { data, error } = await supabase
      .from("google_tokens")ee?: boolean
      .upsert({
        user_id: userId,
        ...tokens,s: {
      })Row: {
      .select()umber
      .single()id: string
          access_token: string
    if (error) throw errortring | null
    return dataes_at: string
  }       scope: string
          created_at: string
  static async getGoogleTokens(userId: string) {
    const { data, error } = await supabase.from("google_tokens").select("*").eq("user_id", userId).single()
        Insert: {
    if (error && error.code !== "PGRST116") throw error
    return datas_token: string
  }       refresh_token?: string | null
          expires_at: string
  // Import en batching
  static async batchInsertClients(clients: ClientInsert[]) {
    const { data, error } = await supabase
      .from("clients")ring
      .upsert(clients, { string
        onConflict: "email",ring | null
        ignoreDuplicates: false,
      })  scope?: string
      .select()
      }
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
