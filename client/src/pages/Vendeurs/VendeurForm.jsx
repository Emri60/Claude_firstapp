import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../api'

const EMPTY = {
  nom: '', telephone: '', stand_habituel: '', marche: '',
  specialite: '', a_entrepot: false, niveau_confiance: 'INCONNU',
  notes: '', rappel_avant_voyage: false,
}

export default function VendeurForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id
  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!isEdit) return
    api.get(`/vendeurs/${id}`).then(r => setForm({ ...EMPTY, ...r.data })).finally(() => setLoading(false))
  }, [id])

  function set(key, val) { setForm(f => ({ ...f, [key]: val })) }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      if (isEdit) {
        await api.put(`/vendeurs/${id}`, form)
        navigate(`/vendeurs/${id}`)
      } else {
        const res = await api.post('/vendeurs', form)
        navigate(`/vendeurs/${res.data.id}`)
      }
    } catch {
      alert('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>

  const inputCls = 'w-full rounded-xl border-gray-200 text-base py-2.5 px-3 focus:ring-primary focus:border-primary'
  const labelCls = 'block text-sm font-medium text-ink mb-1'

  return (
    <form onSubmit={handleSubmit} className="px-4 pt-4 pb-6 space-y-4">
      <div className="flex items-center justify-between mb-2">
        <button type="button" onClick={() => navigate(-1)} className="text-gray-400 text-sm">← Retour</button>
        <h2 className="font-bold text-ink">{isEdit ? 'Modifier vendeur' : 'Nouveau vendeur'}</h2>
        <div />
      </div>

      <div>
        <label className={labelCls}>Nom / Surnom *</label>
        <input className={inputCls} value={form.nom} onChange={e => set('nom', e.target.value)} required placeholder="Marek" />
      </div>

      <div>
        <label className={labelCls}>Téléphone (WhatsApp)</label>
        <input className={inputCls} value={form.telephone} onChange={e => set('telephone', e.target.value)} placeholder="+48 123 456 789" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Marché</label>
          <input className={inputCls} value={form.marche} onChange={e => set('marche', e.target.value)} placeholder="Bazar na Kole" />
        </div>
        <div>
          <label className={labelCls}>Stand habituel</label>
          <input className={inputCls} value={form.stand_habituel} onChange={e => set('stand_habituel', e.target.value)} placeholder="Stand 47 allée B" />
        </div>
      </div>

      <div>
        <label className={labelCls}>Spécialité</label>
        <input className={inputCls} value={form.specialite} onChange={e => set('specialite', e.target.value)} placeholder="Lampes PRL, suspensions industrielles" />
      </div>

      <div>
        <label className={labelCls}>Niveau de confiance</label>
        <select className={inputCls} value={form.niveau_confiance} onChange={e => set('niveau_confiance', e.target.value)}>
          <option value="FIABLE">Fiable</option>
          <option value="MOYEN">Moyen</option>
          <option value="INCONNU">Inconnu</option>
        </select>
      </div>

      <div className="flex gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.a_entrepot} onChange={e => set('a_entrepot', e.target.checked)} className="w-5 h-5 rounded accent-primary" />
          <span className="text-sm font-medium text-ink">A un entrepôt</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.rappel_avant_voyage} onChange={e => set('rappel_avant_voyage', e.target.checked)} className="w-5 h-5 rounded accent-primary" />
          <span className="text-sm font-medium text-ink">Rappel avant voyage</span>
        </label>
      </div>

      <div>
        <label className={labelCls}>Notes</label>
        <textarea className={`${inputCls} min-h-[80px]`} value={form.notes} onChange={e => set('notes', e.target.value)} />
      </div>

      <button
        type="submit"
        disabled={saving}
        className="w-full bg-primary text-white font-semibold text-lg py-4 rounded-xl disabled:opacity-60"
      >
        {saving ? 'Sauvegarde…' : isEdit ? 'Enregistrer' : 'Créer le vendeur'}
      </button>
    </form>
  )
}
