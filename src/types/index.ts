export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  avatarUrl: string | null
  createdAt: string
}

export type PostVisibility = 'PUBLIC' | 'PRIVATE'

export interface Post {
  id: string
  content: string
  imageUrl: string | null
  visibility: PostVisibility
  createdAt: string
  updatedAt: string
  author: Pick<User, 'id' | 'firstName' | 'lastName' | 'avatarUrl'>
  _count: { likes: number; comments: number }
  likedByMe: boolean
  topComments?: Comment[]
}

export interface Comment {
  id: string
  content: string
  createdAt: string
  postId: string
  author: Pick<User, 'id' | 'firstName' | 'lastName' | 'avatarUrl'>
  _count: { likes: number; replies: number }
  likedByMe: boolean
}

export interface Reply {
  id: string
  content: string
  createdAt: string
  commentId: string
  author: Pick<User, 'id' | 'firstName' | 'lastName' | 'avatarUrl'>
  _count: { likes: number }
  likedByMe: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  nextCursor: string | null
}

export interface ApiError {
  error: string
  code?: string
}

