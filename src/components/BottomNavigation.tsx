import { NavLink } from 'react-router-dom';
import './BottomNavigation.css';

const items = [
  { to: '/', label: 'Home', icon: '\u2302' },
  { to: '/products', label: 'Services', icon: '\u25A6' },
  { to: '/book', label: 'Book', icon: '\u25A3', raised: true },
  { to: '/updates', label: 'Updates', icon: '\u25A4' },
  { to: '/messages', label: 'Messages', icon: '\u25CB' },
];

export function BottomNavigation() {
  return (
    <nav className="bottom-navigation" aria-label="Customer portal navigation">
      {items.map((item) => (
        <NavLink key={item.to} to={item.to} end={item.to === '/'} className={({ isActive }) => `bottom-nav-item${isActive ? ' active' : ''}${item.raised ? ' raised' : ''}`}>
          <span className="bottom-nav-icon">{item.icon}</span><span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
