import React, { useState, useEffect } from 'react';
import PatientSidebar from '../../components/PatientSidebar';
import PatientTopNav from '../../components/PatientTopNav';

const MedicineReminders = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [reminders, setReminders] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    medicineName: '',
    dosage: '1 tablet',
    frequency: 'Once Daily',
    instructions: 'After meals',
    time1: '08:00',
    time2: '20:00',
    notifyEmail: true,
    notifySms: true,
    notifyWhatsapp: true
  });

  const user = JSON.parse(localStorage.getItem('user')) || {};

  useEffect(() => {
    fetchReminders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchReminders = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/reminders/patient/${user._id || user.id || 'demo'}`);
      if (response.ok) {
        const data = await response.json();
        setReminders(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching reminders:', err);
    }
  };

  const handleCreateReminder = async (e) => {
    e.preventDefault();
    try {
      const times = [
        { time: formData.time1, taken: false },
        ...(formData.frequency === 'Twice Daily' || formData.frequency === 'Thrice Daily' ? [{ time: formData.time2, taken: false }] : [])
      ];

      const response = await fetch('http://localhost:5000/api/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient: user._id || user.id || '64d1f2a3e8b4c2a1e8f9d001',
          medicineName: formData.medicineName,
          dosage: formData.dosage,
          frequency: formData.frequency,
          instructions: formData.instructions,
          times,
          channels: {
            email: formData.notifyEmail,
            sms: formData.notifySms,
            whatsapp: formData.notifyWhatsapp,
            push: true
          }
        })
      });

      if (response.ok) {
        setShowAddModal(false);
        setFormData({
          medicineName: '',
          dosage: '1 tablet',
          frequency: 'Once Daily',
          instructions: 'After meals',
          time1: '08:00',
          time2: '20:00',
          notifyEmail: true,
          notifySms: true,
          notifyWhatsapp: true
        });
        fetchReminders();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTakeDose = async (reminderId, timeIndex) => {
    try {
      const response = await fetch(`http://localhost:5000/api/reminders/${reminderId}/take`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timeIndex })
      });
      if (response.ok) {
        fetchReminders();
      }
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
              <h1 className="page-title">💊 Medicine Reminders & Tracker</h1>
              <p style={{ color: '#64748b', marginTop: '0.25rem' }}>Automated prescription dosage alerts via WhatsApp, SMS, Email, and Push.</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '10px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 12px rgba(16,185,129,0.2)'
              }}
            >
              ➕ Add Medicine Reminder
            </button>
          </div>

          {/* Today's Schedule Overview */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem' }}>
                💊
              </div>
              <div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '800', margin: 0 }}>{reminders.length}</h3>
                <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Active Prescriptions</span>
              </div>
            </div>

            <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem' }}>
                ⏰
              </div>
              <div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '800', margin: 0 }}>Next at 08:00 PM</h3>
                <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Upcoming Daily Dose</span>
              </div>
            </div>

            <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem' }}>
                📲
              </div>
              <div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '800', margin: 0 }}>4 Channels</h3>
                <span style={{ color: '#64748b', fontSize: '0.85rem' }}>WhatsApp • SMS • Email • Push</span>
              </div>
            </div>
          </div>

          {/* Reminder Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
            {reminders.map((rem) => (
              <div key={rem._id} style={{ background: 'white', borderRadius: '16px', padding: '1.75rem', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '700', margin: '0 0 0.25rem 0', color: '#1e293b' }}>{rem.medicineName}</h3>
                    <span style={{ background: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '600' }}>
                      {rem.dosage} • {rem.frequency}
                    </span>
                  </div>
                  <span style={{ background: '#dcfce7', color: '#166534', padding: '4px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '700' }}>
                    Active
                  </span>
                </div>

                <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '0.75rem', marginBottom: '1rem', fontSize: '0.85rem', color: '#64748b' }}>
                  🍽️ <strong>Instructions:</strong> {rem.instructions || 'Take after food'}
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <h4 style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Daily Timetable:</h4>
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    {(rem.times || []).map((t, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: t.taken ? '#dcfce7' : '#eff6ff', padding: '0.5rem 0.75rem', borderRadius: '8px' }}>
                        <span style={{ fontWeight: '700', color: t.taken ? '#166534' : '#1e40af' }}>🕒 {t.time}</span>
                        {t.taken ? (
                          <span style={{ color: '#166534', fontSize: '0.75rem', fontWeight: '700' }}>✓ Taken</span>
                        ) : (
                          <button
                            onClick={() => handleTakeDose(rem._id, idx)}
                            style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}
                          >
                            Mark Taken
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: '#94a3b8' }}>
                  <span>Channels: 📧 SMS 📱 WA 🔔</span>
                  <span style={{ color: '#10b981', fontWeight: '600' }}>Cron Alert: ON</span>
                </div>
              </div>
            ))}
          </div>

          {/* Add Reminder Modal */}
          {showAddModal && (
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', width: '480px', maxWidth: '90%' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem' }}>💊 Add New Medicine Reminder</h3>
                <form onSubmit={handleCreateReminder} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>Medicine Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Paracetamol / Amoxicillin"
                      value={formData.medicineName}
                      onChange={(e) => setFormData({ ...formData, medicineName: e.target.value })}
                      style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>Dosage</label>
                      <input
                        type="text"
                        value={formData.dosage}
                        onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                        style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>Frequency</label>
                      <select
                        value={formData.frequency}
                        onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                        style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                      >
                        <option value="Once Daily">Once Daily</option>
                        <option value="Twice Daily">Twice Daily</option>
                        <option value="Thrice Daily">Thrice Daily</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>Time 1</label>
                      <input
                        type="time"
                        value={formData.time1}
                        onChange={(e) => setFormData({ ...formData, time1: e.target.value })}
                        style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                      />
                    </div>
                    {formData.frequency !== 'Once Daily' && (
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>Time 2</label>
                        <input
                          type="time"
                          value={formData.time2}
                          onChange={(e) => setFormData({ ...formData, time2: e.target.value })}
                          style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>Instructions</label>
                    <input
                      type="text"
                      value={formData.instructions}
                      onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                      placeholder="e.g. After meal with water"
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
                      style={{ padding: '0.6rem 1.2rem', borderRadius: '8px', border: 'none', background: '#10b981', color: 'white', fontWeight: '600', cursor: 'pointer' }}
                    >
                      Save Reminder
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

export default MedicineReminders;
