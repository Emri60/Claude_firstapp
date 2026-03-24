import { Router } from 'express'
import Anthropic from '@anthropic-ai/sdk'
import prisma from '../lib/prisma.js'

const router = Router()
const client = new Anthropic()

router.post('/chat', async (req, res) => {
  const { messages } = req.body
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Messages manquants' })
  }

  const objets = await prisma.objet.findMany({
    select: {
      nom: true, fabricant: true, designer: true, categorie: true,
      prix_achat_min: true, prix_achat_max: true,
      prix_revente_min: true, prix_revente_max: true, marge_estimee: true,
      tests_authenticite: true, signaux_alerte: true, rarete: true, priorite: true,
    },
  })

  const objetsContext = objets.map(o => {
    const lines = [
      `**${o.nom}** (${o.fabricant ?? 'fabricant inconnu'})`,
      o.designer ? `Designer: ${o.designer}` : null,
      `Catégorie: ${o.categorie} | Rareté: ${o.rarete} | Priorité: ${o.priorite}`,
      `Prix achat: ${o.prix_achat_min}–${o.prix_achat_max}€ | Revente: ${o.prix_revente_min}–${o.prix_revente_max}€ | Marge estimée: ${o.marge_estimee}%`,
      o.tests_authenticite?.length ? `Tests authenticité: ${o.tests_authenticite.join(' / ')}` : null,
      o.signaux_alerte?.length ? `Signaux alerte: ${o.signaux_alerte.join(' / ')}` : null,
    ]
    return lines.filter(Boolean).join('\n')
  }).join('\n\n---\n\n')

  const systemPrompt = `Tu es un expert en objets vintage polonais de l'ère PRL (République Populaire de Pologne, années 50-80). Tu assistes deux acheteurs français lors de leurs voyages à Varsovie pour sourcer des objets vintage : lampes, affiches, fauteuils.

Tu connais parfaitement les marchés aux puces varsoviens (Bazar na Kole, ZOO Market), les prix du marché, les techniques d'authentification et les vendeurs. Tu réponds en français, de façon concise et pratique pour quelqu'un sur un marché.

Voici la base d'objets actuellement dans l'application :

${objetsContext}

Utilise ces données pour répondre aux questions sur les prix, l'authenticité, les négociations, etc.`

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    system: systemPrompt,
    messages,
  })

  res.json({ content: response.content[0].text })
})

export default router
