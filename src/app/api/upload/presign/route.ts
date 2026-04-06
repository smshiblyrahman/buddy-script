import type { NextRequest } from 'next/server'
import { withAuth } from '@/lib/auth'
import { uploadPresignSchema } from '@/lib/validations'
import { buildUploadKey, generatePresignedUploadUrl } from '@/lib/s3'
import { jsonData, jsonError, safeErrorMessage } from '@/lib/api-utils'

export const POST = withAuth(async (req: NextRequest, ctx) => {
  try {
    const json = await req.json().catch(() => null)
    const parsed = uploadPresignSchema.safeParse(json)
    if (!parsed.success) return jsonError('Invalid input', 400, 'VALIDATION_ERROR')

    const { filename, contentType } = parsed.data
    const key = buildUploadKey(ctx.user.userId, filename)
    const { presignedUrl, publicUrl } = await generatePresignedUploadUrl(key, contentType, 5 * 1024 * 1024)

    return jsonData({ presignedUrl, publicUrl }, { status: 200 })
  } catch (e) {
    return jsonError(safeErrorMessage(e), 500, 'INTERNAL_ERROR')
  }
})

