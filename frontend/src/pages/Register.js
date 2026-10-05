import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Auth.css';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'patient',
    specialization: 'General Medicine',
    licenseNumber: '',
    qualification: '',
    experience: ''
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

    // Form validations
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please re-enter your password.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (formData.role === 'doctor') {
      if (!formData.licenseNumber || !formData.qualification) {
        setError('Please complete all required doctor fields (License & Qualification).');
        return;
      }
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          specialization: formData.specialization,
          licenseNumber: formData.licenseNumber,
          qualification: formData.qualification,
          experience: formData.experience
        })
      });

      const data = await response.json();

      if (response.ok) {
        let msg = 'Registration successful! You can now log in.';
        if (formData.role === 'doctor') {
          msg = 'Doctor registration submitted! Please wait for administrator approval before logging in.';
        } else if (formData.role === 'admin') {
          msg = 'Admin registration submitted! Please wait for superadmin approval before logging in.';
        } else if (formData.role === 'superadmin') {
          msg = 'SuperAdmin / Owner account created successfully! You can now log in.';
        }

        alert(msg);
        navigate('/login');
      } else {
        setError(data.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('Server connection error. Please verify the backend is running.');
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
              🚀 Start Your Health Journey
            </div>
            <h1 className="auth-hero-title">
              Create Your Unified Account
            </h1>
            <p className="auth-hero-desc">
              Join thousands of patients, doctors, and healthcare managers using our smart digital platform.
            </p>

            <div className="auth-hero-stats">
              <div className="auth-stat-card">
                <div className="auth-stat-icon">⚡</div>
                <div className="auth-stat-title">Quick Setup</div>
                <div className="auth-stat-sub">Under 1 minute registration</div>
              </div>
              <div className="auth-stat-card">
                <div className="auth-stat-icon">🏥</div>
                <div className="auth-stat-title">All-in-One</div>
                <div className="auth-stat-sub">Consults, Billing, Records</div>
              </div>
              <div className="auth-stat-card">
                <div className="auth-stat-icon">📅</div>
                <div className="auth-stat-title">Realtime Queue</div>
                <div className="auth-stat-sub">Live position updates</div>
              </div>
              <div className="auth-stat-card">
                <div className="auth-stat-icon">🛡️</div>
                <div className="auth-stat-title">Private</div>
                <div className="auth-stat-sub">End-to-End Data Security</div>
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
              <h2 className="auth-header-title">Create Account 🚀</h2>
              <p className="auth-header-subtitle">Select your account type and fill details</p>
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

            {/* Role Notice */}
            {(formData.role === 'doctor' || formData.role === 'admin') && (
              <div className="auth-alert auth-alert-info">
                <span>ℹ️</span>
                <span>
                  <strong>Notice:</strong> {formData.role === 'doctor' ? 'Doctor' : 'Admin'} registration requires approval before logging in.
                </span>
              </div>
            )}

            {/* Alert Error */}
            {error && (
              <div className="auth-alert auth-alert-error">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* Register Form */}
            <form onSubmit={handleSubmit}>
              {/* Full Name */}
              <div className="auth-form-group">
                <label className="auth-label">Full Name *</label>
                <div className="auth-input-wrapper">
                  <span className="auth-input-icon">👤</span>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    required
                    className="auth-input"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="auth-form-group">
                <label className="auth-label">Email Address *</label>
                <div className="auth-input-wrapper">
                  <span className="auth-input-icon">📧</span>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email address"
                    required
                    className="auth-input"
                  />
                </div>
              </div>

              {/* Doctor Specific Fields */}
              {formData.role === 'doctor' && (
                <>
                  <div className="auth-form-group">
                    <label className="auth-label">Specialization *</label>
                    <div className="auth-input-wrapper">
                      <span className="auth-input-icon">🩺</span>
                      <select
                        name="specialization"
                        value={formData.specialization}
                        onChange={handleChange}
                        required
                        className="auth-input"
                        style={{ paddingLeft: '2.8rem' }}
                      >
                        <option value="General Medicine">General Medicine</option>
                        <option value="Cardiology">Cardiology</option>
                        <option value="Dermatology">Dermatology</option>
                        <option value="Neurology">Neurology</option>
                        <option value="Pediatrics">Pediatrics</option>
                        <option value="Orthopedics">Orthopedics</option>
                        <option value="Psychiatry">Psychiatry</option>
                      </select>
                    </div>
                  </div>

                  <div className="auth-form-group">
                    <label className="auth-label">License Number *</label>
                    <div className="auth-input-wrapper">
                      <span className="auth-input-icon">🪪</span>
                      <input
                        type="text"
                        name="licenseNumber"
                        value={formData.licenseNumber}
                        onChange={handleChange}
                        placeholder="Medical license ID"
                        required
                        className="auth-input"
                      />
                    </div>
                  </div>

                  <div className="auth-form-group">
                    <label className="auth-label">Qualification *</label>
                    <div className="auth-input-wrapper">
                      <span className="auth-input-icon">🎓</span>
                      <input
                        type="text"
                        name="qualification"
                        value={formData.qualification}
                        onChange={handleChange}
                        placeholder="e.g., MBBS, MD"
                        required
                        className="auth-input"
                      />
                    </div>
                  </div>

                  <div className="auth-form-group">
                    <label className="auth-label">Years of Experience</label>
                    <div className="auth-input-wrapper">
                      <span className="auth-input-icon">⏳</span>
                      <input
                        type="number"
                        name="experience"
                        value={formData.experience}
                        onChange={handleChange}
                        placeholder="Years (e.g. 5)"
                        min="0"
                        className="auth-input"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Password */}
              <div className="auth-form-group">
                <label className="auth-label">Password *</label>
                <div className="auth-input-wrapper">
                  <span className="auth-input-icon">🔑</span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a strong password"
                    required
                    minLength="6"
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

              {/* Confirm Password */}
              <div className="auth-form-group">
                <label className="auth-label">Confirm Password *</label>
                <div className="auth-input-wrapper">
                  <span className="auth-input-icon">🔒</span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                    required
                    className="auth-input"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="auth-btn-primary"
              >
                {loading ? (
                  <>⏳ Creating Account...</>
                ) : (
                  <>✨ Create Account</>
                )}
              </button>
            </form>

            <div className="auth-card-footer">
              Already have an account?
              <button type="button" onClick={() => navigate('/login')}>
                Log In Here
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;