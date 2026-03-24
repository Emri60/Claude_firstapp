import { Router } from 'express'
import prisma from '../lib/prisma.js'

const router = Router()

function calcMarge(obj) {
  const { prix_achat_min, prix_achat_max, prix_revente_min, prix_revente_max } = obj
  if (prix_achat_min == null || prix_achat_max == null || prix_revente_min == null || prix_revente_max == null) return null
  const achat = (prix_achat_min + prix_achat_max) / 2
  const revente = (prix_revente_min + prix_revente_max) / 2
  if (achat === 0) return null
  return Math.round(((revente - achat) / achat) * 100)
}

router.get('/', async (req, res) => {
  const { categorie, priorite, rarete, statut, q } = req.query
  const where = {}
  if (categorie) where.categorie = categorie
  if (priorite) where.priorite = priorite
  if (rarete) where.rarete = rarete
  if (statut) where.statut = statut
  if (q) where.OR = [
    { nom: { contains: q, mode: 'insensitive' } },
    { fabricant: { contains: q, mode: 'insensitive' } },
    { designer: { contains: q, mode: 'insensitive' } },
    { mots_cles_polonais: { contains: q, mode: 'insensitive' } },
  ]
  const objets = await prisma.objet.findMany({ where, orderBy: [{ priorite: 'asc' }, { nom: 'asc' }] })
  res.json(objets)
})

router.get('/:id', async (req, res) => {
  const objet = await prisma.objet.findUnique({ where: { id: Number(req.params.id) } })
  if (!objet) return res.status(404).json({ error: 'Introuvable' })
  res.json(objet)
})

router.post('/', async (req, res) => {
  const data = { ...req.body, marge_estimee: calcMarge(req.body) }
  const objet = await prisma.objet.create({ data })
  res.status(201).json(objet)
})

router.put('/:id', async (req, res) => {
  const data = { ...req.body, marge_estimee: calcMarge(req.body) }
  const objet = await prisma.objet.update({ where: { id: Number(req.params.id) }, data })
  res.json(objet)
})

router.delete('/:id', async (req, res) => {
  await prisma.objet.delete({ where: { id: Number(req.params.id) } })
  res.status(204).end()
})

export default router
