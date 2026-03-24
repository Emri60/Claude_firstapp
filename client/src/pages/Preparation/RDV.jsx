import { useState, useEffect } from 'react'
import api from '../../api'

const JOURS = ['Vendredi', 'Samedi', 'Dimanche']
const TYPES = ['OLX', 'Particulier', 'Semi-pro']
const EMPTY = { jour: 'Samedi', heure: '10:00', type: 'OLX', nom_contact: '', adresse: '', notes: '' }

function sortRdvs(rdvs) {
  return [...rdvs].sort((a, b) => {
    const jA = JOURS.indexOf(a.jour)
    const jB = JOURS.indexOf(b.jour)
    if (jA !== jB) return jA - jB
    return a.heure.localeCompare(b.heure)
  })
}

export default function RDV() {
  const [rdvs, setRdvs] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(EMPTY)
  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    api.get('/rdv').then(r => setRdvs(sortRdvs(r.data))).finally(() => setLoading(false))
  }, [])

  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }

  async function handleSubmit(e) {
    e.preventDefault()
    if (editing) {
      const { data } = await api.put(`/rdv/${editing}`, form)
      setRdvs(sortRdvs(rdvs.map(r => r.id === editing ? data : r)))
    } else {
      const { data } = await api.post('/rdv', form)
      setRdvs(sortRdvs([...rdvs, data]))
    }
    setForm(EMPTY)
    setEditing(null)
    setShowForm(false)
  }

  async function deleteRdv(id) {
    setRdvs(rdvs.filter(r => r.id !== id))
    await api.delete(`/rdv/${id}`)
  }

  function startEdit(rdv) {
    setForm({ jour: rdv.jour, heure: rdv.heure, type: rdv.type, nom_contact: rdv.nom_contact, adresse: rdv.adresse ?? '', notes: rdv.notes ?? '' })
    setEditing(rdv.id)
    setShowForm(true)
  }

  const grouped = JOURS.reduce((acc, j) => {
    const list = rdvs.filter(r => r.jour === j)
    if (list.length) acc[j] = list
    return acc
  }, {})

  const inputCls = 'w-full rounded-xl border-gray-200 text-sm py-2.5 px-3 focus:ring-primary focus:border-primary'

  if (loading) return <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="space-y-4">
      {/* Liste */}
      {Object.keys(grouped).length === 0 && !showForm && (
        <p className="text-center text-gray-400 py-8 text-sm">Aucun rendez-vous</p>
      )}

      {Object.entries(grouped).map(([jour, list]) => (
        <div key={jour}>
          <h3 className="font-bold text-ink text-sm uppercase tracking-wide mb-2">{jour}</h3>
          <div className="space-y-2">
            {list.map(rdv => (
              <div key={rdv.id} className="bg-card rounded-xl p-3 border border-gray-100">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-ink">{rdv.heure}</span>
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{rdv.type}</span>
                    </div>
                    <div className="font-medium text-ink mt-0.5">{rdv.nom_contact}</div>
                    {rdv.adresse && <div className="text-xs text-gray-400">{rdv.adresse}</div>}
                    {rdv.notes && <div className="text-xs text-gray-400 italic">{rdv.notes}</div>}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => startEdit(rdv)} className="text-xs text-gray-400">Modifier</button>
                    <button onClick={() => deleteRdv(rdv.id)} className="text-xs text-primary">Suppr.</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Formulaire */}
      {showForm ? (
        <form onSubmit={handleSubmit} className="bg-card rounded-2xl p-4 space-y-3 border border-gray-200">
          <h3 className="font-semibold text-ink">{editing ? 'Modifier le RDV' : 'Nouveau RDV'}</h3>
          <div className="grid grid-cols-3 gap-2">
            <select className={inputCls} value={form.jour} onChange={e => set('jour', e.target.value)}>
              {JOURS.map(j => <option key={j} value={j}>{j}</option>)}
            </select>
            <input type="time" className={inputCls} value={form.heure} onChange={e => set('heure', e.target.value)} />
            <select className={inputCls} value={form.type} onChange={e => set('type', e.target.value)}>
              {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <input className={inputCls} placeholder="Nom du contact *" required value={form.nom_contact} onChange={e => set('nom_contact', e.target.value)} />
          <input className={inputCls} placeholder="Adresse ou quartier" value={form.adresse} onChange={e => set('adresse', e.target.value)} />
          <input className={inputCls} placeholder="Notes" value={form.notes} onChange={e => set('notes', e.target.value)} />
          <div className="flex gap-2">
            <button type="submit" className="flex-1 bg-primary text-white rounded-xl py-3 text-sm font-semibold">
              {editing ? 'Enregistrer' : 'Ajouter'}
            </button>
            <button type="button" onClick={() => { setShowForm(false); setEditing(null); setForm(EMPTY) }}
              className="flex-1 bg-gray-100 text-gray-600 rounded-xl py-3 text-sm font-semibold">
              Annuler
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="w-full border-2 border-dashed border-gray-300 text-gray-400 rounded-2xl py-4 text-sm font-medium"
        >
          + Ajouter un rendez-vous
        </button>
      )}
    </div>
  )
}
