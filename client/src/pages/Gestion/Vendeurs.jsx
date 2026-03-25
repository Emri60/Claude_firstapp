import { useState, useEffect } from 'react'
import api from '../../api'

const CONFIANCE_LABELS = { FIABLE: '⭐⭐⭐', MOYEN: '⭐⭐', INCONNU: '⭐' }
const CONFIANCE_COLORS = { FIABLE: 'text-green-600', MOYEN: 'text-yellow-600', INCONNU: 'text-gray-400' }

const EMPTY = {
  nom: '', telephone: '', adresse: '', ville: '', marche: '', specialite: '',
  a_entrepot: false, niveau_confiance: 'INCONNU', notes: '',
}

export default function Vendeurs() {
  const [vendeurs, setVendeurs] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [editId, setEditId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => { load() }, [])

  async function load() {
    try {
      const r = await api.get('/vendeurs')
      setVendeurs(r.data)
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
      telephone: v.telephone ?? '',
      adresse: v.adresse ?? '',
      ville: v.ville ?? '',
      marche: v.marche ?? '',
      specialite: v.specialite ?? '',
      a_entrepot: v.a_entrepot,
      niveau_confiance: v.niveau_confiance,
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
        telephone: form.telephone || null,
        adresse: form.adresse || null,
        ville: form.ville || null,
        marche: form.marche || null,
        specialite: form.specialite || null,
        a_entrepot: form.a_entrepot,
        niveau_confiance: form.niveau_confiance,
        notes: form.notes || null,
      }
      if (editId) {
        await api.put(`/vendeurs/${editId}`, data)
      } else {
        await api.post('/vendeurs', data)
      }
      setShowForm(false)
      load()
    } catch {} finally { setSaving(false) }
  }

  async function handleDelete(id) {
    if (!confirm('Supprimer ce vendeur ?')) return
    try {
      await api.delete(`/vendeurs/${id}`)
      load()
    } catch {}
  }

  const filtered = vendeurs.filter(v =>
    v.nom.toLowerCase().includes(search.toLowerCase()) ||
    (v.marche ?? '').toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>

  if (showForm) return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-ink">{editId ? 'Modifier' : 'Nouveau vendeur'}</h3>
        <button type="button" onClick={() => setShowForm(false)} className="text-sm text-gray-400">Annuler</button>
      </div>

      <input required placeholder="Nom du vendeur" value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })}
        className="w-full bg-card rounded-xl px-4 py-3 text-sm border border-gray-200 focus:border-primary focus:outline-none" />

      <input type="tel" placeholder="Téléphone" value={form.telephone} onChange={e => setForm({ ...form, telephone: e.target.value })}
        className="w-full bg-card rounded-xl px-4 py-3 text-sm border border-gray-200 focus:border-primary focus:outline-none" />

      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2">
          <input placeholder="Adresse" value={form.adresse} onChange={e => setForm({ ...form, adresse: e.target.value })}
            className="w-full bg-card rounded-xl px-4 py-3 text-sm border border-gray-200 focus:border-primary focus:outline-none" />
        </div>
        <input placeholder="Ville" value={form.ville} onChange={e => setForm({ ...form, ville: e.target.value })}
          className="w-full bg-card rounded-xl px-4 py-3 text-sm border border-gray-200 focus:border-primary focus:outline-none" />
      </div>

      <select value={form.marche} onChange={e => setForm({ ...form, marche: e.target.value })}
        className="w-full bg-card rounded-xl px-4 py-3 text-sm border border-gray-200 focus:border-primary focus:outline-none">
        <option value="">Plateforme / Marché</option>
        <option value="OLX">OLX</option>
        <option value="Bazar na Kole">Bazar na Kole</option>
        <option value="ZOO Market">ZOO Market</option>
        <option value="Facebook">Facebook Marketplace</option>
        <option value="Allegro">Allegro</option>
        <option value="Antykwariat">Antykwariat</option>
        <option value="Autre">Autre</option>
      </select>

      <select value={form.specialite} onChange={e => setForm({ ...form, specialite: e.target.value })}
        className="w-full bg-card rounded-xl px-4 py-3 text-sm border border-gray-200 focus:border-primary focus:outline-none">
        <option value="">Spécialité</option>
        <option value="LAMPE">Lampes</option>
        <option value="AFFICHE">Affiches</option>
        <option value="FAUTEUIL">Fauteuils</option>
        <option value="AUTRE">Autre</option>
      </select>

      <select value={form.niveau_confiance} onChange={e => setForm({ ...form, niveau_confiance: e.target.value })}
        className="w-full bg-card rounded-xl px-4 py-3 text-sm border border-gray-200 focus:border-primary focus:outline-none">
        <option value="INCONNU">Fiabilité : Inconnu ⭐</option>
        <option value="MOYEN">Fiabilité : Moyen ⭐⭐</option>
        <option value="FIABLE">Fiabilité : Fiable ⭐⭐⭐</option>
      </select>

      <label className="flex items-center gap-3 bg-card rounded-xl px-4 py-3 border border-gray-200 cursor-pointer">
        <input type="checkbox" checked={form.a_entrepot} onChange={e => setForm({ ...form, a_entrepot: e.target.checked })}
          className="w-4 h-4 rounded border-gray-300" />
        <span className="text-sm text-ink">A un entrepôt</span>
      </label>

      <textarea placeholder="Notes" rows={2} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
        className="w-full bg-card rounded-xl px-4 py-3 text-sm border border-gray-200 focus:border-primary focus:outline-none" />

      <button type="submit" disabled={saving || !form.nom}
        className="w-full bg-ink text-white font-semibold py-4 rounded-xl text-sm disabled:opacity-60">
        {saving ? 'Enregistrement…' : editId ? 'Enregistrer' : 'Ajouter le vendeur'}
      </button>
    </form>
  )

  return (
    <div className="space-y-3">
      <button onClick={openNew}
        className="w-full bg-ink text-white font-semibold py-3 rounded-xl text-sm">
        + Nouveau vendeur
      </button>

      {vendeurs.length > 3 && (
        <input placeholder="Rechercher…" value={search} onChange={e => setSearch(e.target.value)}
          className="w-full bg-card rounded-xl px-4 py-3 text-sm border border-gray-200 focus:border-primary focus:outline-none" />
      )}

      {filtered.length === 0 && (
        <p className="text-center text-gray-400 text-sm py-8">
          {vendeurs.length === 0 ? 'Aucun vendeur enregistré' : 'Aucun résultat'}
        </p>
      )}

      {filtered.map(v => (
        <div key={v.id} onClick={() => openEdit(v)} className="bg-card rounded-2xl p-4 active:scale-[0.98] transition-transform cursor-pointer">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-ink text-sm truncate">{v.nom}</h4>
                <span className={`text-xs ${CONFIANCE_COLORS[v.niveau_confiance]}`}>
                  {CONFIANCE_LABELS[v.niveau_confiance]}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                {v.marche && <span>{v.marche}</span>}
                {v.specialite && <span>· {v.specialite}</span>}
                {v.a_entrepot && <span>· 📦 Entrepôt</span>}
              </div>
              {v.telephone && <p className="text-xs text-gray-500 mt-1">📞 {v.telephone}</p>}
              {(v.adresse || v.ville) && <p className="text-xs text-gray-500 mt-0.5">📍 {[v.adresse, v.ville].filter(Boolean).join(', ')}</p>}
            </div>
            <button onClick={e => { e.stopPropagation(); handleDelete(v.id) }}
              className="text-xs text-red-400 hover:text-red-600 ml-2">
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
