import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { randomUUID } from 'crypto'

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
  },
})

export async function uploadToR2(buffer, mimetype, originalName) {
  const ext = originalName.split('.').pop()
  const key = `photos/${randomUUID()}.${ext}`

  await s3.send(new PutObjectCommand({
    Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: mimetype,
  }))

  return `${process.env.CLOUDFLARE_R2_PUBLIC_URL}/${key}`
}
