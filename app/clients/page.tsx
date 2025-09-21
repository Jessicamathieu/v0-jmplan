"use client"

import { useEffect, useState } from "react"
import { getClients } from "@/lib/queries"

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([])

  useEffect(() => {
    async function loadData() {
      const data = await getClients()
      setClients(data)
    }
    loadData()
  }, [])

  return (
    <div>
      <h1>Clients actifs</h1>
      {clients.length > 0 ? (
        <ul>
          {clients.map(c => (
            <li key={c.client_id}>{c.nom}</li>
          ))}
        </ul>
      ) : (
        <p>Aucun client trouvé</p>
      )}
    </div>
  )
}
