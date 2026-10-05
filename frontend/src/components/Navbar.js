import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const isLoggedIn = localStorage.getItem('token');
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  const getDashboardLink = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const role = user.role;
    if (role === 'doctor') return '/doctor/dashboard';
    if (role === 'patient') return '/patient/dashboard';
    if (role === 'admin') return '/admin/dashboard';
    if (role === 'superadmin') return '/superadmin/dashboard';
    return '/';
  };

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/services', label: 'Services' },
    { path: '/doctors', label: 'Doctors' },
    { path: '/how-it-works', label: 'How It Works' },
    { path: '/about', label: 'About' },
    { path: '/contact', label: 'Contact' },
  ];

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
      background: scrolled ? 'rgba(11, 15, 26, 0.92)' : 'rgba(11, 15, 26, 0.55)',
      backdropFilter: 'blur(16px)',
      borderBottom: scrolled ? '1px solid rgba(102,126,234,0.15)' : '1px solid rgba(255,255,255,0.06)',
      boxShadow: scrolled ? '0 4px 20px rgba(102,126,234,0.08)' : 'none',
      transition: 'all 0.3s ease',
      padding: '0 2rem'
    }}>
      <div style={{ width: '100%', padding: '0 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '68px' }}>
        {/* Brand */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem'
          }}>⚕️</div>
          <span style={{ color: '#ffffff', fontWeight: '800', fontSize: '1.1rem', letterSpacing: '-0.3px' }}>
            Doctor<span style={{ color: '#667eea' }}>Appointment</span>System
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', flexWrap: 'wrap' }}>
          {navLinks.map(link => (
            <Link key={link.path} to={link.path} style={{
              color: isActive(link.path) ? '#667eea' : '#cbd5e1',
              textDecoration: 'none', padding: '0.45rem 0.8rem', borderRadius: '7px',
              fontSize: '0.88rem', fontWeight: isActive(link.path) ? '700' : '500',
              background: isActive(link.path) ? 'rgba(102,126,234,0.12)' : 'transparent',
              transition: 'all 0.2s'
            }}>
              {link.label}
            </Link>
          ))}
        </div>

        {/* CTA Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {!isLoggedIn ? (
            <>
              <Link to="/login" style={{
                color: '#ffffff', textDecoration: 'none', padding: '0.5rem 1rem', borderRadius: '8px',
                fontSize: '0.88rem', fontWeight: '600', border: '1px solid rgba(255,255,255,0.12)',
                background: 'rgba(255,255,255,0.04)', transition: 'all 0.2s'
              }}>
                Login
              </Link>
              <Link to="/register" style={{
                color: '#ffffff', textDecoration: 'none', padding: '0.5rem 1.2rem', borderRadius: '8px',
                fontSize: '0.88rem', fontWeight: '700',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                boxShadow: '0 4px 16px rgba(102,126,234,0.3)', transition: 'all 0.2s'
              }}>
                Get Started
              </Link>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Link to={getDashboardLink()} style={{
                color: '#ffffff', textDecoration: 'none', padding: '0.5rem 1.1rem', borderRadius: '8px',
                fontSize: '0.88rem', fontWeight: '700',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                boxShadow: '0 4px 12px rgba(102,126,234,0.25)'
              }}>
                Dashboard
              </Link>
              <button onClick={handleLogout} style={{
                color: '#cbd5e1', background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px',
                padding: '0.5rem 1rem', cursor: 'pointer', fontSize: '0.88rem', fontWeight: '500'
              }}>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
