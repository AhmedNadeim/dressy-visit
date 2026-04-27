import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useWishlist } from '../context/WishlistContext';
import SearchOverlay from './SearchOverlay';

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [scrolled,    setScrolled]    = useState(false);
  const [menuOpen,    setMenuOpen]    = useState(false);
  const [searchOpen,  setSearchOpen]  = useState(false);
  const isAr = i18n.language === 'ar';
  const { count: wishlistCount } = useWishlist();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close menu + search on route change
  useEffect(() => { setMenuOpen(false); setSearchOpen(false); }, [location]);

  // Prevent body scroll when search is open
  useEffect(() => {
    document.body.style.overflow = searchOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [searchOpen]);

  const toggleLang = () => {
    const next = isAr ? 'en' : 'ar';
    i18n.changeLanguage(next);
    document.documentElement.dir = next === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = next;
  };

  useEffect(() => {
    document.documentElement.dir = isAr ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [isAr, i18n.language]);

  const links = [
    { to: '/',          label: t('nav.home') },
    { to: '/catalog',   label: t('nav.catalog') },
    { to: '/wishlist',  label: t('nav.wishlist') },
    { to: '/branches',  label: t('nav.branches') },
    { to: '/contact',   label: t('nav.contact') },
  ];

  const isHome = location.pathname === '/';
  const transparent = isHome && !scrolled && !menuOpen;

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
          transparent
            ? 'bg-transparent'
            : 'bg-white/95 backdrop-blur-md shadow-md'
        }`}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-4 group">
            <img
              src="https://res.cloudinary.com/douloilcb/image/upload/v1776777867/Logo_p4vksa.png"
              alt="Dressy Atelier"
              className={`h-10 w-auto object-contain mix-blend-multiply transition-all duration-500 ${
                transparent ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
              }`}
            />
            <span className={`text-2xl font-display font-bold tracking-wide transition-colors ${
              transparent ? 'text-white' : 'text-rose'
            }`}>
              Dressy
            </span>
            <span className={`text-xs font-body tracking-[0.3em] uppercase transition-colors ${
              transparent ? 'text-gold-light' : 'text-gold'
            }`}>
              Atelier
            </span>
          </Link>

          {/* Desktop links */}
          <ul className="hidden md:flex items-center gap-8">
            {links.map(l => (
              <li key={l.to}>
                <Link
                  to={l.to}
                  className={`relative text-sm font-semibold tracking-wide transition-colors group ${
                    transparent ? 'text-white/90 hover:text-white' : 'text-ink-soft hover:text-rose'
                  }`}
                >
                  {l.label}
                  <span className={`absolute -bottom-1 left-0 h-0.5 bg-gold transition-all duration-300 ${
                    location.pathname === l.to ? 'w-full' : 'w-0 group-hover:w-full'
                  }`} />
                </Link>
              </li>
            ))}
          </ul>

          {/* Right controls */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <button
              onClick={() => setSearchOpen(true)}
              aria-label={t('search.open')}
              className={`p-1.5 transition-colors ${
                transparent ? 'text-white hover:text-gold-light' : 'text-ink-soft hover:text-rose'
              }`}
            >
              <span className="text-lg leading-none">🔍</span>
            </button>

            {/* Wishlist */}
            <Link
              to="/wishlist"
              aria-label={t('wishlist.title')}
              className={`relative p-1.5 transition-colors ${
                transparent ? 'text-white hover:text-gold-light' : 'text-ink-soft hover:text-rose'
              }`}
            >
              <span className="text-xl leading-none">♡</span>
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -end-1 w-4 h-4 rounded-full bg-rose text-white
                                 text-[10px] font-bold flex items-center justify-center leading-none">
                  {wishlistCount > 9 ? '9+' : wishlistCount}
                </span>
              )}
            </Link>

            <button
              onClick={toggleLang}
              className={`text-sm font-semibold px-4 py-1.5 rounded-full border transition-all duration-300 ${
                transparent
                  ? 'border-white/50 text-white hover:bg-white hover:text-rose'
                  : 'border-rose/30 text-rose hover:bg-rose hover:text-white'
              }`}
            >
              {t('nav.langToggle')}
            </button>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMenuOpen(v => !v)}
              className={`md:hidden flex flex-col gap-1.5 p-1.5 transition-colors ${
                transparent ? 'text-white' : 'text-ink'
              }`}
              aria-label="Menu"
            >
              <span className={`block w-6 h-0.5 bg-current transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`block w-6 h-0.5 bg-current transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
              <span className={`block w-6 h-0.5 bg-current transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </button>
          </div>
        </nav>

        {/* Mobile menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden bg-white border-t border-rose/10 overflow-hidden"
            >
              {/* Mobile search bar */}
              <div className="px-6 pt-4">
                <button
                  onClick={() => { setMenuOpen(false); setSearchOpen(true); }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-ivory
                             border border-gold/20 text-ink-muted text-sm"
                >
                  <span>🔍</span>
                  <span>{t('search.placeholder')}</span>
                </button>
              </div>
              <ul className="px-6 py-4 flex flex-col gap-4">
                {links.map(l => (
                  <li key={l.to}>
                    <Link
                      to={l.to}
                      className={`block text-base font-semibold py-2 border-b border-rose/10 transition-colors ${
                        location.pathname === l.to ? 'text-rose' : 'text-ink-soft hover:text-rose'
                      }`}
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Search overlay — rendered outside header so it covers the whole page */}
      <AnimatePresence>
        {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
      </AnimatePresence>
    </>
  );
}
