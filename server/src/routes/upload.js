import { Router } from 'express'
import multer from 'multer'
import { uploadToR2 } from '../lib/r2.js'
import { writeFile, mkdir } from 'fs/promises'
import { randomUUID } from 'crypto'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const UPLOADS_DIR = path.join(__dirname, '../../../uploads')

const router = Router()
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } })

async function uploadLocal(buffer, originalName) {
  await mkdir(UPLOADS_DIR, { recursive: true })
  const ext = originalName.split('.').pop().toLowerCase()
  const filename = `${randomUUID()}.${ext}`
  await writeFile(path.join(UPLOADS_DIR, filename), buffer)
  return `/uploads/${filename}`
}

router.post('/', upload.array('photos', 10), async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'Aucun fichier reçu' })
  }
  try {
    const useR2 = !!process.env.CLOUDFLARE_R2_ACCOUNT_ID
    const urls = await Promise.all(
      req.files.map(f =>
        useR2
          ? uploadToR2(f.buffer, f.mimetype, f.originalname)
          : uploadLocal(f.buffer, f.originalname)
      )
    )
    res.json({ urls })
  } catch (err) {
    console.error('Upload error:', err)
    res.status(500).json({ error: 'Erreur upload' })
  }
})

export default router
