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
      <div className="w-full aspect-[4/3] bg-gray-100 flex items-center justify-center overflow-hidden">
        {photo ? (
          <img
            src={photo}
            alt={objet.nom}
            className="w-full h-full object-contain"
            loading="lazy"
          />
        ) : (
          <span className="text-gray-300 text-4xl">?</span>
        )}
      </div>
      <div className="p-3">
        <div className="flex items-start justify-between gap-1 mb-1.5">
          <h3 className="font-semibold text-ink text-sm leading-tight flex-1 line-clamp-2">{objet.nom}</h3>
          {objet.marge_estimee != null && (
            <span className="text-secondary font-bold text-xs whitespace-nowrap ml-1">
              ×{Math.round(objet.marge_estimee / 100 + 1)}
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-1 mb-2">
          <Badge type="priorite" value={objet.priorite} />
          <Badge type="statut" value={objet.statut} />
        </div>

        {objet.prix_achat_min != null && (
          <p className="text-xs text-gray-500">
            Achat : <span className="font-medium text-ink">{objet.prix_achat_min}–{objet.prix_achat_max}€</span>
          </p>
        )}
      </div>
    </div>
  )
}
