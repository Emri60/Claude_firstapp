import { Router } from 'express'
import prisma from '../lib/prisma.js'

const router = Router()

router.get('/', async (req, res) => {
  const items = await prisma.checklistItem.findMany({ orderBy: { ordre: 'asc' } })
  res.json(items)
})

router.post('/', async (req, res) => {
  const max = await prisma.checklistItem.aggregate({ _max: { ordre: true } })
  const ordre = (max._max.ordre ?? 0) + 1
  const item = await prisma.checklistItem.create({ data: { ...req.body, ordre } })
  res.status(201).json(item)
})

router.put('/:id', async (req, res) => {
  const item = await prisma.checklistItem.update({ where: { id: Number(req.params.id) }, data: req.body })
  res.json(item)
})

router.delete('/:id', async (req, res) => {
  await prisma.checklistItem.delete({ where: { id: Number(req.params.id) } })
  res.status(204).end()
})

router.post('/reset', async (req, res) => {
  await prisma.checklistItem.updateMany({ data: { checked: false } })
  const items = await prisma.checklistItem.findMany({ orderBy: { ordre: 'asc' } })
  res.json(items)
})

export default router
