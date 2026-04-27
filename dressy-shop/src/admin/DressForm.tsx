import { useState, useEffect, useRef, type FormEvent } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { COLOR_PALETTE } from '../data/dresses';
import CloudinaryUpload from '../components/CloudinaryUpload';
import { shopDressApi, branchApi, type BranchLite } from '../api/client';

// ── Constants ───────────────────────────────────────────────────────────────
const ALL_SIZES      = ['44', '46', '48', '50', '52', '54', '56', '58'];
const ALL_CATEGORIES = ['simple', 'handmade', 'winter'] as const;
const CATEGORY_LABEL: Record<string, string> = {
  simple:   'Simple',
  handmade: 'Handmade',
  winter:   'Winter Collection',
};


// ── Types ────────────────────────────────────────────────────────────────────
interface Color { nameEn: string; nameAr: string; hex: string; }
interface Extra { nameEn: string; nameAr: string; price: string; }
interface AvailEntry { branchId: number; colorHex: string; sizes: string[]; quantity: number; weightFrom: string; }

interface FormState {
  nameEn:    string;
  nameAr:    string;
  descEn:    string;
  descAr:    string;
  priceFrom: string;
  priceTo:   string;
  discount:  string;
  category:  string;
  sizes:     string[];
  colors:    Color[];
  extras:    Extra[];
  images:    string[];
  availabilities: AvailEntry[];
  featured:  boolean;
  isNew:     boolean;
}

function emptyForm(): FormState {
  return {
    nameEn: '', nameAr: '', descEn: '', descAr: '',
    priceFrom: '', priceTo: '', discount: '',
    category: 'simple',
    sizes: [], colors: [],
    extras: [], images: [], availabilities: [],
    featured: false, isNew: false,
  };
}

// ── UI helpers ───────────────────────────────────────────────────────────────
function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50">
        <span className="text-xl">{icon}</span>
        <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wide">{title}</h3>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}
function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-sm font-semibold text-gray-600 mb-1.5">{children}</label>;
}
function Input({ className = '', ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-800
                  focus:outline-none focus:border-rose focus:ring-2 focus:ring-rose/20
                  transition-all placeholder:text-gray-300 ${className}`}
    />
  );
}
function Textarea({ className = '', ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-800
                  focus:outline-none focus:border-rose focus:ring-2 focus:ring-rose/20
                  transition-all placeholder:text-gray-300 resize-none ${className}`}
    />
  );
}

// ── Image Drag-and-Drop Section ──────────────────────────────────────────────
interface ImageSectionProps {
  images: string[];
  onChange: (images: string[]) => void;
  onRemove: (url: string) => void;
  onUpload: (url: string) => void;
}

