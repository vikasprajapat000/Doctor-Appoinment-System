import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Background3D from '../components/Background3D';

const team = [
  { name: 'Dr. Anil Sharma', role: 'Chief Medical Officer', avatar: '👨‍⚕️', bio: 'Former HOD of Medicine at AIIMS with 20+ years of clinical excellence.' },
  { name: 'Priya Kapoor', role: 'Head of Product', avatar: '👩‍💼', bio: 'Led digital health transformation at 3 major hospital chains across India.' },
  { name: 'Vikram Nair', role: 'Lead Engineer', avatar: '👨‍💻', bio: 'Full-stack expert specializing in HIPAA-compliant healthcare systems.' },
  { name: 'Dr. Sunita Rao', role: 'Patient Experience Lead', avatar: '👩‍⚕️', bio: 'Bridging patient care and technology with 15 years of clinical insights.' }
];

const milestones = [
  { year: '2022', title: 'Platform Founded', desc: 'Doctor Appointment System launched with 10 doctors and 50 patients.', color: '#667eea' },
  { year: '2023', title: 'Video Consultations', desc: 'Introduced HD video consultations — 500+ sessions in month 1.', color: '#2ecc71' },
  { year: '2024', title: 'Digital Prescriptions', desc: 'Launched digital PDF prescriptions with custom letterhead support.', color: '#764ba2' },
  { year: '2025', title: 'Full Platform', desc: '12,500+ patients, 280+ doctors, and growing every day.', color: '#3498db' }
];

