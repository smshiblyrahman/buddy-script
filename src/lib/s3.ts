import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { randomUUID } from 'crypto'

const MAX_BYTES = 5 * 1024 * 1024

function getClient() {
  const region = process.env.AWS_REGION
  if (!region) throw new Error('AWS_REGION is not set')
  return new S3Client({ region })
}

function getBucket() {
  const bucket = process.env.S3_BUCKET_NAME
  if (!bucket) throw new Error('S3_BUCKET_NAME is not set')
  return bucket
}

export function buildUploadKey(userId: string, filename: string) {
  const ext = filename.split('.').pop()?.toLowerCase() || 'bin'
  return `uploads/${userId}/${Date.now()}-${randomUUID()}.${ext}`
}

export async function generatePresignedUploadUrl(
  key: string,
  contentType: string,
  maxBytes: number,
) {
  if (!contentType.startsWith('image/')) throw new Error('Invalid content type')
  if (maxBytes > MAX_BYTES) throw new Error('File too large')

  const bucket = getBucket()
  const client = getClient()

  const cmd = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
  })

  const presignedUrl = await getSignedUrl(client, cmd, { expiresIn: 60 * 5 })

  const region = process.env.AWS_REGION!
  const publicUrl = `https://${bucket}.s3.${region}.amazonaws.com/${key}`

  return { presignedUrl, publicUrl }
}

