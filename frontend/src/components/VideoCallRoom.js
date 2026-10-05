import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

const VideoCallRoom = ({ roomId, userRole, userName, onClose }) => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callStatus, setCallStatus] = useState('Connecting to secure signaling server...');
  const [chatMessages, setChatMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const socketRef = useRef(null);

  const iceServers = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };

  useEffect(() => {
    // 1. Connect to socket
    const socket = io('http://localhost:5000');
    socketRef.current = socket;

    // 2. Get User Media
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        // Setup PeerConnection
        const pc = new RTCPeerConnection(iceServers);
        peerConnectionRef.current = pc;

        // Add local tracks
        stream.getTracks().forEach(track => pc.addTrack(track, stream));

        // Listen for remote tracks
        pc.ontrack = (event) => {
          if (event.streams && event.streams[0]) {
            setRemoteStream(event.streams[0]);
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = event.streams[0];
            }
            setCallStatus('Connected (In Consultation)');
          }
        };

        // ICE candidate handling
        pc.onicecandidate = (event) => {
          if (event.candidate) {
            socket.emit('ice-candidate', { roomId, candidate: event.candidate });
          }
        };

        // Join room
        socket.emit('join-room', { roomId, userName: userName || userRole, role: userRole });
        setCallStatus('Room joined. Waiting for peer...');

        // Handle peer joining -> Doctor/Initiator creates offer
        socket.on('user-joined', async () => {
          setCallStatus('Peer joined. Negotiating WebRTC peer connection...');
          try {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            socket.emit('offer', { roomId, sdp: offer });
          } catch (err) {
            console.error('Error creating offer:', err);
          }
        });

        // Handle receiving Offer
        socket.on('offer', async ({ sdp }) => {
          try {
            await pc.setRemoteDescription(new RTCSessionDescription(sdp));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            socket.emit('answer', { roomId, sdp: answer });
            setCallStatus('Connected (In Consultation)');
          } catch (err) {
            console.error('Error answering offer:', err);
          }
        });

        // Handle receiving Answer
        socket.on('answer', async ({ sdp }) => {
          try {
            await pc.setRemoteDescription(new RTCSessionDescription(sdp));
            setCallStatus('Connected (In Consultation)');
          } catch (err) {
            console.error('Error setting remote answer:', err);
          }
        });

        // Handle ICE Candidate
        socket.on('ice-candidate', async ({ candidate }) => {
          try {
            if (pc.remoteDescription) {
              await pc.addIceCandidate(new RTCIceCandidate(candidate));
            }
          } catch (err) {
            console.error('Error adding ICE candidate:', err);
          }
        });

        // Handle Call ended by peer
        socket.on('call-ended', () => {
          setCallStatus('Call ended by peer.');
          setTimeout(() => {
            handleEndCall();
          }, 2000);
        });
      })
      .catch((err) => {
        console.error('Media device error:', err);
        setCallStatus('Could not access camera/microphone. Check permissions.');
      });

    return () => {
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  const cleanup = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
  };

  const handleEndCall = () => {
    if (socketRef.current) {
      socketRef.current.emit('end-call', { roomId });
    }
    cleanup();
    if (onClose) onClose();
  };

  const toggleAudio = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsAudioMuted(!isAudioMuted);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageInput.trim()) return;
    const msg = {
      sender: userName || userRole,
      text: messageInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setChatMessages(prev => [...prev, msg]);
    setMessageInput('');
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: '#0f172a',
      zIndex: 99999,
      display: 'flex',
      flexDirection: 'column',
      color: 'white',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      {/* Top Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem 2rem',
        backgroundColor: 'rgba(30, 41, 59, 0.8)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '1.5rem' }}>📹</span>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700' }}>WebRTC HD Consultation</h3>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Room ID: {roomId} • Status: <strong style={{ color: '#10b981' }}>{callStatus}</strong></span>
          </div>
        </div>
        <button
          onClick={handleEndCall}
          style={{
            background: '#ef4444',
            color: 'white',
            border: 'none',
            padding: '0.6rem 1.2rem',
            borderRadius: '8px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          Exit Room
        </button>
      </div>

      {/* Main Content Area */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', padding: '1rem', gap: '1rem' }}>
        {/* Videos Container */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative' }}>
          {/* Main Remote View */}
          <div style={{
            flex: 1,
            backgroundColor: '#1e293b',
            borderRadius: '16px',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            border: '1px solid rgba(255,255,255,0.05)'
          }}>
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            {!remoteStream && (
              <div style={{ position: 'absolute', textAlign: 'center', color: '#94a3b8' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>👨‍⚕️</div>
                <h3>Waiting for doctor/patient to connect video...</h3>
                <p style={{ fontSize: '0.9rem' }}>Signal exchange is active on Socket.IO</p>
              </div>
            )}
          </div>

          {/* Self Preview (Floating Picture-in-Picture) */}
          <div style={{
            position: 'absolute',
            bottom: '24px',
            right: '24px',
            width: '240px',
            height: '160px',
            backgroundColor: '#000',
            borderRadius: '12px',
            overflow: 'hidden',
            border: '2px solid #3b82f6',
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
          }}>
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div style={{
              position: 'absolute',
              bottom: '6px',
              left: '8px',
              fontSize: '0.75rem',
              backgroundColor: 'rgba(0,0,0,0.6)',
              padding: '2px 6px',
              borderRadius: '4px'
            }}>
              You ({userRole}) {isVideoOff && ' (Video Off)'}
            </div>
          </div>
        </div>

        {/* In-Call Consultation Notes & Chat Sidebar */}
        <div style={{
          width: '320px',
          backgroundColor: '#1e293b',
          borderRadius: '16px',
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid rgba(255,255,255,0.05)'
        }}>
          <div style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <h4 style={{ margin: 0, fontSize: '1rem' }}>💬 Consultation Chat</h4>
          </div>
          <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', textAlign: 'center', background: 'rgba(255,255,255,0.05)', padding: '0.5rem', borderRadius: '6px' }}>
              🔒 End-to-end encrypted WebRTC consultation channel
            </div>
            {chatMessages.map((m, idx) => (
              <div key={idx} style={{ background: '#334155', padding: '0.6rem 0.8rem', borderRadius: '8px', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '2px' }}>
                  <strong>{m.sender}</strong>
                  <span>{m.time}</span>
                </div>
                <div>{m.text}</div>
              </div>
            ))}
          </div>
          <form onSubmit={handleSendMessage} style={{ padding: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              placeholder="Type message..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              style={{
                flex: 1,
                padding: '0.5rem 0.75rem',
                borderRadius: '6px',
                border: '1px solid #475569',
                background: '#0f172a',
                color: 'white',
                fontSize: '0.85rem'
              }}
            />
            <button type="submit" style={{ padding: '0.5rem 0.75rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
              Send
            </button>
          </form>
        </div>
      </div>

      {/* Control Actions Bar */}
      <div style={{
        padding: '1rem',
        backgroundColor: 'rgba(30, 41, 59, 0.95)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '1.5rem',
        borderTop: '1px solid rgba(255,255,255,0.1)'
      }}>
        <button
          onClick={toggleAudio}
          style={{
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            backgroundColor: isAudioMuted ? '#ef4444' : '#334155',
            color: 'white',
            border: 'none',
            fontSize: '1.25rem',
            cursor: 'pointer',
            transition: '0.2s'
          }}
          title={isAudioMuted ? 'Unmute Mic' : 'Mute Mic'}
        >
          {isAudioMuted ? '🔇' : '🎙️'}
        </button>

        <button
          onClick={toggleVideo}
          style={{
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            backgroundColor: isVideoOff ? '#ef4444' : '#334155',
            color: 'white',
            border: 'none',
            fontSize: '1.25rem',
            cursor: 'pointer',
            transition: '0.2s'
          }}
          title={isVideoOff ? 'Turn Video On' : 'Turn Video Off'}
        >
          {isVideoOff ? '🚫' : '📹'}
        </button>

        <button
          onClick={handleEndCall}
          style={{
            padding: '0 2rem',
            height: '50px',
            borderRadius: '25px',
            backgroundColor: '#ef4444',
            color: 'white',
            border: 'none',
            fontSize: '1rem',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <span>🛑</span> End Consultation
        </button>
      </div>
    </div>
  );
};

export default VideoCallRoom;
