import React, { useMemo, useState } from 'react';
import { Calendar, Image as ImageIcon, Send, Video } from 'lucide-react';

const statusStyles = {
  Draft: 'bg-slate-100 text-slate-700',
  Scheduled: 'bg-amber-100 text-amber-700',
  Published: 'bg-emerald-100 text-emerald-700',
  Failed: 'bg-rose-100 text-rose-700',
};

const platformColors = {
  Facebook: 'bg-blue-600',
  Instagram: 'bg-pink-600',
  LinkedIn: 'bg-blue-700',
  X: 'bg-slate-700',
  GoogleBusinessProfile: 'bg-emerald-600',
};

const platformSeed = [
  { id: 1, name: 'Facebook' },
  { id: 2, name: 'Instagram' },
  { id: 3, name: 'LinkedIn' },
  { id: 4, name: 'X' },
  { id: 5, name: 'GoogleBusinessProfile' },
];

const formatDateTimeLocal = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n) => `${n}`.padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export default function SocialMediaScheduler() {
  const [apiBaseUrl, setApiBaseUrl] = useState('http://localhost:3001');
  const [platforms, setPlatforms] = useState(platformSeed);
  const [posts, setPosts] = useState([]);
  const [analytics, setAnalytics] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [platformFilter, setPlatformFilter] = useState('All');
  const [calendarMode, setCalendarMode] = useState('monthly');
  const [form, setForm] = useState({
    title: '',
    caption: '',
    mediaUrl: '',
    hashtags: '',
    scheduledAt: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    selectedPlatforms: [1, 2],
  });

  React.useEffect(() => {
    fetchPlatforms();
  }, [apiBaseUrl]);

  const fetchPlatforms = async () => {
    const res = await fetch(`${apiBaseUrl}/api/social/platforms`, {
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) return;
    const data = await res.json();
    setPlatforms(Array.isArray(data) && data.length ? data : platformSeed);
  };

  const createPost = (status) => {
    if (!form.title || !form.caption) return;

    const newPost = {
      id: Date.now(),
      title: form.title,
      caption: form.caption,
      mediaUrl: form.mediaUrl,
      hashtags: form.hashtags,
      status,
      createdAt: new Date().toISOString(),
      postPlatforms: form.selectedPlatforms.map((pid) => ({
        platformId: pid,
        platform: platforms.find((p) => p.id === pid),
        scheduledAt: form.scheduledAt || null,
        publishedAt: status === 'Published' ? new Date().toISOString() : null,
        status,
        errorLog: null,
      })),
    };

    setPosts((prev) => [newPost, ...prev]);

    const snapshots = newPost.postPlatforms.map((pp) => ({
      postId: newPost.id,
      title: newPost.title,
      platform: pp.platform.name,
      status: pp.status,
      reach: Math.floor(Math.random() * 1000),
      likes: Math.floor(Math.random() * 200),
      comments: Math.floor(Math.random() * 60),
      shares: Math.floor(Math.random() * 50),
      publishedAt: pp.publishedAt,
    }));
    setAnalytics((prev) => [...snapshots, ...prev]);

    setForm((prev) => ({ ...prev, title: '', caption: '', mediaUrl: '', hashtags: '', scheduledAt: '' }));
  };

  const updatePostStatus = (postId, status) => {
    setPosts((prev) => prev.map((post) => (post.id === postId ? { ...post, status } : post)));
  };

  const deletePost = (postId) => {
    setPosts((prev) => prev.filter((post) => post.id !== postId));
    setAnalytics((prev) => prev.filter((row) => row.postId !== postId));
  };

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const statusOk = statusFilter === 'All' || post.status === statusFilter;
      const platformOk = platformFilter === 'All' || post.postPlatforms.some((pp) => pp.platform.name === platformFilter);
      return statusOk && platformOk;
    });
  }, [posts, statusFilter, platformFilter]);

  const days = useMemo(() => {
    const base = new Date();
    const start = new Date(base.getFullYear(), base.getMonth(), 1);
    const end = new Date(base.getFullYear(), base.getMonth() + 1, 0);
    const cells = [];
    for (let i = 1; i <= end.getDate(); i += 1) {
      const d = new Date(base.getFullYear(), base.getMonth(), i);
      const dateKey = d.toDateString();
      const items = posts.filter((p) => p.postPlatforms.some((pp) => pp.scheduledAt && new Date(pp.scheduledAt).toDateString() === dateKey));
      cells.push({ day: i, items });
    }
    return cells;
  }, [posts]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Social Poster & Scheduler</h1>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
        Manage connected accounts from <span className="font-semibold">Settings & Admin → Social Accounts</span>.
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <h2 className="font-bold">Compose Panel</h2>
          <input className="w-full rounded-xl border border-slate-200 px-3 py-2" placeholder="Post title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <textarea className="w-full h-36 rounded-xl border border-slate-200 px-3 py-2" placeholder="Write caption/copy" value={form.caption} onChange={(e) => setForm({ ...form, caption: e.target.value })} />
          <input className="w-full rounded-xl border border-slate-200 px-3 py-2" placeholder="#hashtags" value={form.hashtags} onChange={(e) => setForm({ ...form, hashtags: e.target.value })} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="rounded-xl border border-dashed border-slate-300 px-3 py-2 text-sm text-slate-600 flex items-center gap-2"><ImageIcon size={16} /> Image URL</div>
            <input className="w-full rounded-xl border border-slate-200 px-3 py-2" placeholder="https://..." value={form.mediaUrl} onChange={(e) => setForm({ ...form, mediaUrl: e.target.value })} />
            <div className="rounded-xl border border-dashed border-slate-300 px-3 py-2 text-sm text-slate-600 flex items-center gap-2"><Video size={16} /> Video thumbnail URL</div>
            <div className="rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-500">Use `mediaUrl` for image or video thumbnail.</div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold">Platforms</p>
            <div className="flex flex-wrap gap-3">
              {platforms.map((platform) => (
                <label key={platform.id} className="text-sm flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2">
                  <input
                    type="checkbox"
                    checked={form.selectedPlatforms.includes(platform.id)}
                    onChange={(e) => {
                      setForm((prev) => ({
                        ...prev,
                        selectedPlatforms: e.target.checked
                          ? [...prev.selectedPlatforms, platform.id]
                          : prev.selectedPlatforms.filter((p) => p !== platform.id),
                      }));
                    }}
                  />
                  {platform.name}
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="text-sm">
              <span className="mb-1 block font-semibold">Schedule Date/Time</span>
              <input type="datetime-local" className="w-full rounded-xl border border-slate-200 px-3 py-2" value={form.scheduledAt} onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })} />
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-semibold">Timezone</span>
              <select className="w-full rounded-xl border border-slate-200 px-3 py-2" value={form.timezone} onChange={(e) => setForm({ ...form, timezone: e.target.value })}>
                <option>UTC</option>
                <option>Asia/Dubai</option>
                <option>America/New_York</option>
                <option>Europe/London</option>
              </select>
            </label>
          </div>

          <div className="flex gap-3">
            <button onClick={() => createPost('Draft')} className="px-4 py-2 rounded-xl bg-slate-100 font-semibold">Save Draft</button>
            <button onClick={() => createPost(form.scheduledAt ? 'Scheduled' : 'Published')} className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold flex items-center gap-2"><Send size={16} /> {form.scheduledAt ? 'Schedule' : 'Publish'}</button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
          <h2 className="font-bold">Analytics Snapshot</h2>
          {analytics.slice(0, 8).map((a, idx) => (
            <div key={`${a.postId}-${idx}`} className="rounded-xl border border-slate-100 p-3 text-xs">
              <p className="font-semibold">{a.title} · {a.platform}</p>
              <p className="text-slate-500">Reach {a.reach} · Likes {a.likes} · Comments {a.comments} · Shares {a.shares}</p>
            </div>
          ))}
          {analytics.length === 0 && <p className="text-sm text-slate-500">No analytics yet.</p>}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold">Calendar View</h2>
          <div className="flex gap-2">
            <button className={`px-3 py-1 rounded-lg text-sm ${calendarMode === 'monthly' ? 'bg-slate-900 text-white' : 'bg-slate-100'}`} onClick={() => setCalendarMode('monthly')}>Monthly</button>
            <button className={`px-3 py-1 rounded-lg text-sm ${calendarMode === 'weekly' ? 'bg-slate-900 text-white' : 'bg-slate-100'}`} onClick={() => setCalendarMode('weekly')}>Weekly</button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {(calendarMode === 'weekly' ? days.slice(0, 7) : days).map((cell) => (
            <div key={cell.day} className="min-h-24 rounded-xl border border-slate-100 p-2">
              <p className="text-xs font-bold text-slate-500 mb-1">{cell.day}</p>
              {cell.items.slice(0, 2).map((p) => (
                <button key={p.id} title={p.caption} className="w-full text-left text-[11px] rounded-md px-2 py-1 mb-1 bg-slate-50 hover:bg-slate-100">
                  {p.title}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold">Posts List</h2>
          <div className="flex gap-2">
            <select className="rounded-lg border border-slate-200 px-2 py-1 text-sm" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option>All</option><option>Draft</option><option>Scheduled</option><option>Published</option><option>Failed</option>
            </select>
            <select className="rounded-lg border border-slate-200 px-2 py-1 text-sm" value={platformFilter} onChange={(e) => setPlatformFilter(e.target.value)}>
              <option>All</option>{platforms.map((p) => <option key={p.id}>{p.name}</option>)}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-100">
                <th className="py-2">Title</th><th>Status</th><th>Platforms</th><th>Scheduled</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPosts.map((post) => (
                <tr key={post.id} className="border-b border-slate-50">
                  <td className="py-2">
                    <p className="font-semibold">{post.title}</p>
                    <p className="text-xs text-slate-500 line-clamp-1">{post.caption}</p>
                  </td>
                  <td><span className={`text-xs px-2 py-1 rounded-full ${statusStyles[post.status]}`}>{post.status}</span></td>
                  <td>
                    <div className="flex gap-1 flex-wrap">{post.postPlatforms.map((pp) => <span key={`${post.id}-${pp.platformId}`} className={`text-[10px] text-white px-2 py-1 rounded ${platformColors[pp.platform.name] || 'bg-slate-500'}`}>{pp.platform.name}</span>)}</div>
                  </td>
                  <td>{post.postPlatforms[0]?.scheduledAt ? formatDateTimeLocal(post.postPlatforms[0].scheduledAt) : '-'}</td>
                  <td>
                    <div className="flex gap-2">
                      <button className="text-blue-600" onClick={() => updatePostStatus(post.id, 'Scheduled')}>Reschedule</button>
                      <button className="text-emerald-600" onClick={() => updatePostStatus(post.id, 'Published')}>Publish</button>
                      <button className="text-rose-600" onClick={() => deletePost(post.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredPosts.length === 0 && <p className="text-sm text-slate-500 py-2">No posts found.</p>}
        </div>
      </div>
    </div>
  );
}
