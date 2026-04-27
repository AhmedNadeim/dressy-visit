const BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';

// ── Token storage ──────────────────────────────────────────────────────────
export const TokenStore = {
  get:        () => localStorage.getItem('dressy_token'),
  getRefresh: () => localStorage.getItem('dressy_refresh_token'),
  set:        (t: string, r: string) => {
    localStorage.setItem('dressy_token', t);
    localStorage.setItem('dressy_refresh_token', r);
  },
  clear: () => {
    localStorage.removeItem('dressy_token');
    localStorage.removeItem('dressy_refresh_token');
  },
};

// ── Core fetch wrapper ─────────────────────────────────────────────────────
async function request<T>(
  path: string,
  options: RequestInit = {},
  retry = true,
): Promise<T> {
  const token = TokenStore.get();

  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (res.status === 401 && retry) {
    if (token) {
      const refreshed = await silentRefresh();
      if (refreshed) return request<T>(path, options, false);
      TokenStore.clear();
      window.location.href = '/admin/login';
      throw new Error('Session expired');
    }
    throw new Error('HTTP 401');
  }

  if (!res.ok) {
    const body = await res.text();
    throw new Error(body || `HTTP ${res.status}`);
  }

  const text = await res.text();
  return text ? JSON.parse(text) : ({} as T);
}

async function silentRefresh(): Promise<boolean> {
  const refreshToken = TokenStore.getRefresh();
  if (!refreshToken) return false;
  try {
    const res = await fetch(`${BASE}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    TokenStore.set(data.token, data.refreshToken);
    return true;
  } catch {
    return false;
  }
}

// ── Auth API ───────────────────────────────────────────────────────────────
export const authApi = {
  login: (username: string, password: string) =>
    request<{ token: string; refreshToken: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  logout: () => {
    const refreshToken = TokenStore.getRefresh();
    if (!refreshToken) return Promise.resolve();
    return request<void>('/api/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    }).catch(() => {});
  },
};

// ── Shop: response type (GET) ──────────────────────────────────────────────
export interface ShopDressAvailability {
  branchId:   number;
  branchName: string;
  colorHex:   string;
  sizes:      string[];
  quantity:   number;
  weightFrom: number | null;
}

export interface ShopDress {
  id:            number;
  nameEn:        string;
  nameAr:        string;
  descriptionEn: string;
  descriptionAr: string;
  priceFrom:     number;
  priceTo:       number;
  weightFrom:    number | null;
  weightTo:      number | null;
  category:      string;
  material:      string;
  featured:        boolean;
  isNew:           boolean;
  discountPercent: number | null;
  createdAt:       string;
  colors:        { nameEn: string; nameAr: string; hex: string }[];
  sizes:         string[];
  images:        { url: string; sortOrder: number }[];
  extras:        { nameEn: string; nameAr: string; price: number | null }[];
  availabilities: ShopDressAvailability[];
}

// ── Shop: request payload (POST / PUT) ────────────────────────────────────
export interface DressPayload {
  nameEn:        string;
  nameAr:        string;
  descriptionEn: string;
  descriptionAr: string;
  priceFrom:     number;
  priceTo:       number;
  weightFrom:    number | null;
  weightTo:      number | null;
  category:      string;
  material:      string;
  colors:        { nameEn: string; nameAr: string; hex: string }[];
  sizes:         string[];
  images:        { url: string; sortOrder: number }[];
  extras:        { nameEn: string; nameAr: string; price: number | null }[];
  availabilities: { branchId: number; colorHex: string; sizes: string[]; quantity: number; weightFrom: number | null }[];
  featured:        boolean;
  isNew:           boolean;
  discountPercent: number | null;
}

// ── Shop Dresses API ───────────────────────────────────────────────────────
function buildQuery(params?: { category?: string; q?: string }) {
  const p = new URLSearchParams();
  if (params?.category) p.set('category', params.category);
  if (params?.q)        p.set('q', params.q);
  const s = p.toString();
  return s ? `?${s}` : '';
}

export const shopDressApi = {
  list:        (params?: { category?: string; q?: string }) =>
    request<ShopDress[]>(`/api/shop/dresses${buildQuery(params)}`),
  featured:    () => request<ShopDress[]>('/api/shop/dresses/featured'),
  newArrivals: () => request<ShopDress[]>('/api/shop/dresses/new-arrivals'),
  get:         (id: string | number) => request<ShopDress>(`/api/shop/dresses/${id}`),
  create:      (data: DressPayload)  =>
    request<ShopDress>('/api/shop/dresses', { method: 'POST', body: JSON.stringify(data) }),
  update:      (id: string | number, data: DressPayload) =>
    request<ShopDress>(`/api/shop/dresses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete:      (id: string | number) =>
    request<void>(`/api/shop/dresses/${id}`, { method: 'DELETE' }),
};

// ── Branches API (for admin form) ─────────────────────────────────────────
export interface BranchLite { id: number; name: string; }

export const branchApi = {
  listLite: () => request<BranchLite[]>('/api/branches/lite'),
};

// ── Lookups API ────────────────────────────────────────────────────────────
export interface MaterialLookup { id: number; name: string; codePrefix: string; }

export const lookupApi = {
  materials: () => request<MaterialLookup[]>('/api/lookups/materials'),
};
