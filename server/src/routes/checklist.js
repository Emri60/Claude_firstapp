import { Router } from 'express'
import prisma from '../lib/prisma.js'

const router = Router()

router.get('/', async (req, res) => {
  try {
    const items = await prisma.checklistItem.findMany({ orderBy: { ordre: 'asc' } })
    res.json(items)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/', async (req, res) => {
  try {
    const max = await prisma.checklistItem.aggregate({ _max: { ordre: true } })
    const ordre = (max._max.ordre ?? 0) + 1
    const item = await prisma.checklistItem.create({ data: { ...req.body, ordre } })
    res.status(201).json(item)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.put('/:id', async (req, res) => {
  try {
    const item = await prisma.checklistItem.update({ where: { id: Number(req.params.id) }, data: req.body })
    res.json(item)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    await prisma.checklistItem.delete({ where: { id: Number(req.params.id) } })
    res.status(204).end()
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/reset', async (req, res) => {
  try {
    await prisma.checklistItem.updateMany({ data: { checked: false } })
    const items = await prisma.checklistItem.findMany({ orderBy: { ordre: 'asc' } })
    res.json(items)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
