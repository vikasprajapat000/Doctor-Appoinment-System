import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Background3D from '../components/Background3D';

const contactInfo = [
  { icon: '📍', title: 'Our Office', lines: ['Doctor Appointment System Pvt. Ltd.', '4th Floor, Tech Park, Sector 21', 'Gurugram, Haryana 122016, India'], color: '#667eea' },
  { icon: '📞', title: 'Phone', lines: ['+91 98765 43210', '+9 Mon – Sat, 9 AM – 7 PM IST'], color: '#2ecc71' },
  { icon: '✉️', title: 'Email', lines: ['support@doctorappointmentsystem.com', 'doctors@doctorappointmentsystem.com'], color: '#764ba2' },
  { icon: '⏰', title: 'Support Hours', lines: ['Monday – Friday: 9 AM – 8 PM', 'Emergency: 24/7 via portal'], color: '#3498db' }
];

const topics = ['General Inquiry', 'Technical Support', 'Account & Billing', 'Book a Demo', 'Doctor Registration', 'Partnership', 'Report an Issue', 'Other'];

const miniFaqs = [
  { q: 'How quickly will you respond?', a: 'We typically respond within 2 business hours for support tickets and within 24 hours for general inquiries.' },
  { q: 'Can I call for urgent issues?', a: 'Yes! For urgent technical issues, call our support line. For medical emergencies, please contact local emergency services.' },
  { q: 'How do I report a bug?', a: 'Use the contact form and select "Report an Issue". Please include screenshots or steps to reproduce the issue.' }
];

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', topic: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [openFaq, setOpenFaq] = useState(null);

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

  const validate = () => {
    const e = {};
    if (!formData.name.trim()) e.name = 'Name is required';
    if (!formData.email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) e.email = 'Enter a valid email';
    if (!formData.topic) e.topic = 'Please select a topic';
    if (!formData.message.trim()) e.message = 'Message is required';
    else if (formData.message.trim().length < 20) e.message = 'Message must be at least 20 characters';
    return e;
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors(prev => ({ ...prev, [e.target.name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1500));
    setSubmitting(false);
    setSubmitted(true);
    setFormData({ name: '', email: '', phone: '', topic: '', subject: '', message: '' });
  };

  const inputStyle = (field) => ({
    width: '100%', padding: '0.85rem 1.1rem',
    background: 'rgba(15, 20, 35, 0.85)',
    border: `1px solid ${errors[field] ? '#ef4444' : C.border}`,
    borderRadius: '10px', color: C.white, fontSize: '0.95rem',
    outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  });

  return (
    <div style={{ background: C.bg, color: C.text, fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', minHeight: '100vh', overflowX: 'hidden', position: 'relative' }}>
      <Navbar />
      <Background3D />

      {/* Hero */}
      <section style={{ padding: '140px 2rem 4rem', background: 'transparent', textAlign: 'center', position: 'relative', zIndex: 2 }}>
        <div style={{ display: 'inline-flex', gap: '0.5rem', alignItems: 'center', background: 'rgba(102,126,234,0.12)', border: '1px solid rgba(102,126,234,0.25)', borderRadius: '20px', padding: '0.4rem 1.1rem', marginBottom: '1.5rem', color: C.primary, fontSize: '0.85rem', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase' }}>
          💬 Contact Us
        </div>
        <h1 style={{ fontSize: 'clamp(2.4rem, 5vw, 3.6rem)', fontWeight: '900', marginBottom: '1.25rem', color: C.white, letterSpacing: '-1px' }}>
          We\'re Here to <span style={{ background: C.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Help You</span>
        </h1>
        <p style={{ color: C.muted, maxWidth: '520px', margin: '0 auto 2rem', lineHeight: '1.75', fontSize: '1.05rem' }}>
          Have a question, feedback, or need support? Our team responds within 2 hours on business days.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          {[{ icon: '⚡', label: '2hr Response Time' }, { icon: '🌐', label: 'Online 6 Days/Week' }, { icon: '📞', label: '24/7 Emergency Line' }].map(b => (
            <div key={b.label} style={{ ...glassCard, display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.85rem', color: C.text }}>
              {b.icon} {b.label}
            </div>
          ))}
        </div>
      </section>

      {/* Contact Info Cards */}
      <section style={{ padding: '3rem 0 0', background: 'transparent', position: 'relative', zIndex: 2 }}>
        <div style={{ width: '100%', padding: '0 4rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px,1fr))', gap: '1.25rem' }}>
          {contactInfo.map(info => (
            <div key={info.title} style={{ ...glassCard, padding: '1.75rem', border: `1px solid rgba(102,126,234,0.15)` }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(102,126,234,0.1)', border: `1px solid ${info.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', marginBottom: '0.85rem' }}>{info.icon}</div>
              <h3 style={{ fontWeight: '800', fontSize: '0.95rem', color: info.color, margin: '0 0 0.6rem 0' }}>{info.title}</h3>
              {info.lines.map((line, i) => (
                <div key={i} style={{ fontSize: '0.83rem', color: i === 0 ? C.white : C.muted, fontWeight: i === 0 ? '600' : '400', marginBottom: '0.2rem' }}>{line}</div>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* Main: Form + Sidebar */}
      <section style={{ padding: '3rem 0 5rem', background: 'transparent', position: 'relative', zIndex: 2 }}>
        <div style={{ width: '100%', padding: '0 4rem', display: 'grid', gridTemplateColumns: '1fr 360px', gap: '2rem', alignItems: 'start' }}>

          {/* Contact Form */}
          <div style={{ ...glassCard, padding: '2.5rem' }}>
            <h2 style={{ fontWeight: '800', fontSize: '1.35rem', marginBottom: '0.5rem', color: C.white }}>Send Us a Message</h2>
            <p style={{ color: C.muted, fontSize: '0.9rem', marginBottom: '2rem' }}>Fill in the form below and we\'ll get back to you promptly.</p>

            {submitted ? (
              <div style={{ textAlign: 'center', padding: '3rem 2rem', background: 'rgba(255,255,255,0.02)', border: `1px solid ${C.border}`, borderRadius: '16px' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
                <h3 style={{ fontWeight: '800', fontSize: '1.4rem', marginBottom: '0.75rem', color: '#10b981' }}>Message Sent!</h3>
                <p style={{ color: C.muted, marginBottom: '2rem', lineHeight: '1.7' }}>
                  Thank you! We\'ve received your message and will respond to <strong style={{ color: C.primary }}>{formData.email || 'your email'}</strong> within 2 business hours.
                </p>
                <button onClick={() => setSubmitted(false)} style={{ padding: '0.75rem 2rem', background: C.gradient, color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700' }}>
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: C.muted, marginBottom: '0.4rem' }}>Full Name <span style={{ color: '#ef4444' }}>*</span></label>
                    <input type="text" name="name" placeholder="e.g. Priya Sharma" value={formData.name} onChange={handleChange} style={inputStyle('name')} />
                    {errors.name && <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.3rem' }}>⚠ {errors.name}</div>}
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: C.muted, marginBottom: '0.4rem' }}>Email Address <span style={{ color: '#ef4444' }}>*</span></label>
                    <input type="email" name="email" placeholder="you@example.com" value={formData.email} onChange={handleChange} style={inputStyle('email')} />
                    {errors.email && <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.3rem' }}>⚠ {errors.email}</div>}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: C.muted, marginBottom: '0.4rem' }}>Phone <span style={{ color: '#666', fontWeight: 400 }}>(optional)</span></label>
                    <input type="tel" name="phone" placeholder="+91 98765 43210" value={formData.phone} onChange={handleChange} style={inputStyle('phone')} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: C.muted, marginBottom: '0.4rem' }}>Topic <span style={{ color: '#ef4444' }}>*</span></label>
                    <select name="topic" value={formData.topic} onChange={handleChange} style={{ ...inputStyle('topic'), cursor: 'pointer', background: C.card }}>
                      <option value="" style={{ background: '#0b0f1a' }}>Select a topic…</option>
                      {topics.map(t => <option key={t} value={t} style={{ background: '#0b0f1a' }}>{t}</option>)}
                    </select>
                    {errors.topic && <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.3rem' }}>⚠ {errors.topic}</div>}
                  </div>
                </div>

                <div style={{ marginBottom: '1.1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: C.muted, marginBottom: '0.4rem' }}>Subject <span style={{ color: '#666', fontWeight: 400 }}>(optional)</span></label>
                  <input type="text" name="subject" placeholder="Brief subject line…" value={formData.subject} onChange={handleChange} style={inputStyle('subject')} />
                </div>

                <div style={{ marginBottom: '1.75rem' }}>
                  <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: '700', color: C.muted, marginBottom: '0.4rem' }}>
                    <span>Message <span style={{ color: '#ef4444' }}>*</span></span>
                    <span style={{ color: formData.message.length >= 20 ? '#10b981' : '#666', fontWeight: '500' }}>{formData.message.length}/1000</span>
                  </label>
                  <textarea name="message" placeholder="Describe your question or issue in detail…" value={formData.message} onChange={handleChange} maxLength={1000} rows={6} style={{ ...inputStyle('message'), resize: 'vertical', minHeight: '140px', lineHeight: '1.6' }} />
                  {errors.message && <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.3rem' }}>⚠ {errors.message}</div>}
                </div>

                <button type="submit" disabled={submitting} style={{ width: '100%', padding: '0.95rem', borderRadius: '12px', background: submitting ? 'rgba(102,126,234,0.4)' : C.gradient, color: 'white', border: 'none', fontWeight: '800', fontSize: '1rem', cursor: submitting ? 'not-allowed' : 'pointer', boxShadow: '0 6px 18px rgba(102,126,234,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem' }}>
                  {submitting ? (<><span style={{ display: 'inline-block', width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />Sending…</>) : '✉️ Send Message'}
                </button>
                <p style={{ textAlign: 'center', color: C.muted, fontSize: '0.75rem', marginTop: '1rem' }}>🔒 Your information is encrypted and never shared.</p>
              </form>
            )}
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Quick Links */}
            <div style={{ ...glassCard, padding: '1.75rem' }}>
              <h3 style={{ fontWeight: '800', marginBottom: '1.1rem', fontSize: '0.98rem', color: C.white }}>🔗 Quick Links</h3>
              {[{ label: 'Browse Doctors', path: '/doctors', icon: '👨‍⚕️' }, { label: 'View Services', path: '/services', icon: '⚕️' }, { label: 'How It Works', path: '/how-it-works', icon: '📖' }, { label: 'Create Account', path: '/register', icon: '🚀' }, { label: 'Login', path: '/login', icon: '🔑' }].map(link => (
                <Link key={link.path} to={link.path} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.65rem 0', borderBottom: `1px solid ${C.border}`, color: C.muted, textDecoration: 'none', fontSize: '0.88rem', transition: 'color 0.2s' }}>
                  <span>{link.icon}</span> <span>{link.label}</span> <span style={{ marginLeft: 'auto', color: '#666' }}>›</span>
                </Link>
              ))}
            </div>

            {/* Social */}
            <div style={{ ...glassCard, padding: '1.75rem', border: '1px solid rgba(102,126,234,0.15)' }}>
              <h3 style={{ fontWeight: '800', marginBottom: '0.5rem', fontSize: '0.98rem', color: C.white }}>📱 Connect With Us</h3>
              <p style={{ color: C.muted, fontSize: '0.8rem', marginBottom: '1.1rem' }}>Follow for health tips and platform updates</p>
              {[{ platform: 'Twitter / X', handle: '@DoctorAppSystem', icon: '🐦', color: '#1da1f2' }, { platform: 'LinkedIn', handle: 'Doctor Appointment System', icon: '💼', color: '#0077b5' }, { platform: 'Instagram', handle: '@doctorappointmentsystem', icon: '📸', color: '#e1306c' }].map(s => (
                <div key={s.platform} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', padding: '0.6rem 0', borderBottom: `1px solid ${C.border}` }}>
                  <span style={{ fontSize: '1.25rem' }}>{s.icon}</span>
                  <div><div style={{ fontSize: '0.74rem', color: '#666' }}>{s.platform}</div><div style={{ fontSize: '0.83rem', fontWeight: '700', color: s.color }}>{s.handle}</div></div>
                </div>
              ))}
            </div>

            {/* Mini FAQ */}
            <div style={{ ...glassCard, padding: '1.75rem' }}>
              <h3 style={{ fontWeight: '800', marginBottom: '1.1rem', fontSize: '0.98rem', color: C.white }}>❓ Common Questions</h3>
              {miniFaqs.map((faq, i) => (
                <div key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ width: '100%', background: 'none', border: 'none', color: C.white, cursor: 'pointer', padding: '0.7rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', textAlign: 'left' }}>
                    <span style={{ fontSize: '0.83rem', fontWeight: '600', lineHeight: '1.4' }}>{faq.q}</span>
                    <span style={{ fontSize: '0.8rem', color: C.primary, transform: openFaq === i ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}>▼</span>
                  </button>
                  {openFaq === i && <div style={{ padding: '0 0 0.75rem', color: C.muted, fontSize: '0.82rem', lineHeight: '1.65' }}>{faq.a}</div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Map CTA */}
      <section style={{ padding: '0 0 5rem', background: 'transparent', position: 'relative', zIndex: 2 }}>
        <div style={{ width: '100%', padding: '0 4rem' }}>
          <div style={{ ...glassCard, padding: '3rem', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🗺️</div>
            <h3 style={{ fontWeight: '800', marginBottom: '0.5rem', fontSize: '1.1rem', color: C.white }}>Find Us at Our Office</h3>
            <p style={{ color: C.muted, marginBottom: '1.5rem', fontSize: '0.9rem' }}>4th Floor, Tech Park, Sector 21, Gurugram, Haryana 122016</p>
            <a href="https://maps.google.com/?q=Sector+21,Gurugram,Haryana" target="_blank" rel="noreferrer" style={{ padding: '0.75rem 2rem', background: C.gradient, color: 'white', textDecoration: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '0.9rem', display: 'inline-block', boxShadow: '0 4px 12px rgba(102,126,234,0.3)' }}>
              📍 Open in Google Maps
            </a>
          </div>
        </div>
      </section>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } } input:focus, textarea:focus, select:focus { border-color: #667eea !important; box-shadow: 0 0 0 3px rgba(102,126,234,0.12) !important; outline: none; }`}</style>
    </div>
  );
};

export default Contact;