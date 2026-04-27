import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t } = useTranslation();

  const links = [
    { to: '/',         label: t('nav.home') },
    { to: '/catalog',  label: t('nav.catalog') },
    { to: '/branches', label: t('nav.branches') },
    { to: '/contact',  label: t('nav.contact') },
  ];

  return (
    <footer className="bg-ink text-white/80">
      {/* Top wave */}
      <div className="h-16 bg-ivory dark:bg-ivory overflow-hidden">
        <svg viewBox="0 0 1440 64" className="w-full h-full" preserveAspectRatio="none">
          <path d="M0,64 C360,0 1080,0 1440,64 L1440,0 L0,0 Z" fill="#1A0A0A" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <div className="mb-4">
              <span className="text-3xl font-display font-bold text-white">Dressy</span>
              <span className="text-gold text-xs tracking-[0.3em] uppercase ms-2">Atelier</span>
            </div>
            <p className="text-white/60 text-sm leading-relaxed">{t('footer.tagline')}</p>
            {/* Social icons */}
            <div className="flex gap-4 mt-6">
              {[
                { label: 'Instagram', icon: '📸', href: 'https://www.instagram.com/dressy.atelier3?igsh=bmx2bzM3dXF5bnRw' },
                { label: 'Facebook',  icon: '📘', href: 'https://www.facebook.com/share/1AGB2vE3iH/?mibextid=wwXIfr' },
                { label: 'WhatsApp',  icon: '💬', href: 'https://wa.me/+201110567539' },
                { label: 'Email',     icon: '✉️', href: 'mailto:dressy.mystore@gmail.com' },
              ].map(s => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-rose flex items-center
                             justify-center text-lg transition-all duration-300 hover:scale-110"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-5 tracking-wide">{t('footer.quickLinks')}</h4>
            <ul className="space-y-3">
              {links.map(l => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className="text-white/60 hover:text-gold transition-colors text-sm flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-gold/50" />
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Follow Us */}
          <div>
            <h4 className="text-white font-semibold mb-5 tracking-wide">{t('footer.followUs')}</h4>
            <div className="space-y-3 text-sm text-white/60">
              <p>@dressyatelier</p>
              <p className="text-white/40 text-xs leading-relaxed">
                Tag us in your Dressy look for a chance to be featured!
              </p>
              {/* Decorative gold line */}
              <div className="w-16 h-0.5 bg-gradient-to-r from-gold to-transparent mt-4" />
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 text-center text-white/40 text-sm">
          {t('footer.rights')}
        </div>
      </div>
    </footer>
  );
}
