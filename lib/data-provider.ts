"use client"

import useSWR from "swr"
import { DatabaseService } from "@/lib/database"

// Fetcher générique
const fetcher = (key: string, fn: () => Promise<any>) => fn()

export function useClients() {
  return useSWR("clients", () => DatabaseService.getClients(), { revalidateOnFocus: false })
}

export function useServices() {
  return useSWR("services", () => DatabaseService.getServices(), { revalidateOnFocus: false })
}

export function useEmployes() {
  return useSWR("employes", () => DatabaseService.getEmployes(), { revalidateOnFocus: false })
}

export function useSalles() {
  return useSWR("salles", () => DatabaseService.getSalles(), { revalidateOnFocus: false })
}

export function useRendezVous() {
  return useSWR("rendezvous", () => DatabaseService.getRendezVous(), { refreshInterval: 60000 })
}