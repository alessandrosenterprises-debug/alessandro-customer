import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getCustomerRequests, createRequest } from '../services/requests';
import { useRealtimeTable } from '../hooks/useRealtimeTable';
import type { CustomerRequest } from '../types';
import './pages.css';

function badgeClass(status: string) {
  return `badge badge-${status.toLowerCase().replace(/\s+/g, '-')}`;
}

export function Requests() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<CustomerRequest[]>([]);
  const [requestType, setRequestType] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [justSubmitted, setJustSubmitted] = useState(false);

  const loadRequests = useCallback(async () => {
    if (!user) return;
    const { data, error } = await getCustomerRequests(user.id);
      if (error) {
        console.error('Failed to load requests:', error);
        setError('Failed to load requests.');
      }
      setRequests(data ?? []);
      setLoading(false);
  }, [user]);

  useEffect(() => {
    void loadRequests();
  }, [loadRequests]);

  useRealtimeTable('requests', () => void loadRequests(), user ? `customer_id=eq.${user.id}` : undefined);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user) return;

    if (!requestType.trim() || !description.trim()) {
      setError('Please fill in both fields.');
      return;
    }

    setSubmitting(true);
    setError(null);
    setJustSubmitted(false);

    const { data, error } = await createRequest({
      customer_id: user.id,
      request_type: requestType,
      description,
    });

    setSubmitting(false);

    if (error) {
      console.error('Failed to submit request:', error);
      setError('Failed to submit request.');
      return;
    }

    if (data) setRequests((prev) => [data, ...prev]);
    setRequestType('');
    setDescription('');
    // NotificationCenter shows the "Request submitted" toast via Realtime.
    setJustSubmitted(true);
  }

  return (
    <div className="page">
      <h1>Requests</h1>
      <form className="form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="requestType">Request Type</label>
          <input
            id="requestType"
            required
            placeholder="e.g. Reschedule, Refund, General inquiry"
            value={requestType}
            onChange={(e) => setRequestType(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        {error && <div className="form-error">{error}</div>}
        {justSubmitted && (
          <div className="form-success">Request submitted — we'll review it shortly.</div>
        )}
        <button className="btn" type="submit" disabled={submitting}>
          {submitting ? 'Submitting...' : 'Submit request'}
        </button>
      </form>

      <h2>Your Requests</h2>
      {loading && <div className="page-loading">Loading requests...</div>}
      {!loading && requests.length === 0 && (
        <p className="page-empty">No requests yet.</p>
      )}
      {requests.map((r) => (
        <div className="card" key={r.id}>
          <h3>{r.request_type}</h3>
          <p>{r.description}</p>
          <p className="card-meta">
            {new Date(r.created_at).toLocaleString()}
          </p>
          <span className={badgeClass(r.status)}>{r.status}</span>
        </div>
      ))}
    </div>
  );
}
