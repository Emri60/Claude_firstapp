import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api'
import ObjetCard from './ObjetCard'

const CATEGORIES = ['', 'LAMPE', 'AFFICHE', 'FAUTEUIL', 'AUTRE']
const CAT_LABELS = { '': 'Tous', LAMPE: 'Lampes', AFFICHE: 'Affiches', FAUTEUIL: 'Fauteuils', AUTRE: 'Autres' }
const PRIORITES = ['', 'HAUTE', 'MOYENNE', 'BASSE']
const RARETS = ['', 'RARE', 'MOYEN', 'ABONDANT']
const STATUTS = ['', 'A_CHERCHER', 'REPERE', 'ACHETE']

export default function ObjetsPage() {
  const navigate = useNavigate()
  const [objets, setObjets] = useState([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [categorie, setCategorie] = useState('')
  const [priorite, setPriorite] = useState('')
  const [rarete, setRarete] = useState('')
  const [statut, setStatut] = useState('')

  useEffect(() => {
    const params = {}
    if (q) params.q = q
    if (categorie) params.categorie = categorie
    if (priorite) params.priorite = priorite
    if (rarete) params.rarete = rarete
    if (statut) params.statut = statut
    setLoading(true)
    api.get('/objets', { params })
      .then(r => setObjets(r.data))
      .finally(() => setLoading(false))
  }, [q, categorie, priorite, rarete, statut])

  return (
    <div className="px-4 pt-4">
      {/* Barre de recherche */}
      <input
        type="search"
        value={q}
        onChange={e => setQ(e.target.value)}
        placeholder="Rechercher un objet, fabricant, mot-clé…"
        className="w-full rounded-xl border-gray-200 text-base py-3 px-4 mb-3 focus:ring-primary focus:border-primary"
      />

      {/* Chips catégorie */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-3 scrollbar-hide">
        {CATEGORIES.map(c => (
          <button
            key={c}
            onClick={() => setCategorie(c)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              categorie === c
                ? 'bg-primary text-white border-primary'
                : 'bg-white text-gray-500 border-gray-200'
            }`}
          >
            {CAT_LABELS[c]}
          </button>
        ))}
      </div>

      {/* Filtres secondaires */}
      <div className="flex gap-2 mb-4">
        <select
          value={priorite}
          onChange={e => setPriorite(e.target.value)}
          className="flex-1 rounded-xl border-gray-200 text-sm py-2 focus:ring-primary focus:border-primary"
        >
          <option value="">Priorité</option>
          {PRIORITES.slice(1).map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <select
          value={rarete}
          onChange={e => setRarete(e.target.value)}
          className="flex-1 rounded-xl border-gray-200 text-sm py-2 focus:ring-primary focus:border-primary"
        >
          <option value="">Rareté</option>
          {RARETS.slice(1).map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <select
          value={statut}
          onChange={e => setStatut(e.target.value)}
          className="flex-1 rounded-xl border-gray-200 text-sm py-2 focus:ring-primary focus:border-primary"
        >
          <option value="">Statut</option>
          <option value="A_CHERCHER">À chercher</option>
          <option value="REPERE">Repéré</option>
          <option value="ACHETE">Acheté</option>
        </select>
      </div>

      {/* Compteur */}
      <p className="text-sm text-gray-400 mb-3">{objets.length} objet{objets.length !== 1 ? 's' : ''}</p>

      {/* Liste */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : objets.length === 0 ? (
        <p className="text-center text-gray-400 py-12">Aucun objet trouvé</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 pb-4">
          {objets.map(o => <ObjetCard key={o.id} objet={o} />)}
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => navigate('/objets/nouveau')}
        className="fixed bottom-20 right-4 w-14 h-14 bg-primary text-white rounded-full shadow-lg flex items-center justify-center text-2xl font-light z-40 active:scale-95 transition-transform"
      >
        +
      </button>
    </div>
  )
}
