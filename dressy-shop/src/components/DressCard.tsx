import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import type { ShopDress } from '../api/client';
import { useWishlist } from '../context/WishlistContext';
import { useCompare } from '../context/CompareContext';
import { toSlug } from '../utils/slug';
import { getPriceInfo } from '../utils/price';
import DressImage from './DressImage';

interface Props { dress: ShopDress; index?: number; }

export default function DressCard({ dress, index = 0 }: Props) {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const { isWishlisted, toggle } = useWishlist();
  const { isInCompare, toggle: toggleCompare, count: compareCount } = useCompare();
  const wishlisted = isWishlisted(dress.id);
  const inCompare  = isInCompare(dress.id);

  const name  = isAr ? dress.nameAr : dress.nameEn;
  const thumb = dress.images.find(i => i.sortOrder === 0)?.url ?? dress.images[0]?.url ?? '';
  const { origLabel, discLabel, hasDiscount } = getPriceInfo(dress);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="group"
    >
      <div className="dress-card block">
        {/* Image */}
        <div className="relative overflow-hidden aspect-[3/4]">
          <Link to={`/dress/${toSlug(dress.nameEn, dress.id)}`}>
            <DressImage
              src={thumb}
              alt={name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          </Link>

          {/* Badges */}
          <div className="absolute top-3 start-3 flex flex-col gap-2">
            {dress.discountPercent != null && dress.discountPercent > 0 && (
              <span className="tag bg-red-500 text-white shadow-md font-bold">
                -{dress.discountPercent}%
              </span>
            )}
            {dress.isNew && (
              <span className="tag bg-gold text-white shadow-md">{t('detail.new')}</span>
            )}
            {dress.featured && (
              <span className="tag bg-rose text-white shadow-md">✦</span>
            )}
          </div>

          {/* Wishlist heart */}
          <button
            onClick={e => { e.preventDefault(); toggle(dress.id); }}
            aria-label={wishlisted ? t('wishlist.remove') : t('wishlist.add')}
            aria-pressed={wishlisted}
            className="absolute top-3 end-3 z-10 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm
                       flex items-center justify-center shadow-md transition-all duration-200
                       hover:scale-110 hover:bg-white"
          >
            {wishlisted
              ? <span className="text-rose text-base leading-none">♥</span>
              : <span className="text-ink-muted text-base leading-none">♡</span>
            }
          </button>

          {/* Hover overlay */}
          <Link to={`/dress/${toSlug(dress.nameEn, dress.id)}`}>
            <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent
                            opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col
                            justify-end p-4">
              <span className="text-white font-semibold text-sm tracking-wide translate-y-4
                               group-hover:translate-y-0 transition-transform duration-500">
                {t('catalog.viewDetails')} →
              </span>
            </div>
          </Link>

          {/* Color swatches */}
          <div className="absolute bottom-3 end-3 flex gap-1.5 opacity-0 group-hover:opacity-100
                          transition-all duration-500 translate-y-2 group-hover:translate-y-0">
            {dress.colors.slice(0, 4).map(c => (
              <span
                key={c.hex}
                title={isAr ? c.nameAr : c.nameEn}
                className="w-5 h-5 rounded-full border-2 border-white shadow-md"
                style={{ background: c.hex }}
              />
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          <Link to={`/dress/${toSlug(dress.nameEn, dress.id)}`}>
            <h3 className={`font-semibold text-ink-soft mb-1 truncate ${isAr ? 'font-arabic' : 'font-body'}`}>
              {name}
            </h3>
            <div className="flex items-center justify-between">
              {hasDiscount ? (
                <div className="flex flex-col">
                  <span className="text-xs text-ink-muted line-through leading-tight">
                    {origLabel}{' '}{t('currency')}
                  </span>
                  <span className="text-rose font-bold text-lg leading-tight">
                    {discLabel}{' '}{t('currency')}
                  </span>
                </div>
              ) : (
                <span className="text-rose font-bold text-lg">
                  {origLabel}{' '}{t('currency')}
                </span>
              )}
              <div className="flex gap-1">
                {dress.sizes.slice(0, 3).map(s => (
                  <span key={s} className="text-xs text-ink-muted border border-ink-muted/30
                                           rounded px-1.5 py-0.5">{s}</span>
                ))}
                {dress.sizes.length > 3 && (
                  <span className="text-xs text-ink-muted">+{dress.sizes.length - 3}</span>
                )}
              </div>
            </div>
          </Link>

          {/* Compare toggle */}
          <button
            onClick={() => toggleCompare({ id: dress.id, nameEn: dress.nameEn, nameAr: dress.nameAr, thumb })}
            disabled={!inCompare && compareCount >= 3}
            className={`mt-2 w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg
                        border text-xs font-semibold transition-all duration-200
                        disabled:opacity-30 disabled:cursor-not-allowed
                        ${inCompare
                          ? 'border-rose bg-rose/10 text-rose'
                          : 'border-ink-muted/20 text-ink-muted hover:border-rose hover:text-rose'
                        }`}
          >
            <span>⚖️</span>
            {inCompare ? t('compare.added') : t('compare.add')}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
