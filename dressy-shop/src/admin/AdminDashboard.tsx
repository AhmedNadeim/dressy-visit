import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BRANCHES } from '../data/dresses';
import { useDressList } from '../hooks/useDresses';

interface Stat { label: string; value: string | number; icon: string; color: string; }

export default function AdminDashboard() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(id);
  }, []);

  const { dresses, loading } = useDressList();

  const stats: Stat[] = [
    { label: 'Total Dresses',   value: loading ? '…' : dresses.length,                       icon: '👗', color: 'bg-rose/10 text-rose border-rose/20' },
    { label: 'Featured',        value: loading ? '…' : dresses.filter(d => d.featured).length, icon: '✨', color: 'bg-gold/10 text-gold-dark border-gold/20' },
    { label: 'New Arrivals',    value: loading ? '…' : dresses.filter(d => d.isNew).length,    icon: '🆕', color: 'bg-green-50 text-green-700 border-green-200' },
    { label: 'Active Branches', value: BRANCHES.length,                                         icon: '📍', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  ];

  const greeting = time.getHours() < 12 ? 'Good morning' : time.getHours() < 18 ? 'Good afternoon' : 'Good evening';

  const recent = [...dresses]
    .sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''))
    .slice(0, 5);

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-ink to-rose-dark rounded-2xl p-6 text-white relative overflow-hidden"
      >
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/5" />
        <div className="absolute -bottom-8 -right-4 w-28 h-28 rounded-full bg-white/5" />
        <div className="relative z-10">
          <p className="text-white/60 text-sm">{greeting} 👋</p>
          <h2 className="text-2xl font-bold mt-1">Dressy Atelier — Admin</h2>
          <p className="text-white/60 text-sm mt-2">
            {time.toLocaleDateString('en-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`bg-white rounded-2xl p-5 border shadow-sm flex flex-col gap-2 ${s.color}`}
          >
            <span className="text-3xl">{s.icon}</span>
            <span className="text-3xl font-bold">{s.value}</span>
            <span className="text-sm font-medium opacity-80">{s.label}</span>
          </motion.div>
        ))}
      </div>

      {/* Quick actions */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
      >
        <h3 className="font-bold text-gray-800 mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/admin/dresses/new"
            className="flex items-center gap-2 px-5 py-2.5 bg-rose text-white rounded-xl font-semibold
                       text-sm hover:bg-rose-dark transition-all hover:scale-105 shadow-md shadow-rose/20"
          >
            + Add New Dress
          </Link>
          <Link
            to="/admin/dresses"
            className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 text-gray-700 rounded-xl
                       font-semibold text-sm hover:border-rose hover:text-rose transition-all"
          >
            👗 Manage Dresses
          </Link>
          <Link
            to="/"
            target="_blank"
            className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 text-gray-700 rounded-xl
                       font-semibold text-sm hover:border-rose hover:text-rose transition-all"
          >
            🌐 View Shop ↗
          </Link>
        </div>
      </motion.div>

      {/* Recent dresses */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-800">Recent Dresses</h3>
          <Link to="/admin/dresses" className="text-rose text-sm font-semibold hover:text-rose-dark">
            View all →
          </Link>
        </div>
        <div className="divide-y divide-gray-50">
          {loading && (
            <div className="flex justify-center py-8">
              <span className="w-6 h-6 border-2 border-rose/30 border-t-rose rounded-full animate-spin" />
            </div>
          )}
          {!loading && recent.map(d => {
            const thumb = d.images.find(i => i.sortOrder === 0)?.url ?? d.images[0]?.url ?? '';
            return (
              <div key={d.id} className="flex items-center gap-4 px-6 py-3 hover:bg-gray-50 transition-colors">
                {thumb ? (
                  <img src={thumb} alt={d.nameEn} className="w-10 h-12 object-cover rounded-lg" />
                ) : (
                  <div className="w-10 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">👗</div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-sm truncate">{d.nameEn}</p>
                  <p className="text-gray-400 text-xs capitalize">{d.category}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-rose font-bold text-sm">
                    {d.priceFrom != null ? d.priceFrom.toLocaleString() : '—'} EGP
                  </p>
                  <div className="flex gap-1 justify-end mt-1">
                    {d.isNew    && <span className="text-xs bg-gold/10 text-gold-dark px-1.5 py-0.5 rounded-full font-semibold">New</span>}
                    {d.featured && <span className="text-xs bg-rose/10 text-rose px-1.5 py-0.5 rounded-full font-semibold">Featured</span>}
                  </div>
                </div>
                <Link
                  to={`/admin/dresses/${d.id}/edit`}
                  className="shrink-0 p-2 rounded-lg text-gray-400 hover:text-rose hover:bg-rose/10 transition-all text-sm"
                >
                  ✏️
                </Link>
              </div>
            );
          })}
          {!loading && recent.length === 0 && (
            <p className="text-center text-gray-400 py-8">No dresses yet. Add your first one!</p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
