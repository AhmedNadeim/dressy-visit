import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const CONTACTS = [
  { icon: '💬', labelKey: 'contact.whatsapp',  href: 'https://wa.me/+201110567539',                                              color: 'bg-[#25D366] hover:bg-[#1faa52]' },
  { icon: '📸', labelKey: 'contact.instagram', href: 'https://www.instagram.com/dressy.atelier3?igsh=bmx2bzM3dXF5bnRw',          color: 'bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 hover:opacity-90' },
  { icon: '📘', labelKey: 'contact.facebook',  href: 'https://www.facebook.com/share/1AGB2vE3iH/?mibextid=wwXIfr',              color: 'bg-[#1877F2] hover:bg-[#145fbc]' },
  { icon: '✉️', labelKey: 'contact.email',     href: 'mailto:dressy.mystore@gmail.com',                                          color: 'bg-rose hover:bg-rose-dark' },
];

export default function Contact() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const [form, setForm] = useState({ name: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSend = () => {
    if (!form.name || !form.message) return;
    const text = encodeURIComponent(`*${form.name}*\n\n${form.message}`);
    window.open(`https://wa.me/+201110567539?text=${text}`, '_blank');
    setSent(true);
  };

  return (
    <main className="min-h-screen bg-ivory pt-20 pb-20">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-rose-dark via-rose to-rose/80 py-24 mb-16">
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, #C9A84C 0%, transparent 50%)' }}
        />
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-block mb-4 text-gold tracking-widest uppercase text-sm font-semibold">
              — {t('contact.title')} —
            </span>
            <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-4">
              {t('contact.title')}
            </h1>
            <p className="text-white/70 text-xl max-w-lg mx-auto">{t('contact.subtitle')}</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

          {/* Contact channels */}
          <motion.div
            initial={{ opacity: 0, x: isAr ? 30 : -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className={`text-2xl font-bold text-ink mb-6 ${isAr ? 'font-arabic' : 'font-display'}`}>
              {t('contact.title')}
            </h2>
            <div className="space-y-4">
              {CONTACTS.map((c, i) => (
                <motion.a
                  key={c.labelKey}
                  href={c.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, x: isAr ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className={`flex items-center gap-4 p-5 rounded-2xl text-white font-semibold
                              shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 ${c.color}`}
                >
                  <span className="text-3xl">{c.icon}</span>
                  <span className="text-base">{t(c.labelKey)}</span>
                  <span className={`ms-auto text-lg transition-transform ${isAr ? 'rotate-180' : ''}`}>→</span>
                </motion.a>
              ))}
            </div>

            {/* Brand message */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
              className="mt-10 p-6 rounded-2xl bg-gradient-to-br from-rose/5 to-gold/10 border border-rose/10"
            >
              <p className="text-5xl mb-3">💖</p>
              <p className={`text-ink-soft leading-relaxed ${isAr ? 'font-arabic' : ''}`}>
                {isAr
                  ? 'يسعدنا مساعدتك في العثور على فستانك المثالي. تواصلي معنا ونحن هنا لخدمتك في أي وقت.'
                  : 'We\'re passionate about helping you look and feel your absolute best. Reach out — we\'re always happy to help you find your perfect dress.'}
              </p>
            </motion.div>
          </motion.div>

          {/* WhatsApp message form */}
          <motion.div
            initial={{ opacity: 0, x: isAr ? -30 : 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="glass-card p-8 shadow-xl">
              <h3 className={`text-xl font-bold text-ink mb-6 ${isAr ? 'font-arabic' : 'font-display'}`}>
                {t('contact.formTitle')}
              </h3>

              {sent ? (
                <div className="text-center py-8">
                  <p className="text-5xl mb-4">🎉</p>
                  <p className="text-ink font-semibold text-lg mb-2">
                    {isAr ? 'شكراً لتواصلك معنا!' : 'Thank you for reaching out!'}
                  </p>
                  <p className="text-ink-muted text-sm">
                    {isAr ? 'سنرد عليك في أقرب وقت ممكن.' : 'We\'ll get back to you as soon as possible.'}
                  </p>
                  <button
                    onClick={() => setSent(false)}
                    className="mt-6 btn-outline"
                  >
                    {isAr ? 'إرسال رسالة أخرى' : 'Send Another Message'}
                  </button>
                </div>
              ) : (
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-ink-soft mb-2">
                      {t('contact.name')}
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-ink-muted/20 bg-white
                                 focus:outline-none focus:border-rose focus:ring-2 focus:ring-rose/20
                                 transition-all text-ink placeholder:text-ink-muted/50"
                      placeholder={isAr ? 'اسمك الكريم' : 'Your name'}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-ink-soft mb-2">
                      {t('contact.message')}
                    </label>
                    <textarea
                      rows={5}
                      value={form.message}
                      onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-ink-muted/20 bg-white
                                 focus:outline-none focus:border-rose focus:ring-2 focus:ring-rose/20
                                 transition-all text-ink placeholder:text-ink-muted/50 resize-none"
                      placeholder={isAr ? 'اكتبي رسالتك هنا...' : 'Tell us what you\'re looking for...'}
                    />
                  </div>
                  <button
                    onClick={handleSend}
                    disabled={!form.name || !form.message}
                    className="w-full py-4 rounded-xl bg-[#25D366] text-white font-bold text-base
                               shadow-lg hover:bg-[#1faa52] transition-all duration-300 hover:scale-105
                               disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                               flex items-center justify-center gap-3"
                  >
                    <span className="text-xl">💬</span>
                    {t('contact.send')}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
