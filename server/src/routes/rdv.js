import { Router } from 'express'
import prisma from '../lib/prisma.js'

const router = Router()

router.get('/', async (req, res) => {
  const rdvs = await prisma.rDV.findMany({ orderBy: { heure: 'asc' } })
  res.json(rdvs)
})

router.post('/', async (req, res) => {
  const rdv = await prisma.rDV.create({ data: req.body })
  res.status(201).json(rdv)
})

router.put('/:id', async (req, res) => {
  const rdv = await prisma.rDV.update({ where: { id: Number(req.params.id) }, data: req.body })
  res.json(rdv)
})

router.delete('/:id', async (req, res) => {
  await prisma.rDV.delete({ where: { id: Number(req.params.id) } })
  res.status(204).end()
})

export default router
