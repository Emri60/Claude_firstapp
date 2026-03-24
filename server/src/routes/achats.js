import { Router } from 'express'
import prisma from '../lib/prisma.js'

const router = Router()

router.get('/', async (req, res) => {
  const achats = await prisma.achat.findMany({
    include: { objet: true, vendeur: true },
    orderBy: { date: 'desc' },
  })
  res.json(achats)
})

router.post('/', async (req, res) => {
  const achat = await prisma.achat.create({ data: req.body, include: { objet: true, vendeur: true } })
  res.status(201).json(achat)
})

router.delete('/:id', async (req, res) => {
  await prisma.achat.delete({ where: { id: Number(req.params.id) } })
  res.status(204).end()
})

export default router
