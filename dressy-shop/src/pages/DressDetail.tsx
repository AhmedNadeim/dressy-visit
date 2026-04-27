import { useState, useEffect } from 'react';
import ReactGA from 'react-ga4';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Thumbs, Navigation, FreeMode } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import { BRANCHES } from '../data/dresses';
import { useDress, useDressList } from '../hooks/useDresses';
import { useRecentlyViewed } from '../context/RecentlyViewedContext';
import { toSlug, idFromSlug } from '../utils/slug';
import { getPriceInfo } from '../utils/price';
import DressImage from '../components/DressImage';

// Static fallback for Arabic branch names (backend Branch entity has no nameAr field)
const BRANCH_AR: Record<string, string> = {
  'Maskan Branch':  'فرع الألف مسكن',
  'Tagamoa Branch': 'فرع التجمع الخامس',
  'Abbas Branch':   'فرع عباس العقاد',
};

export default function DressDetail() {
  const { slug } = useParams<{ slug: string }>();
  const id = slug ? idFromSlug(slug) : undefined;
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isAr = i18n.language === 'ar';

  const { dress, loading, error } = useDress(id);
  const { dresses: allDresses }   = useDressList();
  const { add: addRecentlyViewed } = useRecentlyViewed();

  // Scroll to top whenever the dress id changes (navigating from related dresses)
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [id]);

  useEffect(() => {
    if (dress) {
      addRecentlyViewed(dress.id);
      ReactGA.event({ category: 'Dress', action: 'View', label: dress.nameEn });
    }
  }, [dress?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Dynamic SEO: title, OG tags, Schema.org
  useEffect(() => {
    if (!dress) return;

    const siteName = 'Dressy Atelier';
    const title = `${dress.nameEn} | ${siteName}`;
    const description = dress.descriptionEn || `${dress.nameEn} — elegant dress available at ${siteName}`;
    const image = [...dress.images].sort((a, b) => a.sortOrder - b.sortOrder)[0]?.url ?? '';
    const url = `${window.location.origin}/dress/${toSlug(dress.nameEn, dress.id)}`;

    document.title = title;

    const setMeta = (selector: string, attrName: string, attrValue: string, content: string) => {
      let el = document.querySelector<HTMLMetaElement>(selector);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attrName, attrValue);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    setMeta('meta[name="description"]',          'name',     'description',       description);
    setMeta('meta[property="og:title"]',          'property', 'og:title',          title);
    setMeta('meta[property="og:description"]',    'property', 'og:description',    description);
    setMeta('meta[property="og:image"]',          'property', 'og:image',          image);
    setMeta('meta[property="og:url"]',            'property', 'og:url',            url);
    setMeta('meta[property="og:type"]',           'property', 'og:type',           'product');
    setMeta('meta[property="og:site_name"]',      'property', 'og:site_name',      siteName);
    setMeta('meta[name="twitter:card"]',          'name',     'twitter:card',      'summary_large_image');
    setMeta('meta[name="twitter:title"]',         'name',     'twitter:title',     title);
    setMeta('meta[name="twitter:description"]',   'name',     'twitter:description', description);
    setMeta('meta[name="twitter:image"]',         'name',     'twitter:image',     image);

    const schema = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: dress.nameEn,
      description,
      image: dress.images.map(i => i.url),
      brand: { '@type': 'Brand', name: siteName },
      offers: {
        '@type': 'Offer',
        priceCurrency: 'EGP',
        price: dress.priceFrom ?? 0,
        availability: dress.availabilities.length > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
        url,
      },
    };

    let scriptEl = document.getElementById('schema-product') as HTMLScriptElement | null;
    if (!scriptEl) {
      scriptEl = document.createElement('script');
      scriptEl.id = 'schema-product';
      scriptEl.type = 'application/ld+json';
      document.head.appendChild(scriptEl);
    }
    scriptEl.textContent = JSON.stringify(schema);

    return () => {
      document.title = siteName;
      document.getElementById('schema-product')?.remove();
    };
  }, [dress?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const [thumbsSwiper,     setThumbsSwiper]     = useState<SwiperType | null>(null);
  const [selectedSize,     setSelectedSize]     = useState('');
  const [selectedColor,    setSelectedColor]    = useState('');
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);

  // Auto-select the first availability entry when the dress loads or changes
  useEffect(() => {
    if (!dress) return;
    const first = dress.availabilities[0];
    if (first) {
      setSelectedColor(first.colorHex);
      setSelectedSize(first.sizes[0] ?? '');
      setSelectedBranchId(first.branchId);
    } else if (dress.colors.length > 0) {
      setSelectedColor(dress.colors[0].hex);
      setSelectedSize('');
      setSelectedBranchId(null);
    }
  }, [dress?.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ivory pt-16">
        <span className="w-10 h-10 border-2 border-rose/30 border-t-rose rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !dress) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ivory pt-16">
        <div className="text-center">
          <p className="text-6xl mb-4">👗</p>
          <p className="text-ink-muted text-xl mb-6">{error || 'Dress not found.'}</p>
          <Link to="/catalog" className="btn-primary">{t('detail.backToCatalog')}</Link>
        </div>
      </div>
    );
  }

  const name        = isAr ? dress.nameAr : dress.nameEn;
  const description = isAr ? dress.descriptionAr : dress.descriptionEn;

  const sortedImages = [...dress.images].sort((a, b) => a.sortOrder - b.sortOrder);

  const selectedColorObj = dress.colors.find(c => c.hex.toLowerCase() === selectedColor.toLowerCase());

  // Availability filtered by selected color & size (case-insensitive hex comparison)
  const availForColor = dress.availabilities.filter(a =>
    !selectedColor || a.colorHex.toLowerCase() === selectedColor.toLowerCase()
  );
  const availForSelection = availForColor.filter(a =>
    !selectedSize || a.sizes.length === 0 || a.sizes.map(s => s.trim()).includes(selectedSize.trim())
  );

  const { origLabel, discLabel, hasDiscount } = getPriceInfo(dress);
  const priceLabel = `${origLabel} ${t('currency')}`;

  // Derive weight from the best-matching availability entry.
  // Priority: branch + color + size → color + size → branch + color → color → first
  const weightEntry = selectedBranchId
    ? availForSelection.find(a => a.branchId === selectedBranchId)
      ?? availForColor.find(a => a.branchId === selectedBranchId)
      ?? availForSelection[0]
    : availForSelection[0] ?? availForColor[0];
  const entryWeight = weightEntry?.weightFrom ?? null;

  // Sizes available for the current color — narrowed to selected branch if one is chosen
  const sizesForSelection = [...new Set(
    (selectedBranchId
      ? availForColor.filter(a => a.branchId === selectedBranchId)
      : availForColor
    ).flatMap(a => a.sizes)
  )].sort();

  // In-stock branches for current color+size selection
  const inStockBranches = Array.from(new Set(dress.availabilities.map(a => a.branchId)))
    .filter(branchId => {
      const entries = availForColor.filter(a => a.branchId === branchId);
      return entries.some(a =>
        !selectedSize || a.sizes.length === 0 || a.sizes.map(s => s.trim()).includes(selectedSize.trim())
      );
    })
    .map(branchId => {
      const branchName = dress.availabilities.find(a => a.branchId === branchId)?.branchName ?? '';
      const staticBranch = BRANCHES.find(b =>
        b.nameEn.toLowerCase().includes(branchName.toLowerCase().split(' ')[0])
      );
      return { branchId, branchName, staticBranch };
    });

  const selectedBranchEntry = inStockBranches.find(b => b.branchId === selectedBranchId);
  const whatsappPhone = selectedBranchEntry?.staticBranch?.phone
    ?? inStockBranches[0]?.staticBranch?.phone
    ?? '01110567539';

  const dressUrl = `${window.location.origin}/dress/${toSlug(dress.nameEn, dress.id)}`;

  const branchLabel = selectedBranchEntry
    ? (isAr
        ? (BRANCH_AR[selectedBranchEntry.branchName] ?? selectedBranchEntry.branchName)
        : selectedBranchEntry.branchName)
    : (isAr ? 'لم يُحدد' : 'Not specified');

  const whatsappMsg = isAr
    ? `مرحباً Dressy Atelier! 👗\n\nأريد الاستفسار عن هذا الفستان:\n🔗 ${dressUrl}\n\n• الفستان: ${dress.nameAr} / ${dress.nameEn}\n• اللون: ${selectedColorObj ? `${selectedColorObj.nameAr} / ${selectedColorObj.nameEn}` : 'لم يُحدد'}\n• المقاس: ${selectedSize || 'لم يُحدد'}\n• الفرع: ${branchLabel}\n• السعر: ${priceLabel}\n\nشكراً! 🙏`
    : `Hi Dressy Atelier! 👗\n\nI'm interested in this dress:\n🔗 ${dressUrl}\n\n• Dress: ${dress.nameEn} / ${dress.nameAr}\n• Color: ${selectedColorObj ? `${selectedColorObj.nameEn} / ${selectedColorObj.nameAr}` : 'TBD'}\n• Size: ${selectedSize || 'TBD'}\n• Branch: ${branchLabel}\n• Price: ${priceLabel}\n\nThank you! 🙏`;

  const whatsappText = encodeURIComponent(whatsappMsg);

  const relatedDresses = allDresses
    .filter(d => d.id !== dress.id && d.category === dress.category)
    .slice(0, 4);

  return (
    <main className="min-h-screen bg-ivory pt-20 pb-20">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">

        {/* Breadcrumb */}
        <nav className="py-6 flex items-center gap-2 text-sm text-ink-muted">
          <Link to="/" className="hover:text-rose transition-colors">{t('nav.home')}</Link>
          <span>/</span>
          <Link to="/catalog" className="hover:text-rose transition-colors">{t('nav.catalog')}</Link>
          <span>/</span>
          <span className="text-ink font-semibold truncate">{name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Gallery */}
          <motion.div
            initial={{ opacity: 0, x: isAr ? 30 : -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            {sortedImages.length > 0 && (
              <>
                <Swiper
                  modules={[Thumbs, Navigation]}
                  thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
                  navigation
                  className="rounded-2xl overflow-hidden shadow-xl mb-3"
                >
                  {sortedImages.map((img, i) => (
                    <SwiperSlide key={i}>
                      <div className="aspect-[3/4] overflow-hidden">
                        <DressImage src={img.url} alt={`${name} ${i + 1}`} className="w-full h-full object-cover" />
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>

                {sortedImages.length > 1 && (
                  <Swiper
                    modules={[FreeMode, Thumbs]}
                    onSwiper={setThumbsSwiper}
                    freeMode
                    watchSlidesProgress
                    spaceBetween={8}
                    slidesPerView={3}
                    className="thumbnail-swiper"
                  >
                    {sortedImages.map((img, i) => (
                      <SwiperSlide key={i} className="cursor-pointer rounded-lg overflow-hidden opacity-60 hover:opacity-100 transition-opacity">
                        <div className="aspect-[3/4]">
                          <DressImage src={img.url} alt="" className="w-full h-full object-cover" />
                        </div>
                      </SwiperSlide>
                    ))}
                  </Swiper>
                )}
              </>
            )}
          </motion.div>

          {/* Product info */}
          <motion.div
            initial={{ opacity: 0, x: isAr ? -30 : 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col gap-6"
          >
            {/* Badges + name */}
            <div>
              <div className="flex flex-wrap gap-2 mb-3">
                {dress.discountPercent != null && dress.discountPercent > 0 && (
                  <span className="tag bg-red-500 text-white font-bold tracking-wide">
                    SALE -{dress.discountPercent}%
                  </span>
                )}
                {dress.isNew && (
                  <span className="tag bg-gold text-white">{t('detail.new')}</span>
                )}
                <span className="tag bg-rose/10 text-rose capitalize">
                  {dress.category}
                </span>
                {dress.material && (
                  <span className="tag bg-ink/5 text-ink-soft">{dress.material}</span>
                )}
              </div>
              <h1 className={`text-3xl md:text-4xl font-bold text-ink mb-2 ${isAr ? 'font-arabic' : 'font-display'}`}>
                {name}
              </h1>
              {hasDiscount ? (
                <div className="flex items-baseline gap-3">
                  <p className="text-3xl font-bold text-rose">
                    {discLabel}{' '}<span className="text-lg font-normal">{t('currency')}</span>
                  </p>
                  <p className="text-lg text-ink-muted line-through">
                    {origLabel}{' '}{t('currency')}
                  </p>
                </div>
              ) : (
                <p className="text-3xl font-bold text-rose">
                  {origLabel}{' '}<span className="text-lg font-normal">{t('currency')}</span>
                </p>
              )}
              <p className={`text-xs text-ink-muted/70 mt-2 italic ${isAr ? 'font-arabic' : ''}`}>
                {t('detail.rentalHint')}
              </p>
            </div>

            {/* Description */}
            {description && (
              <p className={`text-ink-muted leading-relaxed ${isAr ? 'font-arabic' : ''}`}>{description}</p>
            )}

            {/* Color selector */}
            {dress.colors.length > 0 && (
              <div>
                <h3 className="font-semibold text-ink mb-3 text-sm uppercase tracking-wide">
                  {t('detail.color')}
                  {selectedColorObj && (
                    <span className="ms-2 font-normal text-ink-muted normal-case">
                      — {isAr ? selectedColorObj.nameAr : selectedColorObj.nameEn}
                    </span>
                  )}
                </h3>
                <div className="flex gap-3 flex-wrap">
                  {dress.colors.map(c => (
                    <button
                      key={c.hex}
                      onClick={() => setSelectedColor(c.hex)}
                      title={isAr ? c.nameAr : c.nameEn}
                      className={`w-9 h-9 rounded-full border-4 transition-all duration-300 hover:scale-110 ${
                        selectedColor === c.hex ? 'border-rose scale-110 shadow-lg' : 'border-white shadow-md'
                      }`}
                      style={{ background: c.hex }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Available Sizes */}
            {sizesForSelection.length > 0 && (
              <div>
                <h3 className="font-semibold text-ink mb-3 text-sm uppercase tracking-wide">
                  {isAr ? 'المقاسات المتاحة' : 'Available Sizes'}
                  {selectedBranchId && selectedBranchEntry && (
                    <span className="ms-2 font-normal text-ink-muted normal-case text-xs">
                      — {isAr ? (BRANCH_AR[selectedBranchEntry.branchName] ?? selectedBranchEntry.branchName) : selectedBranchEntry.branchName}
                    </span>
                  )}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {sizesForSelection.map(s => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(selectedSize === s ? '' : s)}
                      className={`w-12 h-12 rounded-xl border-2 font-semibold text-sm transition-all duration-200 ${
                        selectedSize === s
                          ? 'bg-rose border-rose text-white shadow-md'
                          : 'border-gray-200 text-ink-soft hover:border-rose hover:text-rose'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Availability by Location */}
            {dress.availabilities.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-ink text-sm uppercase tracking-wide">
                    {t('detail.availableAt')}
                  </h3>
                  <span className="text-xs text-ink-muted">{t('detail.selectBranch')}</span>
                </div>
                {(selectedColor || selectedSize) && (
                  <p className="text-xs text-ink-muted mb-1">
                    {availForSelection.length} location{availForSelection.length !== 1 ? 's' : ''} found
                    {selectedColorObj && ` for ${isAr ? selectedColorObj.nameAr : selectedColorObj.nameEn}`}
                    {selectedSize && `, size ${selectedSize}`}
                  </p>
                )}
                {entryWeight && (
                  <p className="text-xs text-ink-muted mb-3">
                    {isAr ? `⚖️ مناسبة لوزن ${entryWeight} كجم` : `⚖️ Fit to ${entryWeight} kg`}
                  </p>
                )}
                <div className="rounded-2xl border border-gold/20 overflow-hidden">
                  {Array.from(new Set(dress.availabilities.map(a => a.branchId))).map(branchId => {
                    const branchEntries = availForColor.filter(a => a.branchId === branchId);
                    const inStock = branchEntries.some(a =>
                      !selectedSize || a.sizes.length === 0 || a.sizes.map(s => s.trim()).includes(selectedSize.trim())
                    );
                    const branchName = dress.availabilities.find(a => a.branchId === branchId)?.branchName ?? '';
                    const displayName = isAr ? (BRANCH_AR[branchName] ?? branchName) : branchName;
                    const isSelected = selectedBranchId === branchId;

                    return (
                      <button
                        key={branchId}
                        disabled={!inStock}
                        onClick={() => setSelectedBranchId(isSelected ? null : branchId)}
                        className={`w-full flex items-center justify-between px-4 py-3 border-b border-gold/10
                                    last:border-0 text-start transition-all duration-200
                                    ${inStock ? 'cursor-pointer hover:bg-rose/5' : 'cursor-not-allowed opacity-60'}
                                    ${isSelected ? 'bg-rose/10 border-s-2 border-s-rose' : ''}`}
                      >
                        <span className="flex items-center gap-2 text-sm text-ink-soft">
                          {isSelected ? '✅' : '📍'} {displayName}
                        </span>
                        {inStock ? (
                          <span className="flex items-center gap-1.5 text-green-600 text-xs font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                            {isAr ? 'متوفر' : 'In Stock'}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-red-400 text-xs font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                            {isAr ? 'غير متوفر' : 'Out of Stock'}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
                {selectedBranchId && (
                  <p className="text-xs text-rose mt-2 font-medium">
                    {isAr ? '✓ سيتم تضمين الفرع المختار في رسالة واتساب' : '✓ Selected branch will be included in your WhatsApp message'}
                  </p>
                )}
              </div>
            )}

            {/* Extras */}
            {dress.extras.length > 0 && (
              <div>
                <h3 className="font-semibold text-ink mb-3 text-sm uppercase tracking-wide">
                  Extras & Accessories
                </h3>
                <div className="flex flex-wrap gap-2">
                  {dress.extras.map((ex, i) => (
                    <span key={i} className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-rose/5 border border-rose/20 text-sm text-ink-soft">
                      ✦ {isAr ? ex.nameAr : ex.nameEn}
                      {ex.price != null && (
                        <span className="text-rose font-semibold ms-1">+{ex.price.toLocaleString()} {t('currency')}</span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <a
                href={`https://wa.me/+2${whatsappPhone}?text=${whatsappText}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => ReactGA.event({ category: 'Dress', action: 'WhatsApp Enquiry', label: dress.nameEn })}
                className="flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl
                           bg-[#25D366] text-white font-bold text-base shadow-lg
                           hover:bg-[#1faa52] transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                <span className="text-xl">💬</span>
                {t('detail.whatsapp')}
              </a>
              <button
                onClick={() => navigate(-1)}
                className="px-6 py-4 rounded-2xl border-2 border-rose/30 text-rose font-semibold
                           hover:bg-rose hover:text-white transition-all duration-300"
              >
                ← {t('detail.backToCatalog')}
              </button>
            </div>
          </motion.div>
        </div>

        {/* Related dresses */}
        {relatedDresses.length > 0 && (
          <section className="mt-20">
            <h2 className="section-title mb-10">{isAr ? 'قد يعجبك أيضاً' : 'You May Also Like'}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedDresses.map(d => (
                <div
                  key={d.id}
                  onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); navigate(`/dress/${toSlug(d.nameEn, d.id)}`); }}
                  className="cursor-pointer"
                >
                  <div className="dress-card">
                    <div className="aspect-[3/4] overflow-hidden">
                      <DressImage
                        src={d.images.find(i => i.sortOrder === 0)?.url ?? d.images[0]?.url ?? ''}
                        alt={isAr ? d.nameAr : d.nameEn}
                        className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                      />
                    </div>
                    <div className="p-4">
                      <p className="font-semibold text-ink-soft truncate text-sm">{isAr ? d.nameAr : d.nameEn}</p>
                      <p className="text-rose font-bold">
                        {d.priceFrom != null ? d.priceFrom.toLocaleString() : '—'} {t('currency')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
