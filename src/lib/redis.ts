import { Redis } from '@upstash/redis'

let _redis: Redis | null = null

export function getRedis(): Redis | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null
  }
  if (!_redis) _redis = Redis.fromEnv()
  return _redis
}

export async function redisGet<T>(key: string): Promise<T | null> {
  const r = getRedis()
  if (!r) return null
  return (await r.get(key)) as T | null
}

export async function redisSet(key: string, value: string, opts?: { ex: number }) {
  const r = getRedis()
  if (!r) return
  await r.set(key, value, opts)
}

export async function redisIncr(key: string): Promise<number | null> {
  const r = getRedis()
  if (!r) return null
  return r.incr(key)
}

export async function redisDecr(key: string) {
  const r = getRedis()
  if (!r) return
  await r.decr(key)
}

export async function redisExpire(key: string, seconds: number) {
  const r = getRedis()
  if (!r) return
  await r.expire(key, seconds)
}

export async function redisTtl(key: string): Promise<number | null> {
  const r = getRedis()
  if (!r) return null
  return r.ttl(key)
}

export async function redisDel(key: string) {
  const r = getRedis()
  if (!r) return
  await r.del(key)
}
