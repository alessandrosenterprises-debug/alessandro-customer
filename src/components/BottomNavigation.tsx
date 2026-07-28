import { NavLink } from 'react-router-dom';
import './BottomNavigation.css';

const items = [
  { to: '/', label: 'Home', icon: '⌂' },
  { to: '/products', label: 'Services', icon: '▦' },
  { to: '/book', label: 'Book', icon: '▣', raised: true },
  { to: '/updates', label: 'Updates', icon: '▤' },
  { to: '/messages', label: 'Messages', icon: '◌' },
];

export function BottomNavigation() {
  return <nav className="bottom-navigation" aria-label="Customer portal navigation">
    {items.map((item) => <NavLink key={item.to} to={item.to} end={item.to === '/'} className={({ isActive }) => `bottom-nav-item${isActive ? ' active' : ''}${item.raised ? ' raised' : ''}`}>
      <span className="bottom-nav-icon">{item.icon}</span><span>{item.label}</span>
    </NavLink>)}
  </nav>;
}
