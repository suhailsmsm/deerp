const express = require('express');
const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const router = express.Router();
const prisma = new PrismaClient();
const qs = require('querystring');

const normalizeStatus = (status) => {
  const allowed = ['Draft', 'Scheduled', 'Published', 'Failed'];
  return allowed.includes(status) ? status : 'Draft';
};

const publishToPlatform = async (platformName) => {
  // Placeholder for real API integrations:
  // - Meta Graph API (Facebook/Instagram)
  // - LinkedIn API
  // - X API v2
  // - Google Business Profile API
  if (!platformName) {
    throw new Error('Platform name is required');
  }

  return {
    externalId: `ext_${platformName}_${Date.now()}`,
    publishedAt: new Date(),
    metrics: {
      reach: Math.floor(Math.random() * 1000),
      likes: Math.floor(Math.random() * 300),
      comments: Math.floor(Math.random() * 50),
      shares: Math.floor(Math.random() * 30),
    },
  };
};

const defaultRedirect = 'http://localhost:5174/social-oauth-callback.html';
const oauthStateStore = new Map();

const getProviderApp = async (platform) => {
  const dbApp = await prisma.socialProviderApp.findUnique({ where: { platform } });
  if (dbApp?.isActive) {
    return {
      clientId: dbApp.clientId,
      clientSecret: dbApp.clientSecret,
      redirectUri: dbApp.redirectUri || defaultRedirect,
      source: 'database',
    };
  }

  const envMap = {
    Facebook: {
      clientId: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    },
    Instagram: {
      clientId: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    },
    LinkedIn: {
      clientId: process.env.LINKEDIN_CLIENT_ID,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
    },
    X: {
      clientId: process.env.X_CLIENT_ID,
      clientSecret: process.env.X_CLIENT_SECRET,
    },
    GoogleBusinessProfile: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
  };

  const envCreds = envMap[platform] || {};
  return {
    clientId: envCreds.clientId,
    clientSecret: envCreds.clientSecret,
    redirectUri: process.env.SOCIAL_OAUTH_REDIRECT_URI || defaultRedirect,
    source: 'env',
  };
};

const getOauthConfig = async (platform) => {
  const appCreds = await getProviderApp(platform);
  const map = {
    Facebook: {
      authUrl: 'https://www.facebook.com/v19.0/dialog/oauth',
      scope: 'pages_show_list,pages_read_engagement,pages_manage_posts,instagram_basic,instagram_content_publish',
    },
    Instagram: {
      authUrl: 'https://www.facebook.com/v19.0/dialog/oauth',
      scope: 'instagram_basic,instagram_content_publish,pages_show_list',
    },
    LinkedIn: {
      authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
      scope: 'openid profile email r_organization_social w_organization_social',
    },
    X: {
      authUrl: 'https://twitter.com/i/oauth2/authorize',
      scope: 'tweet.read tweet.write users.read offline.access',
    },
    GoogleBusinessProfile: {
      authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
      scope: 'https://www.googleapis.com/auth/business.manage',
    },
  };

  const cfg = map[platform];
  if (!cfg) return null;
  return { ...cfg, ...appCreds };
};

const exchangeMetaCodeForToken = async (code, redirectUri, clientId, clientSecret) => {

  if (!clientId || !clientSecret) {
    throw new Error('FACEBOOK_CLIENT_ID or FACEBOOK_CLIENT_SECRET missing in .env');
  }

  const params = qs.stringify({
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    code,
  });

  const tokenRes = await fetch(`https://graph.facebook.com/v19.0/oauth/access_token?${params}`);
  const tokenData = await tokenRes.json();
  if (!tokenRes.ok || !tokenData.access_token) {
    throw new Error(tokenData.error?.message || 'Failed to exchange Facebook code for token');
  }
  return tokenData.access_token;
};

const exchangeLinkedInCodeForToken = async (code, redirectUri, clientId, clientSecret) => {
  if (!clientId || !clientSecret) {
    throw new Error('LinkedIn client credentials missing');
  }
  const payload = qs.stringify({
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
    client_id: clientId,
    client_secret: clientSecret,
  });
  const tokenRes = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: payload,
  });
  const tokenData = await tokenRes.json();
  if (!tokenRes.ok || !tokenData.access_token) {
    throw new Error(tokenData.error_description || tokenData.error || 'LinkedIn token exchange failed');
  }
  return tokenData.access_token;
};

