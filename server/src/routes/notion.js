import { Router } from 'express'
import prisma from '../lib/prisma.js'
import { getClient, syncVendeur, syncAchat, syncVoyage } from '../lib/notion.js'

const router = Router()

// GET /api/notion/status
router.get('/status', async (req, res) => {
  const notion = getClient()
  if (!notion) return res.json({ enabled: false })

  try {
    const [pgVendeurs, pgAchats, pgObjets] = await Promise.all([
      prisma.vendeur.count(),
      prisma.achat.count(),
      prisma.objet.count(),
    ])

    const countNotionDB = async (dsId) => {
      if (!dsId) return null
      const r = await notion.dataSources.query({ data_source_id: dsId, page_size: 1 })
      return r.results.length > 0 ? 'ok' : 0
    }

    const [nVendeurs, nObjets, nVoyages] = await Promise.all([
      countNotionDB(process.env.NOTION_VENDEURS_DS_ID),
      countNotionDB(process.env.NOTION_OBJETS_DS_ID),
      countNotionDB(process.env.NOTION_VOYAGES_DS_ID),
    ])

    res.json({
      enabled: true,
      postgres: { vendeurs: pgVendeurs, achats: pgAchats, objets: pgObjets },
      notion: {
        vendeurs: nVendeurs,
        objets: nObjets,
        voyages: nVoyages,
      },
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/notion/sync-all
router.post('/sync-all', async (req, res) => {
  const notion = getClient()
  if (!notion) return res.status(400).json({ error: 'Notion non configuré' })

  res.json({ ok: true, message: 'Synchronisation lancée en arrière-plan' })

  try {
    const [vendeurs, achats, voyages, rate] = await Promise.all([
      prisma.vendeur.findMany(),
      prisma.achat.findMany({ include: { objet: true } }),
      prisma.voyage.findMany(),
      prisma.exchangeRate.findFirst({ orderBy: { fetched_at: 'desc' } }),
    ])

    console.log(`[notion] Sync-all : ${vendeurs.length} vendeurs, ${achats.length} achats, ${voyages.length} voyages`)

    for (const v of vendeurs) {
      await syncVendeur(v)
    }

    for (const voy of voyages) {
      await syncVoyage(voy)
    }

    for (const a of achats) {
      await syncAchat(a, rate)
    }

    console.log('[notion] Sync-all terminée.')
  } catch (err) {
    console.error('[notion] Sync-all error:', err.message)
  }
})

export default router
