import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
})

export default async function handler(req, res) {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  // Check if this IP has already visited (optionnel, basique)
  const alreadyVisited = await redis.get(ip);

  if (!alreadyVisited) {
    await redis.incr('page_views');
    await redis.set(ip, true, { ex: 86400 }); // expire après 24h
  }

  const views = await redis.get('page_views');
  res.status(200).json({ views });
}