const fetchLinkedInOrganizations = async (accessToken) => {
  const orgRes = await fetch('https://api.linkedin.com/v2/organizationalEntityAcls?q=roleAssignee&role=ADMINISTRATOR&state=APPROVED', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const orgData = await orgRes.json();
  if (!orgRes.ok) {
    throw new Error(orgData.message || 'Failed to fetch LinkedIn organization access');
  }
  const elements = Array.isArray(orgData.elements) ? orgData.elements : [];
  return elements
    .map((e) => e.organizationalTarget || e.organization || '')
    .map((urn) => String(urn).replace('urn:li:organization:', ''))
    .filter(Boolean);
};

const exchangeXCodeForToken = async (code, redirectUri, clientId, clientSecret, codeVerifier) => {
  if (!clientId) throw new Error('X client ID missing');
  if (!codeVerifier) throw new Error('X code verifier missing');
  const payload = qs.stringify({
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
    code_verifier: codeVerifier,
    client_id: clientId,
  });
  const basicAuth = Buffer.from(`${clientId}:${clientSecret || ''}`).toString('base64');
  const tokenRes = await fetch('https://api.x.com/2/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${basicAuth}`,
    },
    body: payload,
  });
  const tokenData = await tokenRes.json();
  if (!tokenRes.ok || !tokenData.access_token) {
    throw new Error(tokenData.error_description || tokenData.error || 'X token exchange failed');
  }
  return tokenData.access_token;
};

const fetchXAccount = async (accessToken) => {
  const meRes = await fetch('https://api.x.com/2/users/me', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const meData = await meRes.json();
  if (!meRes.ok) {
    throw new Error(meData.title || 'Failed to fetch X profile');
  }
  return meData?.data?.id ? String(meData.data.id) : null;
};

const exchangeGoogleCodeForToken = async (code, redirectUri, clientId, clientSecret) => {
  if (!clientId || !clientSecret) throw new Error('Google client credentials missing');
  const payload = qs.stringify({
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
    client_id: clientId,
    client_secret: clientSecret,
  });
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: payload,
  });
  const tokenData = await tokenRes.json();
  if (!tokenRes.ok || !tokenData.access_token) {
    throw new Error(tokenData.error_description || tokenData.error || 'Google token exchange failed');
  }
  return tokenData.access_token;
};

