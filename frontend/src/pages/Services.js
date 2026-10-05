import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Background3D from '../components/Background3D';

const services = [
  { icon: '👨‍⚕️', title: 'Specialist Consultations', desc: 'Connect with top-rated specialists across 30+ medical fields for accurate diagnosis and treatment.', color: '#667eea' },
  { icon: '🎥', title: 'Video Telemedicine', desc: 'Secure, high-definition video calls for remote consultations from the comfort of your home.', color: '#2ecc71' },
  { icon: '💊', title: 'E-Prescriptions', desc: 'Receive digital prescriptions instantly after your visit. Easy to download and share with pharmacies.', color: '#764ba2' },
  { icon: '🧪', title: 'Lab Tests At Home', desc: 'Book diagnostic tests online and get samples collected right from your doorstep.', color: '#3498db' },
  { icon: '🏥', title: 'Clinical Procedures', desc: 'Schedule minor clinical procedures with our network of trusted partner clinics and hospitals.', color: '#667eea' },
  { icon: '🧘‍♀️', title: 'Mental Wellness', desc: 'Therapy and counseling sessions with certified psychologists and psychiatrists.', color: '#764ba2' }
];

const Services = () => {
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
      <section style={{ padding: '140px 2rem 5rem', background: 'transparent', textAlign: 'center', position: 'relative', zIndex: 2 }}>
        <div style={{ display: 'inline-flex', gap: '0.5rem', alignItems: 'center', background: 'rgba(102,126,234,0.12)', border: '1px solid rgba(102,126,234,0.25)', borderRadius: '20px', padding: '0.4rem 1.1rem', marginBottom: '1.5rem', color: C.primary, fontSize: '0.85rem', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase' }}>
          ✨ Our Services
        </div>
        <h1 style={{ fontSize: 'clamp(2.4rem, 5vw, 3.6rem)', fontWeight: '900', marginBottom: '1.25rem', color: C.white, letterSpacing: '-1px' }}>
          Comprehensive Healthcare <br/>
          <span style={{ background: C.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Tailored For You</span>
        </h1>
        <p style={{ color: C.muted, maxWidth: '620px', margin: '0 auto', lineHeight: '1.8', fontSize: '1.05rem' }}>
          From online consultations to in-clinic procedures, Doctor Appointment System provides end-to-end medical services to keep you and your family healthy.
        </p>
      </section>

      {/* Services Grid */}
      <section style={{ padding: '5rem 0', background: 'transparent', position: 'relative', zIndex: 2 }}>
        <div style={{ width: '100%', padding: '0 4rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
            {services.map((s, index) => (
              <div key={index} style={{ ...glassCard, padding: '2.5rem', display: 'flex', flexDirection: 'column', transition: 'transform 0.25s' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'rgba(102,126,234,0.1)', border: `1px solid ${s.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', marginBottom: '1.5rem', boxShadow: '0 4px 10px rgba(0,0,0,0.15)' }}>
                  {s.icon}
                </div>
                <h3 style={{ fontWeight: '800', fontSize: '1.2rem', marginBottom: '0.75rem', color: C.white }}>{s.title}</h3>
                <p style={{ color: C.muted, lineHeight: '1.7', fontSize: '0.95rem', flexGrow: 1 }}>{s.desc}</p>
                <div style={{ marginTop: '1.5rem' }}>
                  <Link to="/doctors" style={{ color: s.color, fontWeight: '700', textDecoration: 'none', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                    View Doctors <span style={{ fontSize: '1.1rem' }}>→</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How To Book Section */}
      <section style={{ padding: '6rem 0', background: 'transparent', position: 'relative', zIndex: 2 }}>
        <div style={{ width: '100%', padding: '0 4rem', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '1.5rem', color: C.white }}>Need Immediate Care?</h2>
          <p style={{ color: C.muted, fontSize: '1.1rem', marginBottom: '3rem' }}>Booking an appointment is quick and completely online.</p>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1.5rem' }}>
            <div style={{ ...glassCard, padding: '1.5rem 2rem', flex: '1', minWidth: '250px' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>1️⃣</div>
              <h4 style={{ fontWeight: '700', color: C.white, marginBottom: '0.5rem' }}>Search Doctor</h4>
              <p style={{ color: C.muted, fontSize: '0.9rem' }}>Find a specialist based on symptoms or specialty.</p>
            </div>
            <div style={{ ...glassCard, padding: '1.5rem 2rem', flex: '1', minWidth: '250px' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>2️⃣</div>
              <h4 style={{ fontWeight: '700', color: C.white, marginBottom: '0.5rem' }}>Pick a Slot</h4>
              <p style={{ color: C.muted, fontSize: '0.9rem' }}>Choose an available date and time that suits you.</p>
            </div>
            <div style={{ ...glassCard, padding: '1.5rem 2rem', flex: '1', minWidth: '250px' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>3️⃣</div>
              <h4 style={{ fontWeight: '700', color: C.white, marginBottom: '0.5rem' }}>Consult</h4>
              <p style={{ color: C.muted, fontSize: '0.9rem' }}>Attend via video call or visit the clinic in-person.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: '5rem 0', background: 'transparent', position: 'relative', zIndex: 2 }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', background: 'rgba(15,20,35,0.55)', backdropFilter: 'blur(16px)', border: '1px solid rgba(102,126,234,0.2)', borderRadius: '24px', padding: '3.5rem 2.5rem' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '1rem', background: C.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Experience Better Healthcare Today</h2>
          <p style={{ color: C.muted, marginBottom: '2.5rem', fontSize: '1.1rem' }}>Book your first appointment and see the difference.</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" style={{ padding: '1rem 2.5rem', background: C.gradient, color: C.white, textDecoration: 'none', borderRadius: '12px', fontWeight: '800', boxShadow: '0 8px 24px rgba(102,126,234,0.35)' }}>Book Appointment →</Link>
            <Link to="/contact" style={{ padding: '1rem 2.5rem', background: 'rgba(255,255,255,0.06)', color: C.text, textDecoration: 'none', borderRadius: '12px', fontWeight: '600', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)' }}>Contact Support</Link>
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

export default Services;
