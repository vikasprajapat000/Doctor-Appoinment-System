import React, { useState, useEffect } from 'react';
import DoctorSidebar from '../../components/DoctorSidebar';
import DoctorTopNav from '../../components/DoctorTopNav';
import io from 'socket.io-client';

const DoctorLiveQueue = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [queue, setQueue] = useState({
    currentToken: 0,
    totalTokens: 0,
    avgConsultationTimeMins: 15,
    tokens: []
  });
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const doctorId = user._id || user.id || '64d1f2a3e8b4c2a1e8f9d001';

  useEffect(() => {
    fetchDoctorQueue();

    // Socket.IO real-time connection
    const socket = io('http://localhost:5000');
    socket.emit('subscribe-queue', { doctorId });

    socket.on(`queue:update:${doctorId}`, (updatedQueue) => {
      setQueue(updatedQueue);
    });

    return () => {
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctorId]);

  const fetchDoctorQueue = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/queue/doctor/${doctorId}`);
      if (response.ok) {
        const data = await response.json();
        setQueue(data.data || { currentToken: 0, totalTokens: 0, tokens: [] });
      }
    } catch (err) {
      console.error('Error fetching doctor queue:', err);
    }
  };

  const handleCallNextToken = async () => {
    try {
      const nextToken = (queue.currentToken || 0) + 1;
      const response = await fetch('http://localhost:5000/api/queue/advance', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorId,
          nextTokenNumber: nextToken
        })
      });
      if (response.ok) {
        const data = await response.json();
        setQueue(data.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddWalkInPatient = async (e) => {
    e.preventDefault();
    const patientName = prompt('Enter Walk-in Patient Name:');
    if (!patientName) return;

    try {
      const response = await fetch('http://localhost:5000/api/queue/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorId,
          patientName,
          timeSlot: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        })
      });
      if (response.ok) {
        fetchDoctorQueue();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="dashboard-layout">
      <DoctorSidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <div className="main-content">
        <DoctorTopNav toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <div className="dashboard-content">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 className="page-title">⚡ Live OPD Queue Controller</h1>
              <p style={{ color: '#64748b', marginTop: '0.25rem' }}>Call next patient, advance live tokens, and manage in-clinic consultation flow in real-time.</p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={handleAddWalkInPatient}
                style={{
                  background: 'white',
                  color: '#2563eb',
                  border: '2px solid #2563eb',
                  padding: '0.75rem 1.25rem',
                  borderRadius: '10px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                ➕ Add Walk-In Patient
              </button>
              <button
                onClick={handleCallNextToken}
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.75rem',
                  borderRadius: '10px',
                  fontWeight: '700',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(16,185,129,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                📢 Call Next Patient (Token #{ (queue.currentToken || 0) + 1 })
              </button>
            </div>
          </div>

          {/* Real-time KPI Counters */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            <div style={{ background: '#1e293b', color: 'white', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}>
              <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: '700' }}>CURRENTLY SERVING</span>
              <div style={{ fontSize: '3rem', fontWeight: '900', color: '#38bdf8', marginTop: '0.5rem' }}>
                Token #{queue.currentToken || 0}
              </div>
              <span style={{ fontSize: '0.8rem', color: '#10b981' }}>🟢 Active in Consultation</span>
            </div>

            <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '700' }}>TOTAL REGISTERED TOKENS</span>
              <div style={{ fontSize: '3rem', fontWeight: '900', color: '#1e293b', marginTop: '0.5rem' }}>
                {queue.totalTokens || 0}
              </div>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>For Today's OPD Session</span>
            </div>

            <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '700' }}>PATIENTS WAITING IN CLINIC</span>
              <div style={{ fontSize: '3rem', fontWeight: '900', color: '#f59e0b', marginTop: '0.5rem' }}>
                {Math.max(0, (queue.totalTokens || 0) - (queue.currentToken || 0))}
              </div>
              <span style={{ fontSize: '0.8rem', color: '#f59e0b' }}>Est. Remaining Time: {Math.max(0, (queue.totalTokens || 0) - (queue.currentToken || 0)) * 15} mins</span>
            </div>
          </div>

          {/* Queue Patient List */}
          <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1.25rem' }}>📋 Patient Queue Stream</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {(queue.tokens && queue.tokens.length > 0) ? (
                queue.tokens.map((tokenItem) => {
                  const isCurrent = tokenItem.tokenNumber === queue.currentToken;
                  const isCompleted = tokenItem.tokenNumber < queue.currentToken;

                  return (
                    <div
                      key={tokenItem.tokenNumber}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '1rem 1.5rem',
                        borderRadius: '12px',
                        background: isCurrent ? '#eff6ff' : isCompleted ? '#f8fafc' : '#ffffff',
                        border: isCurrent ? '2px solid #3b82f6' : '1px solid #e2e8f0'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                        <div style={{
                          width: '45px',
                          height: '45px',
                          borderRadius: '10px',
                          background: isCurrent ? '#3b82f6' : isCompleted ? '#cbd5e1' : '#f1f5f9',
                          color: isCurrent ? 'white' : '#1e293b',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: '800',
                          fontSize: '1.2rem'
                        }}>
                          #{tokenItem.tokenNumber}
                        </div>
                        <div>
                          <div style={{ fontWeight: '700', fontSize: '1.05rem', color: '#1e293b' }}>
                            {tokenItem.patientName}
                          </div>
                          <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                            Slot: {tokenItem.timeSlot || '10:00 AM'} • Joined: {new Date(tokenItem.joinedAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{
                          padding: '0.4rem 1rem',
                          borderRadius: '20px',
                          fontSize: '0.8rem',
                          fontWeight: '700',
                          background: isCurrent ? '#dbeafe' : isCompleted ? '#f1f5f9' : '#fef3c7',
                          color: isCurrent ? '#1d4ed8' : isCompleted ? '#64748b' : '#b45309'
                        }}>
                          {isCurrent ? '● In Consultation' : isCompleted ? '✓ Completed' : '⏳ Waiting'}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🎟️</div>
                  <h4>No tokens registered in today's live queue yet</h4>
                  <p style={{ fontSize: '0.9rem' }}>Patients will automatically appear here when they check-in online or get booked.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorLiveQueue;
