# Social Feed App

## What I built
A full-stack social media feed application with authentication, posts (with images), nested comments, replies, and a like system. Built with Next.js 16 (App Router), PostgreSQL, Redis, and S3.

## Architecture decisions

### Why cursor-based pagination?
Offset pagination degrades to \(O(n)\) at high page numbers as the database must scan and discard rows. Cursor pagination stays \(O(\log n)\) via index seek. At millions of posts, this is not optional.

### Why JWTs in httpOnly cookies?
localStorage is accessible to JavaScript (XSS risk). httpOnly cookies are not. SameSite=Lax prevents CSRF for most cases without requiring CSRF tokens.

### Why Prisma + Supabase?
Prisma gives type safety and migration management. Supabase provides a managed PostgreSQL with pgBouncer connection pooling, which is essential for serverless deployments where connections are short-lived.

### Why Redis for caching?
Feed queries join across posts, users, and counts. Caching the result for 60 seconds massively reduces DB load under high read traffic without visible staleness.

### Why presigned S3 URLs?
Uploading through the server doubles bandwidth cost and adds latency. Presigned URLs let the browser upload directly to S3 while the server controls authorization.

## Local setup
1. Clone the repo
2. Copy `.env.local.example` to `.env.local` and fill in values
3. Run `npx prisma migrate dev` to create DB schema
4. Run `npm run dev`

## Deployment
Deployed to Vercel. See `vercel.json` for configuration.
Environment variables set in Vercel dashboard.

## Live URL
[Insert URL here]

## Video walkthrough
[Insert YouTube link here]

