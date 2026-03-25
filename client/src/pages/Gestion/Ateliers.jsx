import { useState, useEffect } from 'react'
import api from '../../api'

const CONFIANCE_LABELS = { FIABLE: '5/5', MOYEN: '3/5', INCONNU: '?' }
const CONFIANCE_COLORS = { FIABLE: 'text-green-600', MOYEN: 'text-yellow-600', INCONNU: 'text-gray-400' }
const SPEC_COLORS = {
  Bois: 'bg-amber-100 text-amber-700',
  Metal: 'bg-gray-200 text-gray-700',
  Tissu: 'bg-pink-100 text-pink-700',
  Electrique: 'bg-yellow-100 text-yellow-700',
  General: 'bg-blue-100 text-blue-700',
  Autre: 'bg-gray-100 text-gray-500',
}

const EMPTY = {
  nom: '', adresse: '', ville: '', telephone: '', whatsapp: false, specialite: '',
  fiabilite: 'INCONNU', facebook: '', instagram: '', tiktok: '', notes: '',
}

export default function Ateliers() {
  const [ateliers, setAteliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [editId, setEditId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => { load() }, [])

  async function load() {
    try {
      const r = await api.get('/ateliers')
      setAteliers(r.data)
    } catch {} finally { setLoading(false) }
  }

  function openNew() {
    setForm(EMPTY)
    setEditId(null)
    setShowForm(true)
  }

  function openEdit(a) {
    setForm({
      nom: a.nom,
      adresse: a.adresse ?? '',
      ville: a.ville ?? '',
      telephone: a.telephone ?? '',
      whatsapp: a.whatsapp ?? false,
      specialite: a.specialite ?? '',
      fiabilite: a.fiabilite,
      facebook: a.facebook ?? '',
      instagram: a.instagram ?? '',
      tiktok: a.tiktok ?? '',
      notes: a.notes ?? '',
    })
    setEditId(a.id)
    setShowForm(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      const data = {
        nom: form.nom,
        adresse: form.adresse || null,
        ville: form.ville || null,
        telephone: form.telephone || null,
        whatsapp: form.whatsapp,
        specialite: form.specialite || null,
        fiabilite: form.fiabilite,
        facebook: form.facebook || null,
        instagram: form.instagram || null,
        tiktok: form.tiktok || null,
        notes: form.notes || null,
      }
      if (editId) {
        await api.put(`/ateliers/${editId}`, data)
      } else {
        await api.post('/ateliers', data)
      }
      setShowForm(false)
      load()
    } catch {} finally { setSaving(false) }
  }

  async function handleDelete(id) {
    if (!confirm('Supprimer cet atelier ?')) return
    try {
      await api.delete(`/ateliers/${id}`)
      load()
    } catch {}
  }

  const filtered = ateliers.filter(a =>
    a.nom.toLowerCase().includes(search.toLowerCase()) ||
    (a.ville ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (a.specialite ?? '').toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>

  if (showForm) return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-ink">{editId ? 'Modifier' : 'Nouvel atelier'}</h3>
        <button type="button" onClick={() => setShowForm(false)} className="text-sm text-gray-400">Annuler</button>
      </div>

      <input required placeholder="Nom de l'atelier" value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })}
        className="w-full bg-card rounded-xl px-4 py-3 text-sm border border-gray-200 focus:border-primary focus:outline-none" />

      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2">
          <input placeholder="Adresse" value={form.adresse} onChange={e => setForm({ ...form, adresse: e.target.value })}
            className="w-full bg-card rounded-xl px-4 py-3 text-sm border border-gray-200 focus:border-primary focus:outline-none" />
        </div>
        <input placeholder="Ville" value={form.ville} onChange={e => setForm({ ...form, ville: e.target.value })}
          className="w-full bg-card rounded-xl px-4 py-3 text-sm border border-gray-200 focus:border-primary focus:outline-none" />
      </div>

      <div className="flex gap-3 items-center">
        <input type="tel" placeholder="Telephone" value={form.telephone} onChange={e => setForm({ ...form, telephone: e.target.value })}
          className="flex-1 bg-card rounded-xl px-4 py-3 text-sm border border-gray-200 focus:border-primary focus:outline-none" />
        <label className="flex items-center gap-2 bg-card rounded-xl px-3 py-3 border border-gray-200 cursor-pointer flex-shrink-0">
          <input type="checkbox" checked={form.whatsapp} onChange={e => setForm({ ...form, whatsapp: e.target.checked })}
            className="w-4 h-4 rounded border-gray-300" />
          <span className="text-sm text-ink">WhatsApp</span>
        </label>
      </div>

      <select value={form.specialite} onChange={e => setForm({ ...form, specialite: e.target.value })}
        className="w-full bg-card rounded-xl px-4 py-3 text-sm border border-gray-200 focus:border-primary focus:outline-none">
        <option value="">Specialite</option>
        <option value="Bois">Bois</option>
        <option value="Metal">Metal</option>
        <option value="Tissu">Tissu</option>
        <option value="Electrique">Electrique</option>
        <option value="General">General</option>
        <option value="Autre">Autre</option>
      </select>

      <select value={form.fiabilite} onChange={e => setForm({ ...form, fiabilite: e.target.value })}
        className="w-full bg-card rounded-xl px-4 py-3 text-sm border border-gray-200 focus:border-primary focus:outline-none">
        <option value="INCONNU">Fiabilite : Inconnu</option>
        <option value="MOYEN">Fiabilite : Moyen</option>
        <option value="FIABLE">Fiabilite : Fiable</option>
      </select>

      <div className="space-y-2">
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Réseaux sociaux</p>
        <input placeholder="Facebook (URL ou pseudo)" value={form.facebook} onChange={e => setForm({ ...form, facebook: e.target.value })}
          className="w-full bg-card rounded-xl px-4 py-3 text-sm border border-gray-200 focus:border-primary focus:outline-none" />
        <input placeholder="Instagram (URL ou pseudo)" value={form.instagram} onChange={e => setForm({ ...form, instagram: e.target.value })}
          className="w-full bg-card rounded-xl px-4 py-3 text-sm border border-gray-200 focus:border-primary focus:outline-none" />
        <input placeholder="TikTok (URL ou pseudo)" value={form.tiktok} onChange={e => setForm({ ...form, tiktok: e.target.value })}
          className="w-full bg-card rounded-xl px-4 py-3 text-sm border border-gray-200 focus:border-primary focus:outline-none" />
      </div>

      <textarea placeholder="Notes" rows={2} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
        className="w-full bg-card rounded-xl px-4 py-3 text-sm border border-gray-200 focus:border-primary focus:outline-none" />

      <button type="submit" disabled={saving || !form.nom}
        className="w-full bg-ink text-white font-semibold py-4 rounded-xl text-sm disabled:opacity-60">
        {saving ? 'Enregistrement...' : editId ? 'Enregistrer' : 'Ajouter l\'atelier'}
      </button>
    </form>
  )

  return (
    <div className="space-y-3">
      <button onClick={openNew}
        className="w-full bg-ink text-white font-semibold py-3 rounded-xl text-sm">
        + Nouvel atelier
      </button>

      {ateliers.length > 3 && (
        <input placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full bg-card rounded-xl px-4 py-3 text-sm border border-gray-200 focus:border-primary focus:outline-none" />
      )}

      {filtered.length === 0 && (
        <p className="text-center text-gray-400 text-sm py-8">
          {ateliers.length === 0 ? 'Aucun atelier enregistre' : 'Aucun resultat'}
        </p>
      )}

      {filtered.map(a => (
        <div key={a.id} onClick={() => openEdit(a)} className="bg-card rounded-2xl p-4 active:scale-[0.98] transition-transform cursor-pointer">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-ink text-sm truncate">{a.nom}</h4>
                <span className={`text-xs font-medium ${CONFIANCE_COLORS[a.fiabilite]}`}>
                  {CONFIANCE_LABELS[a.fiabilite]}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1 text-xs text-gray-400 flex-wrap">
                {a.specialite && (
                  <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${SPEC_COLORS[a.specialite] ?? SPEC_COLORS.Autre}`}>
                    {a.specialite}
                  </span>
                )}
                {a.objets?.length > 0 && <span>{a.objets.length} objet{a.objets.length > 1 ? 's' : ''}</span>}
              </div>
              {a.telephone && (
                <p className="text-xs text-gray-500 mt-1">
                  Tel. {a.telephone}{a.whatsapp && ' · WhatsApp'}
                </p>
              )}
              {(a.adresse || a.ville) && <p className="text-xs text-gray-500 mt-0.5">{[a.adresse, a.ville].filter(Boolean).join(', ')}</p>}
              {(a.facebook || a.instagram || a.tiktok) && (
                <div className="flex gap-2 mt-1 text-xs text-gray-400">
                  {a.facebook && <span>FB</span>}
                  {a.instagram && <span>Insta</span>}
                  {a.tiktok && <span>TikTok</span>}
                </div>
              )}
            </div>
            <button onClick={e => { e.stopPropagation(); handleDelete(a.id) }}
              className="text-xs text-red-400 hover:text-red-600 ml-2">
              X
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
