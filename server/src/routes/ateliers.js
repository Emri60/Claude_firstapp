import { Router } from 'express'
import prisma from '../lib/prisma.js'
import { syncAtelier, deleteNotionByAppId } from '../lib/notion.js'

const router = Router()

router.get('/', async (req, res) => {
  try {
    const ateliers = await prisma.atelier.findMany({
      include: { objets: { select: { id: true } } },
      orderBy: { nom: 'asc' },
    })
    res.json(ateliers)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/', async (req, res) => {
  try {
    const atelier = await prisma.atelier.create({ data: req.body })
    res.status(201).json(atelier)
    syncAtelier(atelier).catch(() => {})
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.put('/:id', async (req, res) => {
  try {
    const atelier = await prisma.atelier.update({
      where: { id: Number(req.params.id) },
      data: req.body,
    })
    res.json(atelier)
    syncAtelier(atelier).catch(() => {})
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id)
    await prisma.atelier.delete({ where: { id } })
    res.status(204).end()
    deleteNotionByAppId(process.env.NOTION_ATELIERS_DS_ID, id).catch(() => {})
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
