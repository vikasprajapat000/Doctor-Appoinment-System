import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Background3D from '../components/Background3D';

const doctorsList = [
  { id: 1, name: 'Dr. Rajesh Kumar', specialty: 'Cardiologist', rating: 4.9, reviews: 124, exp: '15 Yrs', color: '#667eea', avatar: '👨‍⚕️' },
  { id: 2, name: 'Dr. Sunita Verma', specialty: 'Dermatologist', rating: 4.8, reviews: 98, exp: '12 Yrs', color: '#2ecc71', avatar: '👩‍⚕️' },
  { id: 3, name: 'Dr. Anil Sharma', specialty: 'General Physician', rating: 4.7, reviews: 312, exp: '20 Yrs', color: '#3498db', avatar: '👨‍⚕️' },
  { id: 4, name: 'Dr. Priya Patel', specialty: 'Pediatrician', rating: 4.9, reviews: 205, exp: '10 Yrs', color: '#764ba2', avatar: '👩‍⚕️' },
  { id: 5, name: 'Dr. Vikram Singh', specialty: 'Orthopedist', rating: 4.6, reviews: 156, exp: '18 Yrs', color: '#667eea', avatar: '👨‍⚕️' },
  { id: 6, name: 'Dr. Neha Gupta', specialty: 'Gynecologist', rating: 4.9, reviews: 280, exp: '14 Yrs', color: '#764ba2', avatar: '👩‍⚕️' },
  { id: 7, name: 'Dr. Amit Desai', specialty: 'Neurologist', rating: 4.8, reviews: 89, exp: '16 Yrs', color: '#3498db', avatar: '👨‍⚕️' },
  { id: 8, name: 'Dr. Kavita Reddy', specialty: 'Psychiatrist', rating: 5.0, reviews: 110, exp: '9 Yrs', color: '#2ecc71', avatar: '👩‍⚕️' }
];

const specialties = ['All', 'Cardiologist', 'Dermatologist', 'General Physician', 'Pediatrician', 'Orthopedist', 'Gynecologist', 'Neurologist', 'Psychiatrist'];

