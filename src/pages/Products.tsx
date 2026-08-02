import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getActiveServices } from '../services/services';
import { getActiveBusinessProducts, type BusinessProduct } from '../services/businessCatalog';
import { useRealtimeTable } from '../hooks/useRealtimeTable';
import type { Service } from '../types';
import { formatZMW } from '../utils/currency';
import './pages.css';

export function Products() {
  const [services, setServices] = useState<Service[]>([]);
  const [products, setProducts] = useState<BusinessProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const loadCatalogue = async () => {
    const [serviceResult, productResult] = await Promise.all([getActiveServices(), getActiveBusinessProducts()]);
    setServices(serviceResult.data ?? []);
    setProducts(productResult.data ?? []);
    setError(serviceResult.error?.message ?? productResult.error?.message ?? null);
    setLoading(false);
  };
  useEffect(() => { void loadCatalogue(); }, []);
  useRealtimeTable('services', () => void loadCatalogue());
  useRealtimeTable('business_products', () => void loadCatalogue());
  return <main className="page products-page">
    <p className="eyebrow">DISCOVER</p><h1>Products &amp; Services</h1><p className="page-subtitle">Explore all our business units and the solutions we offer, designed to make life and work easier.</p>
    {loading && <div className="page-loading">Loading services...</div>}{error && <div className="page-error">{error}</div>}
    <div className="service-catalogue">{services.map((service) => <article className="card" key={service.id}>
      <div className="service-card-heading">{service.image_url ? <img src={service.image_url} alt="" /> : <span>{service.name.slice(0, 1)}</span>}<h3>{service.name}</h3><b>{'>'}</b></div>
      <p>{service.description || 'Professional service from Alessandro Enterprises.'}</p>
      {Number(service.price) > 0 && <p className="card-meta">{formatZMW(service.price)}</p>}
      <div className="service-card-actions"><button className="btn" onClick={() => navigate(`/products/${service.id}`)}>View service</button><button className="btn btn-secondary" onClick={() => navigate('/book', { state: { serviceId: service.id } })}>Book</button></div>
    </article>)}</div>
    {!loading && products.length > 0 && <><h2>Products</h2><div className="service-catalogue">{products.map((product) => <article className="card" key={product.id}>
      <div className="service-card-heading">{product.image_url ? <img src={product.image_url} alt="" /> : <span>{product.name.slice(0, 1)}</span>}<h3>{product.name}</h3><b>{'>'}</b></div>
      <p>{product.description || 'Available from Alessandro Enterprises.'}</p>
      {Number(product.price) > 0 && <p className="card-meta">{formatZMW(product.price)}</p>}
    </article>)}</div></>}
    {!loading && !services.length && !products.length && <p className="page-empty">No services or products are available right now.</p>}
  </main>;
}
