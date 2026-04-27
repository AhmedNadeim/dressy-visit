// HeroSlider.tsx — Variant A: Editorial Left

import { useRef, useState, useEffect, useCallback } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

/* ─── Slide data ─────────────────────────────────────────────────── */
const SLIDES = [


 {
    image: 'https://res.cloudinary.com/douloilcb/image/upload/v1776623921/WhatsApp_Image_2026-04-19_at_8.54.32_PM_4_sfxsoy.jpg',
    overlayFrom: 'from-gold-dark/70',
    badgeKey: 'hero.badge3',
    title1Key: 'hero.slide3Title1',
    title2Key: 'hero.slide3Title2',
    title3Key: 'hero.slide3Title3',
    subtitleKey: 'hero.slide3Subtitle',
    cta1Key: 'hero.cta',
    cta1To: '/catalog',
    cta2Key: 'hero.ctaSecondary',
    cta2To: '/branches',
  },
  {
    image: 'https://res.cloudinary.com/douloilcb/image/upload/v1776882917/slide2-enhanced_h3qq7p.png',
    overlayFrom: 'from-rose-dark/60',
    badgeKey: 'hero.badge2',
    title1Key: 'hero.slide2Title1',
    title2Key: 'hero.slide2Title2',
    title3Key: 'hero.slide2Title3',
    subtitleKey: 'hero.slide2Subtitle',
    cta1Key: 'hero.slide2Cta',
    cta1To: '/catalog?category=evening',
    cta2Key: 'hero.ctaSecondary',
    cta2To: '/branches',
  }
 
];

const SLIDE_DURATION = 5000;