const fetchGoogleBusinessAccounts = async (accessToken) => {
  const accountRes = await fetch('https://mybusinessaccountmanagement.googleapis.com/v1/accounts', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const accountData = await accountRes.json();
  if (!accountRes.ok) {
    throw new Error(accountData.error?.message || 'Failed to fetch Google Business accounts');
  }
  return Array.isArray(accountData.accounts) ? accountData.accounts : [];
};

const fetchFacebookPages = async (userAccessToken) => {
  const pagesRes = await fetch(`https://graph.facebook.com/v19.0/me/accounts?access_token=${encodeURIComponent(userAccessToken)}`);
  const pagesData = await pagesRes.json();
  if (!pagesRes.ok) {
    throw new Error(pagesData.error?.message || 'Failed to fetch Facebook pages');
  }
  return Array.isArray(pagesData.data) ? pagesData.data : [];
};

router.post('/oauth/start', async (req, res) => {
  const { platform } = req.body;
  const config = await getOauthConfig(platform);

  if (!config) {
    return res.status(400).json({ error: 'Unsupported platform' });
  }

  if (!config.clientId) {
    return res.status(400).json({
      error: `${platform} OAuth is not configured on server`,
      detail: `Missing client ID env var for ${platform}. Configure provider credentials in .env.`,
    });
  }

  const nonce = crypto.randomUUID();
  let state = `${platform}:${nonce}`;
  const paramsObj = {
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: 'code',
    scope: config.scope,
    state,
  };

  if (platform === 'X') {
    const codeVerifier = crypto.randomBytes(48).toString('base64url');
    const codeChallenge = crypto.createHash('sha256').update(codeVerifier).digest('base64url');
    oauthStateStore.set(state, { platform, codeVerifier, createdAt: Date.now() });
    paramsObj.code_challenge = codeChallenge;
    paramsObj.code_challenge_method = 'S256';
  }

  if (platform === 'GoogleBusinessProfile') {
    paramsObj.access_type = 'offline';
    paramsObj.prompt = 'consent';
  }

  const params = qs.stringify(paramsObj);

  return res.json({
    authUrl: `${config.authUrl}?${params}`,
    state,
    note: 'Open URL to login and authorize. Callback auto-finishes in app.',
  });
});

router.post('/oauth/exchange', async (req, res, next) => {
  try {
    const { platform, code, pageId, state } = req.body;

    if (!platform || !code) {
      return res.status(400).json({ error: 'platform and code are required' });
    }

    const config = await getOauthConfig(platform);
    if (!config) {
      return res.status(400).json({ error: 'Unsupported platform' });
    }

    if (platform === 'Facebook' || platform === 'Instagram') {
      const userToken = await exchangeMetaCodeForToken(code, config.redirectUri, config.clientId, config.clientSecret);
      const pages = await fetchFacebookPages(userToken);

      const selectedPages = pageId
        ? pages.filter((p) => p.id === pageId)
        : (pages.length ? pages : [{ id: null, access_token: userToken }]);

      const saved = [];
      for (const page of selectedPages) {
        const platformName = platform;
        const resolvedPageId = page.id || null;
        const resolvedToken = page.access_token || userToken;

        const existing = await prisma.platform.findFirst({
          where: { name: platformName, pageId: resolvedPageId },
        });

        if (existing) {
          const updated = await prisma.platform.update({
            where: { id: existing.id },
            data: { accessToken: resolvedToken, pageId: resolvedPageId },
          });
          saved.push(updated);
        } else {
          const created = await prisma.platform.create({
            data: { name: platformName, accessToken: resolvedToken, pageId: resolvedPageId },
          });
          saved.push(created);
        }
      }

      return res.status(201).json({ connected: saved.length, accounts: saved });
    }

    if (platform === 'LinkedIn') {
      const token = await exchangeLinkedInCodeForToken(code, config.redirectUri, config.clientId, config.clientSecret);
      const orgIds = await fetchLinkedInOrganizations(token);
      const targets = pageId ? [pageId] : (orgIds.length ? orgIds : [null]);
      const saved = [];
      for (const orgId of targets) {
        const existing = await prisma.platform.findFirst({ where: { name: 'LinkedIn', pageId: orgId } });
        if (existing) {
          saved.push(await prisma.platform.update({ where: { id: existing.id }, data: { accessToken: token, pageId: orgId } }));
        } else {
          saved.push(await prisma.platform.create({ data: { name: 'LinkedIn', accessToken: token, pageId: orgId } }));
        }
      }
      return res.status(201).json({ connected: saved.length, accounts: saved });
    }

    if (platform === 'X') {
      const savedState = oauthStateStore.get(state);
      if (!savedState || savedState.platform !== 'X') {
        return res.status(400).json({ error: 'Invalid or expired X OAuth state' });
      }
      oauthStateStore.delete(state);
      const token = await exchangeXCodeForToken(code, config.redirectUri, config.clientId, config.clientSecret, savedState.codeVerifier);
      const userId = await fetchXAccount(token);
      const resolvedId = pageId || userId || null;
      const existing = await prisma.platform.findFirst({ where: { name: 'X', pageId: resolvedId } });
      if (existing) {
        return res.status(201).json({
          connected: 1,
          accounts: [await prisma.platform.update({ where: { id: existing.id }, data: { accessToken: token, pageId: resolvedId } })],
        });
      }
      return res.status(201).json({
        connected: 1,
        accounts: [await prisma.platform.create({ data: { name: 'X', accessToken: token, pageId: resolvedId } })],
      });
    }

    if (platform === 'GoogleBusinessProfile') {
      const token = await exchangeGoogleCodeForToken(code, config.redirectUri, config.clientId, config.clientSecret);
      const accounts = await fetchGoogleBusinessAccounts(token);
      const targets = pageId ? accounts.filter((a) => a.name === pageId || a.accountName === pageId) : accounts;
      const finalTargets = targets.length ? targets : [{ name: pageId || null }];
      const saved = [];
      for (const account of finalTargets) {
        const accountId = account.name || null;
        const existing = await prisma.platform.findFirst({ where: { name: 'GoogleBusinessProfile', pageId: accountId } });
        if (existing) {
          saved.push(await prisma.platform.update({ where: { id: existing.id }, data: { accessToken: token, pageId: accountId } }));
        } else {
          saved.push(await prisma.platform.create({ data: { name: 'GoogleBusinessProfile', accessToken: token, pageId: accountId } }));
        }
      }
      return res.status(201).json({ connected: saved.length, accounts: saved });
    }

    return res.status(400).json({ error: `${platform} is not supported for auto exchange` });
  } catch (error) {
    next(error);
  }
});

router.get('/oauth/apps', async (req, res, next) => {
  try {
    const apps = await prisma.socialProviderApp.findMany({ orderBy: { platform: 'asc' } });
    const masked = apps.map((a) => ({
      id: a.id,
      platform: a.platform,
      clientId: a.clientId,
      clientSecret: a.clientSecret ? `${a.clientSecret.slice(0, 4)}****` : '',
      redirectUri: a.redirectUri,
      isActive: a.isActive,
      updatedAt: a.updatedAt,
    }));
    res.json(masked);
  } catch (error) {
    next(error);
  }
});

router.put('/oauth/apps/:platform', async (req, res, next) => {
  try {
    const platform = req.params.platform;
    const { clientId, clientSecret, redirectUri, isActive = true } = req.body;
    if (!clientId || !clientSecret || !redirectUri) {
      return res.status(400).json({ error: 'clientId, clientSecret and redirectUri are required' });
    }

    const saved = await prisma.socialProviderApp.upsert({
      where: { platform },
      create: { platform, clientId, clientSecret, redirectUri, isActive },
      update: { clientId, clientSecret, redirectUri, isActive },
    });
    res.json(saved);
  } catch (error) {
    next(error);
  }
});

router.post('/oauth/apps/sync', async (req, res) => {
  const { sourceUrl, apiKey } = req.body || {};
  if (!sourceUrl || !apiKey) {
    return res.status(400).json({ error: 'sourceUrl and apiKey are required' });
  }

  try {
    const remoteRes = await fetch(sourceUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    const remoteData = await remoteRes.json().catch(() => ({}));
    if (!remoteRes.ok) {
      return res.status(400).json({
        error: 'Failed to fetch credentials from hosted app',
        detail: remoteData?.error || remoteData?.message || `HTTP ${remoteRes.status}`,
      });
    }

    const apps = Array.isArray(remoteData?.apps) ? remoteData.apps : [];
    if (apps.length === 0) {
      return res.status(400).json({ error: 'No apps found in remote payload. Expected { apps: [...] }' });
    }

    const allowed = new Set(['Facebook', 'Instagram', 'LinkedIn', 'X', 'GoogleBusinessProfile']);
    const saved = [];
    const skipped = [];

    for (const app of apps) {
      const platform = app?.platform;
      if (!allowed.has(platform)) {
        skipped.push({ platform: platform || 'unknown', reason: 'Unsupported platform' });
        continue;
      }

      if (!app.clientId || !app.clientSecret || !app.redirectUri) {
        skipped.push({ platform, reason: 'Missing required fields (clientId/clientSecret/redirectUri)' });
        continue;
      }

      const row = await prisma.socialProviderApp.upsert({
        where: { platform },
        create: {
          platform,
          clientId: app.clientId,
          clientSecret: app.clientSecret,
          redirectUri: app.redirectUri,
          isActive: typeof app.isActive === 'boolean' ? app.isActive : true,
        },
        update: {
          clientId: app.clientId,
          clientSecret: app.clientSecret,
          redirectUri: app.redirectUri,
          isActive: typeof app.isActive === 'boolean' ? app.isActive : true,
        },
      });
      saved.push({ id: row.id, platform: row.platform, isActive: row.isActive });
    }

    return res.json({
      synced: saved.length,
      skipped: skipped.length,
      saved,
      skippedItems: skipped,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Sync failed' });
  }
});

router.post('/oauth/diagnostics', async (req, res) => {
  const { platform } = req.body || {};
  if (!platform) {
    return res.status(400).json({ error: 'platform is required' });
  }

  try {
    const config = await getOauthConfig(platform);
    if (!config) {
      return res.status(400).json({ error: 'Unsupported platform' });
    }

    const report = {
      platform,
      credentialSource: config.source,
      checks: [],
      authUrlPreview: null,
      ok: false,
    };

    if (!config.clientId) {
      report.checks.push({ name: 'clientId', ok: false, detail: 'Missing client ID' });
    } else {
      report.checks.push({ name: 'clientId', ok: true, detail: 'Present' });
    }

    if (!config.clientSecret) {
      report.checks.push({ name: 'clientSecret', ok: false, detail: 'Missing client secret' });
    } else {
      report.checks.push({ name: 'clientSecret', ok: true, detail: 'Present' });
    }

    if (!config.redirectUri) {
      report.checks.push({ name: 'redirectUri', ok: false, detail: 'Missing redirect URI' });
    } else {
      report.checks.push({ name: 'redirectUri', ok: true, detail: config.redirectUri });
    }

    if (config.clientId && config.redirectUri) {
      const state = `diag:${platform}:${Date.now()}`;
      const params = qs.stringify({
        client_id: config.clientId,
        redirect_uri: config.redirectUri,
        response_type: 'code',
        scope: config.scope,
        state,
      });
      report.authUrlPreview = `${config.authUrl}?${params}`;
      report.checks.push({ name: 'authUrlBuild', ok: true, detail: 'Authorization URL generated' });
    }

    if (platform === 'Facebook' || platform === 'Instagram') {
      if (config.clientId) {
        const appRes = await fetch(`https://graph.facebook.com/v19.0/app?access_token=${encodeURIComponent(`${config.clientId}|${config.clientSecret || ''}`)}`);
        const appData = await appRes.json();
        if (appRes.ok) {
          report.checks.push({ name: 'metaAppAccess', ok: true, detail: `App reachable: ${appData.name || 'Unknown'}` });
        } else {
          report.checks.push({ name: 'metaAppAccess', ok: false, detail: appData?.error?.message || 'Meta app validation failed' });
        }
      }
    }

    if (platform === 'LinkedIn') {
      report.checks.push({ name: 'linkedinScopes', ok: true, detail: config.scope });
    }

    if (platform === 'X') {
      report.checks.push({ name: 'xPkceFlow', ok: true, detail: 'PKCE configured for OAuth start/exchange' });
    }

    if (platform === 'GoogleBusinessProfile') {
      report.checks.push({ name: 'googleScope', ok: true, detail: config.scope });
    }

    report.ok = report.checks.every((c) => c.ok);
    return res.json(report);
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Diagnostics failed' });
  }
});

router.get('/platforms', async (req, res, next) => {
  try {
    const platforms = await prisma.platform.findMany({ orderBy: { name: 'asc' } });
    res.json(platforms);
  } catch (error) {
    next(error);
  }
});

router.post('/platforms', async (req, res, next) => {
  try {
    const { name, accessToken, pageId } = req.body;

    if (!name || !accessToken) {
      return res.status(400).json({ error: 'name and accessToken are required' });
    }

    const platform = await prisma.platform.create({
      data: { name, accessToken, pageId: pageId || null },
    });

    res.status(201).json(platform);
  } catch (error) {
    next(error);
  }
});

router.put('/platforms/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { name, accessToken, pageId } = req.body;

    const platform = await prisma.platform.update({
      where: { id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(accessToken !== undefined ? { accessToken } : {}),
        ...(pageId !== undefined ? { pageId } : {}),
      },
    });

    res.json(platform);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Platform not found' });
    }
    next(error);
  }
});

router.delete('/platforms/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    await prisma.platform.delete({ where: { id } });
    res.json({ message: 'Platform deleted' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Platform not found' });
    }
    next(error);
  }
});

