import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { BRANCHES } from '../data/dresses';

export default function Branches() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  return (
    <main className="min-h-screen bg-ivory pt-20 pb-20">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-ink via-ink-soft to-rose-dark py-24 mb-16">
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #C9A84C 0%, transparent 50%)' }}
        />
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <span className="inline-block mb-4 text-gold tracking-widest uppercase text-sm font-semibold">
              — Dressy Atelier —
            </span>
            <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-4">
              {t('branches.title')}
            </h1>
            <p className="text-white/60 text-xl max-w-xl mx-auto">{t('branches.subtitle')}</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {BRANCHES.map((branch, i) => (
            <motion.div
              key={branch.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.6 }}
              className="glass-card overflow-hidden group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500"
            >
              {/* Branch header */}
              <div className="bg-gradient-to-r from-rose to-rose-mid p-5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-lg shrink-0">
                  {i + 1}
                </div>
                <div>
                  <h2 className={`text-white font-bold text-lg leading-tight ${isAr ? 'font-arabic' : 'font-display'}`}>
                    {isAr ? branch.nameAr : branch.nameEn}
                  </h2>
                  <p className="text-white/70 text-xs">{branch.city}</p>
                </div>
              </div>

              {/* Embedded map */}
              <div className="relative">
                <iframe
                  title={isAr ? branch.nameAr : branch.nameEn}
                  src={branch.mapsEmbed}
                  className="w-full h-44 border-0"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>

              <div className="p-6 space-y-4">
                {/* Address */}
                <div className="flex gap-3 items-start">
                  <span className="text-gold text-lg shrink-0 mt-0.5">📍</span>
                  <p className={`text-ink-soft text-sm leading-relaxed ${isAr ? 'font-arabic' : ''}`}>
                    {isAr ? branch.addressAr : branch.addressEn}
                  </p>
                </div>

                {/* Phone */}
                <div className="flex gap-3 items-center">
                  <span className="text-rose text-lg shrink-0">📞</span>
                  <a
                    href={`tel:${branch.phone}`}
                    className="text-rose font-bold text-base hover:text-rose-dark transition-colors tracking-wide"
                    dir="ltr"
                  >
                    {branch.phone}
                  </a>
                </div>

                {/* Hours */}
                <div className="flex gap-3 items-start">
                  <span className="text-ink-muted text-lg shrink-0 mt-0.5">🕙</span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted mb-0.5">
                      {t('branches.hours')}
                    </p>
                    <p className={`text-ink-soft text-sm leading-relaxed whitespace-pre-line ${isAr ? 'font-arabic' : ''}`}>
                      {t('branches.hoursValue')}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-1">
                  <a
                    href={branch.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl
                               bg-[#25D366] text-white font-semibold text-sm transition-all
                               hover:bg-[#1faa52] hover:scale-105 shadow-md"
                  >
                    💬 {t('branches.whatsapp')}
                  </a>
                  <a
                    href={branch.mapsLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl
                               border-2 border-rose/30 text-rose font-semibold text-sm
                               hover:bg-rose hover:text-white transition-all hover:scale-105"
                  >
                    📍 {t('branches.directions')}
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  );
}
