import { z } from 'zod'

export const registerSchema = z.object({
  firstName: z.string().min(1).max(50).trim(),
  lastName: z.string().min(1).max(50).trim(),
  email: z.string().email().toLowerCase(),
  password: z.string().min(8).regex(/[a-zA-Z]/).regex(/[0-9]/),
})

export const loginSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(1),
})

export const createPostSchema = z.object({
  content: z.string().min(1).max(2000).trim(),
  imageUrl: z.string().optional().or(z.literal('')),
  visibility: z.enum(['PUBLIC', 'PRIVATE']).default('PUBLIC'),
})

export const createCommentSchema = z.object({
  content: z.string().min(1).max(1000).trim(),
})

export const createReplySchema = z.object({
  content: z.string().min(1).max(1000).trim(),
})

export const uploadPresignSchema = z.object({
  filename: z.string().min(1).max(255),
  contentType: z.enum(['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
})

export const paginationSchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(50).default(10),
})

