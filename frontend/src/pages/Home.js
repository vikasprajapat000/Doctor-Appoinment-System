import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Background3D from '../components/Background3D';

/* ==========================================================
   UTILITY HOOKS
   ========================================================== */

const useCounter = (target, duration = 2000, start = false) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (ts) => {
      if (!startTime) startTime = ts;
      const p = Math.min((ts - startTime) / duration, 1);
      setCount(Math.floor(p * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
};

/* ==========================================================
   HOME PAGE COMPONENT
   ========================================================== */

const Home = () => {
  const navigate = useNavigate();
  const statsRef = useRef(null);
  const [statsVisible, setStatsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('patient');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const patients = useCounter(12500, 2200, statsVisible);
  const doctors = useCounter(280, 2000, statsVisible);
  const appointments = useCounter(45000, 2400, statsVisible);
  const satisfaction = useCounter(98, 1800, statsVisible);

  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) setStatsVisible(true);
    }, { threshold: 0.3 });
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  // Project-based features data
  const features = [
    { icon: '⚡', title: 'Live Queue Tracking', desc: 'Real-time token queue tracking, live OPD position, and accurate wait-time estimation with Socket.IO.' },
    { icon: '🤖', title: 'AI Health & Voice Assistant', desc: 'Medical Q&A, symptom triage, Whisper voice conversation, and hospital knowledge base guidance.' },
    { icon: '🎥', title: 'WebRTC Video Consultations', desc: 'Connect with doctors face-to-face from home with secure, HD peer-to-peer video sessions.' },
    { icon: '💊', title: 'Medicine Reminders', desc: 'Prescription dosage timetables with multi-channel alerts via WhatsApp, SMS, Email, and Push notifications.' },
    { icon: '👨‍👩‍👧', title: 'Family Health Accounts', desc: 'Manage dependent family profiles, track health records, and book appointments seamlessly together.' },
    { icon: '🛡️', title: 'Secure & Private EHR', desc: 'Your health records and prescriptions are encrypted with HIPAA-compliant role-based access control.' }
  ];

  const steps = [
    { num: '01', title: 'Create Account', desc: 'Sign up as a patient or apply as a doctor in seconds.', icon: '👤' },
    { num: '02', title: 'Find a Specialist', desc: 'Browse doctors by specialty, read profiles & reviews.', icon: '🔍' },
    { num: '03', title: 'Book Appointment', desc: 'Pick a time slot, choose in-person or video, confirm.', icon: '📅' },
    { num: '04', title: 'Get Care & Track Queue', desc: 'Attend your session, track queue token live, and get digital prescriptions.', icon: '✅' }
  ];

  const testimonials = [
    { name: 'Priya Sharma', role: 'Patient', text: 'Booking appointments and tracking my OPD token in real-time saved me 2 hours of waiting!', avatar: '👩' },
    { name: 'Dr. Rajesh Kumar', role: 'Cardiologist', text: 'Managing patient queues, EHR records, and conducting WebRTC consultations has never been smoother.', avatar: '👨‍⚕️' },
    { name: 'Anita Patel', role: 'Patient', text: 'The AI assistant helped me identify the right specialist and book my consultation instantly.', avatar: '👩‍💼' },
    { name: 'Dr. Sunita Verma', role: 'Dermatologist', text: 'The digital prescription and automated reminder system has drastically improved patient adherence.', avatar: '👩‍⚕️' }
  ];

  const roles = [
    { id: 'patient', label: '🩺 Patient', color: '#667eea', items: ['Book & track appointments', 'Live queue tracking & estimated wait', 'AI Voice & Medical Assistant', 'Medicine reminders & dosage logs', 'Family health accounts management', 'WebRTC video consultations', 'Digital prescriptions & lab results'] },
    { id: 'doctor', label: '👨‍⚕️ Doctor', color: '#2ecc71', items: ['Manage patient appointments & schedule', 'Call OPD queue tokens in real-time', 'WebRTC HD video consultations', 'Write digital prescriptions & notes', 'View lab records & patient history', 'Diagnoses & treatment plans'] },
    { id: 'admin', label: '⚙️ Admin', color: '#764ba2', items: ['Oversee all appointments & queues', 'Manage doctors, patients & approvals', 'Billing & payments overview', 'Medical records control & reports', 'Notification & message center', 'System analytics & audit logs'] }
  ];

  // Style constants — project colors
  const C = {
    bg: '#0b0f1a',
    card: 'rgba(15, 20, 35, 0.65)',
    border: 'rgba(102, 126, 234, 0.12)',
    primary: '#667eea',
    secondary: '#764ba2',
    accent: '#3498db',
    success: '#2ecc71',
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
    <div style={{ background: C.bg, color: C.text, fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', overflowX: 'hidden', position: 'relative' }}>
      <Navbar />

      {/* ========== FULL-PAGE 3D BACKGROUND ========== */}
      <Background3D />

      {/* ========== HERO ========== */}
      <section style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', paddingTop: '80px',
        background: 'transparent',
        position: 'relative', zIndex: 2
      }}>
        <div style={{ width: '100%', padding: '4rem 4rem', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.1fr 0.9fr', gap: '4rem', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: `rgba(102,126,234,0.12)`, border: `1px solid rgba(102,126,234,0.25)`, borderRadius: '24px', padding: '0.45rem 1.1rem', marginBottom: '1.5rem', fontSize: '0.82rem', color: C.primary, fontWeight: '700', letterSpacing: '1.2px', textTransform: 'uppercase' }}>
              ⚕️ Doctor Appointment System
            </div>

            <h1 style={{ fontSize: 'clamp(2.4rem, 5vw, 3.6rem)', fontWeight: '900', lineHeight: 1.12, marginBottom: '1.5rem', letterSpacing: '-1.5px', color: C.white }}>
              Your Health,<br />
              <span style={{ background: C.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Our Priority.</span>
            </h1>

            <p style={{ fontSize: '1.1rem', color: C.muted, lineHeight: 1.75, marginBottom: '2.5rem', maxWidth: '520px' }}>
              Book appointments, consult doctors via video, manage prescriptions & lab results — a complete healthcare management system built for patients, doctors, and administrators.
            </p>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button onClick={() => navigate('/register')} style={{ padding: '0.95rem 2.4rem', background: C.gradient, color: C.white, border: 'none', borderRadius: '12px', fontSize: '1rem', fontWeight: '700', cursor: 'pointer', boxShadow: '0 8px 28px rgba(102,126,234,0.35)', transition: 'transform 0.2s' }}>
                Get Started Free →
              </button>
              <button onClick={() => navigate('/login')} style={{ padding: '0.95rem 2.4rem', background: 'rgba(255,255,255,0.04)', color: C.text, border: `1px solid rgba(255,255,255,0.12)`, borderRadius: '12px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer', backdropFilter: 'blur(8px)' }}>
                Login
              </button>
            </div>

            <div style={{ display: 'flex', gap: '2rem', marginTop: '2.5rem', flexWrap: 'wrap' }}>
              {['🟢 System Online', '⭐ 4.9 Rating', '🔒 Encrypted'].map(b => (
                <span key={b} style={{ fontSize: '0.82rem', color: C.muted, fontWeight: '600' }}>{b}</span>
              ))}
            </div>
          </div>

          {/* Right side — space for 3D globe */}
          <div style={{ minHeight: isMobile ? '320px' : '480px', pointerEvents: 'none' }} />
        </div>
      </section>

      {/* ========== STATS ========== */}
      <section ref={statsRef} style={{
        background: 'transparent', padding: '4.5rem 2rem', position: 'relative', zIndex: 2,
        borderTop: '1px solid rgba(102,126,234,0.15)', borderBottom: '1px solid rgba(102,126,234,0.15)'
      }}>
        <div style={{ width: '100%', padding: '0 4rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px,1fr))', gap: '2rem', textAlign: 'center' }}>
          {[
            { label: 'Happy Patients', value: patients.toLocaleString() + '+', icon: '👥' },
            { label: 'Expert Doctors', value: doctors + '+', icon: '👨‍⚕️' },
            { label: 'Appointments', value: appointments.toLocaleString() + '+', icon: '📅' },
            { label: 'Satisfaction', value: satisfaction + '%', icon: '⭐' }
          ].map(s => (
            <div key={s.label} style={{ background: 'rgba(15,20,35,0.5)', backdropFilter: 'blur(12px)', border: '1px solid rgba(102,126,234,0.15)', borderRadius: '16px', padding: '1.5rem 1rem' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.4rem' }}>{s.icon}</div>
              <div style={{ fontSize: '2.6rem', fontWeight: '900', background: C.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{s.value}</div>
              <div style={{ fontSize: '0.88rem', color: C.muted }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ========== FEATURES ========== */}
      <section style={{ padding: '7rem 2rem', background: 'transparent', position: 'relative', zIndex: 2 }}>
        <div style={{ width: '100%', padding: '0 4rem' }}>
          <h2 style={{ textAlign: 'center', fontSize: 'clamp(1.8rem,4vw,2.5rem)', fontWeight: '800', marginBottom: '0.6rem', color: C.white }}>Platform Features</h2>
          <p style={{ textAlign: 'center', color: C.muted, marginBottom: '4rem', fontSize: '1.05rem' }}>Everything you need to manage healthcare digitally</p>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '1.5rem' }}>
            {features.map(f => (
              <div key={f.title} style={{ ...glassCard, padding: '2rem', transition: 'transform 0.25s, box-shadow 0.25s' }}>
                <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(102,126,234,0.12)', border: '1px solid rgba(102,126,234,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', marginBottom: '1.25rem' }}>
                  {f.icon}
                </div>
                <h3 style={{ fontWeight: '700', marginBottom: '0.5rem', fontSize: '1.05rem', color: C.white }}>{f.title}</h3>
                <p style={{ color: C.muted, lineHeight: 1.65, fontSize: '0.9rem' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== HOW IT WORKS ========== */}
      <section style={{ padding: '7rem 2rem', background: 'transparent', position: 'relative', zIndex: 2 }}>
        <div style={{ width: '100%', padding: '0 4rem' }}>
          <h2 style={{ textAlign: 'center', fontSize: 'clamp(1.8rem,4vw,2.5rem)', fontWeight: '800', marginBottom: '0.6rem', color: C.white }}>How It Works</h2>
          <p style={{ textAlign: 'center', color: C.muted, marginBottom: '4rem' }}>Get started in 4 simple steps</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px,1fr))', gap: '2rem' }}>
            {steps.map(s => (
              <div key={s.num} style={{ textAlign: 'center' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: C.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', margin: '0 auto 1rem', boxShadow: '0 8px 24px rgba(102,126,234,0.3)' }}>
                  {s.icon}
                </div>
                <div style={{ fontSize: '2.2rem', fontWeight: '900', color: 'rgba(102,126,234,0.15)', marginBottom: '0.3rem' }}>{s.num}</div>
                <h3 style={{ fontWeight: '700', fontSize: '1rem', color: C.white, marginBottom: '0.4rem' }}>{s.title}</h3>
                <p style={{ color: C.muted, fontSize: '0.88rem', lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== ROLE DASHBOARDS ========== */}
      <section style={{ padding: '7rem 2rem', background: 'transparent', position: 'relative', zIndex: 2 }}>
        <div style={{ width: '100%', padding: '0 4rem' }}>
          <h2 style={{ textAlign: 'center', fontSize: 'clamp(1.8rem,4vw,2.5rem)', fontWeight: '800', marginBottom: '0.6rem', color: C.white }}>Built For Everyone</h2>
          <p style={{ textAlign: 'center', color: C.muted, marginBottom: '3rem' }}>Dedicated dashboards for every role</p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.6rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
            {roles.map(r => (
              <button key={r.id} onClick={() => setActiveTab(r.id)} style={{
                padding: '0.6rem 1.5rem', borderRadius: '25px', cursor: 'pointer', fontWeight: '700', fontSize: '0.9rem', transition: 'all 0.2s',
                border: `2px solid ${activeTab === r.id ? r.color : 'rgba(255,255,255,0.1)'}`,
                background: activeTab === r.id ? r.color : 'rgba(255,255,255,0.03)',
                color: activeTab === r.id ? C.bg : C.text,
              }}>
                {r.label}
              </button>
            ))}
          </div>

          {roles.filter(r => r.id === activeTab).map(r => (
            <div key={r.id} style={{ ...glassCard, padding: '2.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px,1fr))', gap: '1rem' }}>
                {r.items.map(item => (
                  <div key={item} style={{ display: 'flex', gap: '0.7rem', alignItems: 'center' }}>
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: r.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.bg, fontSize: '0.6rem', fontWeight: '900', flexShrink: 0 }}>✓</div>
                    <span style={{ fontSize: '0.9rem', color: C.text, fontWeight: '500' }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========== TESTIMONIALS ========== */}
      <section style={{ padding: '7rem 2rem', background: 'transparent', position: 'relative', zIndex: 2 }}>
        <div style={{ width: '100%', padding: '0 4rem' }}>
          <h2 style={{ textAlign: 'center', fontSize: 'clamp(1.8rem,4vw,2.5rem)', fontWeight: '800', marginBottom: '0.6rem', color: C.white }}>What People Say</h2>
          <p style={{ textAlign: 'center', color: C.muted, marginBottom: '4rem' }}>Real experiences from our community</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px,1fr))', gap: '1.5rem' }}>
            {testimonials.map(t => (
              <div key={t.name} style={{ ...glassCard, padding: '2rem' }}>
                <div style={{ display: 'flex', gap: '2px', marginBottom: '1rem' }}>
                  {[1,2,3,4,5].map(i => <span key={i} style={{ color: '#f1c40f', fontSize: '0.9rem' }}>★</span>)}
                </div>
                <p style={{ color: C.muted, lineHeight: 1.7, marginBottom: '1.5rem', fontSize: '0.92rem', fontStyle: 'italic' }}>"{t.text}"</p>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'rgba(102,126,234,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>{t.avatar}</div>
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '0.9rem', color: C.white }}>{t.name}</div>
                    <div style={{ color: C.primary, fontSize: '0.78rem' }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== CTA ========== */}
      <section style={{ padding: '6rem 2rem', background: 'transparent', position: 'relative', zIndex: 2 }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', background: 'rgba(15,20,35,0.55)', backdropFilter: 'blur(16px)', border: '1px solid rgba(102,126,234,0.2)', borderRadius: '24px', padding: '3.5rem 2.5rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚀</div>
          <h2 style={{ fontSize: 'clamp(1.8rem,4vw,2.5rem)', fontWeight: '900', marginBottom: '1rem', background: C.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Start Your Health Journey Today</h2>
          <p style={{ color: C.muted, marginBottom: '2.5rem', fontSize: '1.05rem', lineHeight: 1.7 }}>
            Join thousands of patients and doctors. Free to start, no credit card needed.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/register')} style={{ padding: '1rem 2.5rem', background: C.gradient, color: C.white, border: 'none', borderRadius: '12px', fontSize: '1.05rem', fontWeight: '800', cursor: 'pointer', boxShadow: '0 8px 24px rgba(102,126,234,0.35)' }}>
              Create Free Account
            </button>
            <button onClick={() => navigate('/doctors')} style={{ padding: '1rem 2.5rem', background: 'rgba(255,255,255,0.06)', color: C.text, border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', fontSize: '1.05rem', fontWeight: '600', cursor: 'pointer', backdropFilter: 'blur(8px)' }}>
              Browse Doctors
            </button>
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

export default Home;