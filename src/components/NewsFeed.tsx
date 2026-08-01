import React, { useEffect, useState } from 'react';
import { ExternalLink, Newspaper, Instagram, RefreshCw } from 'lucide-react';

interface DlhItem {
  id: string;
  title: string;
  url: string;
  image: string;
  date: string;
}

interface IgItem {
  id: string;
  caption: string;
  mediaType: string;
  mediaUrl: string;
  thumbnailUrl: string;
  permalink: string;
  timestamp: string;
}

interface Feed {
  website: { ok: boolean; items: DlhItem[]; fetchedAt: string };
  instagram: { ok: boolean; configured: boolean; items: IgItem[]; fetchedAt: string };
}

const fmtDate = (d: string): string => {
  const m = d.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return d;
  return `${m[3]}-${m[2]}-${m[1]}`;
};

export const NewsFeed: React.FC = () => {
  const [feed, setFeed] = useState<Feed | null>(null);
  const [error, setError] = useState(false);

  const load = () => {
    setFeed(null);
    setError(false);
    fetch('/api/feed')
      .then(r => (r.ok ? r.json() : Promise.reject()))
      .then(setFeed)
      .catch(() => setError(true));
  };

  useEffect(load, []);

  if (error) return null;
  if (!feed) {
    return (
      <div className="bg-white dark:bg-stone-900 border border-emerald-100 dark:border-stone-800 rounded-2xl p-6 animate-pulse">
        <div className="h-4 w-40 bg-slate-100 dark:bg-stone-800 rounded mb-4" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="h-40 bg-slate-100 dark:bg-stone-800 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const berita = feed.website.items;
  const ig = feed.instagram.items;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Berita DLH */}
      <section className="bg-white dark:bg-stone-900 border border-emerald-100 dark:border-stone-800 rounded-2xl overflow-hidden shadow-sm text-left">
        <div className="px-6 py-4 border-b border-slate-50 dark:border-stone-850 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Newspaper className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-extrabold text-[#1B4332] dark:text-emerald-400 tracking-tight">Berita Terkini DLH Pontianak</h3>
          </div>
          <span className="text-[9px] font-mono text-slate-400">dlh.pontianak.go.id</span>
        </div>
        {berita.length === 0 ? (
          <p className="px-6 py-8 text-xs text-slate-400 text-center">Belum ada berita yang dapat dimuat.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6">
            {berita.map((item) => (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col rounded-xl border border-slate-100 dark:border-stone-800 overflow-hidden hover:border-emerald-300 hover:shadow-md transition bg-slate-50/50 dark:bg-stone-950/30"
              >
                <div className="aspect-[4/3] bg-slate-100 dark:bg-stone-800 overflow-hidden">
                  {item.image ? (
                    <img src={item.image} alt={item.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <Newspaper className="w-6 h-6" />
                    </div>
                  )}
                </div>
                <div className="p-3 space-y-1.5 flex-1 flex flex-col">
                  <p className="text-[11px] leading-snug font-semibold text-slate-800 dark:text-stone-200 line-clamp-3 group-hover:text-[#1B4332] transition">
                    {item.title}
                  </p>
                  <div className="mt-auto flex items-center justify-between pt-1">
                    <span className="text-[9px] font-mono text-slate-400">{item.date ? fmtDate(item.date) : '—'}</span>
                    <ExternalLink className="w-3 h-3 text-slate-300 group-hover:text-emerald-600 transition" />
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </section>

      {/* Instagram */}
      <section className="bg-white dark:bg-stone-900 border border-emerald-100 dark:border-stone-800 rounded-2xl overflow-hidden shadow-sm text-left">
        <div className="px-6 py-4 border-b border-slate-50 dark:border-stone-850 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Instagram className="w-4 h-4 text-pink-600" />
            <h3 className="text-sm font-extrabold text-[#1B4332] dark:text-emerald-400 tracking-tight">Instagram @dinaslingkunganhidup_pontianak</h3>
          </div>
          <a
            href="https://www.instagram.com/dinaslingkunganhidup_pontianak/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[9px] font-bold text-pink-600 hover:underline flex items-center gap-1"
          >
            Lihat profil <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </div>

        {!feed.instagram.configured ? (
          <div className="px-6 py-8 text-center space-y-2">
            <p className="text-xs text-slate-500 font-semibold">Feed Instagram belum terhubung.</p>
            <p className="text-[11px] text-slate-400 leading-relaxed max-w-lg mx-auto">
              Hubungkan melalui Meta Graph API (akun Instagram Business/Creator + access token) lalu isi{' '}
              <code className="bg-slate-100 dark:bg-stone-800 px-1.5 py-0.5 rounded font-mono text-[10px]">META_ACCESS_TOKEN</code> dan{' '}
              <code className="bg-slate-100 dark:bg-stone-800 px-1.5 py-0.5 rounded font-mono text-[10px]">META_IG_USER_ID</code> di <code className="bg-slate-100 dark:bg-stone-800 px-1.5 py-0.5 rounded font-mono text-[10px]">.env</code>.
            </p>
          </div>
        ) : ig.length === 0 ? (
          <p className="px-6 py-8 text-xs text-slate-400 text-center">Belum ada postingan yang dapat dimuat.</p>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 p-6">
            {ig.map((post) => (
              <a
                key={post.id}
                href={post.permalink}
                target="_blank"
                rel="noopener noreferrer"
                className="group aspect-square rounded-xl overflow-hidden bg-slate-100 dark:bg-stone-800 border border-slate-100 dark:border-stone-800"
              >
                <img
                  src={post.thumbnailUrl}
                  alt={post.caption || 'Postingan Instagram'}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:opacity-80 group-hover:scale-105 transition duration-300"
                />
              </a>
            ))}
          </div>
        )}
      </section>

      <div className="flex items-center justify-between px-1">
        <span className="text-[9px] font-mono text-slate-400">Diperbarui otomatis dari sumber resmi</span>
        <button onClick={load} className="text-[10px] font-bold text-slate-400 hover:text-emerald-600 transition flex items-center gap-1">
          <RefreshCw className="w-3 h-3" /> Segarkan
        </button>
      </div>
    </div>
  );
};
