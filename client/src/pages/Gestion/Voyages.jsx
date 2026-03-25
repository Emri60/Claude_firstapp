import { useState, useEffect } from 'react'
import api from '../../api'

const DEST_LABELS = { VARSOVIE: 'Varsovie', CRACOVIE: 'Cracovie', AUTRE: 'Autre' }
const DEST_COLORS = { VARSOVIE: 'bg-red-100 text-red-700', CRACOVIE: 'bg-blue-100 text-blue-700', AUTRE: 'bg-gray-100 text-gray-600' }

const EMPTY = {
  nom: '', destination: 'VARSOVIE', date_debut: '', date_fin: '',
  vol_ar: '', hebergement: '', transport_local: '', bagage_soute: '',
  nourriture: '', autres_frais: '', notes: '',
}

export default function Voyages() {
  const [voyages, setVoyages] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [editId, setEditId] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    try {
      const r = await api.get('/voyages')
      setVoyages(r.data)
    } catch {} finally { setLoading(false) }
  }

  function openNew() {
    setForm(EMPTY)
    setEditId(null)
    setShowForm(true)
  }

  function openEdit(v) {
    setForm({
      nom: v.nom,
      destination: v.destination,
      date_debut: v.date_debut?.split('T')[0] ?? '',
      date_fin: v.date_fin?.split('T')[0] ?? '',
      vol_ar: v.vol_ar ?? '',
      hebergement: v.hebergement ?? '',
      transport_local: v.transport_local ?? '',
      bagage_soute: v.bagage_soute ?? '',
      nourriture: v.nourriture ?? '',
      autres_frais: v.autres_frais ?? '',
      notes: v.notes ?? '',
    })
    setEditId(v.id)
    setShowForm(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      const data = {
        nom: form.nom,
        destination: form.destination,
        date_debut: form.date_debut || null,
        date_fin: form.date_fin || null,
        vol_ar: parseFloat(form.vol_ar) || 0,
        hebergement: parseFloat(form.hebergement) || 0,
        transport_local: parseFloat(form.transport_local) || 0,
        bagage_soute: parseFloat(form.bagage_soute) || 0,
        nourriture: parseFloat(form.nourriture) || 0,
        autres_frais: parseFloat(form.autres_frais) || 0,
        notes: form.notes || null,
      }
      if (editId) {
        await api.put(`/voyages/${editId}`, data)
      } else {
        await api.post('/voyages', data)
      }
      setShowForm(false)
      load()
    } catch {} finally { setSaving(false) }
  }

  async function handleDelete(id) {
    if (!confirm('Supprimer ce voyage ?')) return
    try {
      await api.delete(`/voyages/${id}`)
      load()
    } catch {}
  }

  function totalFrais(v) {
    return (v.vol_ar || 0) + (v.hebergement || 0) + (v.transport_local || 0) +
           (v.bagage_soute || 0) + (v.nourriture || 0) + (v.autres_frais || 0)
  }

  if (loading) return <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>

  if (showForm) return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-ink">{editId ? 'Modifier le voyage' : 'Nouveau voyage'}</h3>
        <button type="button" onClick={() => setShowForm(false)} className="text-sm text-gray-400">Annuler</button>
      </div>

      <input required placeholder="Nom du voyage" value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })}
        className="w-full bg-card rounded-xl px-4 py-3 text-sm border border-gray-200 focus:border-primary focus:outline-none" />

      <select value={form.destination} onChange={e => setForm({ ...form, destination: e.target.value })}
        className="w-full bg-card rounded-xl px-4 py-3 text-sm border border-gray-200 focus:border-primary focus:outline-none">
        <option value="VARSOVIE">Varsovie</option>
        <option value="CRACOVIE">Cracovie</option>
        <option value="AUTRE">Autre</option>
      </select>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Début</label>
          <input type="date" value={form.date_debut} onChange={e => setForm({ ...form, date_debut: e.target.value })}
            className="w-full bg-card rounded-xl px-4 py-3 text-sm border border-gray-200 focus:border-primary focus:outline-none" />
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Fin</label>
          <input type="date" value={form.date_fin} onChange={e => setForm({ ...form, date_fin: e.target.value })}
            className="w-full bg-card rounded-xl px-4 py-3 text-sm border border-gray-200 focus:border-primary focus:outline-none" />
        </div>
      </div>

      <p className="text-xs text-gray-400 font-medium uppercase tracking-wide pt-2">Frais (€)</p>
      <div className="grid grid-cols-2 gap-3">
        {[['vol_ar', 'Vol A/R'], ['hebergement', 'Hébergement'], ['transport_local', 'Transport'], ['bagage_soute', 'Bagage soute'], ['nourriture', 'Nourriture'], ['autres_frais', 'Autres']].map(([key, label]) => (
          <div key={key}>
            <label className="text-xs text-gray-400 mb-1 block">{label}</label>
            <input type="number" step="0.01" inputMode="decimal" placeholder="0" value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })}
              className="w-full bg-card rounded-xl px-4 py-3 text-sm border border-gray-200 focus:border-primary focus:outline-none" />
          </div>
        ))}
      </div>

      <textarea placeholder="Notes" rows={2} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
        className="w-full bg-card rounded-xl px-4 py-3 text-sm border border-gray-200 focus:border-primary focus:outline-none" />

      <button type="submit" disabled={saving || !form.nom}
        className="w-full bg-ink text-white font-semibold py-4 rounded-xl text-sm disabled:opacity-60">
        {saving ? 'Enregistrement…' : editId ? 'Enregistrer' : 'Créer le voyage'}
      </button>
    </form>
  )

  return (
    <div className="space-y-3">
      <button onClick={openNew}
        className="w-full bg-ink text-white font-semibold py-3 rounded-xl text-sm">
        + Nouveau voyage
      </button>

      {voyages.length === 0 && (
        <p className="text-center text-gray-400 text-sm py-8">Aucun voyage enregistré</p>
      )}

      {voyages.map(v => (
        <div key={v.id} onClick={() => openEdit(v)} className="bg-card rounded-2xl p-4 space-y-2 active:scale-[0.98] transition-transform cursor-pointer">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-semibold text-ink text-sm">{v.nom}</h4>
              {v.date_debut && (
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(v.date_debut).toLocaleDateString('fr-FR')}
                  {v.date_fin && ` → ${new Date(v.date_fin).toLocaleDateString('fr-FR')}`}
                </p>
              )}
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${DEST_COLORS[v.destination]}`}>
              {DEST_LABELS[v.destination]}
            </span>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-gray-100">
            <div className="text-xs text-gray-500">
              <span className="font-semibold text-ink">{totalFrais(v).toFixed(0)}€</span> de frais
              {v.achats?.length > 0 && <span className="ml-2">· {v.achats.length} achat{v.achats.length > 1 ? 's' : ''}</span>}
            </div>
            <button onClick={e => { e.stopPropagation(); handleDelete(v.id) }}
              className="text-xs text-red-400 hover:text-red-600">
              Supprimer
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
