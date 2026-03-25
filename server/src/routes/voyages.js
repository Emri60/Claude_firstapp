import { Router } from 'express'
import prisma from '../lib/prisma.js'
import { syncVoyage, deleteNotionByAppId } from '../lib/notion.js'

const router = Router()

router.get('/', async (req, res) => {
  try {
    const voyages = await prisma.voyage.findMany({
      include: { achats: { select: { id: true, prix_paye: true, nom: true } } },
      orderBy: { date_debut: 'desc' },
    })
    res.json(voyages)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const voyage = await prisma.voyage.findUnique({
      where: { id: Number(req.params.id) },
      include: { achats: { include: { objet: true, vendeur: true } } },
    })
    if (!voyage) return res.status(404).json({ error: 'Voyage non trouvé' })
    res.json(voyage)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

function parseData(body) {
  const data = { ...body }
  if (data.date_debut) data.date_debut = new Date(data.date_debut)
  if (data.date_fin) data.date_fin = new Date(data.date_fin)
  return data
}

router.post('/', async (req, res) => {
  try {
    const voyage = await prisma.voyage.create({ data: parseData(req.body) })
    res.status(201).json(voyage)
    syncVoyage(voyage).catch(() => {})
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.put('/:id', async (req, res) => {
  try {
    const voyage = await prisma.voyage.update({
      where: { id: Number(req.params.id) },
      data: parseData(req.body),
    })
    res.json(voyage)
    syncVoyage(voyage).catch(() => {})
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id)
    await prisma.voyage.delete({ where: { id } })
    res.status(204).end()
    deleteNotionByAppId(process.env.NOTION_VOYAGES_DS_ID, id).catch(() => {})
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
