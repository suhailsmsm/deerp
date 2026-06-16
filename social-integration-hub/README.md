# Deerp Social Integration Hub

Hosted API app for serving social platform developer credentials to Deerp ERP sync.

## 1. Setup

```bash
cd social-integration-hub
cp .env.example .env
npm install
npm run dev
```

## 2. API Endpoints

### Health
`GET /health`

### ERP Sync Source (use this as sourceUrl)
`GET /api/integration/social-apps`

Header:
`Authorization: Bearer <SOCIAL_SYNC_API_KEY>`

Response:
```json
{
  "apps": [
    {
      "platform": "Facebook",
      "clientId": "...",
      "clientSecret": "...",
      "redirectUri": "http://localhost:5174/social-oauth-callback.html",
      "isActive": true
    }
  ],
  "count": 1,
  "timestamp": "2026-05-27T00:00:00.000Z"
}
```

### Admin: list apps
`GET /api/admin/social-apps`

### Admin: upsert app
`PUT /api/admin/social-apps/:platform`

Body:
```json
{
  "clientId": "...",
  "clientSecret": "...",
  "redirectUri": "http://localhost:5174/social-oauth-callback.html",
  "isActive": true
}
```

### Admin: delete app
`DELETE /api/admin/social-apps/:platform`

## 3. Deploy

Deploy this folder to Render/Railway/Fly/Vercel (Node server). After deployment:

- Use deployed URL in Deerp sync panel:
  - `sourceUrl`: `https://<your-host>/api/integration/social-apps`
  - `apiKey`: `SOCIAL_SYNC_API_KEY`

