import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './Navbar.css';

const links = [
  { to: '/', label: 'Home' },
  { to: '/profile', label: 'Profile' },
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
      <div className="navbar-brand">Alessandro Enterprises</div>
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
