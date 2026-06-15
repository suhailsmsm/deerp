# Social Credentials Hosted Endpoint

This project now includes a deployable hosted endpoint for sharing social developer app credentials with ERP instances.

## Endpoint

- Method: `GET`
- URL: `/api/integration/social-apps`
- Auth: `Authorization: Bearer <SOCIAL_SYNC_API_KEY>`

## Response format

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

## Configuration

Set in `.env`:

```env
SOCIAL_SYNC_API_KEY=your-strong-api-key
```

## Use as ERP sourceUrl

In `Settings & Admin -> Social Accounts -> Sync From Hosted App`:

- `sourceUrl`: `https://<your-hosted-domain>/api/integration/social-apps`
- `apiKey`: same as `SOCIAL_SYNC_API_KEY`

