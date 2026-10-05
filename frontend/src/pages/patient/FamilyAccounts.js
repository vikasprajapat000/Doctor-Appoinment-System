import React, { useState, useEffect } from 'react';
import PatientSidebar from '../../components/PatientSidebar';
import PatientTopNav from '../../components/PatientTopNav';

const FamilyAccounts = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    relationship: 'Child',
    gender: 'Male',
    age: '',
    bloodGroup: 'O+',
    allergies: '',
    chronicConditions: '',
    emergencyPhone: ''
  });

  const user = JSON.parse(localStorage.getItem('user')) || {};

  useEffect(() => {
    fetchFamilyMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchFamilyMembers = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/family/user/${user._id || user.id || 'demo'}`);
      if (response.ok) {
        const data = await response.json();
        setFamilyMembers(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching family:', err);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/family', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          primaryUser: user._id || user.id || '64d1f2a3e8b4c2a1e8f9d001',
          name: formData.name,
          relationship: formData.relationship,
          gender: formData.gender,
          age: Number(formData.age),
          bloodGroup: formData.bloodGroup,
          allergies: formData.allergies ? formData.allergies.split(',').map(s => s.trim()) : [],
          chronicConditions: formData.chronicConditions ? formData.chronicConditions.split(',').map(s => s.trim()) : [],
          emergencyContact: {
            phone: formData.emergencyPhone,
            relation: formData.relationship
          }
        })
      });

      if (response.ok) {
        setShowAddModal(false);
        setFormData({
          name: '',
          relationship: 'Child',
          gender: 'Male',
          age: '',
          bloodGroup: 'O+',
          allergies: '',
          chronicConditions: '',
          emergencyPhone: ''
        });
        fetchFamilyMembers();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteMember = async (id) => {
    if (!window.confirm('Are you sure you want to remove this family member?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/family/${id}`, { method: 'DELETE' });
      if (res.ok) fetchFamilyMembers();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="dashboard-layout">
      <PatientSidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <div className="main-content">
        <PatientTopNav toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <div className="dashboard-content">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 className="page-title">👨‍👩‍👧‍👦 Family Health Accounts</h1>
              <p style={{ color: '#64748b', marginTop: '0.25rem' }}>Manage dependent family profiles, book appointments, and maintain health records together.</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              style={{
                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '10px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 12px rgba(99,102,241,0.2)'
              }}
            >
              ➕ Add Family Member
            </button>
          </div>

          {/* Family Profiles Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {/* Primary Account Card */}
            <div style={{ background: '#ffffff', borderRadius: '16px', padding: '1.75rem', border: '2px solid #3b82f6', boxShadow: '0 4px 16px rgba(59,130,246,0.08)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span style={{ background: '#dbeafe', color: '#1d4ed8', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '700' }}>
                  ⭐ PRIMARY ACCOUNT HOLDER
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#3b82f6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold' }}>
                  {user.name ? user.name.charAt(0) : 'U'}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700' }}>{user.name || 'Current User'}</h3>
                  <span style={{ color: '#64748b', fontSize: '0.85rem' }}>{user.email}</span>
                </div>
              </div>
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#475569' }}>
                <span>Role: Patient</span>
                <span style={{ color: '#10b981', fontWeight: '600' }}>Active</span>
              </div>
            </div>

            {/* Dependent Family Cards */}
            {familyMembers.map((member) => (
              <div key={member._id} style={{ background: 'white', borderRadius: '16px', padding: '1.75rem', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <span style={{ background: '#f1f5f9', color: '#475569', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '700' }}>
                    {member.relationship}
                  </span>
                  <button
                    onClick={() => handleDeleteMember(member._id)}
                    style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.9rem' }}
                    title="Remove Profile"
                  >
                    🗑️
                  </button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#8b5cf6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold' }}>
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700' }}>{member.name}</h3>
                    <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Age: {member.age || 'N/A'} • Blood: {member.bloodGroup || 'N/A'}</span>
                  </div>
                </div>

                <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '0.75rem', marginBottom: '1rem', fontSize: '0.85rem' }}>
                  <div>⚠️ <strong>Allergies:</strong> {member.allergies?.length ? member.allergies.join(', ') : 'None'}</div>
                  <div style={{ marginTop: '4px' }}>🏥 <strong>Conditions:</strong> {member.chronicConditions?.length ? member.chronicConditions.join(', ') : 'None'}</div>
                </div>

                <button
                  onClick={() => window.location.href = `/patient/book-appointment?for=${encodeURIComponent(member.name)}`}
                  style={{
                    width: '100%',
                    padding: '0.6rem',
                    background: '#e0e7ff',
                    color: '#4338ca',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '0.85rem'
                  }}
                >
                  📅 Book Appointment for {member.name.split(' ')[0]}
                </button>
              </div>
            ))}
          </div>

          {/* Add Family Member Modal */}
          {showAddModal && (
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', width: '480px', maxWidth: '90%' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem' }}>👨‍👩‍👧 Add Family Member Profile</h3>
                <form onSubmit={handleAddMember} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Jane Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>Relationship</label>
                      <select
                        value={formData.relationship}
                        onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                        style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                      >
                        <option value="Spouse">Spouse</option>
                        <option value="Child">Child</option>
                        <option value="Parent">Parent</option>
                        <option value="Sibling">Sibling</option>
                        <option value="Grandparent">Grandparent</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>Gender</label>
                      <select
                        value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>Age</label>
                      <input
                        type="number"
                        placeholder="e.g. 12"
                        value={formData.age}
                        onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                        style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>Blood Group</label>
                      <select
                        value={formData.bloodGroup}
                        onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                        style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                      >
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                        <option value="Unknown">Unknown</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>Allergies (comma separated)</label>
                    <input
                      type="text"
                      placeholder="e.g. Peanuts, Penicillin"
                      value={formData.allergies}
                      onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                      style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      style={{ padding: '0.6rem 1.2rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white', cursor: 'pointer' }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      style={{ padding: '0.6rem 1.2rem', borderRadius: '8px', border: 'none', background: '#6366f1', color: 'white', fontWeight: '600', cursor: 'pointer' }}
                    >
                      Add Profile
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FamilyAccounts;