const Doctors = () => {
  const [filter, setFilter] = useState('All');
  const filteredDoctors = filter === 'All' ? doctorsList : doctorsList.filter(d => d.specialty === filter);

  const C = {
    bg: '#0b0f1a',
    card: 'rgba(15, 20, 35, 0.65)',
    border: 'rgba(102, 126, 234, 0.12)',
    primary: '#667eea',
    secondary: '#764ba2',
    accent: '#3498db',
    text: '#e2e8f0',
    muted: '#94a3b8',
    white: '#ffffff',
    gradient: 'linear-gradient(135deg, #667eea, #764ba2)',
  };

  const glassCard = {
    background: C.card,
    backdropFilter: 'blur(16px)',
    border: `1px solid ${C.border}`,
    borderRadius: '16px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
  };

  return (
    <div style={{ background: C.bg, color: C.text, fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', minHeight: '100vh', overflowX: 'hidden', position: 'relative' }}>
      <Navbar />
      <Background3D />

      {/* Hero Section */}
      <section style={{ padding: '140px 2rem 4rem', background: 'transparent', textAlign: 'center', position: 'relative', zIndex: 2 }}>
        <div style={{ display: 'inline-flex', gap: '0.5rem', alignItems: 'center', background: 'rgba(102,126,234,0.12)', border: '1px solid rgba(102,126,234,0.25)', borderRadius: '20px', padding: '0.4rem 1.1rem', marginBottom: '1.5rem', color: C.primary, fontSize: '0.85rem', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase' }}>
          🩺 Meet Our Experts
        </div>
        <h1 style={{ fontSize: 'clamp(2.4rem, 5vw, 3.6rem)', fontWeight: '900', marginBottom: '1.25rem', color: C.white, letterSpacing: '-1px' }}>
          Top Doctors <span style={{ background: C.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>At Your Service</span>
        </h1>
        <p style={{ color: C.muted, maxWidth: '600px', margin: '0 auto', lineHeight: '1.8', fontSize: '1.05rem' }}>
          Book an appointment with India\'s most trusted healthcare professionals. In-person visits or HD video consultations.
        </p>
      </section>

      {/* Filter Section */}
      <section style={{ padding: '2rem 0', background: 'transparent', position: 'relative', zIndex: 2 }}>
        <div style={{ width: '100%', padding: '0 4rem' }}>
          <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem', scrollbarWidth: 'none' }}>
            {specialties.map(spec => (
              <button 
                key={spec}
                onClick={() => setFilter(spec)}
                style={{
                  padding: '0.6rem 1.25rem',
                  borderRadius: '25px',
                  border: filter === spec ? 'none' : `1px solid ${C.border}`,
                  background: filter === spec ? C.gradient : 'rgba(255,255,255,0.04)',
                  color: C.white,
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s',
                  boxShadow: filter === spec ? '0 4px 12px rgba(102,126,234,0.25)' : 'none',
                  backdropFilter: 'blur(8px)'
                }}
              >
                {spec}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Doctors Grid */}
      <section style={{ padding: '2rem 0 6rem', background: 'transparent', position: 'relative', zIndex: 2 }}>
        <div style={{ width: '100%', padding: '0 4rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {filteredDoctors.map(doctor => (
              <div key={doctor.id} style={{ ...glassCard, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ height: '100px', background: `linear-gradient(135deg, ${doctor.color}15, ${doctor.color}30)`, position: 'relative' }}>
                  <div style={{ position: 'absolute', bottom: '-35px', left: '20px', width: '70px', height: '70px', borderRadius: '50%', background: C.bg, border: `2px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
                    {doctor.avatar}
                  </div>
                  <div style={{ position: 'absolute', top: '15px', right: '15px', background: 'rgba(15,20,35,0.85)', border: `1px solid ${C.border}`, padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '800', color: doctor.color }}>
                    {doctor.exp} Exp
                  </div>
                </div>
                
                <div style={{ padding: '3.5rem 1.5rem 1.5rem' }}>
                  <h3 style={{ fontWeight: '800', fontSize: '1.15rem', color: C.white, marginBottom: '0.2rem' }}>{doctor.name}</h3>
                  <div style={{ color: doctor.color, fontWeight: '700', fontSize: '0.85rem', marginBottom: '0.75rem' }}>{doctor.specialty}</div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1.5rem' }}>
                    <span style={{ color: '#fbbf24', fontSize: '1rem' }}>★</span>
                    <span style={{ fontWeight: '700', color: C.white, fontSize: '0.9rem' }}>{doctor.rating}</span>
                    <span style={{ color: C.muted, fontSize: '0.8rem' }}>({doctor.reviews} reviews)</span>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Link to="/register" style={{ flex: 1, padding: '0.6rem 0', background: 'rgba(255,255,255,0.05)', color: C.white, border: `1px solid ${C.border}`, borderRadius: '8px', textAlign: 'center', textDecoration: 'none', fontWeight: '700', fontSize: '0.85rem', transition: 'all 0.2s', backdropFilter: 'blur(8px)' }}>
                      Profile
                    </Link>
                    <Link to="/login" style={{ flex: 1, padding: '0.6rem 0', background: C.gradient, color: C.white, border: 'none', borderRadius: '8px', textAlign: 'center', textDecoration: 'none', fontWeight: '700', fontSize: '0.85rem', transition: 'all 0.2s' }}>
                      Book 
                    </Link>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredDoctors.length === 0 && (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem 2rem' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>😞</div>
                <h3 style={{ fontSize: '1.2rem', color: C.white, marginBottom: '0.5rem' }}>No doctors found</h3>
                <p style={{ color: C.muted }}>We currently don\'t have experts in this category.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: '5rem 0', background: 'transparent', position: 'relative', zIndex: 2 }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', background: 'rgba(15,20,35,0.55)', backdropFilter: 'blur(16px)', border: '1px solid rgba(102,126,234,0.2)', borderRadius: '24px', padding: '3.5rem 2.5rem' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '1rem', background: C.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Are you a Doctor?</h2>
          <p style={{ color: C.muted, marginBottom: '2rem', fontSize: '1.05rem' }}>Join our network and reach thousands of patients daily.</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link to="/register" style={{ padding: '0.9rem 2.5rem', background: C.gradient, color: C.white, textDecoration: 'none', borderRadius: '12px', fontWeight: '800', boxShadow: '0 8px 24px rgba(102,126,234,0.35)' }}>Apply Now</Link>
          </div>
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer style={{ background: '#060912', borderTop: '1px solid rgba(255,255,255,0.05)', padding: '4rem 2rem 2rem', position: 'relative', zIndex: 2 }}>
        <div style={{ width: '100%', padding: '0 4rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px,1fr))', gap: '2rem', marginBottom: '3rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <span style={{ fontSize: '1.2rem' }}>⚕️</span>
                <span style={{ fontWeight: '800', color: C.white, fontSize: '1.05rem' }}>Doctor Appointment System</span>
              </div>
              <p style={{ color: C.muted, fontSize: '0.85rem', lineHeight: 1.7 }}>Making quality healthcare accessible to everyone, everywhere.</p>
            </div>
            {[
              { title: 'Platform', links: [{ l: 'Home', p: '/' }, { l: 'Services', p: '/services' }, { l: 'Doctors', p: '/doctors' }, { l: 'How It Works', p: '/how-it-works' }] },
              { title: 'Company', links: [{ l: 'About', p: '/about' }, { l: 'Contact', p: '/contact' }, { l: 'FAQ', p: '/faq' }] },
              { title: 'Account', links: [{ l: 'Login', p: '/login' }, { l: 'Register', p: '/register' }] }
            ].map(col => (
              <div key={col.title}>
                <h4 style={{ fontWeight: '700', marginBottom: '1rem', color: '#cbd5e1', fontSize: '0.88rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{col.title}</h4>
                {col.links.map(lk => (
                  <div key={lk.l} style={{ marginBottom: '0.5rem' }}>
                    <Link to={lk.p} style={{ color: C.muted, textDecoration: 'none', fontSize: '0.87rem', transition: 'color 0.2s' }}>{lk.l}</Link>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem', textAlign: 'center', color: '#475569', fontSize: '0.82rem' }}>
            © 2025 Doctor Appointment System. Built with ❤️ for better healthcare.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Doctors;
