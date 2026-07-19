import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { getCustomerEmails, createEmail } from '../services/emails';
import { useRealtimeTable } from '../hooks/useRealtimeTable';
import type { CustomerEmail } from '../types';
import './pages.css';

export function Emails() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [emails, setEmails] = useState<CustomerEmail[]>([]);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadEmails = useCallback(async () => {
    if (!user) return;
    const { data, error } = await getCustomerEmails(user.id);
      if (error) {
        console.error('Failed to load emails:', error);
        setError('Failed to load emails.');
      }
      setEmails(data ?? []);
      setLoading(false);
  }, [user]);

  useEffect(() => {
    void loadEmails();
  }, [loadEmails]);

  useRealtimeTable('emails', () => void loadEmails(), user ? `customer_id=eq.${user.id}` : undefined);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user) return;

    if (!subject.trim() || !body.trim()) {
      setError('Subject and body are required.');
      return;
    }

    setSubmitting(true);
    setError(null);

    const { data, error } = await createEmail({
      customer_id: user.id,
      subject,
      body,
    });

    setSubmitting(false);

    if (error) {
      console.error('Failed to send email:', error);
      setError('Failed to send email.');
      return;
    }

    if (data) setEmails((prev) => [data, ...prev]);
    setSubject('');
    setBody('');
    showToast('success', 'Email sent', 'Your email has been recorded.');
  }

  return (
    <div className="page">
      <h1>Emails</h1>
      <form className="form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="subject">Subject</label>
          <input
            id="subject"
            required
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="body">Body</label>
          <textarea
            id="body"
            required
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
        </div>
        {error && <div className="form-error">{error}</div>}
        <button className="btn" type="submit" disabled={submitting}>
          {submitting ? 'Sending...' : 'Send email'}
        </button>
      </form>

      <h2>Email History</h2>
      {loading && <div className="page-loading">Loading emails...</div>}
      {!loading && emails.length === 0 && (
        <p className="page-empty">No emails yet.</p>
      )}
      {emails.map((e) => (
        <div className="card" key={e.id}>
          <h3>{e.subject}</h3>
          <p>{e.body}</p>
          <p className="card-meta">
            {new Date(e.sent_at).toLocaleString()} · {e.status}
          </p>
        </div>
      ))}
    </div>
  );
}
