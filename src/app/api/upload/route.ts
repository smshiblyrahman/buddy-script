import type { NextRequest } from 'next/server'
import { withAuth } from '@/lib/auth'
import { jsonData, jsonError, safeErrorMessage } from '@/lib/api-utils'
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export const POST = withAuth(async (req: NextRequest, ctx) => {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    
    if (!file) {
      return jsonError('No file provided', 400, 'VALIDATION_ERROR')
    }

    const buffer = Buffer.from(await file.arrayBuffer())

    const uploadResult = await new Promise<{ secure_url: string }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'buddyscript_uploads' },
        (error, result) => {
          if (error) reject(error)
          else resolve(result as { secure_url: string })
        }
      )
      uploadStream.end(buffer)
    })

    return jsonData({ publicUrl: uploadResult.secure_url }, { status: 200 })
  } catch (e) {
    return jsonError(safeErrorMessage(e), 500, 'INTERNAL_ERROR')
  }
})
