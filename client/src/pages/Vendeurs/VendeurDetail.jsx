import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../api'
import Badge from '../../components/Badge'

export default function VendeurDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [vendeur, setVendeur] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/vendeurs/${id}`)
      .then(r => setVendeur(r.data))
      .catch(() => navigate('/vendeurs'))
      .finally(() => setLoading(false))
  }, [id])

  async function handleDelete() {
    if (!window.confirm('Supprimer ce vendeur ?')) return
    await api.delete(`/vendeurs/${id}`)
    navigate('/vendeurs')
  }

  if (loading) return <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
  if (!vendeur) return null

  return (
    <div className="px-4 pt-4 pb-6 space-y-5">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="text-gray-400 text-sm">← Retour</button>
        <button onClick={() => navigate(`/vendeurs/${id}/modifier`)} className="text-sm text-primary font-medium">Modifier</button>
      </div>

      {/* En-tête */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h2 className="text-xl font-bold text-ink">{vendeur.nom}</h2>
          <Badge type="confiance" value={vendeur.niveau_confiance} />
        </div>
        {vendeur.marche && <p className="text-gray-500">{vendeur.marche}</p>}
        {vendeur.stand_habituel && <p className="text-sm text-gray-400">{vendeur.stand_habituel}</p>}
      </div>

      {/* Actions contact */}
      <div className="flex gap-3">
        {vendeur.telephone && (
          <>
            <a
              href={`https://wa.me/${vendeur.telephone.replace(/\D/g, '')}`}
              target="_blank"
              rel="noreferrer"
              className="flex-1 bg-success text-white font-semibold py-3 rounded-xl text-sm text-center"
            >
              WhatsApp
            </a>
            <a
              href={`tel:${vendeur.telephone}`}
              className="flex-1 bg-card text-ink font-semibold py-3 rounded-xl text-sm text-center border border-gray-200"
            >
              Appeler
            </a>
          </>
        )}
      </div>

      {/* Infos */}
      <div className="bg-card rounded-2xl p-4 space-y-3">
        {vendeur.telephone && (
          <Row label="Téléphone" value={vendeur.telephone} />
        )}
        {vendeur.specialite && <Row label="Spécialité" value={vendeur.specialite} />}
        <Row label="Entrepôt" value={vendeur.a_entrepot ? 'Oui' : 'Non'} />
        <Row label="Rappel avant voyage" value={vendeur.rappel_avant_voyage ? 'Oui' : 'Non'} />
      </div>

      {vendeur.notes && (
        <div>
          <h3 className="font-semibold text-ink mb-1">Notes</h3>
          <p className="text-sm text-gray-600">{vendeur.notes}</p>
        </div>
      )}

      {/* Historique achats */}
      {vendeur.achats?.length > 0 && (
        <div>
          <h3 className="font-semibold text-ink mb-2">Historique achats ({vendeur.achats.length})</h3>
          <div className="space-y-2">
            {vendeur.achats.map(a => (
              <div key={a.id} className="bg-card rounded-xl p-3 flex justify-between items-center">
                <div>
                  <div className="font-medium text-sm text-ink">{a.objet?.nom ?? 'Objet inconnu'}</div>
                  <div className="text-xs text-gray-400">{new Date(a.date).toLocaleDateString('fr-FR')}{a.voyage ? ` · ${a.voyage}` : ''}</div>
                </div>
                <div className="font-bold text-secondary">{a.prix_paye} €</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Supprimer */}
      <button
        onClick={handleDelete}
        className="w-full bg-red-50 text-primary font-semibold py-3 rounded-xl text-sm"
      >
        Supprimer ce vendeur
      </button>
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-ink">{value}</span>
    </div>
  )
}