router.get('/posts', async (req, res, next) => {
  try {
    const { status, platformId } = req.query;

    const where = {};
    if (status) {
      where.status = normalizeStatus(status);
    }

    const posts = await prisma.post.findMany({
      where,
      include: {
        postPlatforms: {
          include: { platform: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const filtered = platformId
      ? posts.filter((post) => post.postPlatforms.some((pp) => pp.platformId === parseInt(platformId, 10)))
      : posts;

    res.json(filtered);
  } catch (error) {
    next(error);
  }
});

router.post('/posts', async (req, res, next) => {
  try {
    const {
      title,
      caption,
      mediaUrl,
      hashtags = '',
      status = 'Draft',
      platformIds = [],
      scheduledAt,
      timezone = 'UTC',
    } = req.body;

    if (!title || !caption) {
      return res.status(400).json({ error: 'title and caption are required' });
    }

    const created = await prisma.post.create({
      data: {
        title,
        caption,
        mediaUrl: mediaUrl || null,
        hashtags,
        status: normalizeStatus(status),
        createdBy: req.user?.userId || 1,
        postPlatforms: {
          create: platformIds.map((platformId) => ({
            platformId: parseInt(platformId, 10),
            scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
            status: normalizeStatus(status),
            timezone,
          })),
        },
      },
      include: {
        postPlatforms: {
          include: { platform: true },
        },
      },
    });

    res.status(201).json(created);
  } catch (error) {
    next(error);
  }
});

router.put('/posts/:id', async (req, res, next) => {
  try {
    const postId = parseInt(req.params.id, 10);
    const { title, caption, mediaUrl, hashtags, status, scheduledAt, timezone } = req.body;

    const updated = await prisma.post.update({
      where: { id: postId },
      data: {
        ...(title !== undefined ? { title } : {}),
        ...(caption !== undefined ? { caption } : {}),
        ...(mediaUrl !== undefined ? { mediaUrl } : {}),
        ...(hashtags !== undefined ? { hashtags } : {}),
        ...(status !== undefined ? { status: normalizeStatus(status) } : {}),
      },
    });

    if (scheduledAt || status) {
      await prisma.postPlatform.updateMany({
        where: { postId },
        data: {
          ...(scheduledAt ? { scheduledAt: new Date(scheduledAt) } : {}),
          ...(timezone ? { timezone } : {}),
          ...(status ? { status: normalizeStatus(status) } : {}),
        },
      });
    }

    res.json(updated);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Post not found' });
    }
    next(error);
  }
});

router.delete('/posts/:id', async (req, res, next) => {
  try {
    const postId = parseInt(req.params.id, 10);
    await prisma.post.delete({ where: { id: postId } });
    res.json({ message: 'Post deleted' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Post not found' });
    }
    next(error);
  }
});

router.post('/scheduler/run', async (req, res, next) => {
  try {
    const now = new Date();

    const due = await prisma.postPlatform.findMany({
      where: {
        status: 'Scheduled',
        scheduledAt: { lte: now },
      },
      include: {
        platform: true,
        post: true,
      },
    });

    const results = [];

    for (const item of due) {
      try {
        const publishResult = await publishToPlatform(item.platform.name);

        await prisma.postPlatform.update({
          where: {
            postId_platformId: {
              postId: item.postId,
              platformId: item.platformId,
            },
          },
          data: {
            status: 'Published',
            publishedAt: publishResult.publishedAt,
            errorLog: null,
            ...publishResult.metrics,
          },
        });

        const remainingScheduled = await prisma.postPlatform.count({
          where: {
            postId: item.postId,
            status: { not: 'Published' },
          },
        });

        await prisma.post.update({
          where: { id: item.postId },
          data: { status: remainingScheduled === 0 ? 'Published' : 'Scheduled' },
        });

        results.push({ postId: item.postId, platformId: item.platformId, status: 'Published' });
      } catch (error) {
        await prisma.postPlatform.update({
          where: {
            postId_platformId: {
              postId: item.postId,
              platformId: item.platformId,
            },
          },
          data: {
            status: 'Failed',
            errorLog: error.message,
          },
        });

        await prisma.post.update({ where: { id: item.postId }, data: { status: 'Failed' } });

        results.push({ postId: item.postId, platformId: item.platformId, status: 'Failed', error: error.message });
      }
    }

    res.json({ processed: results.length, results });
  } catch (error) {
    next(error);
  }
});

router.get('/analytics', async (req, res, next) => {
  try {
    const rows = await prisma.postPlatform.findMany({
      include: {
        platform: true,
        post: true,
      },
      orderBy: {
        post: {
          createdAt: 'desc',
        },
      },
    });

    const snapshot = rows.map((r) => ({
      postId: r.postId,
      title: r.post.title,
      platform: r.platform.name,
      status: r.status,
      reach: r.reach,
      likes: r.likes,
      comments: r.comments,
      shares: r.shares,
      publishedAt: r.publishedAt,
    }));

    res.json(snapshot);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
