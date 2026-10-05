import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Auth.css';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'patient'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const handleRoleSelect = (roleKey) => {
    setFormData({
      ...formData,
      role: roleKey
    });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: formData.email,
          name: formData.email,
          password: formData.password,
          role: formData.role
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Save auth data
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        // Navigate to appropriate role dashboard
        switch (data.user.role) {
          case 'patient':
            navigate('/patient/dashboard');
            break;
          case 'doctor':
            navigate('/doctor/dashboard');
            break;
          case 'admin':
            navigate('/admin/dashboard');
            break;
          case 'superadmin':
            navigate('/superadmin/dashboard');
            break;
          default:
            navigate('/');
        }
      } else {
        setError(data.message || 'Login failed. Please verify your credentials.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Connection error. Please check if the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-bg-blob-1"></div>
      <div className="auth-bg-blob-2"></div>

      <div className="auth-grid">
        {/* Left Side Hero */}
        <div className="auth-hero-panel">
          <Link to="/" className="auth-brand-logo">
            <div className="auth-brand-icon">🏥</div>
            <span className="auth-brand-name">Doctor Appointment System</span>
          </Link>

          <div className="auth-hero-content">
            <div className="auth-hero-tagline">
              ✨ Unified Healthcare Portal
            </div>
            <h1 className="auth-hero-title">
              Manage Your Health & Practice Seamlessly
            </h1>
            <p className="auth-hero-desc">
              Access your medical records, book appointments, consult with top doctors, or manage clinical operations from a unified workspace.
            </p>

            <div className="auth-hero-stats">
              <div className="auth-stat-card">
                <div className="auth-stat-icon">👥</div>
                <div className="auth-stat-title">4 Roles</div>
                <div className="auth-stat-sub">Patient, Doctor, Admin, Owner</div>
              </div>
              <div className="auth-stat-card">
                <div className="auth-stat-icon">📹</div>
                <div className="auth-stat-title">Live Consults</div>
                <div className="auth-stat-sub">HD Video & Queue Tracking</div>
              </div>
              <div className="auth-stat-card">
                <div className="auth-stat-icon">🤖</div>
                <div className="auth-stat-title">AI Copilot</div>
                <div className="auth-stat-sub">24/7 Smart Appointment AI</div>
              </div>
              <div className="auth-stat-card">
                <div className="auth-stat-icon">🔒</div>
                <div className="auth-stat-title">Encrypted</div>
                <div className="auth-stat-sub">HIPAA Level Security</div>
              </div>
            </div>
          </div>

          <div className="auth-hero-footer">
            <span>© 2026 Doctor Appointment System</span>
            <span>•</span>
            <span>Privacy & Terms</span>
          </div>
        </div>

        {/* Right Side Form */}
        <div className="auth-form-panel">
          <div className="auth-card">
            <div className="auth-header-box">
              <h2 className="auth-header-title">Welcome Back 👋</h2>
              <p className="auth-header-subtitle">Sign in to your portal account</p>
            </div>

            {/* Role Selector Tabs */}
            <div className="auth-role-tabs">
              <button
                type="button"
                className={`auth-role-tab ${formData.role === 'patient' ? 'active patient' : ''}`}
                onClick={() => handleRoleSelect('patient')}
              >
                <span className="icon">👤</span>
                <span>Patient</span>
              </button>
              <button
                type="button"
                className={`auth-role-tab ${formData.role === 'doctor' ? 'active doctor' : ''}`}
                onClick={() => handleRoleSelect('doctor')}
              >
                <span className="icon">⚕️</span>
                <span>Doctor</span>
              </button>
              <button
                type="button"
                className={`auth-role-tab ${formData.role === 'admin' ? 'active admin' : ''}`}
                onClick={() => handleRoleSelect('admin')}
              >
                <span className="icon">👨‍💼</span>
                <span>Admin</span>
              </button>
              <button
                type="button"
                className={`auth-role-tab ${formData.role === 'superadmin' ? 'active superadmin' : ''}`}
                onClick={() => handleRoleSelect('superadmin')}
              >
                <span className="icon">👑</span>
                <span>Owner</span>
              </button>
            </div>

            {/* Alert Error */}
            {error && (
              <div className="auth-alert auth-alert-error">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit}>
              <div className="auth-form-group">
                <label className="auth-label">
                  {formData.role === 'superadmin' ? 'SuperAdmin Name or Email' : 'Email Address'}
                </label>
                <div className="auth-input-wrapper">
                  <span className="auth-input-icon">
                    {formData.role === 'superadmin' ? '👑' : '📧'}
                  </span>
                  <input
                    type={formData.role === 'superadmin' ? 'text' : 'email'}
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder={
                      formData.role === 'superadmin'
                        ? 'Enter your SuperAdmin name or email'
                        : 'Enter your email address'
                    }
                    required
                    className="auth-input"
                  />
                </div>
              </div>

              <div className="auth-form-group">
                <label className="auth-label">Password</label>
                <div className="auth-input-wrapper">
                  <span className="auth-input-icon">🔑</span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    required
                    className="auth-input"
                  />
                  <button
                    type="button"
                    className="auth-input-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="auth-btn-primary"
              >
                {loading ? (
                  <>⏳ Authenticating...</>
                ) : (
                  <>🔐 Log In to Dashboard</>
                )}
              </button>
            </form>

            <div className="auth-card-footer">
              Don't have an account yet?
              <button type="button" onClick={() => navigate('/register')}>
                Register Here
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;