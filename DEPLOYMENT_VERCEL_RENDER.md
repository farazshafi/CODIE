# Deploy to Vercel + Render

## 1) Render services

Use `render.yaml` at repo root to provision:
- `codie-api` (web service)
- `codie-worker` (background worker)
- `codie-scheduler` (scheduler worker)

All three services build from `server/` with:
- Build: `npm ci && npm run build`
- API start: `npm run start`
- Worker start: `npm run worker`
- Scheduler start: `npm run scheduler`

## 2) Required backend environment variables (Render)

Set these on all services unless noted:
- `NODE_ENV=production`
- `DATABASE_URL`
- `REDIS_URL` (managed Redis URL, `rediss://` for TLS)
- `ACCESS_TOKEN_SECRET`
- `REFRESH_TOKEN_SECRET`
- `REFRESH_TOKEN_MAX_AGE=604800000`
- `CLIENT_URL=https://<your-vercel-domain>`
- `CORS_ORIGINS=https://<your-custom-domain>,http://localhost:3000` (optional)
- `EMAIL_USER`, `EMAIL_PASS`
- `GEMINI_API_KEY`
- `CLOUDINARY_API_KEY`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_SECRET`
- `RAZORPAY_KEY_ID`, `RAZORPAY_SECRET_ID`
- `PISTON_URL` (if remote piston service is used)

## 3) Vercel environment variables (client)

Set in Vercel project:
- `NEXT_PUBLIC_API_BASE_URL=https://<render-api-domain>/api`
- `NEXT_PUBLIC_SOCKET_URL=https://<render-api-domain>`
- `API_BASE_URL=https://<render-api-domain>/api`
- `NEXT_PUBLIC_RAZORPAY_KEY_ID`

## 4) CORS/Auth behavior now enforced

- API CORS is strict allowlist from `CLIENT_URL` + optional `CORS_ORIGINS`.
- Credentials are enabled.
- Refresh cookies use:
  - production: `Secure=true`, `SameSite=None`
  - non-production: `SameSite=Strict`
- Socket.IO CORS uses the same allowed origins list.

## 5) Preflight and smoke checks

Run before going live:
1. `cd server && npm run build`
2. `cd client && npm run build`
3. Deploy Render API first, then worker and scheduler, then Vercel frontend.

Verify after deploy:
1. `GET https://<render-api-domain>/api/health` returns `200`.
2. Login works from Vercel domain and refresh token cookie is set.
3. Authenticated API calls from browser succeed with credentials.
4. WebSocket connection establishes from production frontend.
5. Scheduled/queued jobs are processed by worker/scheduler logs.
