import { useNavigate } from 'react-router-dom'
import Badge from '../../components/Badge'

export default function VendeurCard({ vendeur }) {
  const navigate = useNavigate()

  return (
    <div
      onClick={() => navigate(`/vendeurs/${vendeur.id}`)}
      className="bg-card rounded-2xl p-4 shadow-sm border border-gray-100 active:scale-[0.99] transition-transform cursor-pointer"
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <h3 className="font-semibold text-ink text-base">{vendeur.nom}</h3>
        <Badge type="confiance" value={vendeur.niveau_confiance} />
      </div>
      {vendeur.marche && <p className="text-sm text-gray-500">{vendeur.marche}{vendeur.stand_habituel ? ` · ${vendeur.stand_habituel}` : ''}</p>}
      {vendeur.specialite && <p className="text-sm text-gray-400 mt-1 truncate">{vendeur.specialite}</p>}
      <div className="flex items-center gap-3 mt-2">
        {vendeur.telephone && (
          <a
            href={`https://wa.me/${vendeur.telephone.replace(/\D/g, '')}`}
            onClick={e => e.stopPropagation()}
            target="_blank"
            rel="noreferrer"
            className="text-success text-sm font-medium"
          >
            WhatsApp
          </a>
        )}
        {vendeur.a_entrepot && <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full border border-blue-200">Entrepôt</span>}
      </div>
    </div>
  )
}
