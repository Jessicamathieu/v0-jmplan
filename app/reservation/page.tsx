"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/database"
import DatePicker, { registerLocale } from "react-datepicker"
import fr from "date-fns/locale/fr"
import "react-datepicker/dist/react-datepicker.css"

registerLocale("fr", fr)

export default function ReservationPage() {
  const [services, setServices] = useState<any[]>([])
  const [employes, setEmployes] = useState<any[]>([])
  const [salles, setSalles] = useState<any[]>([])
  const [selectedService, setSelectedService] = useState<any>(null)
  const [selectedEmploye, setSelectedEmploye] = useState<number | null>(null)
  const [selectedSalle, setSelectedSalle] = useState<number | null>(null)
  const [date, setDate] = useState<Date | null>(null)
  const [heure, setHeure] = useState<Date | null>(null)

  // Charger services, employes, salles
  useEffect(() => {
    const loadData = async () => {
      let { data: s } = await supabase.from("services").select("*").eq("actif", true)
      let { data: e } = await supabase.from("employes").select("*").eq("actif", true)
      let { data: sl } = await supabase.from("salles").select("*").eq("actif", true)
      setServices(s || [])
      setEmployes(e || [])
      setSalles(sl || [])
    }
    loadData()
  }, [])

  // Salle auto quand un service est choisi
  useEffect(() => {
    if (selectedService) {
      setSelectedSalle(selectedService.salle_id || null)
    }
  }, [selectedService])

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    if (!selectedService || !selectedEmploye || !date || !heure) {
      return alert("⚠️ Remplis tous les champs")
    }

    const dateHeure = new Date(date)
    dateHeure.setHours(heure.getHours(), heure.getMinutes(), 0, 0)

    const { error } = await supabase.from("rendez_vous").insert([
      {
        client_id: 1, // ⚠️ remplacer par le vrai client sélectionné
        service_id: selectedService.id,
        employe_id: selectedEmploye,
        salle_id: selectedSalle,
        date_heure: dateHeure.toISOString(),
        duree: selectedService.duree,
        prix: selectedService.prix,
        statut: "planifie"
      }
    ])

    if (error) {
      console.error(error)
      alert("❌ Erreur lors de l’ajout du rendez-vous")
    } else {
      alert("✅ Rendez-vous ajouté")
    }
  }

  return (
    <div className="p-6 max-w-xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">📅 Nouvelle Réservation</h1>

      <form onSubmit={handleSubmit} className="space-y-4 border p-4 rounded shadow">
        <div>
          <label className="block font-medium">Service</label>
          <select
            className="w-full border rounded p-2"
            onChange={e => setSelectedService(services.find(s => s.id === Number(e.target.value)) || null)}
          >
            <option value="">-- Choisir --</option>
            {services.map(s => (
              <option key={s.id} value={s.id}>
                {s.nom} ({s.duree} min - {s.prix} $)
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-medium">Employé</label>
          <select
            className="w-full border rounded p-2"
            onChange={e => setSelectedEmploye(Number(e.target.value))}
          >
            <option value="">-- Choisir --</option>
            {employes.map(e => (
              <option key={e.id} value={e.id}>{e.nom}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-medium">Date</label>
          <DatePicker
            selected={date}
            onChange={(d: Date) => setDate(d)}
            locale="fr"
            dateFormat="dd/MM/yyyy"
            inline
          />
        </div>

        <div>
          <label className="block font-medium">Heure</label>
          <DatePicker
            selected={heure}
            onChange={(h: Date) => setHeure(h)}
            showTimeSelect
            showTimeSelectOnly
            timeIntervals={15}
            timeCaption="Heure"
            dateFormat="HH:mm"
            className="w-full border rounded p-2"
          />
        </div>

        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Réserver
        </button>
      </form>
    </div>
  )
}