/* ─── Component ─────────────────────────────────────────────────── */
export default function HeroSlider() {
  const { t } = useTranslation();
  const swiperRef = useRef<SwiperType | null>(null);
  const [current, setCurrent] = useState(0);
  const [fillKey, setFillKey] = useState(0); // re-mount to restart animation
  const total = SLIDES.length;

  const handleSlideChange = useCallback((swiper: SwiperType) => {
    setCurrent(swiper.realIndex);
    setFillKey(k => k + 1);
  }, []);

  const goTo = (i: number) => swiperRef.current?.slideToLoop(i);
  const prev = () => swiperRef.current?.slidePrev();
  const next = () => swiperRef.current?.slideNext();

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const pad = (n: number) => String(n + 1).padStart(2, '0');

  return (
    <section className="relative h-screen min-h-[600px] overflow-hidden">

      {/* ── Swiper (images only) ── */}
      <Swiper
        onSwiper={s => { swiperRef.current = s; }}
        modules={[Autoplay, EffectFade]}
        effect="fade"
        autoplay={{ delay: SLIDE_DURATION, disableOnInteraction: false }}
        loop
        speed={900}
        onSlideChange={handleSlideChange}
        className="absolute inset-0 h-full w-full"
      >
        {SLIDES.map((slide, i) => (
          <SwiperSlide key={i} className="relative h-full overflow-hidden">
            {/* Ken Burns image */}
            <div
              className="absolute inset-[-5%] bg-cover bg-center animate-kenburns"
              style={{ backgroundImage: `url(${slide.image})` }}
            />
            {/* Gradient overlays */}
            <div className={`absolute inset-0 bg-gradient-to-r ${slide.overlayFrom} via-ink/30 to-transparent`} />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent" />
          </SwiperSlide>
        ))}
      </Swiper>

      {/* ── Big outline title — slide 0 only ── */}
      <AnimatePresence>
        {current === 0 && (
          <motion.div
            key="big-title"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.04 }}
            transition={{ duration: 0.7 }}
            className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center"
          >
            <span
              className="block font-display font-bold uppercase text-transparent leading-none"
              style={{
                fontSize: 'clamp(60px, 9vw, 130px)',
                WebkitTextStroke: '1.5px rgba(201,168,76,0.65)',
                letterSpacing: '8px',
              }}
            >
              
            </span>
            {/* <p className="mt-2 text-[11px] tracking-[6px] uppercase text-white/50">
              Elegant Dresses For Every Occasion
            </p> */}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Per-slide content ── */}
      <div className="pointer-events-none absolute inset-0 z-20 flex items-center">
        <div className="w-full max-w-7xl mx-auto px-6 lg:px-20">
          <AnimatePresence mode="wait">
            {SLIDES.map((slide, i) =>
              i === current ? (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 32 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.65, ease: 'easeOut' }}
                  className="max-w-xl"
                >
                  {/* Badge */}
                  <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-gold/40
                                   bg-gold/15 px-5 py-2 text-[11px] font-semibold uppercase tracking-widest
                                   text-gold backdrop-blur-sm">
                    ✦ {t(slide.badgeKey, { defaultValue: '✦ New Collection 2025 ✦' })} ✦
                  </span>

                  {/* Headline */}
                  <h1 className="mb-6 font-display font-bold leading-[1.08] text-white"
                      style={{ fontSize: 'clamp(44px, 5.5vw, 80px)' }}>
                    {t(slide.title1Key, { defaultValue: 'Wear Your' })}
                    <em className="block italic text-gold">
                      {t(slide.title2Key, { defaultValue: 'Most Beautiful' })}
                    </em>
                    {t(slide.title3Key, { defaultValue: 'Moment' })}
                  </h1>

                  {/* Subtitle */}
                  <p className="mb-10 max-w-md font-body text-lg leading-relaxed text-white/75">
                    {t(slide.subtitleKey, { defaultValue: 'Exclusively crafted dresses for every occasion — elegance, redefined.' })}
                  </p>

                  {/* CTAs */}
                  <div className="pointer-events-auto flex flex-wrap gap-4">
                    <Link to={slide.cta1To} className="btn-gold text-base shadow-2xl">
                      {t(slide.cta1Key, { defaultValue: 'Explore Collection' })}
                    </Link>
                    <Link
                      to={slide.cta2To}
                      className="inline-flex items-center gap-2 rounded-full border-2 border-white/70
                                 px-8 py-3 text-base font-semibold text-white transition-all duration-300
                                 hover:scale-105 hover:bg-white hover:text-rose"
                    >
                      {t(slide.cta2Key, { defaultValue: 'Visit a Branch' })}
                    </Link>
                  </div>
                </motion.div>
              ) : null
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Slide counter (right) ── */}
      <div className="pointer-events-none absolute right-10 top-1/2 z-30 flex -translate-y-1/2 flex-col items-center gap-3">
        <span className="font-display text-[42px] font-bold leading-none text-white">
          {pad(current)}
        </span>
        <div className="h-10 w-px bg-white/30" />
        <span className="text-base font-light text-white/45">{pad(total - 1)}</span>
      </div>

      {/* ── Custom arrows ── */}
      <button
        onClick={prev}
        aria-label="Previous slide"
        className="absolute left-7 top-1/2 z-30 flex h-13 w-13 -translate-y-1/2 items-center justify-center
                   rounded-full border border-white/30 bg-black/25 text-xl text-white backdrop-blur-sm
                   transition-all duration-300 hover:scale-110 hover:border-gold hover:bg-gold"
      >
        ‹
      </button>
      <button
        onClick={next}
        aria-label="Next slide"
        className="absolute right-20 top-1/2 z-30 flex h-13 w-13 -translate-y-1/2 items-center justify-center
                   rounded-full border border-white/30 bg-black/25 text-xl text-white backdrop-blur-sm
                   transition-all duration-300 hover:scale-110 hover:border-gold hover:bg-gold"
      >
        ›
      </button>

      {/* ── Gold progress bar ── */}
      <div className="absolute bottom-0 left-0 right-0 z-30 flex">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className="relative h-[3px] flex-1 overflow-hidden bg-white/20"
            aria-label={`Go to slide ${i + 1}`}
          >
            {i < current && (
              <span className="absolute inset-0 bg-gold" />
            )}
            {i === current && (
              <span
                key={fillKey}
                className="absolute left-0 top-0 bottom-0 bg-gold"
                style={{
                  animation: `progressFill ${SLIDE_DURATION}ms linear forwards`,
                }}
              />
            )}
          </button>
        ))}
      </div>

      {/* ── Scroll indicator ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6 }}
        className="pointer-events-none absolute bottom-10 left-20 z-30 flex items-center gap-3 opacity-60"
      >
        <div className="h-12 w-px animate-pulse bg-gradient-to-b from-transparent to-white" />
        <span
          className="text-[10px] uppercase tracking-[3px] text-white"
          style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
        >
          Scroll
        </span>
      </motion.div>

    </section>
  );
}
