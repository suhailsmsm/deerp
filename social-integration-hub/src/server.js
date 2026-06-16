const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
require('dotenv').config();

const { readDb, writeDb } = require('./storage');

const app = express();
const port = process.env.PORT || 4000;

const allowedPlatforms = ['Facebook', 'Instagram', 'LinkedIn', 'X', 'GoogleBusinessProfile'];

app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(express.static('public'));

const requireBearer = (expectedKey) => (req, res, next) => {
  const raw = req.headers.authorization || '';
  const token = raw.startsWith('Bearer ') ? raw.slice(7) : '';
  if (!expectedKey) return res.status(500).json({ error: 'Server key is not configured' });
  if (!token || token !== expectedKey) return res.status(401).json({ error: 'Unauthorized' });
  next();
};

const requireSyncKey = (req, res, next) => {
  const key = process.env.SOCIAL_SYNC_API_KEY;
  return requireBearer(key)(req, res, next);
};

const requireAdminKey = (req, res, next) => {
  const key = process.env.ADMIN_API_KEY || process.env.SOCIAL_SYNC_API_KEY;
  return requireBearer(key)(req, res, next);
};

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.sendFile(require('path').join(__dirname, '..', 'public', 'index.html'));
});

app.get('/api/integration/social-apps', requireSyncKey, (req, res) => {
  const db = readDb();
  const activeApps = (db.apps || []).filter((a) => a.isActive);
  res.json({ apps: activeApps, count: activeApps.length, timestamp: new Date().toISOString() });
});

app.get('/api/admin/social-apps', requireAdminKey, (req, res) => {
  const db = readDb();
  const masked = (db.apps || []).map((a) => ({ ...a, clientSecret: a.clientSecret ? `${a.clientSecret.slice(0, 4)}****` : '' }));
  res.json({ apps: masked });
});

app.put('/api/admin/social-apps/:platform', requireAdminKey, (req, res) => {
  const platform = req.params.platform;
  const { clientId, clientSecret, redirectUri, isActive = true } = req.body || {};

  if (!allowedPlatforms.includes(platform)) {
    return res.status(400).json({ error: 'Unsupported platform' });
  }
  if (!clientId || !clientSecret || !redirectUri) {
    return res.status(400).json({ error: 'clientId, clientSecret, redirectUri are required' });
  }

  const db = readDb();
  const apps = db.apps || [];
  const idx = apps.findIndex((a) => a.platform === platform);
  const row = {
    platform,
    clientId,
    clientSecret,
    redirectUri,
    isActive: !!isActive,
    updatedAt: new Date().toISOString(),
    id: idx >= 0 ? apps[idx].id : crypto.randomUUID(),
  };

  if (idx >= 0) apps[idx] = row;
  else apps.push(row);

  writeDb({ apps });
  res.json({ ok: true, app: { ...row, clientSecret: `${clientSecret.slice(0, 4)}****` } });
});

app.delete('/api/admin/social-apps/:platform', requireAdminKey, (req, res) => {
  const platform = req.params.platform;
  const db = readDb();
  const apps = (db.apps || []).filter((a) => a.platform !== platform);
  writeDb({ apps });
  res.json({ ok: true });
});

app.listen(port, () => {
  console.log(`✅ Social Integration Hub running on http://localhost:${port}`);
});
