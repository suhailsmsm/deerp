import React, { useEffect, useMemo, useState } from 'react';
import { ExternalLink, Plus, RefreshCw, Trash2 } from 'lucide-react';

const platforms = ['Facebook', 'Instagram', 'LinkedIn', 'X', 'GoogleBusinessProfile'];

export default function SocialAccountsManager() {
  const [apiBaseUrl, setApiBaseUrl] = useState('http://localhost:3001');
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState('Facebook');
  const [connectUrl, setConnectUrl] = useState('');
  const [connectError, setConnectError] = useState('');
  const [connectInfo, setConnectInfo] = useState('');
  const [providerApps, setProviderApps] = useState([]);
  const [appForm, setAppForm] = useState({
    platform: 'Facebook',
    clientId: '',
    clientSecret: '',
    redirectUri: 'http://localhost:5174/social-oauth-callback.html',
    isActive: true,
  });
  const [diagResults, setDiagResults] = useState({});
  const [diagLoading, setDiagLoading] = useState({});
  const [syncSourceUrl, setSyncSourceUrl] = useState('');
  const [syncApiKey, setSyncApiKey] = useState('');
  const [syncResult, setSyncResult] = useState(null);

  const masked = useMemo(() => {
    return accounts.map((a) => ({ ...a, tokenLabel: a.accessToken ? `${String(a.accessToken).slice(0, 8)}...` : '-' }));
  }, [accounts]);

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBaseUrl}/api/social/platforms`);
      if (!res.ok) return;
      const data = await res.json();
      setAccounts(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
    fetchProviderApps();
  }, [apiBaseUrl]);

  const fetchProviderApps = async () => {
    const res = await fetch(`${apiBaseUrl}/api/social/oauth/apps`);
    if (!res.ok) return;
    const data = await res.json();
    setProviderApps(Array.isArray(data) ? data : []);
  };

  const saveProviderApp = async () => {
    const { platform, clientId, clientSecret, redirectUri, isActive } = appForm;
    const res = await fetch(`${apiBaseUrl}/api/social/oauth/apps/${encodeURIComponent(platform)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId, clientSecret, redirectUri, isActive }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      setConnectError(err.error || 'Failed to save provider app');
      return;
    }
    setConnectInfo(`${platform} app credentials saved.`);
    setAppForm((prev) => ({ ...prev, clientSecret: '' }));
    await fetchProviderApps();
  };

  const runDiagnostics = async (platform) => {
    setDiagLoading((prev) => ({ ...prev, [platform]: true }));
    try {
      const res = await fetch(`${apiBaseUrl}/api/social/oauth/diagnostics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform }),
      });
      const data = await res.json().catch(() => ({}));
      setDiagResults((prev) => ({ ...prev, [platform]: { ok: res.ok, data } }));
    } catch (error) {
      setDiagResults((prev) => ({
        ...prev,
        [platform]: { ok: false, data: { error: error?.message || 'Diagnostics request failed' } },
      }));
    } finally {
      setDiagLoading((prev) => ({ ...prev, [platform]: false }));
    }
  };

  const syncFromHostedApp = async () => {
    setSyncResult(null);
    const res = await fetch(`${apiBaseUrl}/api/social/oauth/apps/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sourceUrl: syncSourceUrl, apiKey: syncApiKey }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setSyncResult({ ok: false, message: data.error || 'Sync failed', detail: data.detail || '' });
      return;
    }
    setSyncResult({ ok: true, ...data });
    await fetchProviderApps();
  };

  useEffect(() => {
    const onMessage = async (event) => {
      if (event.origin !== window.location.origin) return;
      if (!event.data || event.data.type !== 'deerp_social_oauth') return;

      const { code, state, error } = event.data;
      if (error) {
        setConnectError(error);
        return;
      }
      if (!code) {
        setConnectError('Authorization code not found in callback.');
        return;
      }

      setConnectInfo('Authorization received. Connecting account...');
      const res = await fetch(`${apiBaseUrl}/api/social/oauth/exchange`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform: selectedPlatform, code, state }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setConnectError(err.error || 'Failed to connect account');
        return;
      }
      await fetchAccounts();
      setConnectUrl('');
      setConnectInfo('Account connected and saved.');
      setIsModalOpen(false);
    };

    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [apiBaseUrl, selectedPlatform]);

  const startConnect = async () => {
    setConnectError('');
    setConnectInfo('');
    const res = await fetch(`${apiBaseUrl}/api/social/oauth/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ platform: selectedPlatform }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      setConnectError(err.detail || err.error || 'Failed to start OAuth flow');
      return;
    }
    const data = await res.json();
    setConnectUrl(data.authUrl || '');
    if (data.authUrl) {
      const opened = window.open(data.authUrl, '_blank', 'noopener,noreferrer');
      if (!opened) {
        setConnectError('Popup blocked by browser. Use the Open Link button below.');
      } else {
        setConnectInfo(`Login page opened for ${selectedPlatform}. Complete auth and return automatically.`);
      }
    }
  };

  const deleteAccount = async (id) => {
    await fetch(`${apiBaseUrl}/api/social/platforms/${id}`, { method: 'DELETE' });
    await fetchAccounts();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">Social Accounts</h2>
          <p className="text-sm text-slate-500">Connect and manage publishing accounts for Social Poster.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchAccounts} className="px-3 py-2 rounded-lg border border-slate-200 text-sm flex items-center gap-2"><RefreshCw size={14} /> Refresh</button>
          <button onClick={() => setIsModalOpen(true)} className="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm flex items-center gap-2"><Plus size={14} /> Add Account</button>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 p-3">
        <label className="text-xs font-semibold text-slate-500">API Base URL</label>
        <input className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" value={apiBaseUrl} onChange={(e) => setApiBaseUrl(e.target.value)} />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
        <h3 className="font-semibold">Developer Apps Credentials</h3>
        <p className="text-xs text-slate-500">Save social platform app credentials here. OAuth uses these values first, then falls back to `.env`.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <select className="rounded-lg border border-slate-200 px-3 py-2 text-sm" value={appForm.platform} onChange={(e) => setAppForm({ ...appForm, platform: e.target.value })}>
            {platforms.map((p) => <option key={p}>{p}</option>)}
          </select>
          <input className="rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="Client ID" value={appForm.clientId} onChange={(e) => setAppForm({ ...appForm, clientId: e.target.value })} />
          <input className="rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="Client Secret" value={appForm.clientSecret} onChange={(e) => setAppForm({ ...appForm, clientSecret: e.target.value })} />
          <input className="rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="Redirect URI" value={appForm.redirectUri} onChange={(e) => setAppForm({ ...appForm, redirectUri: e.target.value })} />
        </div>
        <label className="inline-flex items-center gap-2 text-sm">
          <input type="checkbox" checked={appForm.isActive} onChange={(e) => setAppForm({ ...appForm, isActive: e.target.checked })} />
          Active
        </label>
        <div>
          <button onClick={saveProviderApp} className="px-3 py-2 rounded-lg bg-slate-900 text-white text-sm">Save App Credentials</button>
        </div>
        <div className="overflow-x-auto border border-slate-100 rounded-xl">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-100">
                <th className="p-2">Platform</th><th className="p-2">Client ID</th><th className="p-2">Client Secret</th><th className="p-2">Redirect URI</th><th className="p-2">Active</th>
              </tr>
            </thead>
            <tbody>
              {providerApps.map((a) => (
                <tr key={a.id} className="border-b border-slate-50">
                  <td className="p-2">{a.platform}</td>
                  <td className="p-2">{a.clientId}</td>
                  <td className="p-2">{a.clientSecret}</td>
                  <td className="p-2">{a.redirectUri}</td>
                  <td className="p-2">{a.isActive ? 'Yes' : 'No'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
        <h3 className="font-semibold">Sync From Hosted App</h3>
        <p className="text-xs text-slate-500">
          Pull credentials from your GitHub-hosted integration endpoint. Expected payload: <code>{'{ "apps": [{ "platform","clientId","clientSecret","redirectUri","isActive" }] }'}</code>
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            placeholder="https://your-hosted-app.com/api/erp/social-apps"
            value={syncSourceUrl}
            onChange={(e) => setSyncSourceUrl(e.target.value)}
          />
          <input
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            placeholder="Bearer API key"
            value={syncApiKey}
            onChange={(e) => setSyncApiKey(e.target.value)}
          />
        </div>
        <div>
          <button onClick={syncFromHostedApp} className="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm">Sync Now</button>
        </div>
        {syncResult && (
          <div className={`rounded-lg border p-3 text-xs ${syncResult.ok ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-rose-200 bg-rose-50 text-rose-700'}`}>
            {syncResult.ok ? (
              <p>Synced {syncResult.synced} app(s), skipped {syncResult.skipped}.</p>
            ) : (
              <p>{syncResult.message}{syncResult.detail ? `: ${syncResult.detail}` : ''}</p>
            )}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
        <h3 className="font-semibold">Connection Diagnostics</h3>
        <p className="text-xs text-slate-500">Run quick checks per platform and view exact errors (credentials, redirect URI, auth URL, provider reachability).</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {platforms.map((platform) => {
            const result = diagResults[platform];
            const loadingState = !!diagLoading[platform];
            return (
              <div key={platform} className="rounded-xl border border-slate-200 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm">{platform}</p>
                  <button
                    onClick={() => runDiagnostics(platform)}
                    className="px-2 py-1 rounded-lg border border-slate-200 text-xs"
                  >
                    {loadingState ? 'Testing...' : 'Test'}
                  </button>
                </div>
                {!result && <p className="text-xs text-slate-500">No test run yet.</p>}
                {result && (
                  <div className="text-xs space-y-2">
                    <p className={result.ok && result.data?.ok ? 'text-emerald-600' : 'text-rose-600'}>
                      {result.ok && result.data?.ok ? 'Healthy' : 'Needs attention'}
                    </p>
                    {result.data?.error && <p className="text-rose-600">Error: {result.data.error}</p>}
                    {Array.isArray(result.data?.checks) && result.data.checks.map((check, idx) => (
                      <p key={`${platform}-check-${idx}`} className={check.ok ? 'text-emerald-600' : 'text-rose-600'}>
                        {check.ok ? 'OK' : 'FAIL'} · {check.name}: {check.detail}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded-2xl border border-slate-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500 border-b border-slate-100">
              <th className="py-3 px-4">Platform</th>
              <th className="py-3 px-4">Page/Profile ID</th>
              <th className="py-3 px-4">Token</th>
              <th className="py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {masked.map((a) => (
              <tr key={a.id} className="border-b border-slate-50">
                <td className="px-4 py-3">{a.name}</td>
                <td className="px-4 py-3">{a.pageId || '-'}</td>
                <td className="px-4 py-3">{a.tokenLabel}</td>
                <td className="px-4 py-3">
                  <button onClick={() => deleteAccount(a.id)} className="text-rose-600 inline-flex items-center gap-1"><Trash2 size={14} /> Delete</button>
                </td>
              </tr>
            ))}
            {!loading && masked.length === 0 && (
              <tr><td className="px-4 py-6 text-slate-500" colSpan={4}>No accounts connected yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-xl rounded-2xl border border-slate-200 p-5 space-y-4">
            <h3 className="text-lg font-bold">Connect Social Account</h3>
            <label className="text-sm block">
              <span className="mb-1 block font-semibold">Platform</span>
              <select className="w-full rounded-lg border border-slate-200 px-3 py-2" value={selectedPlatform} onChange={(e) => setSelectedPlatform(e.target.value)}>
                {platforms.map((p) => <option key={p}>{p}</option>)}
              </select>
            </label>
            <div className="flex gap-2">
              <button onClick={startConnect} className="px-3 py-2 rounded-lg bg-slate-900 text-white text-sm inline-flex items-center gap-2"><ExternalLink size={14} /> Open Login & Authorize</button>
              {connectUrl && (
                <>
                  <a href={connectUrl} target="_blank" rel="noreferrer" className="px-3 py-2 rounded-lg border border-slate-200 text-sm">Open Link</a>
                  <button
                    onClick={() => navigator.clipboard.writeText(connectUrl)}
                    className="px-3 py-2 rounded-lg border border-slate-200 text-sm"
                  >
                    Copy Link
                  </button>
                </>
              )}
            </div>
            {connectInfo && <p className="text-xs text-emerald-600">{connectInfo}</p>}
            {connectError && <p className="text-xs text-rose-600">{connectError}</p>}
            <p className="text-xs text-slate-500">
              No manual token paste needed. After provider authorization, this window auto-completes the connection.
            </p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setIsModalOpen(false)} className="px-3 py-2 rounded-lg bg-slate-100 text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
