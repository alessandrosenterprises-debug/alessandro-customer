import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../supabaseClient';
import './pages.css';

export function Settings() {
  const { user, signOut } = useAuth();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [bookingNotifications, setBookingNotifications] = useState(true);
  const [promotionNotifications, setPromotionNotifications] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from('customer_preferences').select('*').eq('customer_id', user.id).maybeSingle()
      .then(({ data }) => {
        if (!data) return;
        setEmailNotifications(data.email_notifications);
        setBookingNotifications(data.booking_notifications);
        setPromotionNotifications(data.promotion_notifications);
      });
  }, [user]);

  async function save() {
    if (!user) return;
    const { error } = await supabase.from('customer_preferences').upsert({
      customer_id: user.id,
      email_notifications: emailNotifications,
      booking_notifications: bookingNotifications,
      promotion_notifications: promotionNotifications,
    });
    setMessage(error ? error.message : 'Preferences saved.');
  }

  return <div className="page"><h1>My Settings</h1><p className="page-subtitle">Control how Alessandro Enterprises communicates with you.</p><div className="settings-card"><h2>Notifications</h2><Toggle label="Email updates" checked={emailNotifications} onChange={setEmailNotifications} /><Toggle label="Booking updates" checked={bookingNotifications} onChange={setBookingNotifications} /><Toggle label="Promotions and offers" checked={promotionNotifications} onChange={setPromotionNotifications} /><button className="btn" onClick={() => void save()}>Save preferences</button>{message && <p className="form-success">{message}</p>}</div><div className="settings-card"><h2>Account</h2><p>Update your contact details from your Profile page.</p><button className="btn btn-secondary" onClick={() => void signOut()}>Log out</button></div></div>;
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (next: boolean) => void }) {
  return <label className="setting-toggle"><span>{label}</span><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} /></label>;
}
