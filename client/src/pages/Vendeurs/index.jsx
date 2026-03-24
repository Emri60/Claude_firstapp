import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api'
import VendeurCard from './VendeurCard'

export default function VendeursPage() {
  const navigate = useNavigate()
  const [vendeurs, setVendeurs] = useState([])
  const [loading, setLoading] = useState(true)
  const [marche, setMarche] = useState('')
  const [confiance, setConfiance] = useState('')
  const [entrepot, setEntrepot] = useState('')

  useEffect(() => {
    const params = {}
    if (marche) params.marche = marche
    if (confiance) params.niveau_confiance = confiance
    if (entrepot) params.a_entrepot = entrepot
    setLoading(true)
    api.get('/vendeurs', { params })
      .then(r => setVendeurs(r.data))
      .finally(() => setLoading(false))
  }, [marche, confiance, entrepot])

  const inputCls = 'flex-1 rounded-xl border-gray-200 text-sm py-2 focus:ring-primary focus:border-primary'

  return (
    <div className="px-4 pt-4">
      {/* Filtres */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={marche}
          onChange={e => setMarche(e.target.value)}
          placeholder="Marché…"
          className={inputCls}
        />
        <select value={confiance} onChange={e => setConfiance(e.target.value)} className={inputCls}>
          <option value="">Confiance</option>
          <option value="FIABLE">Fiable</option>
          <option value="MOYEN">Moyen</option>
          <option value="INCONNU">Inconnu</option>
        </select>
        <select value={entrepot} onChange={e => setEntrepot(e.target.value)} className={inputCls}>
          <option value="">Entrepôt</option>
          <option value="true">Oui</option>
          <option value="false">Non</option>
        </select>
      </div>

      <p className="text-sm text-gray-400 mb-3">{vendeurs.length} vendeur{vendeurs.length !== 1 ? 's' : ''}</p>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : vendeurs.length === 0 ? (
        <p className="text-center text-gray-400 py-12">Aucun vendeur</p>
      ) : (
        <div className="space-y-3 pb-4">
          {vendeurs.map(v => <VendeurCard key={v.id} vendeur={v} />)}
        </div>
      )}

      <button
        onClick={() => navigate('/vendeurs/nouveau')}
        className="fixed bottom-20 right-4 w-14 h-14 bg-primary text-white rounded-full shadow-lg flex items-center justify-center text-2xl font-light z-40 active:scale-95 transition-transform"
      >
        +
      </button>
    </div>
  )
}
