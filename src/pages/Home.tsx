import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getActivePromotions } from '../services/promotions';
import { getActiveServices } from '../services/services';
import { getCustomerBookings } from '../services/bookings';
import { getCustomer } from '../services/customers';
import { useRealtimeTable } from '../hooks/useRealtimeTable';
import { SharedPostFeed } from '../components/SharedPostFeed';
import type { Customer, Promotion, Service } from '../types';
import './pages.css';

export function Home() {
  const { user } = useAuth(); const navigate = useNavigate(); const [promotions, setPromotions] = useState<Promotion[]>([]); const [services, setServices] = useState<Service[]>([]); const [customer, setCustomer] = useState<Customer | null>(null); const [loading, setLoading] = useState(true); const [error, setError] = useState<string | null>(null); const [refreshKey, setRefreshKey] = useState(0);
  useEffect(() => { if (!user) return; const id = user.id; let cancelled = false; async function load() { const [p, s, c, b] = await Promise.all([getActivePromotions(), getActiveServices(), getCustomer(id), getCustomerBookings(id)]); if (cancelled) return; setPromotions(p.data ?? []); setServices(s.data ?? []); setCustomer(c.data ?? null); setError(p.error?.message ?? s.error?.message ?? b.error?.message ?? null); setLoading(false); } void load(); return () => { cancelled = true; }; }, [user, refreshKey]);
  useRealtimeTable('services', () => setRefreshKey((value) => value + 1)); useRealtimeTable('promotions', () => setRefreshKey((value) => value + 1));
  const name = customer?.name || user?.email?.split('@')[0] || 'Customer'; const promo = promotions[0];
  return <main className="page app-home"><section className="home-hero"><p>Welcome back,</p><h1>{name}!</h1><p>Here is what is new at Alessandro Enterprises.</p></section><nav className="home-shortcuts"><Link to="/promotions"><span>♔</span>Promotions</Link><Link to="/history"><span>▤</span>My Bookings</Link><Link to="/messages"><span>☏</span>Messages</Link><Link to="/settings"><span>◉</span>Support</Link></nav>{promo && <section className="promotion-spotlight"><span className="promotion-tag">LATEST PROMOTION</span><h2>{promo.title}</h2><p>{promo.description || 'Discover a special offer from Alessandro Enterprises.'}</p><strong className="promotion-discount">{promo.discount}%<small> OFF</small></strong><Link className="btn" to="/promotions">View details</Link></section>}{loading && <div className="page-loading">Loading your dashboard...</div>}{error && <div className="page-error">{error}</div>}<SharedPostFeed/><section><div className="section-title-row"><h2>Our Services</h2><Link to="/products">View all</Link></div><div className="home-services">{services.slice(0, 4).map((service) => <button className="home-service-row" key={service.id} onClick={() => navigate(`/products/${service.id}`)}>{service.image_url ? <img src={service.image_url} alt=""/> : <span className="home-service-fallback">◈</span>}<span><h3>{service.name}</h3><p>{service.description || 'View service details and gallery.'}</p><small>View full service and gallery</small></span><b>›</b></button>)}{!loading && !services.length && <p className="page-empty">No services are available yet.</p>}</div></section></main>;
}
