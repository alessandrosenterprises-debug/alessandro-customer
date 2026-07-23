import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getActivePromotions } from '../services/promotions';
import { getActiveServices } from '../services/services';
import { getCustomerBookings } from '../services/bookings';
import { getCustomer } from '../services/customers';
import { useRealtimeTable } from '../hooks/useRealtimeTable';
import type { Promotion, Service, Booking, Customer } from '../types';
import './pages.css';

export function Home() {
  const { user } = useAuth();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      const [promoRes, servicesRes, bookingsRes, customerRes] = await Promise.all([
        getActivePromotions(),
        getActiveServices(),
        getCustomerBookings(user!.id),
        getCustomer(user!.id),
      ]);

      if (cancelled) return;

      if (promoRes.error || servicesRes.error || bookingsRes.error) {
        console.error('Failed to load dashboard data:', {
          promotions: promoRes.error,
          services: servicesRes.error,
          bookings: bookingsRes.error,
        });
        setError('Failed to load some data. Please refresh.');
      }

      setPromotions((promoRes.data ?? []).slice(0, 3));
      setServices((servicesRes.data ?? []).slice(0, 3));
      setCustomer(customerRes.data ?? null);
      const upcoming = (bookingsRes.data ?? []).filter(
        (b) => new Date(b.date).getTime() >= Date.now()
      );
      setBookings(upcoming.slice(0, 3));
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [user, refreshKey]);

  useRealtimeTable(
    'bookings',
    () => setRefreshKey((current) => current + 1),
    user ? `customer_id=eq.${user.id}` : undefined
  );
  useRealtimeTable('services', () => setRefreshKey((current) => current + 1));
  useRealtimeTable('promotions', () => setRefreshKey((current) => current + 1));

  return (
    <div className="page">
      <h1>Welcome{customer?.name ? `, ${customer.name}` : ''}!</h1>
      <p className="page-subtitle">Here's what's new at Alessandro Enterprises.</p>

      {loading && <div className="page-loading">Loading your dashboard...</div>}
      {error && <div className="page-error">{error}</div>}

      {!loading && (
        <>
          <section>
            <h2>Latest Promotions</h2>
            {promotions.length === 0 && (
              <p className="page-empty">No active promotions right now.</p>
            )}
            {promotions.map((promo) => (
              <div className="card" key={promo.id}>
                <h3>{promo.title}</h3>
                <p>{promo.description}</p>
                <span className="badge">{promo.discount}% off</span>
              </div>
            ))}
          </section>

          <section>
            <h2>Latest Services</h2>
            {services.length === 0 && (
              <p className="page-empty">No services available yet.</p>
            )}
            {services.map((service) => (
              <div className="card" key={service.id}>
                <h3>{service.name}</h3>
                <p>{service.description}</p>
                <p className="card-meta">
                  {service.duration ? `${service.duration} min · ` : ''}$
                  {service.price}
                </p>
              </div>
            ))}
          </section>

          <section>
            <h2>Upcoming Bookings</h2>
            {bookings.length === 0 && (
              <p className="page-empty">You have no upcoming bookings.</p>
            )}
            {bookings.map((booking) => (
              <div className="card" key={booking.id}>
                <h3>{booking.service?.name ?? 'Service'}</h3>
                <p className="card-meta">
                  {new Date(booking.date).toLocaleString()}
                </p>
                <span className="badge">{booking.status}</span>
              </div>
            ))}
          </section>

          <section>
            <h2>Quick Links</h2>
            <div className="quick-links">
              <a href="/book">Book a service</a>
              <a href="/products">Browse products</a>
              <a href="/promotions">View promotions</a>
              <a href="/messages">Send a message</a>
              <a href="/requests">Submit a request</a>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
