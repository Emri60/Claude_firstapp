import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import cron from 'node-cron'
const __dirname = path.dirname(fileURLToPath(import.meta.url))
import authRouter from './routes/auth.js'
import objetsRouter from './routes/objets.js'
import achatsRouter from './routes/achats.js'
import voyagesRouter from './routes/voyages.js'
import vendeursRouter from './routes/vendeurs.js'
import ateliersRouter from './routes/ateliers.js'
import checklistRouter from './routes/checklist.js'
import rdvRouter from './routes/rdv.js'
import uploadRouter from './routes/upload.js'
import aiRouter from './routes/ai.js'
import marketRouter from './routes/market.js'
import notionRouter from './routes/notion.js'
import { authMiddleware } from './middleware/auth.js'
import { runMarketCollection } from './collectors/orchestrator.js'

const app = express()
app.use(cors())
app.use(express.json())
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')))

app.use('/api/auth', authRouter)
app.use('/api/objets', authMiddleware, objetsRouter)
app.use('/api/achats', authMiddleware, achatsRouter)
app.use('/api/voyages', authMiddleware, voyagesRouter)
app.use('/api/vendeurs', authMiddleware, vendeursRouter)
app.use('/api/ateliers', authMiddleware, ateliersRouter)
app.use('/api/checklist', authMiddleware, checklistRouter)
app.use('/api/rdv', authMiddleware, rdvRouter)
app.use('/api/upload', authMiddleware, uploadRouter)
app.use('/api/ai', authMiddleware, aiRouter)
app.use('/api/market', authMiddleware, marketRouter)
app.use('/api/notion', authMiddleware, notionRouter)

// Cron : collecte marché tous les lundis à 4h00
cron.schedule('0 4 * * 1', () => {
  console.log('[cron] Collecte marché hebdomadaire...')
  runMarketCollection().catch(err => console.error('[cron:market]', err.message))
})

// Serve client build
const clientDist = path.join(__dirname, '../../client/dist')
app.use(express.static(clientDist))
app.get('*', (req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'))
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
