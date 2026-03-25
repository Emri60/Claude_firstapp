import { useState, useEffect } from 'react'
import api from '../../api'

const EMPTY = { nom: '', prix_paye: '', date: new Date().toISOString().split('T')[0], vendeur_id: '', voyage_id: '', notes: '' }

export default function Achats() {
  const [achats, setAchats] = useState([])
  const [vendeurs, setVendeurs] = useState([])
  const [voyages, setVoyages] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    try {
      const [a, v, voy] = await Promise.all([
        api.get('/achats'),
        api.get('/vendeurs'),
        api.get('/voyages'),
      ])
      setAchats(a.data)
      setVendeurs(v.data)
      setVoyages(voy.data)
    } catch {} finally { setLoading(false) }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      await api.post('/achats', {
        nom: form.nom || null,
        prix_paye: parseFloat(form.prix_paye),
        date: form.date,
        vendeur_id: form.vendeur_id || null,
        voyage_id: form.voyage_id || null,
        notes: form.notes || null,
      })
      setShowForm(false)
      setForm(EMPTY)
      load()
    } catch {} finally { setSaving(false) }
  }

  async function handleDelete(id) {
    if (!confirm('Supprimer cet achat ?')) return
    try {
      await api.delete(`/achats/${id}`)
      load()
    } catch {}
  }

  const totalDepense = achats.reduce((sum, a) => sum + a.prix_paye, 0)

  if (loading) return <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>

  if (showForm) return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-ink">Nouvel achat</h3>
        <button type="button" onClick={() => setShowForm(false)} className="text-sm text-gray-400">Annuler</button>
      </div>

      <input required placeholder="Nom de l'objet acheté" value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })}
        className="w-full bg-card rounded-xl px-4 py-3 text-sm border border-gray-200 focus:border-primary focus:outline-none" />

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Prix payé (PLN)</label>
          <input required type="number" step="0.01" inputMode="decimal" placeholder="0" value={form.prix_paye} onChange={e => setForm({ ...form, prix_paye: e.target.value })}
            className="w-full bg-card rounded-xl px-4 py-3 text-sm border border-gray-200 focus:border-primary focus:outline-none" />
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Date</label>
          <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
            className="w-full bg-card rounded-xl px-4 py-3 text-sm border border-gray-200 focus:border-primary focus:outline-none" />
        </div>
      </div>

      <select value={form.vendeur_id} onChange={e => setForm({ ...form, vendeur_id: e.target.value })}
        className="w-full bg-card rounded-xl px-4 py-3 text-sm border border-gray-200 focus:border-primary focus:outline-none">
        <option value="">Vendeur (optionnel)</option>
        {vendeurs.map(v => <option key={v.id} value={v.id}>{v.nom}{v.marche ? ` — ${v.marche}` : ''}</option>)}
      </select>

      <select value={form.voyage_id} onChange={e => setForm({ ...form, voyage_id: e.target.value })}
        className="w-full bg-card rounded-xl px-4 py-3 text-sm border border-gray-200 focus:border-primary focus:outline-none">
        <option value="">Voyage (optionnel)</option>
        {voyages.map(v => <option key={v.id} value={v.id}>{v.nom}</option>)}
      </select>

      <textarea placeholder="Notes" rows={2} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
        className="w-full bg-card rounded-xl px-4 py-3 text-sm border border-gray-200 focus:border-primary focus:outline-none" />

      <button type="submit" disabled={saving || !form.nom || !form.prix_paye}
        className="w-full bg-ink text-white font-semibold py-4 rounded-xl text-sm disabled:opacity-60">
        {saving ? 'Enregistrement…' : 'Enregistrer l\'achat'}
      </button>
    </form>
  )

  return (
    <div className="space-y-3">
      <button onClick={() => setShowForm(true)}
        className="w-full bg-ink text-white font-semibold py-3 rounded-xl text-sm">
        + Nouvel achat
      </button>

      {achats.length > 0 && (
        <div className="bg-card rounded-2xl p-3 flex justify-between items-center">
          <span className="text-xs text-gray-400">{achats.length} achat{achats.length > 1 ? 's' : ''}</span>
          <span className="text-sm font-semibold text-ink">{totalDepense.toFixed(0)} PLN dépensés</span>
        </div>
      )}

      {achats.length === 0 && (
        <p className="text-center text-gray-400 text-sm py-8">Aucun achat enregistré</p>
      )}

      {achats.map(a => (
        <div key={a.id} className="bg-card rounded-2xl p-4 space-y-1.5">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-ink text-sm truncate">
                {a.objet?.nom ?? a.nom ?? `Achat #${a.id}`}
              </h4>
              <p className="text-xs text-gray-400 mt-0.5">
                {new Date(a.date).toLocaleDateString('fr-FR')}
                {a.vendeur && <span> · {a.vendeur.nom}</span>}
                {a.voyage && <span> · 🗺️ {a.voyage.nom}</span>}
              </p>
            </div>
            <div className="text-right ml-3">
              <p className="font-semibold text-ink text-sm">{a.prix_paye} PLN</p>
              <button onClick={() => handleDelete(a.id)}
                className="text-xs text-red-400 hover:text-red-600 mt-1">
                Supprimer
              </button>
            </div>
          </div>
          {a.notes && <p className="text-xs text-gray-400 pt-1 border-t border-gray-100">{a.notes}</p>}
        </div>
      ))}
    </div>
  )
}
