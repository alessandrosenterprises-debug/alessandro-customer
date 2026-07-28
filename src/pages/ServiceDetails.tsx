import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { formatZMW } from '../utils/currency';
import './pages.css';

type Service = { id: string; name: string; description: string | null; long_description: string | null; price: number | null; duration: number | null; image_url: string | null };
type Photo = { id: string; image_url: string; caption: string | null; sort_order: number };

export function ServiceDetails() {
  const { id } = useParams();
  const [service, setService] = useState<Service | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    async function load() {
      const [serviceResult, galleryResult] = await Promise.all([
        supabase.from('services').select('id,name,description,long_description,price,duration,image_url').eq('id', id).maybeSingle(),
        supabase.from('service_gallery').select('*').eq('service_id', id).order('sort_order'),
      ]);
      setService(serviceResult.data as Service | null); setPhotos((galleryResult.data ?? []) as Photo[]); setLoading(false);
    }
    void load();
  }, [id]);
  if (loading) return <div className="page-loading">Loading service...</div>;
  if (!service) return <div className="page-error">This service is not available.</div>;
  const items = (service.long_description || service.description || '').split(/\n+/).map((item) => item.replace(/^[-*]\s*/, '').trim()).filter(Boolean);
  const details = service.long_description || service.description || 'Full service information will be available soon.';
  const showPrice = Number(service.price) > 0;
  return <main className="service-detail-page">
    <Link className="back-link" to="/products">{'<'} All services</Link>
    <section className="service-detail-hero">
      <div><p className="eyebrow">ABOUT THE BUSINESS</p><h1>{service.name}</h1><p>{details}</p>
        {(showPrice || service.duration) && <strong>{showPrice ? formatZMW(service.price) : ''}{showPrice && service.duration ? '  |  ' : ''}{service.duration ? `${service.duration} minutes` : ''}</strong>}
        <div className="service-actions"><Link className="btn" to="/book" state={{ serviceId: service.id }}>Book Service</Link><a className="btn btn-secondary" href="tel:+260530383949">Call</a><a className="btn btn-secondary" href="mailto:alessandrosenterprises@gmail.com?subject=Service enquiry">Email</a><a className="btn btn-secondary" href="https://wa.me/260530383949" target="_blank" rel="noreferrer">WhatsApp</a></div>
      </div>
    </section>
    <section className="service-gallery"><h2>Service gallery</h2><div>
      {photos.map((photo) => <figure key={photo.id}><img src={photo.image_url} alt={photo.caption || service.name} />{photo.caption && <figcaption>{photo.caption}</figcaption>}</figure>)}
      {!photos.length && service.image_url && <figure><img src={service.image_url} alt={service.name} /></figure>}
      {Array.from({ length: Math.max(0, 3 - photos.length - (service.image_url && !photos.length ? 1 : 0)) }).map((_, index) => <figure className="gallery-placeholder" key={index}><span>Image {index + 1}</span><figcaption>Images will be added by the business team.</figcaption></figure>)}
    </div></section>
    <section className="service-includes"><h2>What this service includes</h2>{items.length ? <ul>{items.map((item, index) => <li key={index}>{item}</li>)}</ul> : <p>Full service information will be listed here.</p>}</section>
  </main>;
}
