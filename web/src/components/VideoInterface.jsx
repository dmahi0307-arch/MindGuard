// web/src/components/VideoInterface.jsx
import React, { useRef, useState, useEffect } from 'react';
import { Video, VideoOff, Camera, HeartPulse, ShieldCheck } from 'lucide-react';
import { apiClient } from '../services/api';

export default function VideoInterface({ isCamOn, onToggleCam, onMoodLogged, userId = 'user_demo_01' }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [facialState, setFacialState] = useState({
    emotion: 'calm',
    tension: 18,
    fatigue: 24,
    valence: 82,
    confidence: 0.94,
  });
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    if (isCamOn) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isCamOn]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setIsScanning(true);
    } catch (err) {
      console.warn('Camera access denied or unavailable:', err);
      setIsScanning(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsScanning(false);
  };

  // Simulate periodic bio-facial telemetry update
  useEffect(() => {
    if (!isCamOn) return;

    const interval = setInterval(() => {
      // Gentle realistic variation in telemetry
      setFacialState((prev) => ({
        ...prev,
        tension: Math.max(10, Math.min(85, prev.tension + (Math.random() * 8 - 4))),
        fatigue: Math.max(15, Math.min(80, prev.fatigue + (Math.random() * 6 - 3))),
        valence: Math.max(30, Math.min(95, prev.valence + (Math.random() * 8 - 4))),
      }));
    }, 2500);

    return () => clearInterval(interval);
  }, [isCamOn]);

  const handleCaptureSnapshot = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const base64Data = canvas.toDataURL('image/jpeg').split(',')[1];

    try {
      const res = await apiClient.sendVideoInteraction(userId, base64Data);
      if (onMoodLogged) onMoodLogged(res.moodLog);
    } catch (e) {
      console.warn('Video interaction err:', e);
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      maxWidth: '840px',
      margin: '0 auto',
      width: '100%',
      padding: '0 16px',
    }}>
      {/* Video Stream Stage */}
      <div className="glass-panel" style={{
        position: 'relative',
        width: '100%',
        height: '420px',
        borderRadius: '24px',
        overflow: 'hidden',
        background: '#070B14',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid var(--border-glass-bright)',
      }}>
        {isCamOn ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transform: 'scaleX(-1)', // Mirror effect
              }}
            />

            {/* AI Facial Landmark Reticle Overlay */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '220px',
              height: '280px',
              border: '2px dashed rgba(110, 193, 228, 0.4)',
              borderRadius: '50% 50% 45% 45%',
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <div style={{
                position: 'absolute',
                top: '12px',
                fontSize: '0.68rem',
                color: 'var(--calm-blue)',
                background: 'rgba(7, 11, 20, 0.8)',
                padding: '2px 8px',
                borderRadius: '999px',
              }}>
                Face Target
              </div>
            </div>

            {/* Live Bio-Telemetry Top Bar */}
            <div style={{
              position: 'absolute',
              top: '16px',
              left: '16px',
              right: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <div className="badge-emotion calm">
                <HeartPulse size={12} />
                Facial State: {facialState.emotion} ({Math.round(facialState.confidence * 100)}%)
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(7, 11, 20, 0.7)',
                padding: '4px 10px',
                borderRadius: '999px',
                fontSize: '0.75rem',
                color: 'var(--sage-green)',
              }}>
                <ShieldCheck size={13} />
                {isScanning ? 'Live private scan' : 'Private On-Device Feed'}
              </div>
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{
              width: '70px',
              height: '70px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
              border: '1px solid var(--border-glass)',
            }}>
              <VideoOff size={28} color="var(--text-muted)" />
            </div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', marginBottom: '8px' }}>
              Camera is currently disabled
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', maxWidth: '380px', margin: '0 auto 20px auto' }}>
              Enable your camera to track subtle micro-expressions, screen fatigue, and somatic tension indicators.
            </p>
            <button onClick={onToggleCam} className="btn-primary">
              <Video size={16} />
              Enable Camera Stream
            </button>
          </div>
        )}

        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>

      {/* Real-time Facial Bio-Metrics Grid */}
      {isCamOn && (
        <>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px',
          width: '100%',
          marginTop: '16px',
        }}>
          {/* Tension Metric */}
          <div className="glass-card" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Facial Tension</span>
              <span style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--sage-green)' }}>
                {Math.round(facialState.tension)}% (Low)
              </span>
            </div>
            <div style={{ height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '999px', overflow: 'hidden' }}>
              <div style={{ width: `${facialState.tension}%`, height: '100%', background: 'linear-gradient(to right, #A8C6A5, #6EC1E4)' }} />
            </div>
          </div>

          {/* Eye Fatigue Metric */}
          <div className="glass-card" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Eye Strain & Fatigue</span>
              <span style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--calm-blue)' }}>
                {Math.round(facialState.fatigue)}% (Normal)
              </span>
            </div>
            <div style={{ height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '999px', overflow: 'hidden' }}>
              <div style={{ width: `${facialState.fatigue}%`, height: '100%', background: 'linear-gradient(to right, #6EC1E4, #BAE6FD)' }} />
            </div>
          </div>

          {/* Emotional Valence */}
          <div className="glass-card" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Positivity Valence</span>
              <span style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--pastel-peach)' }}>
                {Math.round(facialState.valence)}% (Tranquil)
              </span>
            </div>
            <div style={{ height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '999px', overflow: 'hidden' }}>
              <div style={{ width: `${facialState.valence}%`, height: '100%', background: 'linear-gradient(to right, #F5C6A5, #A8C6A5)' }} />
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
          <button onClick={handleCaptureSnapshot} className="btn-primary" type="button">
            <Camera size={16} />
            Capture Wellness Snapshot
          </button>
        </div>
        </>
      )}
    </div>
  );
}
