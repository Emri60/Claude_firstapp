import { Router } from 'express'
import multer from 'multer'
import { uploadToR2 } from '../lib/r2.js'

const router = Router()
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } })

router.post('/', upload.array('photos', 10), async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'Aucun fichier reçu' })
  }
  try {
    const urls = await Promise.all(
      req.files.map(f => uploadToR2(f.buffer, f.mimetype, f.originalname))
    )
    res.json({ urls })
  } catch (err) {
    console.error('Upload R2 error:', err)
    res.status(500).json({ error: 'Erreur upload' })
  }
})

export default router
