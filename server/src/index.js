import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
const __dirname = path.dirname(fileURLToPath(import.meta.url))
import authRouter from './routes/auth.js'
import objetsRouter from './routes/objets.js'
import vendeursRouter from './routes/vendeurs.js'
import achatsRouter from './routes/achats.js'
import checklistRouter from './routes/checklist.js'
import rdvRouter from './routes/rdv.js'
import uploadRouter from './routes/upload.js'
import aiRouter from './routes/ai.js'
import { authMiddleware } from './middleware/auth.js'

const app = express()
app.use(cors())
app.use(express.json())
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')))

app.use('/api/auth', authRouter)
app.use('/api/objets', authMiddleware, objetsRouter)
app.use('/api/vendeurs', authMiddleware, vendeursRouter)
app.use('/api/achats', authMiddleware, achatsRouter)
app.use('/api/checklist', authMiddleware, checklistRouter)
app.use('/api/rdv', authMiddleware, rdvRouter)
app.use('/api/upload', authMiddleware, uploadRouter)
app.use('/api/ai', authMiddleware, aiRouter)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
