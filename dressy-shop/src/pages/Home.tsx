import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';

import HeroSlider from '../components/HeroSlider';
import DressCard from '../components/DressCard';
import ErrorState from '../components/ErrorState';
import { CATEGORIES } from '../data/dresses';
import { useFeatured, useNewArrivals, useDressesByIds } from '../hooks/useDresses';
import { useRecentlyViewed } from '../context/RecentlyViewedContext';

const WHY_ICONS = ['💎', '✨', '👗', '📍'];

const CATEGORY_IMAGES: Record<string, string> = {
  evening:  'https://images.unsplash.com/photo-1566479179817-0b25b6b0f45c?w=600&q=80',
  wedding:  'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&q=80',
  cocktail: 'https://images.unsplash.com/photo-1612336307429-8a898d10e223?w=600&q=80',
  maxi:     'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&q=80',
  casual:   'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&q=80',
};

function Spinner() {
  return (
    <div className="flex justify-center py-16">
      <span className="w-8 h-8 border-2 border-rose/30 border-t-rose rounded-full animate-spin" />
    </div>
  );
}

export default function Home() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  const { dresses: featured,    loading: loadingFeatured,    error: errorFeatured,    retry: retryFeatured }    = useFeatured();
  const { dresses: newArrivals, loading: loadingNewArrivals, error: errorNewArrivals, retry: retryNewArrivals } = useNewArrivals();
  const { ids: recentIds } = useRecentlyViewed();
  const { dresses: recentDresses } = useDressesByIds(recentIds);

  const categories = CATEGORIES.filter(c => c.value !== 'all');

  return (
    <main>
      <HeroSlider />

      {/* Featured Dresses */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6 }}
          >
            <p className="text-center text-gold font-semibold tracking-widest uppercase text-sm mb-2">
              — {t('home.featuredTitle')} —
            </p>
            <h2 className="section-title">{t('home.featuredTitle')}</h2>
            <p className="section-subtitle">{t('home.featuredSubtitle')}</p>
          </motion.div>

          {loadingFeatured ? (
            <Spinner />
          ) : errorFeatured ? (
            <ErrorState message={errorFeatured} onRetry={retryFeatured} />
          ) : featured.length === 0 ? (
            <p className="text-center text-ink-muted py-12">{t('catalog.noResults')}</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featured.map((d, i) => (
                <DressCard key={d.id} dress={d} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Categories Banner */}
      <section className="py-20 bg-ivory-dark px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6 }}
          >
            <h2 className="section-title">{t('home.categoriesTitle')}</h2>
            <p className="section-subtitle">{t('home.categoriesSubtitle')}</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.value}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <Link
                  to={`/catalog?category=${cat.value}`}
                  className="group relative block rounded-2xl overflow-hidden aspect-[3/4] shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
                >
                  <img
                    src={CATEGORY_IMAGES[cat.value] ?? CATEGORY_IMAGES.casual}
                    alt={isAr ? cat.labelAr : cat.labelEn}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent" />
                  <div className="absolute bottom-0 inset-x-0 p-4 text-center">
                    <span className={`text-white font-bold text-base drop-shadow-lg ${isAr ? 'font-arabic' : 'font-display'}`}>
                      {isAr ? cat.labelAr : cat.labelEn}
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Dressy */}
      <section className="py-20 px-4 relative overflow-hidden">
        <div className="absolute -top-32 -end-32 w-96 h-96 rounded-full bg-rose/5 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -start-32 w-96 h-96 rounded-full bg-gold/5 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6 }}
          >
            <h2 className="section-title">{t('home.whyTitle')}</h2>
            <p className="section-subtitle">{t('home.whySubtitle')}</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {(t('home.whyItems', { returnObjects: true }) as { title: string; body: string }[]).map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.6 }}
                className="glass-card p-8 text-center group hover:shadow-rose/10 hover:border-rose/20
                           transition-all duration-500 hover:-translate-y-2"
              >
                <span className="text-5xl mb-5 block animate-float" style={{ animationDelay: `${i * 0.5}s` }}>
                  {WHY_ICONS[i]}
                </span>
                <h3 className={`font-bold text-ink mb-3 text-lg ${isAr ? 'font-arabic' : 'font-display'}`}>
                  {item.title}
                </h3>
                <p className={`text-ink-muted text-sm leading-relaxed ${isAr ? 'font-arabic' : ''}`}>
                  {item.body}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* New Arrivals carousel */}
      <section className="py-20 bg-gradient-to-br from-ink to-ink-soft px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6 }}
          >
            <p className="text-center text-gold font-semibold tracking-widest uppercase text-sm mb-2">
              — {t('home.newArrivals')} —
            </p>
            <h2 className="section-title text-white">{t('home.newArrivals')}</h2>
            <p className="section-subtitle text-white/60">{t('home.newArrivalsSubtitle')}</p>
          </motion.div>

          {loadingNewArrivals ? (
            <Spinner />
          ) : errorNewArrivals ? (
            <ErrorState message={errorNewArrivals} onRetry={retryNewArrivals} />
          ) : newArrivals.length === 0 ? (
            <p className="text-center text-white/50 py-12">{t('catalog.noResults')}</p>
          ) : (
            <Swiper
              modules={[Autoplay, Navigation]}
              autoplay={{ delay: 3500, disableOnInteraction: false }}
              navigation
              loop
              spaceBetween={24}
              breakpoints={{
                0:    { slidesPerView: 1.2 },
                640:  { slidesPerView: 2.2 },
                1024: { slidesPerView: 3.5 },
              }}
              className="pb-4"
            >
              {newArrivals.map((d, i) => (
                <SwiperSlide key={d.id}>
                  <DressCard dress={d} index={i} />
                </SwiperSlide>
              ))}
            </Swiper>
          )}

          <div className="text-center mt-10">
            <Link to="/catalog" className="btn-gold">
              {t('home.viewAll')}
            </Link>
          </div>
        </div>
      </section>

      {/* Recently Viewed */}
      {recentDresses.length > 0 && (
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.6 }}
            >
              <p className="text-center text-gold font-semibold tracking-widest uppercase text-sm mb-2">
                — {t('home.recentlyViewed')} —
              </p>
              <h2 className="section-title">{t('home.recentlyViewed')}</h2>
              <p className="section-subtitle">{t('home.recentlyViewedSubtitle')}</p>
            </motion.div>
            <Swiper
              modules={[Autoplay, Navigation]}
              autoplay={{ delay: 4000, disableOnInteraction: false }}
              navigation
              loop={recentDresses.length > 3}
              spaceBetween={24}
              breakpoints={{
                0:    { slidesPerView: 1.2 },
                640:  { slidesPerView: 2.2 },
                1024: { slidesPerView: 4 },
              }}
              className="pb-4"
            >
              {recentDresses.map((d, i) => (
                <SwiperSlide key={d.id}>
                  <DressCard dress={d} index={i} />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </section>
      )}

      {/* Promo strip */}
      <div className="bg-rose py-4 overflow-hidden">
        <div className="flex gap-16 animate-[marquee_20s_linear_infinite] whitespace-nowrap">
          {Array.from({ length: 8 }).map((_, i) => (
            <span key={i} className="text-white/90 text-sm font-semibold tracking-widest uppercase flex items-center gap-8">
              ✦ New Collection 2025 &nbsp;|&nbsp; فساتين حصرية &nbsp;|&nbsp; Free In-Store Styling
            </span>
          ))}
        </div>
      </div>
    </main>
  );
}
