import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../api'
import Badge from '../../components/Badge'

export default function ObjetDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [objet, setObjet] = useState(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    api.get(`/objets/${id}`)
      .then(r => setObjet(r.data))
      .catch(() => navigate('/objets'))
      .finally(() => setLoading(false))
  }, [id])

  async function handleDelete() {
    if (!window.confirm('Supprimer cet objet ?')) return
    setDeleting(true)
    await api.delete(`/objets/${id}`)
    navigate('/objets')
  }

  async function handleDuplicate() {
    const { id: _id, created_at, updated_at, photos_reference, ...data } = objet
    const res = await api.post('/objets', { ...data, nom: `${objet.nom} (copie)`, photos_reference: [] })
    navigate(`/objets/${res.data.id}/modifier`)
  }

  if (loading) return (
    <div className="flex justify-center py-16">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (!objet) return null

  const photos = objet.photos_reference ?? []

  return (
    <div className="pb-4">
      {/* Photos */}
      {photos.length > 0 && (
        <div className="flex gap-2 overflow-x-auto px-4 pt-4 pb-2 scrollbar-hide">
          {photos.map((url, i) => (
            <img key={i} src={url} alt="" className="h-48 w-48 object-cover rounded-xl flex-shrink-0" />
          ))}
        </div>
      )}

      <div className="px-4 pt-4 space-y-5">
        {/* En-tête */}
        <div>
          <div className="flex flex-wrap gap-1.5 mb-2">
            <Badge type="priorite" value={objet.priorite} />
            <Badge type="rarete" value={objet.rarete} />
            <Badge type="statut" value={objet.statut} />
          </div>
          <h2 className="text-xl font-bold text-ink">{objet.nom}</h2>
          {objet.fabricant && <p className="text-gray-500 mt-0.5">{objet.fabricant}{objet.designer ? ` — ${objet.designer}` : ''}</p>}
          {objet.epoque && <p className="text-sm text-gray-400">{objet.epoque}</p>}
          {objet.dimensions && <p className="text-sm text-gray-400">{objet.dimensions}</p>}
        </div>

        {/* Prix */}
        {(objet.prix_achat_min != null || objet.prix_revente_min != null) && (
          <div className="bg-card rounded-2xl p-4 space-y-2">
            <h3 className="font-semibold text-ink text-sm uppercase tracking-wide">Prix</h3>
            {objet.prix_achat_min != null && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Achat marché</span>
                <span className="font-semibold text-ink">{objet.prix_achat_min} – {objet.prix_achat_max} €</span>
              </div>
            )}
            {objet.prix_revente_min != null && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Revente</span>
                <span className="font-semibold text-secondary">{objet.prix_revente_min} – {objet.prix_revente_max} €</span>
              </div>
            )}
            {objet.marge_estimee != null && (
              <div className="flex justify-between text-sm border-t border-gray-200 pt-2 mt-1">
                <span className="text-gray-500">Marge estimée</span>
                <span className="font-bold text-success">+{objet.marge_estimee} %</span>
              </div>
            )}
          </div>
        )}

        {/* Bouton calculateur */}
        <button
          onClick={() => navigate(`/terrain?onglet=calculateur&objet=${id}`)}
          className="w-full bg-secondary text-white font-semibold py-3 rounded-xl text-sm"
        >
          Calculer la marge terrain
        </button>

        {/* Description */}
        {objet.description && (
          <div>
            <h3 className="font-semibold text-ink mb-1">Description</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{objet.description}</p>
          </div>
        )}

        {/* Tests authenticité */}
        {objet.tests_authenticite?.length > 0 && (
          <div>
            <h3 className="font-semibold text-ink mb-2">Tests d'authenticité</h3>
            <div className="space-y-2">
              {objet.tests_authenticite.map((t, i) => (
                <div key={i} className="flex gap-2 text-sm">
                  <span className="text-success font-bold mt-0.5">✓</span>
                  <span className="text-gray-700">{t}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Signaux alerte */}
        {objet.signaux_alerte?.length > 0 && (
          <div>
            <h3 className="font-semibold text-ink mb-2">Signaux d'alerte</h3>
            <div className="space-y-2">
              {objet.signaux_alerte.map((s, i) => (
                <div key={i} className="flex gap-2 text-sm">
                  <span className="text-primary font-bold mt-0.5">⚠</span>
                  <span className="text-gray-700">{s}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mots-clés polonais */}
        {objet.mots_cles_polonais && (
          <div>
            <h3 className="font-semibold text-ink mb-1">Mots-clés polonais</h3>
            <p className="text-sm text-gray-600 bg-card rounded-xl p-3 font-mono">{objet.mots_cles_polonais}</p>
          </div>
        )}

        {/* Liens référence */}
        {objet.liens_reference?.length > 0 && (
          <div>
            <h3 className="font-semibold text-ink mb-2">Liens référence</h3>
            <div className="space-y-2">
              {objet.liens_reference.map((l, i) => (
                <a
                  key={i}
                  href={l.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block text-sm text-primary underline"
                >
                  {l.label}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {objet.notes && (
          <div>
            <h3 className="font-semibold text-ink mb-1">Notes</h3>
            <p className="text-sm text-gray-600">{objet.notes}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={() => navigate(`/objets/${id}/modifier`)}
            className="flex-1 bg-ink text-white font-semibold py-3 rounded-xl text-sm"
          >
            Modifier
          </button>
          <button
            onClick={handleDuplicate}
            className="flex-1 bg-gray-100 text-gray-700 font-semibold py-3 rounded-xl text-sm"
          >
            Dupliquer
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex-1 bg-red-50 text-primary font-semibold py-3 rounded-xl text-sm disabled:opacity-60"
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  )
}
