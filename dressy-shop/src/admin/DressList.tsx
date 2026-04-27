import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { shopDressApi, type ShopDress } from '../api/client';
import { useDressList } from '../hooks/useDresses';
import { toSlug } from '../utils/slug';

export default function DressList() {
  const [search,   setSearch]   = useState('');
  const [deleteId,    setDeleteId]    = useState<number | null>(null);
  const [deleting,    setDeleting]    = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const { dresses, loading, error } = useDressList();
  const [removed, setRemoved] = useState<number[]>([]);

  const visible = dresses.filter(d => !removed.includes(d.id));
  const filtered = visible.filter(d =>
    d.nameEn.toLowerCase().includes(search.toLowerCase()) ||
    d.nameAr.includes(search) ||
    d.category.toLowerCase().includes(search.toLowerCase())
  );

  const confirmDelete = async () => {
    if (deleteId == null) return;
    setDeleting(true);
    setDeleteError('');
    try {
      await shopDressApi.delete(deleteId);
      setRemoved(prev => [...prev, deleteId]);
      setDeleteId(null);
    } catch (e: unknown) {
      setDeleteError(e instanceof Error ? e.message : 'Failed to delete. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  function thumb(d: ShopDress) {
    return d.images.find(i => i.sortOrder === 0)?.url ?? d.images[0]?.url ?? '';
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Dress Collection</h2>
          <p className="text-gray-400 text-sm">{visible.length} dresses in catalog</p>
        </div>
        <Link
          to="/admin/dresses/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-rose text-white rounded-xl
                     font-semibold text-sm hover:bg-rose-dark transition-all hover:scale-105
                     shadow-md shadow-rose/20 self-start sm:self-auto"
        >
          + Add New Dress
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <span className="absolute inset-y-0 start-4 flex items-center text-gray-400">🔍</span>
        <input
          type="search"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or category…"
          className="w-full ps-11 pe-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-800
                     placeholder:text-gray-400 focus:outline-none focus:border-rose focus:ring-2
                     focus:ring-rose/20 transition-all shadow-sm"
        />
      </div>

      {/* Loading / Error */}
      {loading && (
        <div className="flex justify-center py-16">
          <span className="w-8 h-8 border-2 border-rose/30 border-t-rose rounded-full animate-spin" />
        </div>
      )}
      {error && !loading && (
        <p className="text-center text-red-500 py-8">{error}</p>
      )}

      {/* Table */}
      {!loading && !error && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-4 py-3 text-start text-gray-500 font-semibold">Dress</th>
                  <th className="px-4 py-3 text-start text-gray-500 font-semibold hidden md:table-cell">Category</th>
                  <th className="px-4 py-3 text-start text-gray-500 font-semibold hidden lg:table-cell">Sizes</th>
                  <th className="px-4 py-3 text-start text-gray-500 font-semibold hidden lg:table-cell">Branches</th>
                  <th className="px-4 py-3 text-start text-gray-500 font-semibold">Price</th>
                  <th className="px-4 py-3 text-start text-gray-500 font-semibold hidden sm:table-cell">Badges</th>
                  <th className="px-4 py-3 text-end text-gray-500 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                <AnimatePresence>
                  {filtered.map((d, i) => (
                    <motion.tr
                      key={d.id}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      {/* Dress name + image */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {thumb(d) ? (
                            <img
                              src={thumb(d)}
                              alt={d.nameEn}
                              className="w-10 h-12 object-cover rounded-lg shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-12 rounded-lg bg-gray-100 shrink-0 flex items-center justify-center text-gray-400">
                              👗
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-800 truncate max-w-[140px]">{d.nameEn}</p>
                            <p className="text-gray-400 text-xs truncate max-w-[140px]" dir="rtl">{d.nameAr}</p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="capitalize px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-semibold">
                          {d.category}
                        </span>
                      </td>

                      {/* Sizes */}
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {d.sizes.map(s => (
                            <span key={s} className="px-1.5 py-0.5 border border-gray-200 rounded text-xs text-gray-500">{s}</span>
                          ))}
                        </div>
                      </td>

                      {/* Branches */}
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {Array.from(new Set(d.availabilities.map(a => a.branchName))).map(name => (
                            <span key={name} className="px-2 py-0.5 bg-rose/10 text-rose rounded-full text-xs font-semibold">
                              {name.replace(' Branch', '')}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Price */}
                      <td className="px-4 py-3">
                        <span className="font-bold text-rose">
                          {d.priceFrom != null ? d.priceFrom.toLocaleString() : '—'}
                        </span>
                        <span className="text-gray-400 text-xs ms-1">EGP</span>
                      </td>

                      {/* Badges */}
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <div className="flex gap-1">
                          {d.isNew    && <span className="px-2 py-0.5 bg-gold/10 text-gold-dark rounded-full text-xs font-semibold">New</span>}
                          {d.featured && <span className="px-2 py-0.5 bg-rose/10 text-rose rounded-full text-xs font-semibold">Featured</span>}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            to={`/dress/${toSlug(d.nameEn, d.id)}`}
                            target="_blank"
                            className="p-2 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-all"
                            title="View on shop"
                          >
                            🌐
                          </Link>
                          <Link
                            to={`/admin/dresses/${d.id}/edit`}
                            className="p-2 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-all"
                            title="Edit"
                          >
                            ✏️
                          </Link>
                          <button
                            onClick={() => setDeleteId(d.id)}
                            className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                            title="Delete"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>

                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-16 text-center text-gray-400">
                      <p className="text-4xl mb-2">👗</p>
                      <p>No dresses found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      <AnimatePresence>
        {deleteId != null && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4"
            onClick={() => { if (!deleting) { setDeleteId(null); setDeleteError(''); } }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl"
            >
              <p className="text-4xl text-center mb-3">⚠️</p>
              <h3 className="font-bold text-gray-800 text-center text-lg mb-2">Delete Dress?</h3>
              <p className="text-gray-500 text-center text-sm mb-4">
                This will permanently remove{' '}
                <strong>{visible.find(d => d.id === deleteId)?.nameEn}</strong> from the catalog.
              </p>
              {deleteError && (
                <div className="mb-4 px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs font-medium text-center">
                  ⚠️ {deleteError}
                </div>
              )}
              <div className="flex gap-3">
                <button
                  onClick={() => { setDeleteId(null); setDeleteError(''); }}
                  disabled={deleting}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold
                             text-sm hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={deleting}
                  className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-semibold text-sm
                             hover:bg-red-600 transition-all flex items-center justify-center gap-2"
                >
                  {deleting ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                  {deleting ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
