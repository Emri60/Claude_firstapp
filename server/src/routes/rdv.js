import { Router } from 'express'
import prisma from '../lib/prisma.js'

const router = Router()

router.get('/', async (req, res) => {
  try {
    const rdvs = await prisma.rDV.findMany({ orderBy: { heure: 'asc' } })
    res.json(rdvs)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/', async (req, res) => {
  try {
    const rdv = await prisma.rDV.create({ data: req.body })
    res.status(201).json(rdv)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.put('/:id', async (req, res) => {
  try {
    const rdv = await prisma.rDV.update({ where: { id: Number(req.params.id) }, data: req.body })
    res.json(rdv)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    await prisma.rDV.delete({ where: { id: Number(req.params.id) } })
    res.status(204).end()
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
