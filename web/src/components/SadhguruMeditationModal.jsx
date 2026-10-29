// web/src/components/SadhguruMeditationModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Sparkles, Play, Pause, RotateCcw, Heart } from 'lucide-react';
import { meditationEngine } from '../services/meditationEngine';

export default function SadhguruMeditationModal({ isOpen, onClose }) {
  const [activeSession, setActiveSession] = useState('sadhguru'); // 'sadhguru' | 'limitless' | 'somatic'
  const [isPlaying, setIsPlaying] = useState(false);
  const [timer, setTimer] = useState(180); // 3 minutes = 180s
  const [breathPhase, setBreathPhase] = useState('inhale'); // 'inhale' | 'hold' | 'exhale' | 'pause'
  const [streak] = useState(3);

  const sessions = [
    {
      id: 'sadhguru',
      title: 'Sadhguru 3-Min Miracle Meditation',
      subtitle: '"I am not the body, I am not even the mind"',
      duration: 180,
      sound: 'aum',
      tag: 'Sacred 136.1Hz Om',
    },
    {
      id: 'limitless',
      title: 'Limitless Brain 6Hz Theta Entrainment',
      subtitle: 'Subconscious stress dissolution & cognitive clarity',
      duration: 120,
      sound: 'theta',
      tag: 'Binaural Theta + 528Hz',
    },
    {
      id: 'somatic',
      title: 'Isha Temple Serenity Bowl',
      subtitle: 'Somatic grounding & harmonic resonance',
      duration: 180,
      sound: 'temple',
      tag: '432Hz Sound Bath',
    },
  ];

  const currentObj = sessions.find((s) => s.id === activeSession) || sessions[0];

  useEffect(() => {
    let interval = null;
    let breathInterval = null;

    if (isPlaying && timer > 0) {
      // Countdown
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);

      // 12-second breath cycle: 4s Inhale, 2s Hold, 4s Exhale, 2s Pause
      breathInterval = setInterval(() => {
        setBreathPhase((prev) => {
          if (prev === 'inhale') return 'hold';
          if (prev === 'hold') return 'exhale';
          if (prev === 'exhale') return 'pause';
          return 'inhale';
        });
      }, 3000);
    } else if (timer === 0) {
      setIsPlaying(false);
      meditationEngine.stop();
    }

    return () => {
      clearInterval(interval);
      clearInterval(breathInterval);
    };
  }, [isPlaying, timer]);

  const handleStart = () => {
    if (isPlaying) {
      setIsPlaying(false);
      meditationEngine.stop();
    } else {
      setIsPlaying(true);
      meditationEngine.playTrack(currentObj.sound);
    }
  };

  const handleSelectSession = (sId) => {
    meditationEngine.stop();
    setIsPlaying(false);
    setActiveSession(sId);
    const selected = sessions.find((s) => s.id === sId);
    setTimer(selected ? selected.duration : 180);
    setBreathPhase('inhale');
  };

  const handleReset = () => {
    meditationEngine.stop();
    setIsPlaying(false);
    setTimer(currentObj.duration);
    setBreathPhase('inhale');
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(7, 11, 20, 0.88)',
      backdropFilter: 'blur(24px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '20px',
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '820px',
        maxHeight: '92vh',
        overflowY: 'auto',
        padding: '30px',
        background: 'rgba(14, 22, 38, 0.96)',
        border: '1px solid rgba(168, 198, 165, 0.3)',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6)',
        borderRadius: '28px',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #A8C6A5 0%, #6EC1E4 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(168, 198, 165, 0.4)',
            }}>
              <Sparkles size={22} color="#070B14" />
            </div>
            <div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.35rem', fontWeight: '700' }}>
                Miracle of Mind & Limitless Resonance
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Guided Awareness & Neuro-Acoustic Frequency Entrainment
              </p>
            </div>
          </div>

          <button onClick={() => { meditationEngine.stop(); onClose(); }} className="btn-icon">
            <X size={18} />
          </button>
        </div>

        {/* Daily Resilience Streak Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(168, 198, 165, 0.12)',
          border: '1px solid rgba(168, 198, 165, 0.25)',
          padding: '12px 20px',
          borderRadius: '16px',
          marginBottom: '20px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Heart size={18} color="var(--sage-green)" />
            <span style={{ fontSize: '0.88rem', fontWeight: '600', color: 'var(--sage-green-light)' }}>
              Day {streak} Mindful Resilience Streak
            </span>
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Daily practice rewires neuro-plastic calm
          </span>
        </div>

        {/* Session Selection Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '24px' }}>
          {sessions.map((s) => {
            const isSelected = activeSession === s.id;
            return (
              <div
                key={s.id}
                onClick={() => handleSelectSession(s.id)}
                className="glass-card"
                style={{
                  padding: '16px',
                  cursor: 'pointer',
                  background: isSelected ? 'rgba(168, 198, 165, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                  borderColor: isSelected ? 'var(--sage-green)' : 'var(--border-glass)',
                  transform: isSelected ? 'scale(1.02)' : 'none',
                }}
              >
                <span style={{
                  fontSize: '0.68rem',
                  padding: '2px 8px',
                  borderRadius: '999px',
                  background: isSelected ? 'rgba(168, 198, 165, 0.3)' : 'rgba(255, 255, 255, 0.06)',
                  color: isSelected ? 'var(--sage-green-light)' : 'var(--text-muted)',
                  fontWeight: '600',
                }}>
                  {s.tag}
                </span>
                <h4 style={{ fontSize: '0.92rem', fontWeight: '600', marginTop: '8px', color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                  {s.title}
                </h4>
                <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  {s.subtitle}
                </p>
              </div>
            );
          })}
        </div>

        {/* Interactive Breathing Mandala Stage */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '30px 20px',
          background: 'radial-gradient(circle at center, rgba(168, 198, 165, 0.1) 0%, rgba(7, 11, 20, 0.6) 80%)',
          borderRadius: '24px',
          border: '1px solid var(--border-glass)',
          marginBottom: '24px',
          position: 'relative',
        }}>
          {/* Animated Pulsating Sacred Circle */}
          <div style={{
            width: '160px',
            height: '160px',
            borderRadius: '50%',
            background: 'radial-gradient(circle at 35% 35%, #DCFCE7 0%, #A8C6A5 50%, #0284C7 100%)',
            boxShadow: isPlaying ? '0 0 60px rgba(168, 198, 165, 0.6), inset 0 0 20px rgba(255, 255, 255, 0.6)' : '0 0 30px rgba(168, 198, 165, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 3s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: isPlaying
              ? breathPhase === 'inhale' ? 'scale(1.3)'
                : breathPhase === 'hold' ? 'scale(1.3)'
                : breathPhase === 'exhale' ? 'scale(0.85)'
                : 'scale(0.85)'
              : 'scale(1)',
          }}>
            <span style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.5rem',
              fontWeight: '700',
              color: '#070B14',
            }}>
              {formatTime(timer)}
            </span>
          </div>

          {/* Sadhguru Breath Mantras */}
          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <p style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.2rem',
              fontWeight: '600',
              color: 'var(--sage-green-light)',
              minHeight: '36px',
            }}>
              {isPlaying && breathPhase === 'inhale' && 'Inhale gently... "I am not the body"'}
              {isPlaying && breathPhase === 'hold' && 'Hold softly in stillness...'}
              {isPlaying && breathPhase === 'exhale' && 'Exhale slowly... "I am not even the mind"'}
              {isPlaying && breathPhase === 'pause' && 'Rest in boundless awareness...'}
              {!isPlaying && 'Press Play to Begin Sacred Meditation'}
            </p>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Sacred 136.1Hz Earth Year Resonance • Isha Kriya Awareness Guidance
            </p>
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
            <button
              onClick={handleStart}
              className="btn-primary"
              style={{
                padding: '12px 32px',
                fontSize: '0.96rem',
                background: isPlaying ? 'linear-gradient(135deg, #F5C6A5 0%, #F97316 100%)' : 'linear-gradient(135deg, #A8C6A5 0%, #6EC1E4 100%)',
              }}
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} />}
              <span>{isPlaying ? 'Pause Session' : 'Start Meditation'}</span>
            </button>

            <button onClick={handleReset} className="btn-ghost" style={{ padding: '12px 18px' }}>
              <RotateCcw size={16} />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
