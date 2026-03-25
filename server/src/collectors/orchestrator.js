import prisma from '../lib/prisma.js'
import { collectExchangeRate } from './exchange.js'
import { collectTrends } from './trends.js'
import { collectSelency } from './selency.js'

export async function runMarketCollection() {
  console.log('[orchestrator] Démarrage collecte marché...')
  const objets = await prisma.objet.findMany()

  const [rate, trendsResults, selencyResults] = await Promise.allSettled([
    collectExchangeRate(prisma),
    collectTrends(objets),
    collectSelency(objets),
  ])

  const trends  = trendsResults.status  === 'fulfilled' ? trendsResults.value  : {}
  const selency = selencyResults.status === 'fulfilled' ? selencyResults.value : {}

  // Upsert snapshots
  for (const obj of objets) {
    const data = {}
    if (trends[obj.id]   != null) data.trends_score = trends[obj.id]
    if (selency[obj.id]) {
      const s = selency[obj.id]
      Object.assign(data, {
        selency_count: s.count,
        selency_prix_moyen: s.prix_moyen,
        selency_prix_min: s.prix_min,
        selency_prix_max: s.prix_max,
      })
    }

    if (Object.keys(data).length > 0) {
      data.collected_at = new Date()
      await prisma.marketSnapshot.upsert({
        where:  { objet_id: obj.id },
        update: data,
        create: { objet_id: obj.id, ...data },
      })
    }
  }

  console.log('[orchestrator] Collecte terminée.')
}
