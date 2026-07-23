import { useEffect, useState, type FormEvent } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { getCustomerWithRetry, updateCustomer } from '../services/customers';
import type { Customer } from '../types';
import './pages.css';

export function Profile() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notReady, setNotReady] = useState(false);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    getCustomerWithRetry(user.id).then(({ data, error }) => {
      if (cancelled) return;
      if (error && !data) {
        console.error('Failed to load profile after retries:', error);
        setNotReady(true);
      } else {
        setCustomer(data);
      }
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [user]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!customer || !user) return;
    setSaving(true);
    setError(null);

    const { data, error } = await updateCustomer(user.id, {
      name: customer.name,
      business: customer.business,
      phone: customer.phone,
      address: customer.address,
    });

    setSaving(false);

    if (error) {
      console.error('Failed to save profile:', error);
      setError('Failed to save changes.');
      return;
    }

    setCustomer(data);
    showToast('success', 'Profile updated', 'Your changes have been saved.');
  }

  if (loading) return <div className="page-loading">Loading profile...</div>;

  if (notReady) {
    return (
      <div className="page-loading">
        We're still finishing setting up your account. Please refresh in a
        few seconds.
      </div>
    );
  }

  if (!customer) return <div className="page-error">Profile not found.</div>;

  return (
    <div className="page">
      <h1>Your Profile</h1>
      <form className="form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input
            id="name"
            required
            value={customer.name}
            onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label htmlFor="business">Business</label>
          <input
            id="business"
            value={customer.business ?? ''}
            onChange={(e) =>
              setCustomer({ ...customer, business: e.target.value })
            }
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input id="email" value={customer.email} disabled />
        </div>
        <div className="form-group">
          <label htmlFor="phone">Phone</label>
          <input
            id="phone"
            value={customer.phone ?? ''}
            onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label htmlFor="address">Address</label>
          <textarea
            id="address"
            value={customer.address ?? ''}
            onChange={(e) =>
              setCustomer({ ...customer, address: e.target.value })
            }
          />
        </div>
        {error && <div className="form-error">{error}</div>}
        <button className="btn" type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save changes'}
        </button>
      </form>
    </div>
  );
}