const About = () => {
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

      {/* Hero */}
      <section style={{ padding: '140px 2rem 5rem', background: 'transparent', textAlign: 'center', position: 'relative', zIndex: 2 }}>
        <div style={{ display: 'inline-flex', gap: '0.5rem', alignItems: 'center', background: 'rgba(102,126,234,0.12)', border: '1px solid rgba(102,126,234,0.25)', borderRadius: '20px', padding: '0.4rem 1.1rem', marginBottom: '1.5rem', color: C.primary, fontSize: '0.85rem', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase' }}>
          ℹ️ About Us
        </div>
        <h1 style={{ fontSize: 'clamp(2.4rem, 5vw, 3.6rem)', fontWeight: '900', marginBottom: '1.25rem', color: C.white, letterSpacing: '-1px' }}>
          Our Mission: <span style={{ background: C.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Better Healthcare for All</span>
        </h1>
        <p style={{ color: C.muted, maxWidth: '620px', margin: '0 auto', lineHeight: '1.8', fontSize: '1.05rem' }}>
          Doctor Appointment System was built with a single vision — make quality healthcare as easy to access as sending a message.
        </p>
      </section>

      {/* Mission / Vision / Values */}
      <section style={{ padding: '5rem 0', background: 'transparent', position: 'relative', zIndex: 2 }}>
        <div style={{ width: '100%', padding: '0 4rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px,1fr))', gap: '1.5rem' }}>
          {[
            { icon: '🎯', title: 'Our Mission', color: '#667eea', desc: 'To eliminate barriers in healthcare by connecting patients and doctors through smart, accessible technology — enabling faster, better, and more affordable care.' },
            { icon: '🔭', title: 'Our Vision', color: '#2ecc71', desc: 'A world where every person, regardless of location or background, has instant access to the best possible medical expertise at their fingertips.' },
            { icon: '💎', title: 'Our Values', color: '#764ba2', desc: 'Patient privacy first. Clinical accuracy. Transparent billing. Continuous improvement. Building with empathy for both patients and healthcare providers.' }
          ].map(card => (
            <div key={card.title} style={{ ...glassCard, padding: '2rem', border: `1px solid rgba(102,126,234,0.15)` }}>
              <div style={{ fontSize: '2.25rem', marginBottom: '1rem' }}>{card.icon}</div>
              <h3 style={{ fontWeight: '800', fontSize: '1.1rem', marginBottom: '0.75rem', color: card.color }}>{card.title}</h3>
              <p style={{ color: C.muted, lineHeight: '1.75', fontSize: '0.9rem' }}>{card.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tech Stack */}
      <section style={{ padding: '5rem 0', background: 'transparent', position: 'relative', zIndex: 2 }}>
        <div style={{ width: '100%', padding: '0 4rem', textAlign: 'center' }}>
          <h2 style={{ fontWeight: '800', fontSize: '2.2rem', marginBottom: '1rem', color: C.white }}>🛠️ Built With Modern Technology</h2>
          <p style={{ color: C.muted, marginBottom: '3rem' }}>Our MERN stack architecture ensures scalability, security, and speed</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px,1fr))', gap: '1.5rem' }}>
            {[
              { tech: 'MongoDB', icon: '🍃', role: 'Database', desc: 'NoSQL for flexible medical data storage', color: '#2ecc71' },
              { tech: 'Express.js', icon: '⚡', role: 'Backend API', desc: 'Fast, minimal REST API framework', color: '#3498db' },
              { tech: 'React.js', icon: '⚛️', role: 'Frontend', desc: 'Dynamic, reactive user interfaces', color: '#667eea' },
              { tech: 'Node.js', icon: '💚', role: 'Runtime', desc: 'High-performance server environment', color: '#764ba2' }
            ].map(t => (
              <div key={t.tech} style={{ ...glassCard, padding: '1.75rem', textAlign: 'center' }}>
                <div style={{ fontSize: '2.25rem', marginBottom: '0.75rem' }}>{t.icon}</div>
                <h3 style={{ fontWeight: '800', color: t.color, marginBottom: '0.25rem', fontSize: '1rem' }}>{t.tech}</h3>
                <div style={{ fontSize: '0.72rem', color: C.muted, marginBottom: '0.5rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t.role}</div>
                <p style={{ fontSize: '0.82rem', color: C.muted, lineHeight: '1.5' }}>{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section style={{ padding: '5rem 0', background: 'transparent', position: 'relative', zIndex: 2 }}>
        <div style={{ width: '100%', padding: '0 4rem', maxWidth: '850px', margin: '0 auto' }}>
          <h2 style={{ fontWeight: '800', fontSize: '2.2rem', marginBottom: '3rem', textAlign: 'center', color: C.white }}>📅 Our Journey</h2>
          <div style={{ position: 'relative', paddingLeft: '80px' }}>
            <div style={{ position: 'absolute', left: '40px', top: 0, bottom: 0, width: '2px', background: C.gradient }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {milestones.map(m => (
                <div key={m.year} style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '-46px', top: '14px', width: '18px', height: '18px', borderRadius: '50%', background: m.color, border: `3px solid ${C.bg}`, zIndex: 1, boxShadow: `0 0 0 3px ${m.color}30` }} />
                  <div style={{ ...glassCard, padding: '1.25rem 1.5rem', border: `1px solid rgba(102,126,234,0.15)` }}>
                    <div style={{ fontWeight: '800', color: m.color, fontSize: '0.82rem', marginBottom: '0.35rem' }}>{m.year}</div>
                    <div style={{ fontWeight: '700', color: C.white, marginBottom: '0.4rem' }}>{m.title}</div>
                    <div style={{ color: C.muted, fontSize: '0.88rem', lineHeight: '1.6' }}>{m.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section style={{ padding: '5rem 0', background: 'transparent', position: 'relative', zIndex: 2 }}>
        <div style={{ width: '100%', padding: '0 4rem', textAlign: 'center' }}>
          <h2 style={{ fontWeight: '800', fontSize: '2.2rem', marginBottom: '1rem', color: C.white }}>👥 The Team Behind Doctor Appointment System</h2>
          <p style={{ color: C.muted, marginBottom: '3rem' }}>Driven by passion, guided by purpose</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px,1fr))', gap: '1.5rem' }}>
            {team.map(member => (
              <div key={member.name} style={{ ...glassCard, padding: '2rem 1.5rem', textAlign: 'center' }}>
                <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'rgba(102,126,234,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.25rem', margin: '0 auto 1rem', boxShadow: '0 4px 12px rgba(102,126,234,0.15)' }}>
                  {member.avatar}
                </div>
                <h3 style={{ fontWeight: '800', fontSize: '0.98rem', marginBottom: '0.3rem', color: C.white }}>{member.name}</h3>
                <div style={{ color: C.primary, fontSize: '0.78rem', fontWeight: '700', marginBottom: '0.75rem' }}>{member.role}</div>
                <p style={{ color: C.muted, fontSize: '0.82rem', lineHeight: '1.65' }}>{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '5rem 0', background: 'transparent', position: 'relative', zIndex: 2 }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', background: 'rgba(15,20,35,0.55)', backdropFilter: 'blur(16px)', border: '1px solid rgba(102,126,234,0.2)', borderRadius: '24px', padding: '3.5rem 2.5rem' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '1rem', background: C.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Join the Doctor Appointment System Community</h2>
          <p style={{ color: C.muted, marginBottom: '2.5rem' }}>Register as a patient or apply as a doctor today</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" style={{ padding: '1rem 2.5rem', background: C.gradient, color: 'white', textDecoration: 'none', borderRadius: '12px', fontWeight: '800', boxShadow: '0 8px 24px rgba(102,126,234,0.35)' }}>Get Started →</Link>
            <Link to="/contact" style={{ padding: '1rem 2.5rem', background: 'rgba(255,255,255,0.06)', color: C.text, textDecoration: 'none', borderRadius: '12px', fontWeight: '600', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)' }}>Contact Us</Link>
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

export default About;