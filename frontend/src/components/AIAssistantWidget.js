import React, { useState, useEffect, useRef, useCallback } from 'react';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Role-specific accent colors matching the existing design system
const ROLE_COLORS = {
  patient: { primary: '#667eea', secondary: '#764ba2', light: '#ede9fe', text: '#5b21b6' },
  doctor: { primary: '#059669', secondary: '#047857', light: '#d1fae5', text: '#065f46' },
  admin: { primary: '#d97706', secondary: '#b45309', light: '#fef3c7', text: '#92400e' },
  superadmin: { primary: '#dc2626', secondary: '#b91c1c', light: '#fee2e2', text: '#991b1b' }
};

const ROLE_ICONS = { patient: '🏥', doctor: '👨‍⚕️', admin: '⚙️', superadmin: '🔐' };

// Helper: get auth token and user from localStorage
function getAuthData() {
  try {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    return { token, user };
  } catch {
    return { token: null, user: null };
  }
}


// ============================================================
// CARD COMPONENTS for rich message rendering
// ============================================================

function AppointmentCard({ appointment, colors }) {
  const statusColor = {
    pending: '#f59e0b', confirmed: '#10b981', completed: '#6366f1',
    cancelled: '#ef4444', rejected: '#ef4444'
  }[appointment.status] || '#94a3b8';

  return (
    <div style={{
      background: '#fff', borderRadius: '10px', padding: '10px 12px',
      marginTop: '6px', border: `1px solid #e2e8f0`,
      borderLeft: `3px solid ${statusColor}`, fontSize: '0.82rem'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
        <span style={{ fontWeight: '600', color: '#1e293b' }}>
          {appointment.doctor?.name ? `Dr. ${appointment.doctor.name}` : 'Doctor'}
        </span>
        <span style={{
          background: statusColor + '20', color: statusColor,
          borderRadius: '99px', padding: '1px 8px', fontSize: '0.75rem', fontWeight: '600',
          textTransform: 'capitalize'
        }}>{appointment.status}</span>
      </div>
      <div style={{ color: '#64748b', lineHeight: '1.5' }}>
        {appointment.doctor?.specialization && <div>🩺 {appointment.doctor.specialization}</div>}
        <div>📅 {appointment.date} {appointment.time && `at ${appointment.time}`}</div>
        {appointment.type && <div>🏷️ {appointment.type}</div>}
        {appointment.reason && <div style={{ marginTop: '2px', fontStyle: 'italic', color: '#94a3b8', fontSize: '0.78rem' }}>"{appointment.reason}"</div>}
      </div>
    </div>
  );
}

function DoctorCard({ doctor, colors, onBook }) {
  return (
    <div style={{
      background: '#fff', borderRadius: '10px', padding: '10px 12px',
      marginTop: '6px', border: '1px solid #e2e8f0',
      borderLeft: `3px solid ${colors.primary}`, fontSize: '0.82rem'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
        <span style={{ fontWeight: '600', color: '#1e293b' }}>Dr. {doctor.name}</span>
        <span style={{ fontSize: '0.75rem', color: colors.text, background: colors.light, borderRadius: '99px', padding: '1px 8px' }}>
          {doctor.specialization || 'General'}
        </span>
      </div>
      <div style={{ color: '#64748b', lineHeight: '1.5' }}>
        {doctor.qualification && <div>🎓 {doctor.qualification}</div>}
        {doctor.experience > 0 && <div>⏱️ {doctor.experience} years experience</div>}
      </div>
      {onBook && (
        <button
          onClick={() => onBook(doctor)}
          style={{
            marginTop: '6px', background: colors.primary, color: 'white',
            border: 'none', borderRadius: '6px', padding: '4px 10px',
            fontSize: '0.78rem', cursor: 'pointer', fontWeight: '500'
          }}
        >
          📅 Book Appointment
        </button>
      )}
    </div>
  );
}

function StatCard({ label, value, icon, colors }) {
  return (
    <div style={{
      background: '#fff', borderRadius: '8px', padding: '8px 12px',
      border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center',
      gap: '8px', marginTop: '4px', fontSize: '0.82rem'
    }}>
      <span style={{ fontSize: '1.1rem' }}>{icon}</span>
      <div>
        <div style={{ color: '#64748b', fontSize: '0.72rem' }}>{label}</div>
        <div style={{ fontWeight: '700', color: colors.primary, fontSize: '1rem' }}>{value}</div>
      </div>
    </div>
  );
}

function ConfirmationButtons({ data, onConfirm, onDismiss, colors }) {
  return (
    <div style={{ marginTop: '8px', padding: '10px', background: '#fffbeb', borderRadius: '8px', border: '1px solid #fcd34d' }}>
      <div style={{ fontSize: '0.8rem', color: '#92400e', marginBottom: '8px', fontWeight: '500' }}>
        ⚠️ {data.message}
      </div>
      <div style={{ display: 'flex', gap: '6px' }}>
        <button
          onClick={onConfirm}
          style={{
            background: colors.primary, color: 'white', border: 'none',
            borderRadius: '6px', padding: '5px 14px', fontSize: '0.8rem',
            cursor: 'pointer', fontWeight: '600'
          }}
        >
          ✓ Confirm
        </button>
        <button
          onClick={onDismiss}
          style={{
            background: '#f1f5f9', color: '#475569', border: 'none',
            borderRadius: '6px', padding: '5px 14px', fontSize: '0.8rem',
            cursor: 'pointer'
          }}
        >
          ✕ Cancel
        </button>
      </div>
    </div>
  );
}

// ============================================================
// MAIN WIDGET COMPONENT
// ============================================================

const AIAssistantWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [pendingConfirmation, setPendingConfirmation] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const { token, user } = getAuthData();
  const role = user?.role || 'patient';
  const colors = ROLE_COLORS[role] || ROLE_COLORS.patient;
  const roleIcon = ROLE_ICONS[role] || '🤖';

  // ---- Initialization ----
  useEffect(() => {
    if (token && user) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, [token, user]);

  const fetchWelcomeAndSuggestions = async () => {
    try {
      const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

      const [welcomeRes, suggestionsRes] = await Promise.all([
        fetch(`${API_BASE}/api/ai/welcome`, { headers }),
        fetch(`${API_BASE}/api/ai/suggestions`, { headers })
      ]);

      if (welcomeRes.ok) {
        const welcomeData = await welcomeRes.json();
        if (welcomeData.success) {
          const welcomeMsg = welcomeData.data.message;
          const userName = welcomeData.data.userName;
          addMessage('bot', `Hi ${userName}! ${welcomeMsg}`, { type: 'welcome' });
        }
      }

      if (suggestionsRes.ok) {
        const suggestionsData = await suggestionsRes.json();
        if (suggestionsData.success) {
          setSuggestions(suggestionsData.data.questions || []);
        }
      }
    } catch (err) {
      addMessage('bot', `${roleIcon} Hi! I'm your AI assistant. How can I help you today?`, { type: 'welcome' });
    }
  };

  // Fetch welcome message and suggestions when chat opens
  useEffect(() => {
    if (isOpen && isAuthenticated && messages.length === 0) {
      fetchWelcomeAndSuggestions();
    }
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, isAuthenticated]);

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  function addMessage(sender, text, extra = {}) {
    setMessages(prev => [...prev, {
      id: Date.now() + Math.random(),
      sender,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      ...extra
    }]);
  }

  // ---- Send Message ----
  const sendMessage = useCallback(async (userText, isVoice = false) => {
    const textToSend = (userText || input).trim();
    if (!textToSend) return;
    if (!isAuthenticated) {
      addMessage('bot', '⚠️ Please log in to use the AI assistant.', { type: 'error' });
      return;
    }

    setShowSuggestions(false);
    addMessage('user', textToSend);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/ai/chat`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: textToSend })
      });

      if (response.status === 401) {
        addMessage('bot', '⚠️ Your session has expired. Please log in again.', { type: 'error' });
        setIsLoading(false);
        return;
      }

      if (response.status === 429) {
        const data = await response.json();
        addMessage('bot', `⏳ ${data.message || 'Too many requests. Please wait a moment.'}`, { type: 'error' });
        setIsLoading(false);
        return;
      }

      const data = await response.json();

      if (data.success) {
        const aiData = data.data;

        // Handle confirmation requirement
        if (aiData.requiresConfirmation && aiData.confirmationData) {
          setPendingConfirmation({
            data: aiData.confirmationData,
            toolsUsed: aiData.toolsUsed
          });
        }

        addMessage('bot', aiData.text, {
          type: aiData.type || 'text',
          responseData: aiData.data,
          requiresConfirmation: aiData.requiresConfirmation,
          confirmationData: aiData.confirmationData,
          toolsUsed: aiData.toolsUsed || []
        });

        if (isVoice && 'speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(aiData.text.replace(/[*#[\]]/g, ''));
          utterance.rate = 1.0;
          window.speechSynthesis.speak(utterance);
        }
      } else {
        addMessage('bot', data.message || "I'm sorry, I couldn't process your request. Please try again.", { type: 'error' });
      }
    } catch (err) {
      console.error('AI Widget Error:', err);
      addMessage('bot', "🔌 Connection error. Please check your internet connection and try again.", { type: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, [input, token, isAuthenticated]);

  // ---- Confirmation handlers ----
  const handleConfirm = async () => {
    if (!pendingConfirmation) return;
    const { data } = pendingConfirmation;
    setPendingConfirmation(null);

    // Re-send with confirmed = true
    const confirmMsg = data.appointmentId
      ? `Yes, please confirm. Appointment ID: ${data.appointmentId}`
      : 'Yes, please confirm.';
    await sendMessage(confirmMsg);
  };

  const handleDismiss = () => {
    setPendingConfirmation(null);
    addMessage('bot', 'No problem! The action has been cancelled. Is there anything else I can help you with?', { type: 'text' });
  };

  // ---- Voice Input ----
  const handleVoiceListen = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = async (e) => {
      const transcript = e.results[0][0].transcript;
      setIsListening(false);
      await sendMessage(transcript, true);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  // ---- Clear Conversation ----
  const clearConversation = async () => {
    try {
      await fetch(`${API_BASE}/api/ai/clear`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
    } catch { /* silent */ }
    setMessages([]);
    setSuggestions([]);
    setShowSuggestions(true);
    setPendingConfirmation(null);
    fetchWelcomeAndSuggestions();
  };

  // ---- Message renderer ----
  const renderMessageContent = (msg) => {
    // Rich render for bot messages
    if (msg.sender === 'bot') {
      const hasAppointments = msg.responseData?.appointments?.length > 0;
      const hasDoctors = msg.responseData?.doctors?.length > 0;
      const hasStats = msg.type === 'statistics' && msg.responseData;

      return (
        <div>
          {/* Main text */}
          <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>
            {formatMarkdown(msg.text)}
          </div>

          {/* Appointment cards */}
          {hasAppointments && (
            <div style={{ marginTop: '8px' }}>
              {msg.responseData.appointments.slice(0, 5).map((apt, i) => (
                <AppointmentCard key={i} appointment={apt} colors={colors} />
              ))}
              {msg.responseData.appointments.length > 5 && (
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px', textAlign: 'center' }}>
                  + {msg.responseData.appointments.length - 5} more appointments
                </div>
              )}
            </div>
          )}

          {/* Doctor cards */}
          {hasDoctors && (
            <div style={{ marginTop: '8px' }}>
              {msg.responseData.doctors.slice(0, 4).map((doc, i) => (
                <DoctorCard
                  key={i}
                  doctor={doc}
                  colors={colors}
                  onBook={role === 'patient' ? (doc) => {
                    setInput(`Book appointment with Dr. ${doc.name}`);
                    inputRef.current?.focus();
                  } : null}
                />
              ))}
            </div>
          )}

          {/* Statistics cards */}
          {hasStats && msg.responseData.byStatus && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', marginTop: '8px' }}>
              <StatCard label="Total" value={msg.responseData.total || msg.responseData.byStatus?.total || 0} icon="📊" colors={colors} />
              <StatCard label="Completed" value={msg.responseData.byStatus?.completed || 0} icon="✅" colors={colors} />
              <StatCard label="Pending" value={msg.responseData.byStatus?.pending || 0} icon="⏳" colors={colors} />
              <StatCard label="Cancelled" value={msg.responseData.byStatus?.cancelled || 0} icon="❌" colors={colors} />
            </div>
          )}

          {/* Confirmation buttons */}
          {msg.requiresConfirmation && msg.confirmationData && pendingConfirmation && (
            <ConfirmationButtons
              data={msg.confirmationData}
              onConfirm={handleConfirm}
              onDismiss={handleDismiss}
              colors={colors}
            />
          )}

          {/* TTS button */}
          <button
            onClick={() => {
              if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
                const utt = new SpeechSynthesisUtterance(msg.text.replace(/[*#[\]]/g, ''));
                window.speechSynthesis.speak(utt);
              }
            }}
            style={{
              background: 'transparent', border: 'none', cursor: 'pointer',
              fontSize: '0.72rem', marginTop: '6px', opacity: 0.5, color: '#64748b',
              display: 'flex', alignItems: 'center', gap: '2px'
            }}
            title="Read aloud"
          >
            🔊 Read aloud
          </button>
        </div>
      );
    }

    return <div style={{ lineHeight: '1.5' }}>{msg.text}</div>;
  };

  // Simple markdown formatter (bold + bullets)
  function formatMarkdown(text) {
    if (!text) return null;
    const lines = text.split('\n');
    return lines.map((line, i) => {
      // Bold **text**
      const boldProcessed = line.replace(/\*\*(.*?)\*\*/g, (_, m) => `§BOLD§${m}§/BOLD§`);
      const parts = boldProcessed.split(/(§BOLD§.*?§\/BOLD§)/g);

      const elements = parts.map((part, j) => {
        if (part.startsWith('§BOLD§')) {
          return <strong key={j}>{part.replace(/§BOLD§|§\/BOLD§/g, '')}</strong>;
        }
        return <span key={j}>{part}</span>;
      });

      // Bullet point lines
      if (line.startsWith('• ') || line.startsWith('- ') || line.startsWith('* ')) {
        return <div key={i} style={{ paddingLeft: '8px', marginTop: '2px' }}>• {elements.slice(1)}</div>;
      }

      return <div key={i} style={{ marginTop: i > 0 ? '2px' : 0 }}>{elements}</div>;
    });
  }

  // Don't render if user not logged in
  if (!isAuthenticated) return null;

  const gradientStyle = `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`;

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999, fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif" }}>

      {/* Floating Toggle Button */}
      {!isOpen && (
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setIsOpen(true)}
            title="Open AI Assistant"
            style={{
              width: '62px', height: '62px', borderRadius: '50%',
              background: gradientStyle, color: 'white', border: 'none',
              boxShadow: `0 8px 32px ${colors.primary}55`,
              cursor: 'pointer', fontSize: '1.8rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.25s ease',
              animation: 'aiPulse 3s infinite'
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.boxShadow = `0 12px 40px ${colors.primary}77`; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = `0 8px 32px ${colors.primary}55`; }}
          >
            🤖
          </button>
          {/* Role badge */}
          <div style={{
            position: 'absolute', top: '-4px', right: '-4px',
            background: colors.primary, color: 'white',
            borderRadius: '99px', fontSize: '0.6rem', fontWeight: '700',
            padding: '2px 6px', textTransform: 'uppercase', letterSpacing: '0.5px',
            border: '2px solid white', whiteSpace: 'nowrap'
          }}>
            AI
          </div>
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div style={{
          width: '400px', height: '580px',
          background: '#f8fafc',
          borderRadius: '20px',
          boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
          border: '1px solid #e2e8f0',
          animation: 'slideUp 0.25s ease'
        }}>

          {/* Header */}
          <div style={{
            background: gradientStyle, color: 'white',
            padding: '14px 16px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            flexShrink: 0
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '38px', height: '38px', borderRadius: '50%',
                background: 'rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.3rem'
              }}>
                {roleIcon}
              </div>
              <div>
                <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>AI Health Copilot</div>
                <div style={{ fontSize: '0.72rem', opacity: 0.85 }}>
                  <span style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '99px', padding: '1px 7px', textTransform: 'capitalize' }}>
                    {role} assistant
                  </span>
                  <span style={{ marginLeft: '6px', opacity: 0.7 }}>• {user?.name || 'User'}</span>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {/* Clear button */}
              <button
                onClick={clearConversation}
                title="Clear conversation"
                style={{
                  background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white',
                  borderRadius: '8px', width: '30px', height: '30px',
                  cursor: 'pointer', fontSize: '0.85rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
              >🗑️</button>
              {/* Close button */}
              <button
                onClick={() => setIsOpen(false)}
                title="Close"
                style={{
                  background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white',
                  borderRadius: '8px', width: '30px', height: '30px',
                  cursor: 'pointer', fontSize: '1rem', fontWeight: '700',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
              >✕</button>
            </div>
          </div>

          {/* Suggested Questions */}
          {showSuggestions && suggestions.length > 0 && messages.length <= 1 && (
            <div style={{
              padding: '10px 12px 6px',
              background: '#fff',
              borderBottom: '1px solid #f1f5f9',
              flexShrink: 0
            }}>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '6px', fontWeight: '600', letterSpacing: '0.5px' }}>
                💡 SUGGESTED QUESTIONS
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', maxHeight: '80px', overflow: 'hidden' }}>
                {suggestions.slice(0, 6).map((q, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(q)}
                    style={{
                      background: colors.light, color: colors.text,
                      border: `1px solid ${colors.primary}30`,
                      borderRadius: '99px', padding: '3px 10px',
                      fontSize: '0.72rem', cursor: 'pointer',
                      whiteSpace: 'nowrap', transition: 'all 0.15s',
                      fontWeight: '500'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = colors.primary; e.currentTarget.style.color = 'white'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = colors.light; e.currentTarget.style.color = colors.text; }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Message Area */}
          <div style={{
            flex: 1, overflowY: 'auto', padding: '14px 12px',
            display: 'flex', flexDirection: 'column', gap: '10px',
            background: '#f8fafc'
          }}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '90%'
                }}
              >
                {msg.sender === 'bot' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <div style={{
                      width: '22px', height: '22px', borderRadius: '50%',
                      background: gradientStyle,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.75rem', flexShrink: 0
                    }}>🤖</div>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>AI Copilot • {msg.timestamp}</span>
                  </div>
                )}
                <div style={{
                  padding: msg.type === 'error' ? '8px 12px' : '10px 14px',
                  borderRadius: msg.sender === 'user' ? '16px 16px 4px 16px' : '4px 16px 16px 16px',
                  boxShadow: msg.sender === 'user'
                    ? `0 2px 8px ${colors.primary}40`
                    : '0 1px 4px rgba(0,0,0,0.08)',
                  fontSize: '0.85rem',
                  lineHeight: '1.5',
                  border: msg.type === 'error' ? '1px solid #fecaca' : 'none',
                  background: msg.type === 'error'
                    ? '#fef2f2'
                    : msg.sender === 'user' ? gradientStyle : '#ffffff',
                  color: msg.type === 'error' ? '#991b1b' : msg.sender === 'user' ? 'white' : '#1e293b'
                }}>
                  {renderMessageContent(msg)}
                </div>
                {msg.sender === 'user' && (
                  <div style={{ textAlign: 'right', marginTop: '2px' }}>
                    <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>{msg.timestamp}</span>
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {isLoading && (
              <div style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '22px', height: '22px', borderRadius: '50%',
                  background: gradientStyle,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.75rem'
                }}>🤖</div>
                <div style={{
                  background: '#fff', borderRadius: '4px 16px 16px 16px',
                  padding: '10px 14px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                  display: 'flex', gap: '4px', alignItems: 'center'
                }}>
                  {[0, 0.2, 0.4].map((delay, i) => (
                    <div key={i} style={{
                      width: '6px', height: '6px', borderRadius: '50%',
                      background: colors.primary,
                      animation: `typingDot 1s ease-in-out infinite`,
                      animationDelay: `${delay}s`
                    }} />
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form
            onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
            style={{
              padding: '10px 12px',
              background: '#ffffff',
              borderTop: '1px solid #e2e8f0',
              display: 'flex', gap: '8px', alignItems: 'center',
              flexShrink: 0
            }}
          >
            {/* Voice button */}
            <button
              type="button"
              onClick={handleVoiceListen}
              title={isListening ? 'Listening...' : 'Voice input'}
              style={{
                background: isListening ? '#ef4444' : '#f1f5f9',
                color: isListening ? 'white' : '#475569',
                border: 'none', width: '38px', height: '38px',
                borderRadius: '50%', cursor: 'pointer',
                fontSize: '1rem', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                animation: isListening ? 'aiPulse 1s infinite' : 'none',
                transition: 'all 0.2s'
              }}
            >
              🎙️
            </button>

            {/* Text input */}
            <input
              ref={inputRef}
              type="text"
              placeholder={isListening ? 'Listening...' : `Ask your ${role} AI assistant...`}
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={isLoading}
              maxLength={1000}
              style={{
                flex: 1, padding: '9px 14px',
                borderRadius: '99px',
                border: `1.5px solid ${input ? colors.primary + '60' : '#e2e8f0'}`,
                fontSize: '0.85rem', outline: 'none',
                background: '#f8fafc', color: '#1e293b',
                transition: 'border-color 0.2s'
              }}
              onFocus={e => e.target.style.borderColor = colors.primary}
              onBlur={e => e.target.style.borderColor = input ? colors.primary + '60' : '#e2e8f0'}
            />

            {/* Send button */}
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              style={{
                background: (isLoading || !input.trim()) ? '#e2e8f0' : gradientStyle,
                color: (isLoading || !input.trim()) ? '#94a3b8' : 'white',
                border: 'none', borderRadius: '50%',
                width: '38px', height: '38px', flexShrink: 0,
                cursor: (isLoading || !input.trim()) ? 'not-allowed' : 'pointer',
                fontSize: '1rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s',
                boxShadow: (isLoading || !input.trim()) ? 'none' : `0 2px 8px ${colors.primary}40`
              }}
            >
              ➤
            </button>
          </form>

          {/* Footer */}
          <div style={{
            textAlign: 'center', padding: '5px',
            fontSize: '0.65rem', color: '#cbd5e1',
            background: '#fff', borderTop: '1px solid #f1f5f9',
            flexShrink: 0
          }}>
            🔒 Secured • Role-verified • Data stays private
          </div>
        </div>
      )}

      {/* Animations */}
      <style>{`
        @keyframes aiPulse {
          0%, 100% { box-shadow: 0 8px 32px ${colors.primary}55; }
          50% { box-shadow: 0 8px 48px ${colors.primary}99, 0 0 0 8px ${colors.primary}15; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes typingDot {
          0%, 100% { transform: translateY(0); opacity: 0.4; }
          50% { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default AIAssistantWidget;
