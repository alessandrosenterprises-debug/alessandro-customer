import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getActivePromotions } from '../services/promotions';
import { getActiveServices } from '../services/services';
import { getCustomerBookings } from '../services/bookings';
import { getCustomer } from '../services/customers';
import { useRealtimeTable } from '../hooks/useRealtimeTable';
import type { Promotion, Service, Booking, Customer } from '../types';
import './pages.css';

type Detail =
  | { kind: 'Promotion'; title: string; description: string | null; discount: number }
  | { kind: 'Service'; title: string; description: string | null; price: number; duration: number | null }
  | { kind: 'Booking'; title: string; date: string; notes: string | null; status: string };

export function Home() {
  const { user } = useAuth();
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
    let cancelled = false;
    async function load() {
      setLoading(true);
      const [promoRes, servicesRes, bookingsRes, customerRes] = await Promise.all([
        getActivePromotions(), getActiveServices(), getCustomerBookings(user!.id), getCustomer(user!.id),
      ]);
      if (cancelled) return;
      if (promoRes.error || servicesRes.error || bookingsRes.error) {
        console.error('Failed to load dashboard data:', { promotions: promoRes.error, services: servicesRes.error, bookings: bookingsRes.error });
        setError('Failed to load some data. Please refresh.');
      }
      setPromotions((promoRes.data ?? []).slice(0, 3));
      setServices((servicesRes.data ?? []).slice(0, 3));
      setCustomer(customerRes.data ?? null);
      setBookings((bookingsRes.data ?? []).filter((booking) => {
        const status = String(booking.status).toLowerCase();
        return new Date(booking.date).getTime() >= Date.now() && status !== 'completed' && status !== 'cancelled';
      }).slice(0, 3));
      setLoading(false);
    }
    void load();
    return () => { cancelled = true; };
  }, [user, refreshKey]);

  useRealtimeTable('bookings', () => setRefreshKey((current) => current + 1), user ? `customer_id=eq.${user.id}` : undefined);
  useRealtimeTable('services', () => setRefreshKey((current) => current + 1));
  useRealtimeTable('promotions', () => setRefreshKey((current) => current + 1));

  return <div className="page">
    <h1>Welcome{customer?.name ? `, ${customer.name}` : ''}!</h1>
    <p className="page-subtitle">Here's what's new at Alessandro Enterprises.</p>
    {loading && <div className="page-loading">Loading your dashboard...</div>}
    {error && <div className="page-error">{error}</div>}
    {!loading && <>
      <section><h2>Latest Promotions</h2>{promotions.length === 0 ? <p className="page-empty">No active promotions right now.</p> : promotions.map((promo) => <button className="card detail-card" key={promo.id} onClick={() => setSelected({ kind: 'Promotion', title: promo.title, description: promo.description, discount: promo.discount })}><h3>{promo.title}</h3><p>{promo.description}</p><span className="badge">{promo.discount}% off</span><small className="view-detail">View details</small></button>)}</section>
      <section><h2>Latest Services</h2>{services.length === 0 ? <p className="page-empty">No services available yet.</p> : services.map((service) => <button className="card detail-card" key={service.id} onClick={() => setSelected({ kind: 'Service', title: service.name, description: service.description, price: service.price, duration: service.duration })}><h3>{service.name}</h3><p>{service.description}</p><p className="card-meta">{service.duration ? `${service.duration} min · ` : ''}K{service.price}</p><small className="view-detail">View details</small></button>)}</section>
      <section><h2>Upcoming Bookings</h2>{bookings.length === 0 ? <p className="page-empty">You have no pending or upcoming bookings.</p> : bookings.map((booking) => <button className="card detail-card" key={booking.id} onClick={() => setSelected({ kind: 'Booking', title: booking.service?.name ?? 'Service booking', date: booking.date, notes: booking.notes, status: String(booking.status) })}><h3>{booking.service?.name ?? 'Service'}</h3><p className="card-meta">{new Date(booking.date).toLocaleString()}</p><span className="badge">{booking.status}</span><small className="view-detail">View details</small></button>)}</section>
      <section><h2>Quick Links</h2><div className="quick-links"><a href="/book">Book a service</a><a href="/products">Browse products</a><a href="/promotions">View promotions</a><a href="/messages">Send a message</a><a href="/requests">Submit a request</a></div></section>
    </>}
    {selected && <DetailModal detail={selected} onClose={() => setSelected(null)} />}
  </div>;
}

function DetailModal({ detail, onClose }: { detail: Detail; onClose: () => void }) {
  return <div className="detail-backdrop" role="presentation" onMouseDown={onClose}><section className="detail-modal" role="dialog" aria-modal="true" aria-label={`${detail.kind} details`} onMouseDown={(event) => event.stopPropagation()}><button className="detail-close" onClick={onClose} aria-label="Close details">×</button><p className="eyebrow">{detail.kind}</p><h2>{detail.title}</h2>{detail.kind === 'Promotion' && <><p>{detail.description || 'No additional promotion details have been added.'}</p><strong className="detail-highlight">{detail.discount}% off</strong></>}{detail.kind === 'Service' && <><p>{detail.description || 'No service description has been added yet.'}</p><p className="detail-meta">{detail.duration ? `${detail.duration} minutes · ` : ''}Zambian Kwacha (K) {detail.price.toFixed(2)}</p></>}{detail.kind === 'Booking' && <><p className="detail-meta">{new Date(detail.date).toLocaleString()}</p><p><b>Status:</b> {detail.status}</p>{detail.notes && <p><b>Your notes:</b><br />{detail.notes}</p>}</>}</section></div>;
}
