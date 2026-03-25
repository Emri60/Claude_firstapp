import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api'

function KpiCard({ title, value, sub, color = 'text-ink' }) {
  return (
    <div className="bg-card rounded-2xl p-4 space-y-1">
      <p className="text-xs text-gray-400 uppercase tracking-wide">{title}</p>
      <p className={`text-xl font-bold ${color}`}>{value ?? '—'}</p>
      {sub && <p className="text-xs text-gray-400">{sub}</p>}
    </div>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    api.get('/market/dashboard')
      .then(r => setData(r.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex justify-center py-16">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const { snapshots = [], rate, stats = {} } = data ?? {}
  const hasData = snapshots.length > 0 || rate != null
  const topObjet = snapshots[0]
  const rows = showAll ? snapshots : snapshots.slice(0, 10)

  const avgShoppingPrice = (() => {
    const prices = snapshots.filter(s => s.selency_prix_moyen != null).map(s => s.selency_prix_moyen)
    return prices.length > 0 ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : null
  })()

  return (
    <div className="pb-6 space-y-5 px-4 pt-4">

      {data?.rate && (
        <p className="text-xs text-gray-400 text-right">
          Mise à jour : {new Date(data.rate.fetched_at).toLocaleDateString('fr-FR')}
        </p>
      )}

      {!hasData ? (
        <div className="text-center py-12 space-y-3">
          <p className="text-gray-400 text-sm">Aucune donnée marché disponible.</p>
          <p className="text-gray-400 text-xs">La collecte automatique tourne chaque lundi à 4h00.</p>
        </div>
      ) : (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-2 gap-3">
            <KpiCard
              title="Taux EUR/PLN"
              value={rate ? `${rate.eur_pln.toFixed(4)}` : '—'}
              sub={rate ? `Source ${rate.source}` : 'Non disponible'}
            />
            <KpiCard
              title="Plus demandé (FR)"
              value={topObjet?.trends_score != null ? `Score ${topObjet.trends_score}/100` : '—'}
              sub={topObjet?.objet?.nom?.split(' ').slice(0, 3).join(' ')}
              color="text-primary"
            />
            <KpiCard
              title="Shopping FR moyen"
              value={avgShoppingPrice != null ? `${avgShoppingPrice}€` : '—'}
              sub="Prix moyen Google Shopping"
              color="text-secondary"
            />
            <KpiCard
              title="Objets suivis"
              value={`${stats.objets_avec_data} / ${stats.total_objets}`}
              sub="avec données marché"
            />
          </div>

          {/* Tableau classement */}
          <section>
            <h2 className="font-semibold text-ink mb-3">Classement par demande France</h2>
            <div className="bg-card rounded-2xl overflow-x-auto">
              <table className="w-full text-xs min-w-[320px]">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left p-3 text-gray-400 font-medium">Objet</th>
                    <th className="text-right p-3 text-gray-400 font-medium">Trends</th>
                    <th className="text-right p-3 text-gray-400 font-medium">Shopping FR</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((s) => (
                    <tr
                      key={s.id}
                      onClick={() => navigate(`/objets/${s.objet.id}`)}
                      className="border-b border-gray-100 last:border-0 cursor-pointer active:bg-gray-50"
                    >
                      <td className="p-3 font-medium text-ink">
                        <div className="truncate max-w-[40vw]">{s.objet.nom.split(' ').slice(0, 4).join(' ')}</div>
                      </td>
                      <td className="p-3 text-right">
                        {s.trends_score != null
                          ? <span className="font-bold text-primary">{s.trends_score}</span>
                          : <span className="text-gray-300">—</span>}
                      </td>
                      <td className="p-3 text-right">
                        {s.selency_prix_moyen != null
                          ? <span className="text-secondary">{Math.round(s.selency_prix_moyen)}€</span>
                          : <span className="text-gray-300">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {snapshots.length > 10 && (
              <button
                onClick={() => setShowAll(v => !v)}
                className="w-full mt-2 text-xs text-gray-400 py-2"
              >
                {showAll ? 'Voir moins' : `Voir les ${snapshots.length - 10} autres`}
              </button>
            )}
          </section>
        </>
      )}
    </div>
  )
}
