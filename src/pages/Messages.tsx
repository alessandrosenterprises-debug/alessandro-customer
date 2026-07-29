import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getCustomerMessages, createMessage } from '../services/messages';
import { useRealtimeTable } from '../hooks/useRealtimeTable';
import type { Message } from '../types';
import './pages.css';

export function Messages() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [justSent, setJustSent] = useState(false);

  const loadMessages = useCallback(async () => {
    if (!user) return;
    const { data, error } = await getCustomerMessages(user.id);
      if (error) {
        console.error('Failed to load messages:', error);
        setError('Failed to load messages.');
      }
      setMessages(data ?? []);
      setLoading(false);
  }, [user]);

  useEffect(() => {
    void loadMessages();
  }, [loadMessages]);

  useRealtimeTable('messages', () => void loadMessages(), user ? `customer_id=eq.${user.id}` : undefined);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user) return;

    if (!subject.trim() || !body.trim()) {
      setError('Subject and message body are required.');
      return;
    }

    setSubmitting(true);
    setError(null);
    setJustSent(false);

    const { data, error } = await createMessage({
      customer_id: user.id,
      subject,
      body,
    });

    setSubmitting(false);

    if (error) {
      console.error('Failed to send message:', error);
      setError('Failed to send message.');
      return;
    }

    if (data) setMessages((prev) => [data, ...prev]);
    setSubject('');
    setBody('');
    // NotificationCenter shows the "Message received" toast via Realtime.
    setJustSent(true);
  }

  return (
    <div className="page">
      <h1>Messages</h1>
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
          <label htmlFor="body">Message</label>
          <textarea
            id="body"
            required
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
        </div>
        {error && <div className="form-error">{error}</div>}
        {justSent && (
          <div className="form-success">Message sent — we'll get back to you soon.</div>
        )}
        <button className="btn" type="submit" disabled={submitting}>
          {submitting ? 'Sending...' : 'Send'}
        </button>
      </form>

      <h2>Message History</h2>
      {loading && <div className="page-loading">Loading messages...</div>}
      {!loading && messages.length === 0 && (
        <p className="page-empty">No messages yet.</p>
      )}
      {messages.map((m) => (
        <div className="card" key={m.id}>
          <h3>{m.subject}</h3>
          <p>{m.body}</p>
          <p className="card-meta">
            {new Date(m.sent_at).toLocaleString()} · {m.status}
          </p>
        </div>
      ))}
    </div>
  );
}
