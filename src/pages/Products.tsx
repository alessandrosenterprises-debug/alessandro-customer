import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getActiveServices } from '../services/services';
import type { Service } from '../types';
import { formatZMW } from '../utils/currency';
import './pages.css';

export function Products() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  useEffect(() => { void getActiveServices().then(({ data, error: requestError }) => { setServices(data ?? []); setError(requestError?.message ?? null); setLoading(false); }); }, []);
  return <main className="page products-page">
    <p className="eyebrow">DISCOVER</p><h1>Products &amp; Services</h1><p className="page-subtitle">Explore all our business units and the solutions we offer, designed to make life and work easier.</p>
    {loading && <div className="page-loading">Loading services...</div>}{error && <div className="page-error">{error}</div>}
    <div className="service-catalogue">{services.map((service) => <article className="card" key={service.id}>
      <div className="service-card-heading">{service.image_url ? <img src={service.image_url} alt="" /> : <span>{service.name.slice(0, 1)}</span>}<h3>{service.name}</h3><b>{'>'}</b></div>
      <p>{service.description || 'Professional service from Alessandro Enterprises.'}</p>
      {Number(service.price) > 0 && <p className="card-meta">{formatZMW(service.price)}</p>}
      <div className="service-card-actions"><button className="btn" onClick={() => navigate(`/products/${service.id}`)}>View service</button><button className="btn btn-secondary" onClick={() => navigate('/book', { state: { serviceId: service.id } })}>Book</button></div>
    </article>)}</div>
    {!loading && !services.length && <p className="page-empty">No services available right now.</p>}
  </main>;
}
