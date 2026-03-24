import { Router } from 'express'
import prisma from '../lib/prisma.js'

const router = Router()

router.get('/', async (req, res) => {
  const { marche, niveau_confiance, a_entrepot } = req.query
  const where = {}
  if (marche) where.marche = { contains: marche, mode: 'insensitive' }
  if (niveau_confiance) where.niveau_confiance = niveau_confiance
  if (a_entrepot !== undefined) where.a_entrepot = a_entrepot === 'true'
  const vendeurs = await prisma.vendeur.findMany({ where, orderBy: { nom: 'asc' } })
  res.json(vendeurs)
})

router.get('/:id', async (req, res) => {
  const vendeur = await prisma.vendeur.findUnique({
    where: { id: Number(req.params.id) },
    include: { achats: { include: { objet: true } } },
  })
  if (!vendeur) return res.status(404).json({ error: 'Introuvable' })
  res.json(vendeur)
})

router.post('/', async (req, res) => {
  const vendeur = await prisma.vendeur.create({ data: req.body })
  res.status(201).json(vendeur)
})

router.put('/:id', async (req, res) => {
  const vendeur = await prisma.vendeur.update({ where: { id: Number(req.params.id) }, data: req.body })
  res.json(vendeur)
})

router.delete('/:id', async (req, res) => {
  await prisma.vendeur.delete({ where: { id: Number(req.params.id) } })
  res.status(204).end()
})

export default router
