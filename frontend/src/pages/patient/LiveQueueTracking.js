import React, { useState, useEffect } from 'react';
import PatientSidebar from '../../components/PatientSidebar';
import PatientTopNav from '../../components/PatientTopNav';

const LiveQueueTracking = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [queues, setQueues] = useState([]);

  const user = JSON.parse(localStorage.getItem('user')) || {};

  useEffect(() => {
    fetchPatientQueues();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchPatientQueues = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/queue/patient/${user._id || user.id || 'demo'}`);
      if (response.ok) {
        const data = await response.json();
        setQueues(data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch patient queues:', err);
    }
  };

  // Demo queue simulator for testing
  const handleJoinDemoQueue = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/queue/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorId: '64d1f2a3e8b4c2a1e8f9d001',
          patientId: user._id || user.id,
          patientName: user.name || 'Current Patient',
          timeSlot: '11:30 AM'
        })
      });
      const data = await response.json();
      if (data.success) {
        alert(`Joined live queue! Your token number is #${data.data.tokenNumber}`);
        fetchPatientQueues();
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
              <h1 className="page-title">⚡ Live Queue Tracking</h1>
              <p style={{ color: '#64748b', marginTop: '0.25rem' }}>Real-time token status, current serving token, and estimated wait times.</p>
            </div>
            <button
              onClick={handleJoinDemoQueue}
              style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '10px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 12px rgba(37,99,235,0.2)'
              }}
            >
              🎟️ Get Live OPD Token
            </button>
          </div>

          {/* Active Live Queue Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            {/* Live Token Status Card */}
            <div style={{ background: '#ffffff', borderRadius: '16px', padding: '1.75rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: '700', color: '#64748b' }}>NOW SERVING</span>
                <span style={{ background: '#dcfce7', color: '#15803d', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '700' }}>
                  🟢 LIVE
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
                <span style={{ fontSize: '3.5rem', fontWeight: '900', color: '#1e293b' }}>
                  Token #{queues[0]?.currentToken || 1}
                </span>
                <span style={{ color: '#64748b', fontSize: '0.9rem' }}>
                  {queues[0]?.doctor?.name ? `Dr. ${queues[0].doctor.name}` : 'OPD Room 101'}
                </span>
              </div>
              <div style={{ marginTop: '1rem', height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '65%', height: '100%', background: 'linear-gradient(90deg, #10b981, #3b82f6)', borderRadius: '4px' }}></div>
              </div>
            </div>

            {/* Patient's Your Token Card */}
            <div style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', color: 'white', borderRadius: '16px', padding: '1.75rem', boxShadow: '0 8px 24px rgba(15,23,42,0.3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: '700', color: '#94a3b8' }}>YOUR TOKEN NUMBER</span>
                <span style={{ background: '#38bdf8', color: '#0369a1', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '800' }}>
                  {queues[0]?.yourToken ? 'ACTIVE' : 'READY'}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
                <span style={{ fontSize: '3.5rem', fontWeight: '900', color: '#38bdf8' }}>
                  {queues[0]?.yourToken ? `#${queues[0].yourToken}` : '#--'}
                </span>
                <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                  {queues[0]?.tokensAhead !== undefined ? `${queues[0].tokensAhead} patients ahead` : 'Click below to get token'}
                </span>
              </div>
              <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#cbd5e1', fontSize: '0.9rem' }}>
                <span>⏱️ Estimated Wait Time:</span>
                <strong style={{ color: '#facc15' }}>
                  {queues[0]?.estimatedWaitTimeMins !== undefined ? `~${queues[0].estimatedWaitTimeMins} mins` : 'Instant check-in'}
                </strong>
              </div>
            </div>

            {/* Smart Notification Alert */}
            <div style={{ background: '#eff6ff', borderRadius: '16px', padding: '1.75rem', border: '1px solid #bfdbfe' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '1.5rem' }}>🔔</span>
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1e40af' }}>Queue Notification Alert</h3>
              </div>
              <p style={{ color: '#1e3a8a', fontSize: '0.9rem', lineHeight: '1.5' }}>
                We will send you an SMS and Push Notification when your token is 2 positions away. Please ensure you are near OPD Room 204.
              </p>
              <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', fontSize: '0.8rem', color: '#2563eb', fontWeight: '600' }}>
                <span>✓ SMS Alert: Active</span>
                <span>•</span>
                <span>✓ WhatsApp: Active</span>
              </div>
            </div>
          </div>

          {/* Department Queue Details */}
          <div style={{ background: '#ffffff', borderRadius: '16px', padding: '1.5rem', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem' }}>🏥 Hospital Department Queue Overview</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#64748b', fontSize: '0.85rem' }}>
                    <th style={{ padding: '1rem' }}>Doctor & Specialty</th>
                    <th style={{ padding: '1rem' }}>Room</th>
                    <th style={{ padding: '1rem' }}>Current Serving</th>
                    <th style={{ padding: '1rem' }}>Total in Queue</th>
                    <th style={{ padding: '1rem' }}>Avg Wait / Patient</th>
                    <th style={{ padding: '1rem' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { doctor: 'Dr. John Smith', spec: 'Cardiology', room: 'Room 101', current: '#12', total: 18, avg: '12 mins', status: 'Running smoothly' },
                    { doctor: 'Dr. Sarah Wilson', spec: 'Dermatology', room: 'Room 104', current: '#08', total: 10, avg: '10 mins', status: 'On time' },
                    { doctor: 'Dr. David Lee', spec: 'Pediatrics', room: 'Room 202', current: '#15', total: 22, avg: '15 mins', status: 'Slight delay' },
                    { doctor: 'Dr. Emily Brown', spec: 'Neurology', room: 'Room 305', current: '#05', total: 7, avg: '20 mins', status: 'Running smoothly' }
                  ].map((row, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '1rem', fontWeight: '600' }}>
                        <div>{row.doctor}</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{row.spec}</div>
                      </td>
                      <td style={{ padding: '1rem', color: '#475569' }}>{row.room}</td>
                      <td style={{ padding: '1rem', fontWeight: '700', color: '#2563eb' }}>{row.current}</td>
                      <td style={{ padding: '1rem' }}>{row.total} patients</td>
                      <td style={{ padding: '1rem' }}>{row.avg}</td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ background: '#dcfce7', color: '#166534', padding: '4px 8px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '600' }}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveQueueTracking;
