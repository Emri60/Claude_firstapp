import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../../api'

function calcMarges(prixDemande, reventeMin, reventeMax, commission) {
  if (!prixDemande || !reventeMin || !reventeMax) return null
  const p = parseFloat(prixDemande)
  const revMoy = (parseFloat(reventeMin) + parseFloat(reventeMax)) / 2
  const com = parseFloat(commission) / 100
  if (!p || !revMoy) return null
  const margeB = ((revMoy - p) / p) * 100
  const revNette = revMoy * (1 - com)
  const margeN = ((revNette - p) / p) * 100
  return { margeB: Math.round(margeB), margeN: Math.round(margeN), revMoy: revMoy.toFixed(0), revNette: revNette.toFixed(0) }
}

function Verdict({ margeN }) {
  if (margeN > 60) return (
    <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
      <div className="text-3xl font-black text-success">ACHÈTE</div>
      <div className="text-success text-sm mt-1">Marge nette +{margeN}%</div>
    </div>
  )
  if (margeN >= 30) return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center">
      <div className="text-3xl font-black text-secondary">NÉGOCIE</div>
      <div className="text-secondary text-sm mt-1">Marge nette +{margeN}%</div>
    </div>
  )
  return (
    <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-center">
      <div className="text-3xl font-black text-primary">PASSE</div>
      <div className="text-primary text-sm mt-1">Marge nette {margeN}%</div>
    </div>
  )
}

export default function Calculateur() {
  const [searchParams] = useSearchParams()
  const objetId = searchParams.get('objet')
  const [objet, setObjet] = useState(null)
  const [prixDemande, setPrixDemande] = useState('')
  const [reventeMin, setReventeMin] = useState('')
  const [reventeMax, setReventeMax] = useState('')
  const [commission, setCommission] = useState('15')

  useEffect(() => {
    if (!objetId) return
    api.get(`/objets/${objetId}`).then(r => {
      setObjet(r.data)
      setReventeMin(String(r.data.prix_revente_min ?? ''))
      setReventeMax(String(r.data.prix_revente_max ?? ''))
    })
  }, [objetId])

  const result = calcMarges(prixDemande, reventeMin, reventeMax, commission)

  return (
    <div className="space-y-4">
      {objet && (
        <div className="bg-card rounded-2xl p-3 text-sm">
          <span className="text-gray-400">Objet : </span>
          <span className="font-semibold text-ink">{objet.nom}</span>
        </div>
      )}

      <div className="bg-card rounded-2xl p-4 space-y-3">
        <div>
          <label className="block text-sm font-semibold text-ink mb-1">Prix demandé par le vendeur (€)</label>
          <input
            type="number"
            step="0.5"
            value={prixDemande}
            onChange={e => setPrixDemande(e.target.value)}
            placeholder="Ex : 12"
            className="w-full rounded-xl border-gray-200 text-2xl font-bold py-3 px-4 focus:ring-primary focus:border-primary"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Revente min (€)</label>
            <input type="number" step="1" value={reventeMin} onChange={e => setReventeMin(e.target.value)}
              className="w-full rounded-xl border-gray-200 text-base py-2.5 px-3 focus:ring-primary focus:border-primary" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Revente max (€)</label>
            <input type="number" step="1" value={reventeMax} onChange={e => setReventeMax(e.target.value)}
              className="w-full rounded-xl border-gray-200 text-base py-2.5 px-3 focus:ring-primary focus:border-primary" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Commission plateforme ({commission}%)</label>
          <input type="range" min="0" max="40" step="1" value={commission} onChange={e => setCommission(e.target.value)}
            className="w-full accent-primary" />
          <div className="flex justify-between text-xs text-gray-400 mt-0.5">
            <span>0%</span><span>Selency/LBC = 15%</span><span>40%</span>
          </div>
        </div>
      </div>

      {result ? (
        <div className="space-y-3">
          <Verdict margeN={result.margeN} />
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-card rounded-2xl p-3 text-center">
              <div className="text-xs text-gray-400 mb-1">Revente moy.</div>
              <div className="text-xl font-bold text-ink">{result.revMoy} €</div>
            </div>
            <div className="bg-card rounded-2xl p-3 text-center">
              <div className="text-xs text-gray-400 mb-1">Après commission</div>
              <div className="text-xl font-bold text-secondary">{result.revNette} €</div>
            </div>
            <div className="bg-card rounded-2xl p-3 text-center">
              <div className="text-xs text-gray-400 mb-1">Marge brute</div>
              <div className={`text-xl font-bold ${result.margeB > 0 ? 'text-success' : 'text-primary'}`}>+{result.margeB}%</div>
            </div>
            <div className="bg-card rounded-2xl p-3 text-center">
              <div className="text-xs text-gray-400 mb-1">Marge nette</div>
              <div className={`text-xl font-bold ${result.margeN > 60 ? 'text-success' : result.margeN >= 30 ? 'text-secondary' : 'text-primary'}`}>
                {result.margeN > 0 ? '+' : ''}{result.margeN}%
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-card rounded-2xl p-6 text-center text-gray-400 text-sm">
          Entrez un prix demandé et les prix de revente pour calculer
        </div>
      )}
    </div>
  )
}
