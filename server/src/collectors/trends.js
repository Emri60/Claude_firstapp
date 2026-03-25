function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

export async function collectTrends(objets) {
  const apiKey = process.env.SERPAPI_KEY
  if (!apiKey) {
    console.warn('[trends] SERPAPI_KEY manquante — collecteur ignoré')
    return {}
  }

  const results = {}
  for (const obj of objets) {
    if (!obj.keywords_trends_fr) continue
    try {
      const q = encodeURIComponent(obj.keywords_trends_fr)
      const url = `https://serpapi.com/search.json?engine=google_trends&q=${q}&geo=FR&date=today+12-m&api_key=${apiKey}`
      const res = await fetch(url)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()

      const timeline = data?.interest_over_time?.timeline_data ?? []
      if (timeline.length > 0) {
        // Score = max sur 12 mois (plus représentatif que la dernière semaine)
        const scores = timeline.map(t => t?.values?.[0]?.extracted_value ?? 0)
        const score = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        results[obj.id] = score
        console.log(`[trends] ${obj.nom}: ${score} (moy 12 mois)`)
      } else {
        console.log(`[trends] ${obj.nom}: aucune donnée Trends`)
      }
    } catch (err) {
      console.warn(`[trends] Erreur pour "${obj.nom}":`, err.message)
    }
    await sleep(1000)
  }
  return results
}
