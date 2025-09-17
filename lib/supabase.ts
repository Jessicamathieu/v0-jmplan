import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types pour la base de données
export type Database = {
  public: {
    Tables: {
      clients: {
        Row: {
          id: number
          nom: string
          prenom: string
          email: string | null
          telephone: string | null
          adresse: string | null
          date_naissance: string | null
          points_fidelite: number
          created_at: string
          updated_at: string
        }
        Insert: {
          nom: string
          prenom: string
          email?: string | null
          telephone?: string | null
          adresse?: string | null
          date_naissance?: string | null
          points_fidelite?: number
        }
        Update: {
          nom?: string
          prenom?: string
          email?: string | null
          telephone?: string | null
          adresse?: string | null
          date_naissance?: string | null
          points_fidelite?: number
        }
      }
      services: {
        Row: {
          id: number
          nom: string
          description: string | null
          prix: number
          duree: number
          actif: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          nom: string
          description?: string | null
          prix: number
          duree: number
          actif?: boolean
        }
        Update: {
          nom?: string
          description?: string | null
          prix?: number
          duree?: number
          actif?: boolean
        }
      }
      rendez_vous: {
        Row: {
          id: number
          client_id: number
          service_id: number
          employe_id: number | null
          date_heure: string
          duree: number
          statut: string
          notes: string | null
          prix: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          client_id: number
          service_id: number
          employe_id?: number | null
          date_heure: string
          duree: number
          statut?: string
          notes?: string | null
          prix?: number | null
        }
        Update: {
          client_id?: number
          service_id?: number
          employe_id?: number | null
          date_heure?: string
          duree?: number
          statut?: string
          notes?: string | null
          prix?: number | null
        }
      }
    }
  }
}
