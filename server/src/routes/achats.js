import { Router } from 'express'
import prisma from '../lib/prisma.js'
import { syncAchat, deleteNotionByAppId } from '../lib/notion.js'

const router = Router()

router.get('/', async (req, res) => {
  try {
    const achats = await prisma.achat.findMany({
      include: { objet: true, vendeur: true, voyage: true },
      orderBy: { date: 'desc' },
    })
    res.json(achats)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/', async (req, res) => {
  try {
    const data = { ...req.body }
    if (data.objet_id) data.objet_id = Number(data.objet_id)
    if (data.vendeur_id) data.vendeur_id = Number(data.vendeur_id)
    if (data.voyage_id) data.voyage_id = Number(data.voyage_id)
    if (!data.objet_id) delete data.objet_id
    if (!data.vendeur_id) delete data.vendeur_id
    if (!data.voyage_id) delete data.voyage_id
    if (data.date) data.date = new Date(data.date)

    const achat = await prisma.achat.create({
      data,
      include: { objet: true, vendeur: true, voyage: true },
    })
    res.status(201).json(achat)
    prisma.exchangeRate.findFirst({ orderBy: { fetched_at: 'desc' } })
      .then(rate => syncAchat(achat, rate))
      .catch(() => {})
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id)
    await prisma.achat.delete({ where: { id } })
    res.status(204).end()
    deleteNotionByAppId(process.env.NOTION_OBJETS_DS_ID, id).catch(() => {})
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
