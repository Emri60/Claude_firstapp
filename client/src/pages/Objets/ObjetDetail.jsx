import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../api'
import Badge from '../../components/Badge'

export default function ObjetDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [objet, setObjet] = useState(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [lightbox, setLightbox] = useState(null) // index ou null

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

  const photos = objet?.photos_reference ?? []

  const prev = useCallback(() => setLightbox(i => (i - 1 + photos.length) % photos.length), [photos.length])
  const next = useCallback(() => setLightbox(i => (i + 1) % photos.length), [photos.length])
  const [touchStart, setTouchStart] = useState(null)

  useEffect(() => {
    if (lightbox === null) return
    function onKey(e) {
      if (e.key === 'Escape') setLightbox(null)
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightbox, prev, next])

  function handleTouchStart(e) { setTouchStart(e.touches[0].clientX) }
  function handleTouchEnd(e) {
    if (touchStart === null) return
    const diff = e.changedTouches[0].clientX - touchStart
    if (Math.abs(diff) > 50) { diff > 0 ? prev() : next() }
    setTouchStart(null)
  }

  if (loading) return (
    <div className="flex justify-center py-16">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (!objet) return null

  return (
    <div className="pb-4">
      {/* Photos */}
      {photos.length > 0 && (
        <div className="flex gap-2 overflow-x-auto px-4 pt-4 pb-2 scrollbar-hide">
          {photos.map((url, i) => (
            <img
              key={i}
              src={url}
              alt=""
              onClick={() => setLightbox(i)}
              className="h-28 w-28 object-cover rounded-xl flex-shrink-0 cursor-zoom-in"
            />
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex flex-col"
          onClick={() => setLightbox(null)}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 flex-shrink-0" onClick={e => e.stopPropagation()}>
            <span className="text-white/60 text-sm">{lightbox + 1} / {photos.length}</span>
            <button
              onClick={() => setLightbox(null)}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white/20 text-white text-xl font-bold hover:bg-white/30 transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Image */}
          <div className="flex-1 flex items-center justify-center px-4 min-h-0" onClick={e => e.stopPropagation()}
            onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
            <img
              src={photos[lightbox]}
              alt=""
              className="max-w-full max-h-full object-contain select-none"
            />
          </div>

          {/* Navigation */}
          {photos.length > 1 && (
            <div className="flex items-center justify-between px-4 py-4 flex-shrink-0" onClick={e => e.stopPropagation()}>
              <button
                onClick={prev}
                className="w-12 h-12 flex items-center justify-center rounded-full bg-white/20 text-white text-xl hover:bg-white/30 transition-colors"
              >
                ‹
              </button>
              {/* Points */}
              <div className="flex gap-1.5">
                {photos.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setLightbox(i)}
                    className={`w-2 h-2 rounded-full transition-all ${i === lightbox ? 'bg-white scale-125' : 'bg-white/40'}`}
                  />
                ))}
              </div>
              <button
                onClick={next}
                className="w-12 h-12 flex items-center justify-center rounded-full bg-white/20 text-white text-xl hover:bg-white/30 transition-colors"
              >
                ›
              </button>
            </div>
          )}
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

        {/* Restauration */}
        {objet.restauration && (
          <div className="bg-orange-50 rounded-2xl p-4 flex items-center gap-3">
            <span className="text-lg">🔧</span>
            <div>
              <p className="text-sm font-semibold text-orange-700">Restauration necessaire</p>
              {objet.atelier && (
                <p className="text-xs text-orange-600 mt-0.5">
                  Atelier : {objet.atelier.nom}{objet.atelier.ville ? ` (${objet.atelier.ville})` : ''}
                </p>
              )}
            </div>
          </div>
        )}

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

        {/* Données marché */}
        {objet.market_snapshot && (
          <div className="bg-card rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-ink text-sm uppercase tracking-wide">Données marché</h3>
              <span className="text-xs text-gray-400">
                {new Date(objet.market_snapshot.collected_at).toLocaleDateString('fr-FR')}
              </span>
            </div>
            {objet.market_snapshot.trends_score != null && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Tendance Google FR</span>
                <span className="font-semibold text-primary">{objet.market_snapshot.trends_score} / 100</span>
              </div>
            )}
            {objet.market_snapshot.selency_prix_moyen != null && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Shopping FR ({objet.market_snapshot.selency_count} résultats)</span>
                <span className="font-semibold text-secondary">~{Math.round(objet.market_snapshot.selency_prix_moyen)}€</span>
              </div>
            )}
          </div>
        )}

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
        <div className="space-y-2 pt-2">
          <button
            onClick={() => navigate(`/objets/${id}/modifier`)}
            className="w-full bg-ink text-white font-semibold py-3 rounded-xl text-sm"
          >
            Modifier
          </button>
          <div className="flex gap-3">
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
    </div>
  )
}
