import { supabase } from "./database"  // ton client Supabase

// === Clients ===
export async function getClients() {
  const { data, error } = await supabase
    .from("clients")
    .select("client_id, nom, actif")
    .eq("actif", true)
    .order("nom", { ascending: true })

  if (error) {
    console.error("Erreur getClients:", error.message)
    return []
  }
  return data || []
}

// === Employés ===
export async function getEmployes() {
  const { data, error } = await supabase
    .from("employes")
    .select("employe_id, nom_employe, initiales, couleur_secondaire, actif")
    .eq("actif", true)
    .order("nom_employe", { ascending: true })

  if (error) {
    console.error("Erreur getEmployes:", error.message)
    return []
  }
  return data || []
}

// === Services ===
export async function getServices() {
  const { data, error } = await supabase
    .from("services")
    .select("service_id, categorie, description, dureeminutes, prix, employes_competents, salle_id, actif")
    .eq("actif", true)
    .order("description", { ascending: true })

  if (error) {
    console.error("Erreur getServices:", error.message)
    return []
  }
  return data || []
}

// === Salles ===
export async function getSalles() {
  const { data, error } = await supabase
    .from("salles")
    .select("salle_id, description, actif")
    .eq("actif", true)
    .order("description", { ascending: true })

  if (error) {
    console.error("Erreur getSalles:", error.message)
    return []
  }
  return data || []
}
