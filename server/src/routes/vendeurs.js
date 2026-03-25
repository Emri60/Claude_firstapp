import { Router } from 'express'
import prisma from '../lib/prisma.js'
import { syncVendeur, deleteNotionByAppId } from '../lib/notion.js'

const router = Router()

router.get('/', async (req, res) => {
  try {
    const vendeurs = await prisma.vendeur.findMany({
      include: { achats: { select: { id: true } } },
      orderBy: { nom: 'asc' },
    })
    res.json(vendeurs)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/', async (req, res) => {
  try {
    const vendeur = await prisma.vendeur.create({ data: req.body })
    res.status(201).json(vendeur)
    syncVendeur(vendeur).catch(() => {})
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.put('/:id', async (req, res) => {
  try {
    const vendeur = await prisma.vendeur.update({
      where: { id: Number(req.params.id) },
      data: req.body,
    })
    res.json(vendeur)
    syncVendeur(vendeur).catch(() => {})
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id)
    await prisma.vendeur.delete({ where: { id } })
    res.status(204).end()
    deleteNotionByAppId(process.env.NOTION_VENDEURS_DS_ID, id).catch(() => {})
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
