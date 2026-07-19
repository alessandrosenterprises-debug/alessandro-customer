import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getActiveServices } from '../services/services';
import type { Service } from '../types';
import './pages.css';

export function Products() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    getActiveServices().then(({ data, error }) => {
      if (error) {
        console.error('Failed to load services:', error);
        setError('Failed to load services.');
      }
      setServices(data ?? []);
      setLoading(false);
    });
  }, []);

  return (
    <div className="page">
      <h1>Products &amp; Services</h1>
      {loading && <div className="page-loading">Loading services...</div>}
      {error && <div className="page-error">{error}</div>}
      {!loading && services.length === 0 && (
        <p className="page-empty">No services available right now.</p>
      )}
      {services.map((service) => (
        <div className="card" key={service.id}>
          <h3>{service.name}</h3>
          <p>{service.description}</p>
          <p className="card-meta">
            {service.duration ? `${service.duration} min · ` : ''}$
            {service.price}
          </p>
          <button
            className="btn"
            onClick={() => navigate('/book', { state: { serviceId: service.id } })}
          >
            Book
          </button>
        </div>
      ))}
    </div>
  );
}
