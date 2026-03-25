import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../api'

const EMPTY = {
  nom: '', fabricant: '', designer: '', categorie: 'LAMPE', epoque: '', dimensions: '',
  description: '', rarete: 'MOYEN', priorite: 'HAUTE',
  prix_achat_min: '', prix_achat_max: '', prix_revente_min: '', prix_revente_max: '',
  mots_cles_polonais: '', statut: 'A_CHERCHER', notes: '', poids_estime: '', volume_estime: '',
  liens_reference: [], tests_authenticite: [], signaux_alerte: [], photos_reference: [],
}

function toFloat(v) { const n = parseFloat(v); return isNaN(n) ? null : n }

export default function ObjetForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id
  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (!isEdit) return
    api.get(`/objets/${id}`).then(r => {
      const o = r.data
      setForm({
        ...EMPTY, ...o,
        prix_achat_min: o.prix_achat_min ?? '',
        prix_achat_max: o.prix_achat_max ?? '',
        prix_revente_min: o.prix_revente_min ?? '',
        prix_revente_max: o.prix_revente_max ?? '',
        poids_estime: o.poids_estime ?? '',
        volume_estime: o.volume_estime ?? '',
        liens_reference: o.liens_reference ?? [],
        tests_authenticite: o.tests_authenticite ?? [],
        signaux_alerte: o.signaux_alerte ?? [],
        photos_reference: o.photos_reference ?? [],
      })
    }).finally(() => setLoading(false))
  }, [id])

  function set(key, val) { setForm(f => ({ ...f, [key]: val })) }

  // Dynamic list helpers
  function addString(key) { set(key, [...form[key], '']) }
  function updateString(key, i, val) { set(key, form[key].map((v, j) => j === i ? val : v)) }
  function removeString(key, i) { set(key, form[key].filter((_, j) => j !== i)) }

  function addLien() { set('liens_reference', [...form.liens_reference, { label: '', url: '' }]) }
  function updateLien(i, field, val) {
    set('liens_reference', form.liens_reference.map((l, j) => j === i ? { ...l, [field]: val } : l))
  }
  function removeLien(i) { set('liens_reference', form.liens_reference.filter((_, j) => j !== i)) }

  async function handlePhotos(e) {
    const files = Array.from(e.target.files)
    if (!files.length) return
    setUploading(true)
    const fd = new FormData()
    files.forEach(f => fd.append('photos', f))
    try {
      const { data } = await api.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      set('photos_reference', [...form.photos_reference, ...data.urls])
    } catch {
      alert('Erreur lors de l\'upload')
    } finally {
      setUploading(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    const payload = {
      ...form,
      prix_achat_min: toFloat(form.prix_achat_min),
      prix_achat_max: toFloat(form.prix_achat_max),
      prix_revente_min: toFloat(form.prix_revente_min),
      prix_revente_max: toFloat(form.prix_revente_max),
      poids_estime: toFloat(form.poids_estime),
      volume_estime: toFloat(form.volume_estime),
    }
    try {
      if (isEdit) {
        await api.put(`/objets/${id}`, payload)
        navigate(`/objets/${id}`)
      } else {
        const res = await api.post('/objets', payload)
        navigate(`/objets/${res.data.id}`)
      }
    } catch {
      alert('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="flex justify-center py-16">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const inputCls = 'w-full rounded-xl border-gray-200 text-base py-2.5 px-3 focus:ring-primary focus:border-primary'
  const labelCls = 'block text-sm font-medium text-ink mb-1'

  return (
    <form onSubmit={handleSubmit} className="px-4 pt-4 pb-6 space-y-5">
      <h2 className="font-bold text-ink mb-2">{isEdit ? 'Modifier l\'objet' : 'Nouvel objet'}</h2>

      {/* Infos générales */}
      <section className="space-y-3">
        <h3 className="font-semibold text-ink text-sm uppercase tracking-wide">Informations</h3>
        <div>
          <label className={labelCls}>Nom *</label>
          <input className={inputCls} value={form.nom} onChange={e => set('nom', e.target.value)} required placeholder="Lampe ZAOS Grzybek" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Fabricant</label>
            <input className={inputCls} value={form.fabricant} onChange={e => set('fabricant', e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Designer</label>
            <input className={inputCls} value={form.designer} onChange={e => set('designer', e.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Catégorie</label>
            <select className={inputCls} value={form.categorie} onChange={e => set('categorie', e.target.value)}>
              <option value="LAMPE">Lampe</option>
              <option value="AFFICHE">Affiche</option>
              <option value="FAUTEUIL">Fauteuil</option>
              <option value="AUTRE">Autre</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Époque</label>
            <input className={inputCls} value={form.epoque} onChange={e => set('epoque', e.target.value)} placeholder="années 60-70" />
          </div>
        </div>
        <div>
          <label className={labelCls}>Dimensions</label>
          <input className={inputCls} value={form.dimensions} onChange={e => set('dimensions', e.target.value)} placeholder="H: 35cm, Ø 33cm" />
        </div>
        <div>
          <label className={labelCls}>Description</label>
          <textarea className={`${inputCls} min-h-[100px]`} value={form.description} onChange={e => set('description', e.target.value)} />
        </div>
      </section>

      {/* Priorité / Rareté / Statut */}
      <section className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Priorité</label>
          <select className={inputCls} value={form.priorite} onChange={e => set('priorite', e.target.value)}>
            <option value="HAUTE">Haute</option>
            <option value="MOYENNE">Moyenne</option>
            <option value="BASSE">Basse</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>Rareté</label>
          <select className={inputCls} value={form.rarete} onChange={e => set('rarete', e.target.value)}>
            <option value="RARE">Rare</option>
            <option value="MOYEN">Moyen</option>
            <option value="ABONDANT">Abondant</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>Statut</label>
          <select className={inputCls} value={form.statut} onChange={e => set('statut', e.target.value)}>
            <option value="A_CHERCHER">À chercher</option>
            <option value="REPERE">Repéré</option>
            <option value="ACHETE">Acheté</option>
          </select>
        </div>
      </section>

      {/* Prix */}
      <section className="space-y-3">
        <h3 className="font-semibold text-ink text-sm uppercase tracking-wide">Prix (€)</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Achat min</label>
            <input type="number" step="0.5" inputMode="decimal" className={inputCls} value={form.prix_achat_min} onChange={e => set('prix_achat_min', e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Achat max</label>
            <input type="number" step="0.5" inputMode="decimal" className={inputCls} value={form.prix_achat_max} onChange={e => set('prix_achat_max', e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Revente min</label>
            <input type="number" step="0.5" inputMode="decimal" className={inputCls} value={form.prix_revente_min} onChange={e => set('prix_revente_min', e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Revente max</label>
            <input type="number" step="0.5" inputMode="decimal" className={inputCls} value={form.prix_revente_max} onChange={e => set('prix_revente_max', e.target.value)} />
          </div>
        </div>
      </section>

      {/* Bagage */}
      <section className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Poids estimé (kg)</label>
          <input type="number" step="0.1" inputMode="decimal" className={inputCls} value={form.poids_estime} onChange={e => set('poids_estime', e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Volume estimé (L)</label>
          <input type="number" step="0.5" inputMode="decimal" className={inputCls} value={form.volume_estime} onChange={e => set('volume_estime', e.target.value)} />
        </div>
      </section>

      {/* Mots-clés */}
      <section>
        <label className={labelCls}>Mots-clés polonais</label>
        <input className={inputCls} value={form.mots_cles_polonais} onChange={e => set('mots_cles_polonais', e.target.value)} placeholder="lampa grzybek · lampa ZAOS" />
      </section>

      {/* Tests authenticité */}
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-ink text-sm uppercase tracking-wide">Tests authenticité</h3>
          <button type="button" onClick={() => addString('tests_authenticite')} className="text-primary text-sm font-medium">+ Ajouter</button>
        </div>
        {form.tests_authenticite.map((t, i) => (
          <div key={i} className="flex gap-2">
            <input className={`${inputCls} flex-1`} value={t} onChange={e => updateString('tests_authenticite', i, e.target.value)} />
            <button type="button" onClick={() => removeString('tests_authenticite', i)} className="text-gray-400 px-2">✕</button>
          </div>
        ))}
      </section>

      {/* Signaux alerte */}
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-ink text-sm uppercase tracking-wide">Signaux d'alerte</h3>
          <button type="button" onClick={() => addString('signaux_alerte')} className="text-primary text-sm font-medium">+ Ajouter</button>
        </div>
        {form.signaux_alerte.map((s, i) => (
          <div key={i} className="flex gap-2">
            <input className={`${inputCls} flex-1`} value={s} onChange={e => updateString('signaux_alerte', i, e.target.value)} />
            <button type="button" onClick={() => removeString('signaux_alerte', i)} className="text-gray-400 px-2">✕</button>
          </div>
        ))}
      </section>

      {/* Liens référence */}
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-ink text-sm uppercase tracking-wide">Liens référence</h3>
          <button type="button" onClick={addLien} className="text-primary text-sm font-medium">+ Ajouter</button>
        </div>
        {form.liens_reference.map((l, i) => (
          <div key={i} className="space-y-1.5 bg-card rounded-xl p-3">
            <input className={inputCls} value={l.label} onChange={e => updateLien(i, 'label', e.target.value)} placeholder="Label" />
            <div className="flex gap-2">
              <input className={`${inputCls} flex-1`} value={l.url} onChange={e => updateLien(i, 'url', e.target.value)} placeholder="URL" />
              <button type="button" onClick={() => removeLien(i)} className="text-gray-400 px-2">✕</button>
            </div>
          </div>
        ))}
      </section>

      {/* Photos */}
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-ink text-sm uppercase tracking-wide">Photos</h3>
          {form.photos_reference.length > 1 && (
            <span className="text-xs text-gray-400">Appuyer sur ★ pour choisir la couverture</span>
          )}
        </div>
        {form.photos_reference.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {form.photos_reference.map((url, i) => (
              <div key={i} className="relative flex-shrink-0">
                <img
                  src={url}
                  alt=""
                  className={`h-24 w-24 object-cover rounded-lg ${i === 0 ? 'ring-2 ring-secondary' : ''}`}
                />
                {/* Bouton supprimer */}
                <button
                  type="button"
                  onClick={() => set('photos_reference', form.photos_reference.filter((_, j) => j !== i))}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white rounded-full text-xs flex items-center justify-center"
                >✕</button>
                {/* Bouton couverture */}
                {i !== 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      const photos = [...form.photos_reference]
                      photos.splice(i, 1)
                      photos.unshift(url)
                      set('photos_reference', photos)
                    }}
                    className="absolute bottom-1 right-1 w-6 h-6 bg-black/50 text-yellow-300 rounded-full text-xs flex items-center justify-center"
                    title="Définir comme photo de couverture"
                  >★</button>
                )}
                {i === 0 && (
                  <div className="absolute bottom-1 left-1 bg-secondary text-white text-xs px-1 rounded font-medium">
                    couv.
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="file" accept="image/*" multiple className="hidden" onChange={handlePhotos} />
          <span className={`inline-flex items-center gap-1 px-4 py-2 rounded-xl border-2 border-dashed border-gray-300 text-sm text-gray-500 ${uploading ? 'opacity-60' : ''}`}>
            {uploading ? 'Upload…' : '+ Ajouter des photos'}
          </span>
        </label>
      </section>

      {/* Notes */}
      <section>
        <label className={labelCls}>Notes</label>
        <textarea className={`${inputCls} min-h-[80px]`} value={form.notes} onChange={e => set('notes', e.target.value)} />
      </section>

      {/* Submit */}
      <button
        type="submit"
        disabled={saving}
        className="w-full bg-primary text-white font-semibold text-lg py-4 rounded-xl disabled:opacity-60 transition-colors"
      >
        {saving ? 'Sauvegarde…' : isEdit ? 'Enregistrer les modifications' : 'Créer l\'objet'}
      </button>
    </form>
  )
}
