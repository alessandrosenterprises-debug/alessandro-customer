import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './Navbar.css';

const links = [
  { to: '/', label: 'Home' },
  { to: '/profile', label: 'Profile' },
  { to: '/settings', label: 'Settings' },
  { to: '/products', label: 'Products' },
  { to: '/promotions', label: 'Promotions' },
  { to: '/book', label: 'Book' },
  { to: '/messages', label: 'Messages' },
  { to: '/requests', label: 'Requests' },
  { to: '/emails', label: 'Emails' },
];

export function Navbar() {
  const { user, signOut } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <img
          src="/logos/alessandroenterprises.png"
          alt="Alessandro Enterprises"
          className="brand-logo"
        />
        <span>Alessandro Enterprises</span>
      </div>
      <div className="navbar-links">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/'}
            className={({ isActive }) =>
              isActive ? 'navbar-link active' : 'navbar-link'
            }
          >
            {link.label}
          </NavLink>
        ))}
        <a
          className="navbar-link"
          href="https://alessandros-enterprises.vercel.app"
          target="_blank"
          rel="noreferrer"
        >
          Explore website ↗
        </a>
        <a className="navbar-link" href="mailto:alessandrosenterprises@gmail.com">
          Email support
        </a>
        <a className="navbar-link" href="https://wa.me/260768148043" target="_blank" rel="noreferrer">
          WhatsApp
        </a>
      </div>
      <div className="navbar-user">
        {user && (
          <>
            <span className="navbar-email">{user.email}</span>
            <button className="navbar-logout" onClick={() => signOut()}>
              Log out
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
