import { useState, useEffect } from 'react';
import { shopDressApi, type ShopDress } from '../api/client';

export function useDressList(params?: { category?: string; q?: string }) {
  const [dresses, setDresses] = useState<ShopDress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    shopDressApi.list(params)
      .then(setDresses)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params?.category, params?.q]);

  return { dresses, loading, error };
}

export function useDress(id: string | undefined) {
  const [dress,   setDress]   = useState<ShopDress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError('');
    shopDressApi.get(id)
      .then(setDress)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  return { dress, loading, error };
}

export function useFeatured() {
  const [dresses, setDresses] = useState<ShopDress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    setLoading(true);
    setError('');
    shopDressApi.featured()
      .then(setDresses)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [attempt]);

  const retry = () => setAttempt(a => a + 1);
  return { dresses, loading, error, retry };
}

export function useNewArrivals() {
  const [dresses, setDresses] = useState<ShopDress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    setLoading(true);
    setError('');
    shopDressApi.newArrivals()
      .then(setDresses)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [attempt]);

  const retry = () => setAttempt(a => a + 1);
  return { dresses, loading, error, retry };
}

export function useDressesByIds(ids: number[]) {
  const [dresses, setDresses] = useState<ShopDress[]>([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (ids.length === 0) { setDresses([]); return; }
    setLoading(true);
    setError('');
    Promise.all(ids.map(id => shopDressApi.get(id).catch(() => null)))
      .then(results => setDresses(results.filter(Boolean) as ShopDress[]))
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids.join(','), attempt]);

  const retry = () => setAttempt(a => a + 1);
  return { dresses, loading, error, retry };
}

export function useWishlistDresses(ids: number[]) {
  return useDressesByIds(ids);
}
