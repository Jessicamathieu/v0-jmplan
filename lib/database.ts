'use clients'
import { createClient } from '@supabase/supabase-js'

// Configuration de la connexion à la base de données Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
export type Client = {
  id: number
  nom: string
  adresse: string | null
  ville: string | null
  province: string | null
  codepostal: string | null
  telephone: string | null
  courriel: string | null
  actif: boolean
  created_at: string
  updated_at: string
}

export type Employe = {
  id: number
  nom_employe: string
  initiales: string | null
  couleur_secondaire: string | null
  actif: boolean
  created_at: string
  updated_at: string
}

export type Salle = {
  id: number
  description: string | null
  actif: boolean
  created_at: string
  updated_at: string
}

export type Service = {
  id: number
  categorie: string | null
  description: string | null
  dureeminutes: number
  prix: number
  employes_competents: string | null
  salle_id: number | null
  actif: boolean
  created_at: string
  updated_at: string
}

export type RendezVous = {
  id: number
  client_id: number
  service_id: number
  employe_id: number | null
  salle_id: number | null
  date_heure: string
  duree: number
  statut: string
  notes: string | null
  prix: number | null
  created_at: string
  updated_at: string
}

export type Produit = {
  id: number
  nom: string
  description: string | null
  prix: number
  actif: boolean
  created_at: string
  updated_at: string
}
// Exporter la classe DatabaseService
class DatabaseService {
  static createClient(body: any) {
    throw new Error("Method not implemented.")
  }
  static createClient(body: any) {
    throw new Error("Method not implemented.")
  }
  static async getClients() {
    const supabase = createClient(supabaseUrl, supabaseKey)
    const { data, error } = await supabase.from('clients').select('*')
    if (error) throw error
    return data as Client[]
  }

  static async getServices() {
    const supabase = createClient(supabaseUrl, supabaseKey)
    const { data, error } = await supabase.from('services').select('*')
    if (error) throw error
    return data as Service[]
  }

  static async getRendezVous() {
  const supabase = createClient(supabaseUrl, supabaseKey)
  const { data, error } = await supabase.from('rendez_vous').select('*') // ✅ underscore comme SQL
  if (error) throw error
  return data as RendezVous[]
  }

  static async getEmployes() {
    const supabase = createClient(supabaseUrl, supabaseKey)
    const { data, error } = await supabase.from('employes').select('*')
    if (error) throw error
    return data as Employe[]
  }

  static async getSalles() {
    const supabase = createClient(supabaseUrl, supabaseKey)
    const { data, error } = await supabase.from('salles').select('*')
    if (error) throw error
    return data as Salle[]
  }
}

export { DatabaseService }


export const getClients = () => DatabaseService.getClients()
export const getServices = () => DatabaseService.getServices()
export const getRendezVous = () => DatabaseService.getRendezVous()
export const getEmployes = () => DatabaseService.getEmployes()
export const getSalles = () => DatabaseService.getSalles()

