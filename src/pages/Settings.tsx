import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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

  return <div className="page"><p className="eyebrow">MY ACCOUNT</p><h1>Settings</h1><p className="page-subtitle">Choose how your portal works and how Alessandro Enterprises keeps in touch.</p><div className="settings-grid"><div className="settings-card"><h2>Notifications</h2><Toggle label="Email updates" checked={emailNotifications} onChange={setEmailNotifications} /><Toggle label="Booking updates" checked={bookingNotifications} onChange={setBookingNotifications} /><Toggle label="Promotions and offers" checked={promotionNotifications} onChange={setPromotionNotifications} /><button className="btn" onClick={() => void save()}>Save preferences</button>{message && <p className="form-success">{message}</p>}</div><div className="settings-card"><h2>My account</h2><p>Keep your name, phone number, and business details current.</p><div className="settings-actions"><Link className="btn btn-secondary" to="/profile">Edit profile</Link><Link className="btn btn-secondary" to="/history">View history</Link></div><button className="btn btn-secondary settings-logout" onClick={() => void signOut()}>Log out securely</button></div><div className="settings-card settings-support"><h2>Need help?</h2><p>Our team is here to help with your account, booking, or request.</p><a href="mailto:alessandrosenterprises@gmail.com">alessandrosenterprises@gmail.com</a><a href="tel:+260768148043">0768 148 043</a><a href="https://wa.me/260768148043" target="_blank" rel="noreferrer">Chat on WhatsApp</a></div></div></div>;
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (next: boolean) => void }) {
  return <label className="setting-toggle"><span>{label}</span><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} /></label>;
}