function ImageSection({ images, onChange, onRemove, onUpload }: ImageSectionProps) {
  const draggingIdx = useRef<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const [dragging,    setDragging]    = useState<number | null>(null);

  const handleDragStart = (idx: number) => {
    draggingIdx.current = idx;
    setDragging(idx);
  };

  const handleDragEnd = () => {
    draggingIdx.current = null;
    setDragging(null);
    setDragOverIdx(null);
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (draggingIdx.current !== null && draggingIdx.current !== idx) {
      setDragOverIdx(idx);
    }
  };

  const handleDrop = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    const from = draggingIdx.current;
    if (from === null || from === idx) return;
    const next = [...images];
    const [moved] = next.splice(from, 1);
    next.splice(idx, 0, moved);
    onChange(next);
    draggingIdx.current = null;
    setDragging(null);
    setDragOverIdx(null);
  };

  return (
    <Section title="Dress Images" icon="🖼️">
      <p className="text-gray-400 text-xs mb-1">
        Upload up to 5 photos. <strong className="text-gray-500">Drag to reorder</strong> — the first image is the cover photo shown on all cards.
      </p>

      {images.length > 0 && (
        <>
          {/* Instruction strip */}
          <div className="flex items-center gap-2 mb-4 mt-2 px-3 py-2 bg-rose/5 border border-rose/15 rounded-xl">
            <span className="text-rose text-sm">⠿</span>
            <p className="text-xs text-rose/80 font-medium">
              Drag the cards below to set the display order. The card marked <strong>COVER</strong> will be the main thumbnail.
            </p>
          </div>

          <div
            className="flex flex-wrap gap-4 mb-5"
            onDragLeave={() => setDragOverIdx(null)}
          >
            {images.map((url, i) => (
              <div
                key={url}
                draggable
                onDragStart={() => handleDragStart(i)}
                onDragEnd={handleDragEnd}
                onDragOver={e => handleDragOver(e, i)}
                onDrop={e => handleDrop(e, i)}
                className={`relative group rounded-xl border-2 transition-all duration-200 cursor-grab active:cursor-grabbing select-none
                  ${dragging === i
                    ? 'opacity-30 scale-95 border-dashed border-gray-300 shadow-none'
                    : dragOverIdx === i
                      ? 'border-rose scale-105 shadow-lg shadow-rose/20 ring-2 ring-rose/30'
                      : 'border-gray-200 hover:border-rose/40 shadow-sm hover:shadow-md'
                  }`}
              >
                {/* Thumbnail */}
                <img
                  src={url}
                  alt={`Dress image ${i + 1}`}
                  className="w-28 h-36 object-cover rounded-[10px] block"
                  draggable={false}
                />

                {/* Cover badge */}
                {i === 0 && (
                  <span className="absolute top-1.5 start-1.5 text-[10px] bg-rose text-white
                                   px-2 py-0.5 rounded-full font-bold shadow-md tracking-wide">
                    COVER
                  </span>
                )}

                {/* Order number */}
                {i > 0 && (
                  <span className="absolute top-1.5 start-1.5 w-5 h-5 rounded-full bg-black/50
                                   text-white text-[10px] font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                )}

                {/* Drag handle hint */}
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-center
                                py-1.5 bg-gradient-to-t from-black/50 to-transparent rounded-b-[10px]
                                opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-white text-xs font-medium tracking-wide select-none">⠿ drag</span>
                </div>

                {/* Drop-here indicator */}
                {dragOverIdx === i && dragging !== i && (
                  <div className="absolute inset-0 rounded-[10px] bg-rose/10 flex items-center justify-center pointer-events-none">
                    <span className="text-rose font-bold text-xs bg-white/90 px-2 py-1 rounded-full shadow">Drop here</span>
                  </div>
                )}

                {/* Delete button */}
                <button
                  type="button"
                  onClick={() => onRemove(url)}
                  className="absolute -top-2 -end-2 w-6 h-6 rounded-full bg-red-500 text-white text-xs
                             flex items-center justify-center opacity-0 group-hover:opacity-100
                             transition-opacity shadow-md hover:bg-red-600 z-10"
                >
                  ✕
                </button>
              </div>
            ))}

            {/* Drop zone spacer when dragging */}
            {dragging !== null && (
              <div
                onDragOver={e => { e.preventDefault(); setDragOverIdx(images.length); }}
                onDrop={e => handleDrop(e, images.length - 1)}
                className="w-28 h-36 rounded-xl border-2 border-dashed border-rose/30 bg-rose/5
                           flex items-center justify-center text-rose/40 text-2xl"
              >
                ↓
              </div>
            )}
          </div>
        </>
      )}

      {/* Upload button */}
      {images.length < 5 && (
        <CloudinaryUpload
          label={images.length === 0 ? 'Upload Cover Photo' : `Add Photo ${images.length + 1} of 5`}
          onUploaded={onUpload}
        />
      )}
    </Section>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────
export default function DressForm() {
  const { id }     = useParams<{ id?: string }>();
  const navigate   = useNavigate();
  const isEdit     = !!id;

  const [form,        setForm]        = useState<FormState>(emptyForm);
  const [branches,    setBranches]    = useState<BranchLite[]>([]);
  const [initLoading, setInitLoading] = useState(isEdit);
  const [saving,      setSaving]      = useState(false);
  const [saved,       setSaved]       = useState(false);
  const [errors,      setErrors]      = useState<Partial<Record<keyof FormState, string>>>({});

  useEffect(() => {
    branchApi.listLite().then(setBranches).catch(() => {});

    if (isEdit && id) {
      shopDressApi.get(id)
        .then(d => setForm({
          nameEn:    d.nameEn,
          nameAr:    d.nameAr,
          descEn:    d.descriptionEn,
          descAr:    d.descriptionAr,
          priceFrom: String(d.priceFrom),
          priceTo:   String(d.priceTo),
          discount:  d.discountPercent != null && d.discountPercent > 0 ? String(d.discountPercent) : '',
          category:  d.category?.toLowerCase() ?? 'simple',
          sizes:     [...d.sizes],
          colors:    d.colors.map(c => ({ nameEn: c.nameEn, nameAr: c.nameAr, hex: c.hex })),
          extras:    d.extras.map(e => ({ nameEn: e.nameEn, nameAr: e.nameAr, price: e.price != null ? String(e.price) : '' })),
          images:    [...d.images].sort((a, b) => a.sortOrder - b.sortOrder).map(i => i.url),
          availabilities: d.availabilities.map(a => ({
            branchId:   a.branchId,
            colorHex:   a.colorHex,
            sizes:      [...a.sizes],
            quantity:   a.quantity,
            weightFrom: a.weightFrom != null ? String(a.weightFrom) : '',
          })),
          featured: d.featured,
          isNew:    d.isNew,
        }))
        .catch(() => {})
        .finally(() => setInitLoading(false));
    }
  }, [id, isEdit]);

  const set = <K extends keyof FormState>(key: K, val: FormState[K]) =>
    setForm(f => ({ ...f, [key]: val }));

  // Colors — toggle from palette
  const toggleColor = (paletteColor: { nameEn: string; nameAr: string; hex: string }) => {
    const exists = form.colors.some(c => c.hex === paletteColor.hex);
    if (exists) set('colors', form.colors.filter(c => c.hex !== paletteColor.hex));
    else        set('colors', [...form.colors, paletteColor]);
  };

  // Extras
  const addExtra    = () => set('extras', [...form.extras, { nameEn: '', nameAr: '', price: '' }]);
  const removeExtra = (i: number) => set('extras', form.extras.filter((_, j) => j !== i));
  const updateExtra = (i: number, field: keyof Extra, val: string) =>
    set('extras', form.extras.map((e, j) => j === i ? { ...e, [field]: val } : e));

  // Images
  const removeImage = (url: string) => set('images', form.images.filter(u => u !== url));

  // Availability
  const addAvail = () => {
    const firstBranch = branches[0];
    const firstColor  = form.colors[0];
    if (!firstBranch || !firstColor) return; // require at least one color selected first
    set('availabilities', [...form.availabilities, {
      branchId:   firstBranch.id,
      colorHex:   firstColor.hex,
      sizes:      [],
      quantity:   1,
      weightFrom: '',
    }]);
  };
  const removeAvail = (i: number) =>
    set('availabilities', form.availabilities.filter((_, j) => j !== i));
  const updateAvail = (i: number, patch: Partial<AvailEntry>) =>
    set('availabilities', form.availabilities.map((a, j) => j === i ? { ...a, ...patch } : a));
  const toggleAvailSize = (i: number, size: string) => {
    const entry = form.availabilities[i];
    const sizes = entry.sizes.includes(size)
      ? entry.sizes.filter(s => s !== size)
      : [...entry.sizes, size];
    updateAvail(i, { sizes });
  };

  // Validation
  const validate = (): boolean => {
    const e: typeof errors = {};
    if (!form.nameEn.trim())  e.nameEn  = 'English name is required';
    if (!form.nameAr.trim())  e.nameAr  = 'Arabic name is required';
    if (!form.priceFrom || isNaN(Number(form.priceFrom)) || Number(form.priceFrom) <= 0)
      e.priceFrom = 'Valid price from is required';
    if (!form.priceTo || isNaN(Number(form.priceTo)) || Number(form.priceTo) < Number(form.priceFrom))
      e.priceTo = 'Price to must be ≥ price from';
    if (form.colors.length === 0) e.colors = 'Select at least one color';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // Submit
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        nameEn:        form.nameEn.trim(),
        nameAr:        form.nameAr.trim(),
        descriptionEn: form.descEn.trim(),
        descriptionAr: form.descAr.trim(),
        priceFrom:     Number(form.priceFrom),
        priceTo:       Number(form.priceTo),
        weightFrom:    null,
        weightTo:      null,
        category:      form.category.toLowerCase(),
        material:        '',
        discountPercent: form.discount ? Math.min(90, Math.max(0, Number(form.discount))) : null,
        featured:        form.featured,
        isNew:         form.isNew,
        colors:        form.colors.map(c => ({ nameEn: c.nameEn, nameAr: c.nameAr, hex: c.hex })),
        sizes:         [...new Set(form.availabilities.flatMap(a => a.sizes))].sort(),
        images:        form.images.map((url, idx) => ({ url, sortOrder: idx })),
        extras:        form.extras.map(ex => ({ nameEn: ex.nameEn, nameAr: ex.nameAr, price: ex.price ? Number(ex.price) : null })),
        availabilities: form.availabilities.map(a => ({
          branchId:   a.branchId,
          colorHex:   a.colorHex,
          sizes:      a.sizes,
          quantity:   a.quantity,
          weightFrom: a.weightFrom ? Number(a.weightFrom) : null,
        })),
      };

      if (isEdit && id) await shopDressApi.update(id, payload);
      else              await shopDressApi.create(payload);

      setSaved(true);
      setTimeout(() => navigate('/admin/dresses'), 1200);
    } catch {
      alert('Failed to save dress. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (initLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <span className="w-8 h-8 border-2 border-rose/30 border-t-rose rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to="/admin/dresses"
          className="p-2 rounded-xl border border-gray-200 hover:border-rose hover:text-rose transition-all text-gray-500">
          ←
        </Link>
        <div>
          <h2 className="text-xl font-bold text-gray-800">{isEdit ? 'Edit Dress' : 'Add New Dress'}</h2>
          <p className="text-gray-400 text-sm">Fill in all details for the dress catalog</p>
        </div>
      </div>

      {saved && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 px-4 py-3 rounded-xl bg-green-50 border border-green-200 text-green-700 font-semibold">
          ✅ Dress saved successfully! Redirecting…
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* ① Basic Info */}
        <Section title="Basic Information" icon="📝">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Name (English) *</Label>
              <Input value={form.nameEn} onChange={e => set('nameEn', e.target.value)} placeholder="e.g. Rose Blossom Gown" />
              {errors.nameEn && <p className="text-red-500 text-xs mt-1">{errors.nameEn}</p>}
            </div>
            <div>
              <Label>الاسم (عربي) *</Label>
              <Input value={form.nameAr} onChange={e => set('nameAr', e.target.value)} placeholder="مثال: فستان وردة الربيع" dir="rtl" />
              {errors.nameAr && <p className="text-red-500 text-xs mt-1">{errors.nameAr}</p>}
            </div>
            <div className="sm:col-span-2">
              <Label>Description (English)</Label>
              <Textarea rows={3} value={form.descEn} onChange={e => set('descEn', e.target.value)} placeholder="Describe the dress…" />
            </div>
            <div className="sm:col-span-2">
              <Label>الوصف (عربي)</Label>
              <Textarea rows={3} value={form.descAr} onChange={e => set('descAr', e.target.value)} placeholder="وصف الفستان…" dir="rtl" />
            </div>
          </div>
        </Section>

        {/* ② Price Range */}
        <Section title="Price Range (EGP)" icon="💰">
          <p className="text-gray-400 text-xs mb-4">Set a price range — useful when condition or extras affect the final price.</p>
          <div className="grid grid-cols-2 gap-4 max-w-sm">
            <div>
              <Label>From *</Label>
              <div className="relative">
                <Input type="number" min="0" step="50" value={form.priceFrom}
                  onChange={e => set('priceFrom', e.target.value)} placeholder="e.g. 1500" className="pe-14" />
                <span className="absolute inset-y-0 end-3 flex items-center text-gray-400 text-xs font-semibold">EGP</span>
              </div>
              {errors.priceFrom && <p className="text-red-500 text-xs mt-1">{errors.priceFrom}</p>}
            </div>
            <div>
              <Label>To *</Label>
              <div className="relative">
                <Input type="number" min="0" step="50" value={form.priceTo}
                  onChange={e => set('priceTo', e.target.value)} placeholder="e.g. 2000" className="pe-14" />
                <span className="absolute inset-y-0 end-3 flex items-center text-gray-400 text-xs font-semibold">EGP</span>
              </div>
              {errors.priceTo && <p className="text-red-500 text-xs mt-1">{errors.priceTo}</p>}
            </div>
          </div>
        </Section>

        {/* ② b  Discount */}
        <Section title="Sale / Discount" icon="🏷️">
          <p className="text-gray-400 text-xs mb-4">
            Optional — set a discount percentage to show a strikethrough price and a <strong>SALE</strong> badge on the card and detail page. Leave blank for no discount.
          </p>
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <Label>Discount %</Label>
              <div className="relative w-36">
                <Input
                  type="number" min="0" max="90" step="5"
                  value={form.discount}
                  onChange={e => set('discount', e.target.value)}
                  placeholder="e.g. 20"
                  className="pe-8"
                />
                <span className="absolute inset-y-0 end-3 flex items-center text-gray-400 text-sm font-semibold">%</span>
              </div>
            </div>

            {/* Live preview */}
            {form.discount && Number(form.discount) > 0 && form.priceFrom && (
              <div className="flex flex-col gap-1 pb-0.5">
                <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">Preview</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-bold text-rose">
                    {Math.round(Number(form.priceFrom) * (1 - Number(form.discount) / 100)).toLocaleString()}
                    {form.priceTo && Number(form.priceTo) > Number(form.priceFrom)
                      ? ` – ${Math.round(Number(form.priceTo) * (1 - Number(form.discount) / 100)).toLocaleString()}`
                      : ''} EGP
                  </span>
                  <span className="text-sm text-gray-400 line-through">
                    {Number(form.priceFrom).toLocaleString()}
                    {form.priceTo && Number(form.priceTo) > Number(form.priceFrom)
                      ? ` – ${Number(form.priceTo).toLocaleString()}`
                      : ''} EGP
                  </span>
                  <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full font-bold">
                    SALE -{form.discount}%
                  </span>
                </div>
              </div>
            )}
          </div>
        </Section>

        {/* ④ Category */}
        <Section title="Category" icon="🏷️">
          <div>
            <Label>Category *</Label>
            <select value={form.category} onChange={e => set('category', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-800
                         focus:outline-none focus:border-rose focus:ring-2 focus:ring-rose/20 bg-white">
              {ALL_CATEGORIES.map(c => (
                <option key={c} value={c}>{CATEGORY_LABEL[c]}</option>
              ))}
            </select>
          </div>
        </Section>

        {/* ⑤ Colors */}
        <Section title="Colors" icon="🎨">
          <p className="text-gray-400 text-xs mb-4">Click to select the colors available for this dress.</p>
          <div className="flex flex-wrap gap-3">
            {COLOR_PALETTE.map(c => {
              const selected = form.colors.some(fc => fc.hex === c.hex);
              return (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => toggleColor(c)}
                  title={`${c.nameEn} / ${c.nameAr}`}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all duration-200 ${
                    selected
                      ? 'border-rose scale-105 shadow-md shadow-rose/20 bg-rose/5'
                      : 'border-gray-200 hover:border-gray-400'
                  }`}
                >
                  <span
                    className="w-8 h-8 rounded-full border border-gray-200 shadow-sm"
                    style={{ background: c.hex }}
                  />
                  <span className="text-xs text-gray-500 font-medium leading-tight text-center w-14 truncate">
                    {c.nameEn}
                  </span>
                  {selected && <span className="text-rose text-xs font-bold">✓</span>}
                </button>
              );
            })}
          </div>
          {form.colors.length > 0 && (
            <p className="text-xs text-gray-400 mt-3">
              Selected: {form.colors.map(c => c.nameEn).join(', ')}
            </p>
          )}
          {errors.colors && <p className="text-red-500 text-xs mt-2">{errors.colors}</p>}
        </Section>

        {/* ⑦ Branch Availability */}
        <Section title="Branch Availability" icon="📍">
          <p className="text-gray-400 text-xs mb-4">
            For each entry specify which branch carries a particular color and which sizes are available there.
          </p>

          {form.availabilities.length === 0 && (
            <p className="text-gray-400 text-sm text-center py-4 border border-dashed border-gray-200 rounded-xl mb-4">
              No availability entries yet — add one below.
            </p>
          )}

          <div className="space-y-4">
            {form.availabilities.map((entry, i) => (
              <div key={i} className="p-4 rounded-xl border border-gray-200 bg-gray-50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Entry {i + 1}</span>
                  <button type="button" onClick={() => removeAvail(i)}
                    className="p-1 rounded-lg text-red-400 hover:bg-red-50 transition-all text-xs">✕ Remove</button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Branch */}
                  <div>
                    <Label>Branch</Label>
                    <select value={entry.branchId}
                      onChange={e => updateAvail(i, { branchId: Number(e.target.value) })}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-gray-800 text-sm
                                 focus:outline-none focus:border-rose focus:ring-2 focus:ring-rose/20 bg-white">
                      {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                  </div>

                  {/* Color */}
                  <div>
                    <Label>Color</Label>
                    <select value={entry.colorHex}
                      onChange={e => updateAvail(i, { colorHex: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-gray-800 text-sm
                                 focus:outline-none focus:border-rose focus:ring-2 focus:ring-rose/20 bg-white">
                      {form.colors.length === 0 && <option value="">— Define colors first —</option>}
                      {form.colors.map(c => (
                        <option key={c.hex} value={c.hex}>
                          {c.nameEn || c.hex}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Quantity */}
                  <div>
                    <Label>Quantity</Label>
                    <Input type="number" min="1" value={entry.quantity}
                      onChange={e => updateAvail(i, { quantity: Number(e.target.value) })}
                      className="text-sm" />
                  </div>
                </div>

                {/* Sizes for this entry */}
                <div>
                  <Label>Available Sizes at this Branch</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {ALL_SIZES.map(s => (
                      <button key={s} type="button"
                        onClick={() => toggleAvailSize(i, s)}
                        className={`w-11 h-11 rounded-lg border-2 font-semibold text-sm transition-all ${
                          entry.sizes.includes(s)
                            ? 'bg-rose border-rose text-white shadow-sm'
                            : 'border-gray-200 text-gray-400 hover:border-rose hover:text-rose'
                        }`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Weight for this entry */}
                <div>
                  <Label>⚖️ Suitable Weight (KG) <span className="font-normal text-gray-400 text-xs">— optional</span></Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      type="number" min="40" max="200" step="1"
                      value={entry.weightFrom}
                      onChange={e => updateAvail(i, { weightFrom: e.target.value })}
                      placeholder="e.g. 70"
                      className="w-28 text-sm"
                    />
                    <span className="text-gray-500 text-sm font-medium">kg</span>
                    {entry.weightFrom && (
                      <span className="text-xs text-rose font-semibold ms-1">
                        ⚖️ Fit to {entry.weightFrom} kg
                      </span>
                    )}
                  </div>
                </div>

                {/* Preview */}
                <div className="flex items-center gap-2 text-xs text-gray-500 pt-1">
                  <span style={{ background: entry.colorHex }} className="w-4 h-4 rounded-full border border-white shadow" />
                  <span>{branches.find(b => b.id === entry.branchId)?.name ?? '—'}</span>
                  <span>·</span>
                  <span>{entry.sizes.length > 0 ? `Sizes: ${entry.sizes.join(', ')}` : 'No sizes selected'}</span>
                  <span>·</span>
                  <span>Qty: {entry.quantity}</span>
                  {entry.weightFrom && (
                    <><span>·</span><span>⚖️ {entry.weightFrom} kg</span></>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button type="button" onClick={addAvail}
            disabled={branches.length === 0 || form.colors.length === 0}
            title={form.colors.length === 0 ? 'Select at least one color above first' : undefined}
            className="mt-4 flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-dashed
                       border-gray-200 text-gray-400 hover:border-rose hover:text-rose
                       transition-all text-sm font-semibold w-full justify-center disabled:opacity-40 disabled:cursor-not-allowed">
            {form.colors.length === 0 ? '⚠️ Select colors first, then add entry' : '+ Add Branch Entry'}
          </button>
        </Section>

        {/* ⑧ Extras */}
        <Section title="Extras & Accessories" icon="✨">
          <p className="text-gray-400 text-xs mb-4">Add optional extras like extensions, belts, veils, etc.</p>
          <div className="space-y-3">
            {form.extras.map((ex, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <Input value={ex.nameEn} onChange={e => updateExtra(i, 'nameEn', e.target.value)}
                    placeholder="Extra name (EN)" className="text-sm" />
                  <Input value={ex.nameAr} onChange={e => updateExtra(i, 'nameAr', e.target.value)}
                    placeholder="الاسم (عربي)" dir="rtl" className="text-sm" />
                  <div className="relative">
                    <Input type="number" min="0" value={ex.price}
                      onChange={e => updateExtra(i, 'price', e.target.value)}
                      placeholder="Price (optional)" className="text-sm pe-14" />
                    <span className="absolute inset-y-0 end-3 flex items-center text-gray-400 text-xs">EGP</span>
                  </div>
                </div>
                <button type="button" onClick={() => removeExtra(i)}
                  className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-all shrink-0">✕</button>
              </div>
            ))}
            <button type="button" onClick={addExtra}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-dashed
                         border-gray-200 text-gray-400 hover:border-rose hover:text-rose
                         transition-all text-sm font-semibold w-full justify-center">
              + Add Extra
            </button>
          </div>
        </Section>

        {/* ⑨ Images */}
        <ImageSection
          images={form.images}
          onChange={imgs => set('images', imgs)}
          onRemove={removeImage}
          onUpload={url => set('images', [...form.images, url])}
        />

        {/* ⑩ Badges */}
        <Section title="Display Badges" icon="🏅">
          <div className="flex flex-wrap gap-4">
            {[
              { key: 'isNew' as const,   label: 'New Arrival', desc: 'Shows a "NEW" badge on the card', color: 'gold' },
              { key: 'featured' as const, label: 'Featured',    desc: 'Shown on the homepage featured section', color: 'rose' },
            ].map(({ key, label, desc, color }) => (
              <label key={key} className={`flex items-center gap-3 px-5 py-3 rounded-xl border-2 cursor-pointer transition-all ${
                form[key] ? `border-${color} bg-${color}/5` : 'border-gray-100 hover:border-gray-200'
              }`}>
                <div className={`w-5 h-5 rounded-full border-2 transition-all flex items-center justify-center ${
                  form[key] ? `border-${color} bg-${color}` : 'border-gray-300'
                }`}>
                  {form[key] && <span className="text-white text-xs">✓</span>}
                </div>
                <input type="checkbox" checked={form[key]} onChange={e => set(key, e.target.checked)} className="hidden" />
                <div>
                  <p className="font-semibold text-gray-700 text-sm">{label}</p>
                  <p className="text-gray-400 text-xs">{desc}</p>
                </div>
              </label>
            ))}
          </div>
        </Section>

        {/* Submit */}
        <div className="flex gap-3 pb-8">
          <button type="submit" disabled={saving || saved}
            className="flex-1 sm:flex-none sm:px-10 py-3.5 rounded-xl bg-rose text-white font-bold
                       shadow-lg shadow-rose/20 hover:bg-rose-dark transition-all hover:scale-105
                       disabled:opacity-60 disabled:hover:scale-100 flex items-center justify-center gap-2">
            {saving ? (
              <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving…</>
            ) : saved ? '✅ Saved!' : isEdit ? 'Save Changes' : 'Add Dress'}
          </button>
          <Link to="/admin/dresses"
            className="px-6 py-3.5 rounded-xl border border-gray-200 text-gray-600 font-semibold
                       hover:border-gray-300 transition-all text-center">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
