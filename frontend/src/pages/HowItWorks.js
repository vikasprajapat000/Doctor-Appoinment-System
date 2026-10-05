import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Background3D from '../components/Background3D';

const patientSteps = [
  { step: 1, title: 'Sign Up', desc: 'Create a free account using your email or phone number. Basic details take just 1 minute.', icon: '👤', img: '📱' },
  { step: 2, title: 'Find a Specialist', desc: 'Browse or search doctors by name, specialty, or condition. View their ratings and schedule.', icon: '🔍', img: '👨‍⚕️' },
  { step: 3, title: 'Book an Appointment', desc: 'Select an available slot. Choose between a clinic visit or a secure video consultation.', icon: '📅', img: '🗓️' },
  { step: 4, title: 'Get Care & Prescriptions', desc: 'Attend your consultation. Get instant access to digital prescriptions and lab test recommendations.', icon: '💊', img: '📄' }
];

const doctorSteps = [
  { step: 1, title: 'Apply & Get Verified', desc: 'Submit your medical license and credentials. Our team verifies your profile within 24 hours.', icon: '📝', img: '✅' },
  { step: 2, title: 'Set Your Schedule', desc: 'Log in to your dashboard to set your availability, fees, and consultation modes.', icon: '⏱️', img: '🕒' },
  { step: 3, title: 'See Patients', desc: 'Receive bookings. Conduct High-Def video calls or manage in-person walk-ins easily.', icon: '🎥', img: '👥' },
  { step: 4, title: 'Manage Records', desc: 'Write electronic prescriptions, view patient health history, and track your daily earnings.', icon: '📊', img: '💻' }
];

const HowItWorks = () => {
  const [activeTab, setActiveTab] = useState('patient');
  const steps = activeTab === 'patient' ? patientSteps : doctorSteps;

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
    <div style={{ background: C.bg, color: C.text, fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', minHeight: '100vh', overflowX: 'hidden', position: 'relative' }}>
      <Navbar />
      <Background3D />

      {/* Hero Section */}
      <section style={{ padding: '140px 2rem 5rem', background: 'transparent', textAlign: 'center', position: 'relative', zIndex: 2 }}>
        <div style={{ display: 'inline-flex', gap: '0.5rem', alignItems: 'center', background: 'rgba(102,126,234,0.12)', border: '1px solid rgba(102,126,234,0.25)', borderRadius: '20px', padding: '0.4rem 1.1rem', marginBottom: '1.5rem', color: C.primary, fontSize: '0.85rem', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase' }}>
          💡 Simple & Easy
        </div>
        <h1 style={{ fontSize: 'clamp(2.4rem, 5vw, 3.6rem)', fontWeight: '900', marginBottom: '1.25rem', color: C.white, letterSpacing: '-1px' }}>
          How Doctor Appointment System <span style={{ background: C.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Works</span>
        </h1>
        <p style={{ color: C.muted, maxWidth: '600px', margin: '0 auto', lineHeight: '1.8', fontSize: '1.05rem' }}>
          We\'ve streamlined the entire healthcare process so you can focus on what matters most — getting better or providing care.
        </p>

        {/* Tab Selection */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '3rem' }}>
          <button 
            onClick={() => setActiveTab('patient')}
            style={{ 
              padding: '0.8rem 2.5rem', borderRadius: '30px', 
              background: activeTab === 'patient' ? C.gradient : 'rgba(255,255,255,0.04)', 
              color: C.white, 
              border: activeTab === 'patient' ? 'none' : `1px solid ${C.border}`, 
              fontWeight: '800', cursor: 'pointer', fontSize: '1rem',
              boxShadow: activeTab === 'patient' ? '0 4px 14px rgba(102,126,234,0.3)' : 'none',
              transition: 'all 0.3s',
              backdropFilter: 'blur(8px)'
            }}
          >
            For Patients
          </button>
          <button 
            onClick={() => setActiveTab('doctor')}
            style={{ 
              padding: '0.8rem 2.5rem', borderRadius: '30px', 
              background: activeTab === 'doctor' ? 'linear-gradient(135deg, #2ecc71, #27ae60)' : 'rgba(255,255,255,0.04)', 
              color: C.white, 
              border: activeTab === 'doctor' ? 'none' : `1px solid ${C.border}`, 
              fontWeight: '800', cursor: 'pointer', fontSize: '1rem',
              boxShadow: activeTab === 'doctor' ? '0 4px 14px rgba(46,204,113,0.3)' : 'none',
              transition: 'all 0.3s',
              backdropFilter: 'blur(8px)'
            }}
          >
            For Doctors
          </button>
        </div>
      </section>

      {/* Steps List */}
      <section style={{ padding: '5rem 0', background: 'transparent', position: 'relative', zIndex: 2 }}>
        <div style={{ width: '100%', padding: '0 4rem', maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ position: 'relative' }}>
            
            {/* Connecting Line */}
            <div style={{ position: 'absolute', left: '32px', top: '20px', bottom: '20px', width: '2px', background: activeTab === 'patient' ? `${C.primary}30` : `${C.success}30`, zIndex: 1 }} />

            {steps.map((step, i) => (
              <div key={step.step} style={{ display: 'flex', gap: '2.5rem', marginBottom: i === steps.length - 1 ? 0 : '4rem', position: 'relative', zIndex: 2, alignItems: 'center' }}>
                {/* Step Circle */}
                <div style={{ 
                  flexShrink: 0, width: '64px', height: '64px', borderRadius: '50%', 
                  background: activeTab === 'patient' ? C.gradient : 'linear-gradient(135deg, #2ecc71, #27ae60)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', 
                  fontSize: '1.5rem', color: C.white, fontWeight: '900',
                  boxShadow: `0 4px 12px ${activeTab === 'patient' ? 'rgba(102,126,234,0.3)' : 'rgba(46,204,113,0.3)'}`
                }}>
                  {step.icon}
                </div>
                
                {/* Step Content */}
                <div style={{ ...glassCard, flexGrow: 1, padding: '2rem' }}>
                  <div style={{ color: activeTab === 'patient' ? C.primary : C.success, fontWeight: '800', fontSize: '0.85rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Step {step.step}
                  </div>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: C.white, marginBottom: '0.75rem' }}>{step.title}</h3>
                  <p style={{ color: C.muted, lineHeight: '1.7', fontSize: '1rem' }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: '5rem 0', background: 'transparent', position: 'relative', zIndex: 2 }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', background: 'rgba(15,20,35,0.55)', backdropFilter: 'blur(16px)', border: '1px solid rgba(102,126,234,0.2)', borderRadius: '24px', padding: '3.5rem 2.5rem' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: '900', marginBottom: '1rem', background: C.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Ready to get started?
          </h2>
          <p style={{ color: C.muted, marginBottom: '2.5rem', fontSize: '1.1rem' }}>
            Join the community today and experience a new era of digital healthcare.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" style={{ padding: '1rem 2.5rem', background: C.gradient, color: C.white, textDecoration: 'none', borderRadius: '12px', fontWeight: '800', boxShadow: '0 8px 24px rgba(102,126,234,0.35)' }}>
               Create An Account →
            </Link>
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

export default HowItWorks;
