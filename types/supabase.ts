export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
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
          notes: string | null
          points_fidelite: number
          actif: boolean
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
          notes?: string | null
          points_fidelite?: number
          actif?: boolean
        }
        Update: {
          nom?: string
          prenom?: string
          email?: string | null
          telephone?: string | null
          adresse?: string | null
          date_naissance?: string | null
          notes?: string | null
          points_fidelite?: number
          actif?: boolean
        }
      }
      services: {
        Row: {
          id: number
          nom: string
          description: string | null
          prix: number
          duree: number
          couleur: string
          actif: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          nom: string
          description?: string | null
          prix: number
          duree: number
          couleur?: string
          actif?: boolean
        }
          Update: {
            nom?: string
            description?: string | null
            prix?: number
            duree?: number
            couleur?: string
            actif?: boolean
          }
      }
      employes: {
        Row: {
          id: number
          nom: string
          prenom: string
          email: string
          telephone: string | null
          specialites: string[]
          actif: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          nom: string
          prenom: string
          email: string
          telephone?: string | null
          specialites?: string[]
          actif?: boolean
        }
          Update: {
            nom?: string
            prenom?: string
            email?: string
            telephone?: string | null
            specialites?: string[]
            actif?: boolean
          }
      }
      salles: {
        Row: {
          id: number
          nom: string
          capacite: number
          equipements: string[]
          actif: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          nom: string
          capacite?: number
          equipements?: string[]
          actif?: boolean
        }
          Update: {
            nom?: string
            capacite?: number
            equipements?: string[]
            actif?: boolean
          }
      }
      rendez_vous: {
        Row: {
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
          google_event_id: string | null
          rappel_envoye: boolean
          confirmation_envoyee: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          client_id: number
          service_id: number
          employe_id?: number | null
          salle_id?: number | null
          date_heure: string
          duree: number
          statut?: string
          notes?: string | null
          prix?: number | null
          google_event_id?: string | null
          rappel_envoye?: boolean
          confirmation_envoyee?: boolean
        }
          Update: {
            client_id?: number
            service_id?: number
            employe_id?: number | null
            salle_id?: number | null
            date_heure?: string
            duree?: number
            statut?: string
            notes?: string | null
            prix?: number | null
            google_event_id?: string | null
            rappel_envoye?: boolean
            confirmation_envoyee?: boolean
          }
      }
      produits: {
        Row: {
          id: number
          nom_categorie: string
          description: string | null
          prix: number
        }
        Insert: {
          nom_categorie: string
          description?: string | null
          prix: number
        }
          Update: {
            nom_categorie?: string
            description?: string | null
            prix?: number
          }
      }
      google_calendar_tokens: {
        Row: {
          id: number
          user_id: string
          access_token: string
          refresh_token: string | null
          expires_at: string
          scope: string
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          access_token: string
          refresh_token?: string | null
          expires_at: string
          scope: string
        }
          Update: {
            user_id?: string
            access_token?: string
            refresh_token?: string | null
            expires_at?: string
            scope?: string
          }
      }
    }
  }
}
