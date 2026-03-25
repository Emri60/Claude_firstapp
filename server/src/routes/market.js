import { Router } from 'express'
import prisma from '../lib/prisma.js'
import { authMiddleware as auth } from '../middleware/auth.js'

const router = Router()
router.use(auth)

// GET /api/market/dashboard
router.get('/dashboard', async (req, res) => {
  try {
    const [snapshots, rate, totalObjets] = await Promise.all([
      prisma.marketSnapshot.findMany({
        include: { objet: { select: { id: true, nom: true, categorie: true } } },
        orderBy: { trends_score: 'desc' },
      }),
      prisma.exchangeRate.findFirst({ orderBy: { fetched_at: 'desc' } }),
      prisma.objet.count(),
    ])

    res.json({
      snapshots,
      rate,
      stats: {
        total_objets: totalObjets,
        objets_avec_data: snapshots.length,
      },
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/market/collect — désactivé
router.post('/collect', (req, res) => {
  res.status(403).json({ error: 'Collecte manuelle désactivée' })
})

export default router
