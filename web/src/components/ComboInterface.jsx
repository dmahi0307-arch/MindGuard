// web/src/components/ComboInterface.jsx
import React, { useRef, useState, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  HeartPulse,
  ShieldCheck,
  Radio,
  Sparkles,
  Smile,
  Wind,
} from 'lucide-react';
import { speechService } from '../services/speech';
import { apiClient } from '../services/api';
import { faceAnalyzer } from '../services/faceEmotionDetector';
import { aiReasoningEngine } from '../services/aiReasoning';
import { ambianceEngine } from '../services/audioAmbiance';

export default function ComboInterface({
  isMicOn,
  onToggleMic,
  isCamOn,
  onToggleCam,
  showTranscript: _showTranscript,
  onMoodLogged,
  onOpenMeditation,
  userId = 'user_demo_01',
}) {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);

  // Assistant states
  const [orbState, setOrbState] = useState('idle'); // 'idle' | 'listening' | 'thinking' | 'speaking'
  const [transcript, setTranscript] = useState('');
  const [lastAIResponse, setLastAIResponse] = useState(
    "Hello! I am actively tracking your facial expressions and listening to your voice. How are you genuinely feeling in this moment?"
  );
  const [somaticAdvice, setSomaticAdvice] = useState('');

  // Real-time Bio-telemetry from Computer Vision Face Analyzer
  const [telemetry, setTelemetry] = useState({
    emotion: 'calm',
    confidence: 0.94,
    tension: 18,
    fatigue: 22,
    valence: 85,
  });

  // 1. Camera Lifecycle & Real-time Vision Frame Analyzer
  useEffect(() => {
    let frameId = null;

    const analyzeLoop = () => {
      if (videoRef.current && isCamOn) {
        const result = faceAnalyzer.analyzeVideoFrame(videoRef.current);
        if (result) {
          setTelemetry((prev) => ({
            ...prev,
            emotion: result.emotion,
            tension: result.tension,
            fatigue: result.fatigue,
            valence: result.valence,
            confidence: result.confidence,
          }));
        }
      }
      frameId = requestAnimationFrame(analyzeLoop);
    };

    if (isCamOn) {
      startCamera().then(() => {
        frameId = requestAnimationFrame(analyzeLoop);
      });
    } else {
      stopCamera();
    }

    return () => {
      if (frameId) cancelAnimationFrame(frameId);
      stopCamera();
    };
  }, [isCamOn]);

  // 2. Voice Recognition Lifecycle
  useEffect(() => {
    if (isMicOn) {
      startVoiceSession();
    } else {
      speechService.stopListening();
      speechService.stopSpeaking();
      setOrbState('idle');
    }
    return () => {
      speechService.stopListening();
      speechService.stopSpeaking();
    };
  }, [isMicOn]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.warn('Camera stream error:', err);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const startVoiceSession = () => {
    setOrbState('listening');
    speechService.startListening(
      async (result) => {
        setTranscript(result.text);

        // When user pauses speaking
        if (result.final && result.final.trim().length > 2) {
          handleMultimodalInput(result.final);
        }
      },
      (err) => {
        console.warn('Speech error:', err);
        setOrbState('idle');
      },
      (isListening) => {
        if (!isListening && orbState === 'listening') {
          setOrbState('idle');
        }
      }
    );
  };

  const handleMultimodalInput = async (spokenText) => {
    setOrbState('thinking');
    speechService.stopListening();

    try {
      // 1. Synthesize all 3 modalities: Spoken Text + Live Face Analysis + Vocal tone
      const aiResult = await aiReasoningEngine.synthesizeAndRespond(
        spokenText,
        telemetry,
        telemetry.emotion
      );

      // 2. Log to backend API
      const logPayload = {
        userId,
        emotion: aiResult.fusedEmotion,
        sourceMode: 'combo',
        timestamp: new Date().toISOString(),
        details: { confidence: aiResult.confidence, tension: telemetry.tension, spokenText },
      };
      if (onMoodLogged) onMoodLogged(logPayload);
      apiClient.sendTextInteraction(userId, spokenText);

      // 3. Update UI states with deep empathetic reply
      setLastAIResponse(aiResult.response);
      setSomaticAdvice(aiResult.somaticAdvice);

      // 4. If high stress or burnout is detected, auto-trigger restorative rain/music
      if (aiResult.fusedEmotion === 'stressed' || telemetry.tension > 60) {
        ambianceEngine.triggerBurnoutIntervention();
      }

      // 5. Speak reply with warm voice
      setOrbState('speaking');
      speechService.speak(aiResult.response, () => {
        if (isMicOn) {
          setOrbState('listening');
          startVoiceSession();
        } else {
          setOrbState('idle');
        }
      });
    } catch (err) {
      console.error('Multimodal processing error:', err);
      setOrbState('idle');
    }
  };

  const handlePromptClick = (text) => {
    setTranscript(text);
    handleMultimodalInput(text);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      width: '100%',
      maxWidth: '960px',
      margin: '0 auto',
    }}>
      {/* Unified Single-Frame Multimodal Viewport */}
      <div className="glass-panel" style={{
        position: 'relative',
        width: '100%',
        height: '540px',
        borderRadius: '28px',
        overflow: 'hidden',
        background: '#070B14',
        border: '1px solid var(--border-glass-bright)',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
      }}>
        {/* Background Camera Feed (or serene gradient fallback) */}
        {isCamOn ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: 'scaleX(-1)', // Mirror
              opacity: 0.92,
            }}
          />
        ) : (
          <div style={{
            width: '100%',
            height: '100%',
            background: 'radial-gradient(circle at center, #111C2E 0%, #070B14 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <div style={{ textAlign: 'center', opacity: 0.6 }}>
              <VideoOff size={42} color="var(--text-muted)" style={{ margin: '0 auto 10px auto' }} />
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Camera disabled • Running Voice + Live Transcript mode
              </p>
            </div>
          </div>
        )}

        {/* Soft Vignette Overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(7,11,20,0.55) 0%, rgba(7,11,20,0.05) 40%, rgba(7,11,20,0.88) 100%)',
          pointerEvents: 'none',
        }} />

        {/* Top HUD: Real-time Multimodal Emotion Telemetry */}
        <div style={{
          position: 'absolute',
          top: '18px',
          left: '20px',
          right: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 10,
        }}>
          {/* Live Emotion Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className={`badge-emotion ${telemetry.emotion}`} style={{ backdropFilter: 'blur(12px)', padding: '6px 14px' }}>
              <HeartPulse size={14} />
              <span>
                Synced State: {telemetry.emotion.toUpperCase()} ({Math.round(telemetry.confidence * 100)}%)
              </span>
            </div>

            {isCamOn && (
              <div style={{
                fontSize: '0.75rem',
                color: telemetry.tension > 50 ? 'var(--pastel-peach)' : 'var(--sage-green)',
                background: 'rgba(7, 11, 20, 0.6)',
                backdropFilter: 'blur(10px)',
                padding: '4px 12px',
                borderRadius: '999px',
                border: `1px solid ${telemetry.tension > 50 ? 'var(--pastel-peach)' : 'rgba(168, 198, 165, 0.3)'}`,
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
              }}>
                <Smile size={12} />
                <span>Facial Tension: {Math.round(telemetry.tension)}%</span>
              </div>
            )}
          </div>

          {/* Stream & Privacy Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(7, 11, 20, 0.6)',
              backdropFilter: 'blur(10px)',
              padding: '4px 12px',
              borderRadius: '999px',
              fontSize: '0.75rem',
              color: isMicOn ? 'var(--calm-blue-light)' : 'var(--text-muted)',
              border: '1px solid var(--border-glass)',
            }}>
              <Radio size={12} color={isMicOn ? 'var(--calm-blue)' : 'var(--text-muted)'} />
              <span>{isMicOn ? 'Mic Active' : 'Mic Paused'}</span>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              background: 'rgba(7, 11, 20, 0.6)',
              backdropFilter: 'blur(10px)',
              padding: '4px 10px',
              borderRadius: '999px',
              fontSize: '0.74rem',
              color: 'var(--sage-green)',
              border: '1px solid rgba(168, 198, 165, 0.25)',
            }}>
              <ShieldCheck size={13} />
              <span>Private</span>
            </div>
          </div>
        </div>

        {/* Floating Companion Voice Orb in Top-Right */}
        <div style={{
          position: 'absolute',
          top: '70px',
          right: '24px',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          cursor: 'pointer',
        }} onClick={onToggleMic}>
          <div style={{
            position: 'relative',
            width: '90px',
            height: '90px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <div className="orb-ring" style={{ width: '100px', height: '100px', opacity: orbState === 'listening' ? 0.8 : 0.2 }} />
            <div
              className={`orb-core ${orbState}`}
              style={{
                width: '60px',
                height: '60px',
              }}
            />
          </div>
          <span style={{
            fontSize: '0.72rem',
            color: orbState === 'listening' ? 'var(--pastel-peach)' : 'var(--calm-blue-light)',
            fontWeight: '600',
            marginTop: '4px',
            background: 'rgba(7, 11, 20, 0.7)',
            padding: '2px 8px',
            borderRadius: '999px',
            backdropFilter: 'blur(8px)',
          }}>
            {orbState === 'listening' && 'Listening...'}
            {orbState === 'thinking' && 'Reflecting...'}
            {orbState === 'speaking' && 'Speaking...'}
            {orbState === 'idle' && (isMicOn ? 'Ready' : 'Tap to Speak')}
          </span>
        </div>

        {/* Bottom Dialogue Ribbon: Simultaneous Live Subtitles & MindGuard Reply */}
        <div style={{
          position: 'absolute',
          bottom: '18px',
          left: '20px',
          right: '20px',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}>
          {/* Live User Speech Transcription */}
          {transcript && (
            <div style={{
              background: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(110, 193, 228, 0.3)',
              borderRadius: '16px',
              padding: '10px 18px',
              fontSize: '0.88rem',
              color: 'var(--calm-blue-light)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
            }}>
              <Mic size={14} color="var(--calm-blue)" />
              <span style={{ fontStyle: 'italic' }}>"{transcript}"</span>
            </div>
          )}

          {/* AI Empathetic Response Subtitle */}
          <div style={{
            background: 'rgba(7, 11, 20, 0.9)',
            backdropFilter: 'blur(20px)',
            border: '1px solid var(--border-glass-bright)',
            borderRadius: '18px',
            padding: '16px 22px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
          }}>
            <p style={{
              fontSize: '0.96rem',
              lineHeight: '1.55',
              color: 'var(--text-primary)',
              fontWeight: '400',
            }}>
              "{lastAIResponse}"
            </p>

            {/* Somatic Advice Tag */}
            {somaticAdvice && (
              <div style={{
                marginTop: '8px',
                fontSize: '0.78rem',
                color: 'var(--sage-green)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}>
                <Wind size={13} />
                <span>{somaticAdvice}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* In-Frame Action Controls & Quick Prompts */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: '16px',
        gap: '12px',
        flexWrap: 'wrap',
      }}>
        {/* Hardware & Meditation Controls */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={onToggleMic}
            className={`btn-ghost ${isMicOn ? 'active' : ''}`}
            style={{
              background: isMicOn ? 'rgba(110, 193, 228, 0.2)' : 'rgba(255, 255, 255, 0.05)',
              borderColor: isMicOn ? 'var(--calm-blue)' : 'var(--border-glass)',
              color: isMicOn ? 'var(--calm-blue-light)' : 'var(--text-secondary)',
            }}
          >
            {isMicOn ? <MicOff size={15} /> : <Mic size={15} />}
            <span>{isMicOn ? 'Pause Mic' : 'Start Mic'}</span>
          </button>

          <button
            onClick={onToggleCam}
            className={`btn-ghost ${isCamOn ? 'active' : ''}`}
            style={{
              background: isCamOn ? 'rgba(168, 198, 165, 0.2)' : 'rgba(255, 255, 255, 0.05)',
              borderColor: isCamOn ? 'var(--sage-green)' : 'var(--border-glass)',
              color: isCamOn ? 'var(--sage-green-light)' : 'var(--text-secondary)',
            }}
          >
            {isCamOn ? <VideoOff size={15} /> : <Video size={15} />}
            <span>{isCamOn ? 'Turn Camera Off' : 'Turn Camera On'}</span>
          </button>

          {/* Sadhguru Miracle Meditation Modal Trigger */}
          <button
            onClick={onOpenMeditation}
            className="btn-ghost"
            style={{
              background: 'rgba(168, 198, 165, 0.15)',
              borderColor: 'var(--sage-green)',
              color: 'var(--sage-green-light)',
            }}
          >
            <Sparkles size={14} color="var(--sage-green)" />
            <span>Sadhguru Miracle Meditation</span>
          </button>
        </div>

        {/* Quick Calming Prompt Pills */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            'My boss is pushing unrealistic deadlines',
            'I am exhausted and need a 2-minute reset',
            'Play Sadhguru 136.1Hz Om meditation',
            'Help me process my stress and unclench my jaw',
          ].map((prompt, i) => (
            <button
              key={i}
              onClick={() => handlePromptClick(prompt)}
              className="btn-ghost"
              style={{ fontSize: '0.76rem', padding: '5px 12px' }}
            >
              <Sparkles size={11} color="var(--calm-blue)" />
              {prompt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
