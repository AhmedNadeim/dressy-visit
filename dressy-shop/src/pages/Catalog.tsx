import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import DressCard from '../components/DressCard';
import DressCardSkeleton from '../components/DressCardSkeleton';
import { CATEGORIES, COLOR_PALETTE } from '../data/dresses';
import { useDressList } from '../hooks/useDresses';

const ALL_SIZES = ['44', '46', '48', '50', '52', '54', '56', '58'];

export default function Catalog() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const [params] = useSearchParams();

  const [category, setCategory] = useState<string>((params.get('category')) ?? 'all');
  const [size,     setSize]     = useState<string>('');
  const [sort,     setSort]     = useState<'newest' | 'priceLow' | 'priceHigh'>('newest');
  const [maxPrice,  setMaxPrice]  = useState<number>(5000);
  const [myWeight,  setMyWeight]  = useState<number>(0);
  const [color,     setColor]     = useState<string>('');
  const [filterOpen, setFilterOpen] = useState(false);

  const { dresses, loading, error } = useDressList();

  const filtered = useMemo(() => {
    let list = [...dresses];
    if (category !== 'all') list = list.filter(d => d.category === category);
    if (size)               list = list.filter(d => d.sizes.includes(size));
    list = list.filter(d => d.priceFrom == null || d.priceFrom <= maxPrice);
    if (myWeight > 0) list = list.filter(d =>
      // Keep dresses with no weight set, or where at least one availability entry
      // has a weight within ±5 kg of the user's weight
      d.availabilities.length === 0 ||
      d.availabilities.every(a => a.weightFrom == null) ||
      d.availabilities.some(a => a.weightFrom != null && Math.abs(a.weightFrom - myWeight) <= 5)
    );
    if (color) list = list.filter(d =>
      d.colors.some(c => c.hex.toLowerCase() === color.toLowerCase())
    );
    if (sort === 'priceLow')  list.sort((a, b) => (a.priceFrom ?? 0) - (b.priceFrom ?? 0));
    if (sort === 'priceHigh') list.sort((a, b) => (b.priceFrom ?? 0) - (a.priceFrom ?? 0));
    if (sort === 'newest')    list.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
    return list;
  }, [dresses, category, size, sort, maxPrice, myWeight, color]);

  const clearFilters = () => { setCategory('all'); setSize(''); setMaxPrice(5000); setMyWeight(0); setColor(''); setSort('newest'); };

  return (
    <main className="min-h-screen bg-ivory pt-24 pb-20">
      {/* Page header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-ink to-ink-soft py-16 mb-12">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, #C2185B 0%, transparent 60%), radial-gradient(circle at 70% 50%, #C9A84C 0%, transparent 60%)' }}
        />
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}
            className="text-gold tracking-widest uppercase text-sm mb-2"
          >
            — Dressy Atelier —
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-display font-bold text-white mb-3"
          >
            {t('catalog.title')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="text-white/60 text-lg"
          >
            {t('catalog.subtitle')}
          </motion.p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        {/* Mobile filter toggle */}
        <div className="flex items-center justify-between mb-6 lg:hidden">
          <span className="text-ink-muted text-sm">{filtered.length} {t('catalog.results')}</span>
          <button
            onClick={() => setFilterOpen(v => !v)}
            className="flex items-center gap-2 px-4 py-2 border border-rose/30 rounded-full text-rose text-sm font-semibold"
          >
            ⚙ {t('catalog.filterCategory')}
          </button>
        </div>

        <div className="flex gap-8">
          {/* Sidebar filters */}
          <aside className={`lg:block lg:w-64 shrink-0 ${filterOpen ? 'block' : 'hidden'}`}>
            <div className="glass-card p-6 sticky top-24 space-y-8">
              {/* Category */}
              <div>
                <h4 className="font-semibold text-ink mb-3 text-sm uppercase tracking-wide">
                  {t('catalog.filterCategory')}
                </h4>
                <ul className="space-y-2">
                  {CATEGORIES.map(c => (
                    <li key={c.value}>
                      <button
                        onClick={() => setCategory(c.value)}
                        className={`w-full text-start px-3 py-2 rounded-lg text-sm transition-all ${
                          category === c.value
                            ? 'bg-rose text-white font-semibold'
                            : 'text-ink-soft hover:bg-rose/10 hover:text-rose'
                        }`}
                      >
                        {isAr ? c.labelAr : c.labelEn}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Size */}
              <div>
                <h4 className="font-semibold text-ink mb-3 text-sm uppercase tracking-wide">
                  {t('catalog.filterSize')}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {ALL_SIZES.map(s => (
                    <button
                      key={s}
                      onClick={() => setSize(size === s ? '' : s)}
                      className={`w-12 h-10 rounded-lg border text-sm font-semibold transition-all ${
                        size === s
                          ? 'bg-rose border-rose text-white'
                          : 'border-ink-muted/30 text-ink-soft hover:border-rose hover:text-rose'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color */}
              <div>
                <h4 className="font-semibold text-ink mb-3 text-sm uppercase tracking-wide">
                  {isAr ? 'اللون' : 'Color'}
                </h4>
                <div role="radiogroup" aria-label={isAr ? 'اللون' : 'Color'} className="flex flex-wrap gap-2">
                  {COLOR_PALETTE.map(c => (
                    <button
                      key={c.hex}
                      role="radio"
                      aria-checked={color === c.hex}
                      aria-label={isAr ? c.nameAr : c.nameEn}
                      onClick={() => setColor(color === c.hex ? '' : c.hex)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setColor(color === c.hex ? '' : c.hex);
                        }
                      }}
                      className={`w-7 h-7 rounded-full border-2 transition-all duration-200 hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose focus-visible:ring-offset-2 ${
                        color === c.hex
                          ? 'border-rose scale-110 shadow-md'
                          : 'border-white shadow-sm'
                      }`}
                      style={{ background: c.hex, outline: color === c.hex ? '2px solid #C2185B' : 'none', outlineOffset: '2px' }}
                    />
                  ))}
                </div>
                {color && (
                  <p className="text-xs text-rose font-semibold mt-2">
                    {isAr
                      ? COLOR_PALETTE.find(c => c.hex === color)?.nameAr
                      : COLOR_PALETTE.find(c => c.hex === color)?.nameEn}
                  </p>
                )}
              </div>

              {/* Price range */}
              <div>
                <h4 className="font-semibold text-ink mb-3 text-sm uppercase tracking-wide">
                  {t('catalog.filterPrice')}
                </h4>
                <input type="range" min={500} max={5000} step={100}
                  value={maxPrice} onChange={e => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-rose" />
                <div className="flex justify-between text-xs text-ink-muted mt-1">
                  <span>500 {t('currency')}</span>
                  <span className="text-rose font-semibold">{maxPrice.toLocaleString()} {t('currency')}</span>
                </div>
              </div>

              {/* Weight filter */}
              <div>
                <h4 className="font-semibold text-ink mb-3 text-sm uppercase tracking-wide">
                  My Weight (KG)
                </h4>
                <input type="range" min={0} max={150} step={5}
                  value={myWeight} onChange={e => setMyWeight(Number(e.target.value))}
                  className="w-full accent-rose" />
                <div className="flex justify-between text-xs text-ink-muted mt-1">
                  <span>Any</span>
                  <span className={myWeight > 0 ? 'text-rose font-semibold' : ''}>
                    {myWeight > 0 ? `${myWeight} kg` : 'Not set'}
                  </span>
                </div>
              </div>

              {/* Clear */}
              <button
                onClick={clearFilters}
                className="w-full py-2 rounded-lg border border-rose/30 text-rose text-sm
                           font-semibold hover:bg-rose hover:text-white transition-all"
              >
                {t('catalog.clearFilters')}
              </button>
            </div>
          </aside>

          {/* Main grid */}
          <div className="flex-1">
            {/* Sort bar */}
            <div className="hidden lg:flex items-center justify-between mb-6">
              <span className="text-ink-muted text-sm">{filtered.length} {t('catalog.results')}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-ink-muted">{t('catalog.sortBy')}:</span>
                {(['newest', 'priceLow', 'priceHigh'] as const).map(opt => (
                  <button
                    key={opt}
                    onClick={() => setSort(opt)}
                    className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                      sort === opt ? 'bg-rose text-white' : 'border border-ink-muted/30 text-ink-soft hover:border-rose hover:text-rose'
                    }`}
                  >
                    {t(`catalog.sortOptions.${opt}`)}
                  </button>
                ))}
              </div>
            </div>

            {/* Skeleton grid while loading */}
            {loading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <DressCardSkeleton key={i} />
                ))}
              </div>
            )}

            {/* Error */}
            {error && !loading && (
              <div className="text-center py-24">
                <p className="text-red-500 mb-4">{error}</p>
                <button onClick={clearFilters} className="btn-outline">Retry</button>
              </div>
            )}

            {/* Grid */}
            {!loading && !error && (
              <AnimatePresence mode="wait">
                {filtered.length === 0 ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="text-center py-24"
                  >
                    <p className="text-6xl mb-4">👗</p>
                    <p className="text-ink-muted text-lg mb-4">{t('catalog.noResults')}</p>
                    <button onClick={clearFilters} className="btn-outline">
                      {t('catalog.clearFilters')}
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="grid"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
                  >
                    {filtered.map((d, i) => (
                      <DressCard key={d.id} dress={d} index={i} />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
