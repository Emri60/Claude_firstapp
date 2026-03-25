function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

function parsePrice(str) {
  if (!str) return null
  // Format français : "1 234,56 €" → 1234.56
  const clean = str.replace(/\s/g, '').replace(',', '.').replace(/[^0-9.]/g, '')
  const val = parseFloat(clean)
  return (val > 5 && val < 15000) ? val : null
}

export async function collectSelency(objets) {
  const apiKey = process.env.SERPAPI_KEY
  if (!apiKey) {
    console.warn('[shopping] SERPAPI_KEY manquante — collecteur ignoré')
    return {}
  }

  const results = {}
  for (const obj of objets) {
    if (!obj.keywords_trends_fr) continue
    try {
      const q = encodeURIComponent(obj.keywords_trends_fr + ' vintage')
      const url = `https://serpapi.com/search.json?engine=google_shopping&q=${q}&gl=fr&hl=fr&api_key=${apiKey}`
      const res = await fetch(url)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()

      const items = data?.shopping_results ?? []
      const prices = items.map(i => parsePrice(i.price)).filter(Boolean)

      if (prices.length > 0) {
        const avg = prices.reduce((a, b) => a + b, 0) / prices.length
        results[obj.id] = {
          count: prices.length,
          prix_moyen: Math.round(avg),
          prix_min: Math.round(Math.min(...prices)),
          prix_max: Math.round(Math.max(...prices)),
        }
        console.log(`[shopping] ${obj.nom}: ${prices.length} résultats, moy ${Math.round(avg)}€`)
      } else {
        console.log(`[shopping] ${obj.nom}: aucun prix trouvé`)
      }
    } catch (err) {
      console.warn(`[shopping] Erreur pour "${obj.nom}":`, err.message)
    }
    await sleep(1000)
  }
  return results
}
