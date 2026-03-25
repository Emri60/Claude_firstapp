export async function collectExchangeRate(prisma) {
  try {
    const res = await fetch('https://api.frankfurter.app/latest?from=EUR&to=PLN')
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    const rate = data.rates?.PLN
    if (!rate) throw new Error('PLN rate not found in response')
    await prisma.exchangeRate.deleteMany()
    await prisma.exchangeRate.create({ data: { eur_pln: rate, source: 'ECB' } })
    console.log(`[exchange] EUR/PLN = ${rate}`)
    return rate
  } catch (err) {
    console.warn('[exchange] Erreur:', err.message)
    return null
  }
}
