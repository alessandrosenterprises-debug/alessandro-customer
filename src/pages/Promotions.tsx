import { useCallback, useEffect, useState } from 'react';
import { getActivePromotions } from '../services/promotions';
import { useRealtimeTable } from '../hooks/useRealtimeTable';
import type { Promotion } from '../types';
import './pages.css';

export function Promotions() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPromotions = useCallback(async () => {
    const { data, error } = await getActivePromotions();
      if (error) {
        console.error('Failed to load promotions:', error);
        setError('Failed to load promotions.');
      }
      setPromotions(data ?? []);
      setLoading(false);
  }, []);

  useEffect(() => {
    void loadPromotions();
  }, [loadPromotions]);

  useRealtimeTable('promotions', () => void loadPromotions());

  return (
    <div className="page">
      <h1>Promotions</h1>
      {loading && <div className="page-loading">Loading promotions...</div>}
      {error && <div className="page-error">{error}</div>}
      {!loading && promotions.length === 0 && (
        <p className="page-empty">No active promotions right now.</p>
      )}
      {promotions.map((promo) => (
        <div className="card" key={promo.id}>
          <h3>{promo.title}</h3>
          <p>{promo.description}</p>
          <span className="badge">{promo.discount}% off</span>
        </div>
      ))}
    </div>
  );
}
