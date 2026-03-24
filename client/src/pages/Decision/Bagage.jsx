import { useState, useEffect } from 'react'
import api from '../../api'

const MAX_KG = 20

export default function Bagage() {
  const [objets, setObjets] = useState([])
  const [checked, setChecked] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/objets').then(r => {
      setObjets(r.data)
      const defaults = {}
      r.data.forEach(o => { if (o.statut === 'ACHETE') defaults[o.id] = true })
      setChecked(defaults)
    }).finally(() => setLoading(false))
  }, [])

  function toggle(id) {
    setChecked(c => ({ ...c, [id]: !c[id] }))
  }

  const selected = objets.filter(o => checked[o.id])
  const totalKg = selected.reduce((s, o) => s + (o.poids_estime ?? 0), 0)
  const totalL = selected.reduce((s, o) => s + (o.volume_estime ?? 0), 0)
  const over = totalKg > MAX_KG

  if (loading) return <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="space-y-4">
      {/* Totaux */}
      <div className={`rounded-2xl p-4 border-2 ${over ? 'bg-red-50 border-primary' : 'bg-green-50 border-green-200'}`}>
        <div className="flex justify-around">
          <div className="text-center">
            <div className={`text-3xl font-black ${over ? 'text-primary' : 'text-success'}`}>{totalKg.toFixed(1)} kg</div>
            <div className="text-xs text-gray-500 mt-0.5">sur {MAX_KG} kg max</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-black text-ink">{totalL.toFixed(0)} L</div>
            <div className="text-xs text-gray-500 mt-0.5">volume total</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-black text-ink">{selected.length}</div>
            <div className="text-xs text-gray-500 mt-0.5">objet{selected.length !== 1 ? 's' : ''}</div>
          </div>
        </div>
        {over && (
          <div className="mt-2 text-center text-primary font-semibold text-sm">
            ⚠ Dépasse la limite Ryanair 20kg !
          </div>
        )}
        {!over && totalKg > 0 && (
          <div className="mt-2">
            <div className="w-full bg-green-200 rounded-full h-2">
              <div className="bg-success rounded-full h-2 transition-all" style={{ width: `${Math.min(100, (totalKg / MAX_KG) * 100)}%` }} />
            </div>
            <div className="text-xs text-gray-400 text-right mt-0.5">{Math.round((totalKg / MAX_KG) * 100)}% de la capacité</div>
          </div>
        )}
      </div>

      {/* Liste objets */}
      <div className="space-y-2">
        {objets.map(o => (
          <label
            key={o.id}
            className={`flex items-center gap-3 p-3 rounded-xl border transition-colors cursor-pointer ${
              checked[o.id] ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
            }`}
          >
            <input
              type="checkbox"
              checked={!!checked[o.id]}
              onChange={() => toggle(o.id)}
              className="w-5 h-5 rounded text-success accent-success"
            />
            <div className="flex-1 min-w-0">
              <div className="font-medium text-ink text-sm truncate">{o.nom}</div>
              <div className="text-xs text-gray-400">
                {o.poids_estime ? `${o.poids_estime} kg` : 'poids ?'}
                {o.volume_estime ? ` · ${o.volume_estime} L` : ''}
              </div>
            </div>
            {o.statut === 'ACHETE' && <span className="text-xs bg-green-100 text-success px-2 py-0.5 rounded-full">Acheté</span>}
          </label>
        ))}
      </div>
    </div>
  )
}
