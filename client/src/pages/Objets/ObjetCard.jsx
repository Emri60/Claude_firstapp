import { useNavigate } from 'react-router-dom'
import Badge from '../../components/Badge'

export default function ObjetCard({ objet }) {
  const navigate = useNavigate()

  const photo = objet.photos_reference?.[0]

  return (
    <div
      onClick={() => navigate(`/objets/${objet.id}`)}
      className="bg-card rounded-2xl shadow-sm border border-gray-100 active:scale-[0.99] transition-transform cursor-pointer overflow-hidden"
    >
      {photo && (
        <img
          src={photo}
          alt={objet.nom}
          className="w-full h-40 object-cover"
          loading="lazy"
        />
      )}
      <div className="p-4">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-semibold text-ink text-base leading-tight flex-1">{objet.nom}</h3>
        {objet.marge_estimee != null && (
          <span className="text-secondary font-bold text-sm whitespace-nowrap">
            ×{Math.round(objet.marge_estimee / 100 + 1)}
          </span>
        )}
      </div>

      {objet.fabricant && (
        <p className="text-sm text-gray-500 mb-2">{objet.fabricant}{objet.designer ? ` · ${objet.designer}` : ''}</p>
      )}

      <div className="flex flex-wrap gap-1.5 mb-3">
        <Badge type="priorite" value={objet.priorite} />
        <Badge type="rarete" value={objet.rarete} />
        <Badge type="statut" value={objet.statut} />
      </div>

      {(objet.prix_achat_min != null || objet.prix_revente_min != null) && (
        <div className="flex items-center gap-3 text-sm">
          {objet.prix_achat_min != null && (
            <span className="text-gray-500">
              Achat : <span className="font-medium text-ink">{objet.prix_achat_min}–{objet.prix_achat_max}€</span>
            </span>
          )}
          {objet.prix_revente_min != null && (
            <span className="text-gray-500">
              Revente : <span className="font-semibold text-secondary">{objet.prix_revente_min}–{objet.prix_revente_max}€</span>
            </span>
          )}
        </div>
      )}
      </div>
    </div>
  )
}
