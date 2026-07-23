import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getActiveServices } from '../services/services';
import { createBooking } from '../services/bookings';
import { useRealtimeTable } from '../hooks/useRealtimeTable';
import type { Service } from '../types';
import './pages.css';

export function Booking() {
  const { user } = useAuth();
  const location = useLocation();
  const preselectedServiceId = (location.state as { serviceId?: string } | null)
    ?.serviceId;

  const [services, setServices] = useState<Service[]>([]);
  const [serviceId, setServiceId] = useState(preselectedServiceId ?? '');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [justBooked, setJustBooked] = useState(false);

  const loadServices = useCallback(async () => {
    const { data, error } = await getActiveServices();
      if (error) {
        console.error('Failed to load services:', error);
        setError('Failed to load services.');
      }
      setServices(data ?? []);
      if (!preselectedServiceId && data && data.length > 0) {
        setServiceId(data[0].id);
      }
      setLoading(false);
  }, [preselectedServiceId]);

  useEffect(() => {
    void loadServices();
  }, [loadServices]);

  useRealtimeTable('services', () => void loadServices());

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user) return;

    if (!serviceId || !date || !time) {
      setError('Please select a service, date, and time.');
      return;
    }

    const dateTime = new Date(`${date}T${time}`);

    if (Number.isNaN(dateTime.getTime())) {
      setError('Please enter a valid date and time.');
      return;
    }

    if (dateTime.getTime() < Date.now()) {
      setError('Please choose a date and time in the future.');
      return;
    }

    setSubmitting(true);
    setError(null);
    setJustBooked(false);

    const { error } = await createBooking({
      customer_id: user.id,
      service_id: serviceId,
      date: dateTime.toISOString(),
      notes: notes || undefined,
    });

    setSubmitting(false);

    if (error) {
      console.error('Failed to create booking:', error);
      setError('Failed to create booking. Please try again.');
      return;
    }

    // NotificationCenter shows the "Booking created" toast via Realtime;
    // this inline confirmation covers the moment before that event arrives.
    setJustBooked(true);
    setDate('');
    setTime('');
    setNotes('');
  }

  if (loading) return <div className="page-loading">Loading services...</div>;

  return (
    <div className="page">
      <h1>Book an Appointment</h1>
      <form className="form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="service">Service</label>
          <select
            id="service"
            required
            value={serviceId}
            onChange={(e) => setServiceId(e.target.value)}
          >
            <option value="" disabled>
              Select a service
            </option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} (${s.price})
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="date">Date</label>
          <input
            id="date"
            type="date"
            required
            value={date}
            min={new Date().toISOString().split('T')[0]}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="time">Time</label>
          <input
            id="time"
            type="time"
            required
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="notes">Notes</label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Anything we should know?"
          />
        </div>
        {error && <div className="form-error">{error}</div>}
        {justBooked && (
          <div className="form-success">
            Booking requested — we'll confirm your appointment soon.
          </div>
        )}
        <button className="btn" type="submit" disabled={submitting}>
          {submitting ? 'Booking...' : 'Book'}
        </button>
      </form>
    </div>
  );
}
