import { useState, useEffect } from 'react'
import api from '../../api'

function calcMarge(objet, prix, commission) {
  if (!objet || !prix) return null
  const p = parseFloat(prix)
  const revMoy = (objet.prix_revente_min + objet.prix_revente_max) / 2
  const com = commission / 100
  const revNette = revMoy * (1 - com)
  const margeN = ((revNette - p) / p) * 100
  return { margeN: Math.round(margeN), profit: Math.round(revNette - p) }
}

export default function Comparateur() {
  const [objets, setObjets] = useState([])
  const [objetA, setObjetA] = useState('')
  const [objetB, setObjetB] = useState('')
  const [prixA, setPrixA] = useState('')
  const [prixB, setPrixB] = useState('')
  const [budget, setBudget] = useState('')
  const [commission] = useState(15)

  useEffect(() => {
    api.get('/objets').then(r => setObjets(r.data))
  }, [])

  const oA = objets.find(o => o.id === parseInt(objetA))
  const oB = objets.find(o => o.id === parseInt(objetB))
  const resA = calcMarge(oA, prixA, commission)
  const resB = calcMarge(oB, prixB, commission)

  function getRecommendation() {
    if (!oA || !oB || !prixA || !prixB) return null
    const bgt = parseFloat(budget) || Infinity
    const fitA = parseFloat(prixA) <= bgt
    const fitB = parseFloat(prixB) <= bgt
    if (!fitA && !fitB) return { msg: 'Les deux dépassent votre budget', color: 'text-primary' }
    if (!fitA) return { msg: `Prenez ${oB.nom}`, sub: `Budget trop juste pour ${oA.nom}`, color: 'text-success' }
    if (!fitB) return { msg: `Prenez ${oA.nom}`, sub: `Budget trop juste pour ${oB.nom}`, color: 'text-success' }
    if (!resA || !resB) return null
    if (resA.margeN > resB.margeN) return { msg: `Prenez ${oA.nom}`, sub: `Marge nette +${resA.margeN}% vs +${resB.margeN}%`, color: 'text-success' }
    if (resB.margeN > resA.margeN) return { msg: `Prenez ${oB.nom}`, sub: `Marge nette +${resB.margeN}% vs +${resA.margeN}%`, color: 'text-success' }
    return { msg: 'Marges équivalentes', sub: 'Prenez les deux si le budget le permet !', color: 'text-secondary' }
  }

  const reco = getRecommendation()

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {/* Objet A */}
        <div className="bg-card rounded-2xl p-3 space-y-2">
          <div className="text-xs font-bold text-gray-400 uppercase">Objet A</div>
          <select value={objetA} onChange={e => setObjetA(e.target.value)}
            className="w-full rounded-xl border-gray-200 text-sm py-2 focus:ring-primary focus:border-primary">
            <option value="">Choisir…</option>
            {objets.map(o => <option key={o.id} value={o.id}>{o.nom}</option>)}
          </select>
          <input type="number" step="0.5" placeholder="Prix demandé €" value={prixA} onChange={e => setPrixA(e.target.value)}
            className="w-full rounded-xl border-gray-200 text-base py-2 px-3 focus:ring-primary focus:border-primary" />
          {resA && (
            <div className="text-center">
              <div className={`text-2xl font-black ${resA.margeN > 60 ? 'text-success' : resA.margeN >= 30 ? 'text-secondary' : 'text-primary'}`}>
                {resA.margeN > 0 ? '+' : ''}{resA.margeN}%
              </div>
              <div className="text-xs text-gray-400">profit ~{resA.profit}€</div>
            </div>
          )}
        </div>

        {/* Objet B */}
        <div className="bg-card rounded-2xl p-3 space-y-2">
          <div className="text-xs font-bold text-gray-400 uppercase">Objet B</div>
          <select value={objetB} onChange={e => setObjetB(e.target.value)}
            className="w-full rounded-xl border-gray-200 text-sm py-2 focus:ring-primary focus:border-primary">
            <option value="">Choisir…</option>
            {objets.map(o => <option key={o.id} value={o.id}>{o.nom}</option>)}
          </select>
          <input type="number" step="0.5" placeholder="Prix demandé €" value={prixB} onChange={e => setPrixB(e.target.value)}
            className="w-full rounded-xl border-gray-200 text-base py-2 px-3 focus:ring-primary focus:border-primary" />
          {resB && (
            <div className="text-center">
              <div className={`text-2xl font-black ${resB.margeN > 60 ? 'text-success' : resB.margeN >= 30 ? 'text-secondary' : 'text-primary'}`}>
                {resB.margeN > 0 ? '+' : ''}{resB.margeN}%
              </div>
              <div className="text-xs text-gray-400">profit ~{resB.profit}€</div>
            </div>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-ink mb-1">Budget disponible (€)</label>
        <input type="number" step="5" placeholder="Ex : 50" value={budget} onChange={e => setBudget(e.target.value)}
          className="w-full rounded-xl border-gray-200 text-base py-3 px-4 focus:ring-primary focus:border-primary" />
      </div>

      {reco && (
        <div className="bg-card rounded-2xl p-4 text-center">
          <div className={`text-xl font-black ${reco.color}`}>{reco.msg}</div>
          {reco.sub && <div className="text-sm text-gray-500 mt-1">{reco.sub}</div>}
        </div>
      )}
    </div>
  )
}
