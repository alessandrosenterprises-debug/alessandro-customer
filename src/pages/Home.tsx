import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getActivePromotions } from '../services/promotions';
import { getActiveServices } from '../services/services';
import { getCustomerBookings } from '../services/bookings';
import { getCustomer } from '../services/customers';
import { useRealtimeTable } from '../hooks/useRealtimeTable';
import { SharedPostFeed } from '../components/SharedPostFeed';
import { formatZMW } from '../utils/currency';
import type { Booking, Customer, Promotion, Service } from '../types';
import './pages.css';

type Detail = { kind: string; title: string; body: string; meta: string };

export function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selected, setSelected] = useState<Detail | null>(null);

  useEffect(() => {
    if (!user) return;
    const customerId = user.id;
    let cancelled = false;
    async function load() {
      setLoading(true);
      const [promoResult, serviceResult, bookingResult, customerResult] = await Promise.all([
        getActivePromotions(), getActiveServices(), getCustomerBookings(customerId), getCustomer(customerId),
      ]);
      if (cancelled) return;
      if (promoResult.error || serviceResult.error || bookingResult.error) setError('Failed to load some data. Please refresh.');
      else setError(null);
      setPromotions((promoResult.data ?? []).slice(0, 3));
      setServices(serviceResult.data ?? []);
      setCustomer(customerResult.data ?? null);
      setBookings((bookingResult.data ?? []).filter((booking) => !['completed', 'cancelled'].includes(String(booking.status).toLowerCase())).slice(0, 3));
      setLoading(false);
    }
    void load();
    return () => { cancelled = true; };
  }, [user, refreshKey]);

  useRealtimeTable('bookings', () => setRefreshKey((value) => value + 1), user ? `customer_id=eq.${user.id}` : undefined);
  useRealtimeTable('services', () => setRefreshKey((value) => value + 1));
  useRealtimeTable('promotions', () => setRefreshKey((value) => value + 1));

  return <div className="page"><h1>Welcome{customer?.name ? `, ${customer.name}` : ''}!</h1><p className="page-subtitle">Here's what's new at Alessandro Enterprises.</p>{loading && <div className="page-loading">Loading your dashboard...</div>}{error && <div className="page-error">{error}</div>}{!loading && <><section><h2>Latest Promotions</h2>{promotions.length ? promotions.map((item) => <button className="card detail-card" key={item.id} onClick={() => setSelected({ kind: 'Promotion', title: item.title, body: item.description || 'No additional details have been added.', meta: `${item.discount}% off` })}><h3>{item.title}</h3><p>{item.description}</p><span className="badge">{item.discount}% off</span><small className="view-detail">View details</small></button>) : <p className="page-empty">No active promotions right now.</p>}</section><SharedPostFeed/><section><h2>Services</h2>{services.length ? services.map((item) => <button className="card detail-card" key={item.id} onClick={() => navigate(`/products/${item.id}`)}><h3>{item.name}</h3><p>{item.description}</p><p className="card-meta">{item.duration ? `${item.duration} min` : ''}{item.duration && Number(item.price) > 0 ? ' · ' : ''}{Number(item.price) > 0 ? formatZMW(item.price) : ''}</p><small className="view-detail">View full service and gallery</small></button>) : <p className="page-empty">No services available yet.</p>}</section><section><h2>Upcoming Bookings</h2>{bookings.length ? bookings.map((item) => <button className="card detail-card" key={item.id} onClick={() => setSelected({ kind: 'Booking', title: item.service?.name || 'Service booking', body: item.notes || 'No additional notes were supplied.', meta: `${new Date(item.date).toLocaleString()} · ${item.status}` })}><h3>{item.service?.name || 'Service'}</h3><p className="card-meta">{new Date(item.date).toLocaleString()}</p><span className="badge">{item.status}</span><small className="view-detail">View details</small></button>) : <p className="page-empty">You have no pending or upcoming bookings.</p>}</section><section><h2>Quick Links</h2><div className="quick-links"><a href="/book">Book a service</a><a href="/products">Explore services</a><a href="/updates">Latest updates</a><a href="/promotions">View promotions</a><a href="/messages">Send a message</a></div></section></>}{selected && <div className="detail-backdrop" onMouseDown={() => setSelected(null)}><section className="detail-modal" onMouseDown={(event) => event.stopPropagation()}><button className="detail-close" onClick={() => setSelected(null)}>×</button><p className="eyebrow">{selected.kind}</p><h2>{selected.title}</h2><p>{selected.body}</p><p className="detail-meta">{selected.meta}</p></section></div>}</div>;
}