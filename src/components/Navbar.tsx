import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getCustomer } from '../services/customers';
import { CustomerNotifications } from './CustomerNotifications';
import './Navbar.css';

const menu = [{ to: '/profile', label: 'My profile' }, { to: '/history', label: 'History' }, { to: '/promotions', label: 'Promotions' }, { to: '/requests', label: 'Requests' }, { to: '/emails', label: 'Emails' }, { to: '/settings', label: 'Settings' }];
export function Navbar() { const { user, signOut } = useAuth(); const [open, setOpen] = useState(false); const [avatar, setAvatar] = useState<string | null>(null); useEffect(() => { if (user) getCustomer(user.id).then(({ data }) => setAvatar(data?.avatar_url ?? null)); }, [user]); return <header className="portal-app-header"><button className="portal-menu-trigger" onClick={() => setOpen(!open)} aria-label="Open menu">☰</button><NavLink className="portal-app-brand" to="/"><img src="/logos/alessandroenterprises.png" alt="Alessandro Enterprises"/><span>ALESSANDRO<small>ENTERPRISES</small></span></NavLink><div className="portal-app-actions"><CustomerNotifications/><button className="portal-avatar-button" onClick={() => setOpen(!open)}>{avatar ? <img src={avatar} alt="My account"/> : <span>{(user?.email?.[0] ?? 'A').toUpperCase()}</span>}</button></div>{open && <div className="portal-drawer"><p>MY ACCOUNT</p>{menu.map((item) => <NavLink key={item.to} to={item.to} onClick={() => setOpen(false)}>{item.label}</NavLink>)}<a href="mailto:alessandrosenterprises@gmail.com">Email support</a><a href="tel:+260573383949">Call +260 573 383 949</a><button onClick={() => void signOut()}>Log out</button></div>}</header>; }
