// web/src/components/Header.jsx
import React, { useState, useEffect } from 'react';
import {
  Shield,
  Sparkles,
  Volume2,
  VolumeX,
  Activity,
  Heart,
  ChevronDown,
  CloudRain,
  Waves,
  Music,
  Trees,
  Compass,
} from 'lucide-react';
import { ambianceEngine } from '../services/audioAmbiance';

export default function Header({ onOpenDashboard, burnoutScore = 24, autoInterventionActive: _autoInterventionActive = false }) {
  const [activeTrack, setActiveTrack] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    ambianceEngine.onTrackChange = (track) => {
      setActiveTrack(track);
    };
  }, []);

  const tracks = [
    { id: 'rain', label: 'Gentle Rain', icon: CloudRain, desc: 'Soft brown noise raindrops' },
    { id: 'ocean', label: 'Ocean Waves', icon: Waves, desc: '8s rhythmic breathing swells' },
    { id: 'bowl', label: 'Tibetan Bowl 432Hz', icon: Music, desc: 'Harmonic theta resonance' },
    { id: 'forest', label: 'Forest Breeze', icon: Trees, desc: 'Canopy breeze & serene chimes' },
    { id: 'celestial', label: 'Celestial Drift', icon: Compass, desc: '528Hz deep alpha dream pad' },
  ];

  const handleSelectTrack = (trackId) => {
    if (activeTrack === trackId) {
      ambianceEngine.stop();
    } else {
      ambianceEngine.playTrack(trackId);
    }
    setIsMenuOpen(false);
  };

  const getShieldStatus = (score) => {
    if (score < 40) return { label: 'Optimal Equilibrium', color: 'var(--sage-green)', bg: 'rgba(168, 198, 165, 0.15)' };
    if (score < 70) return { label: 'Mild Stress', color: 'var(--pastel-peach)', bg: 'rgba(245, 198, 165, 0.15)' };
    return { label: 'Elevated Risk', color: '#F87171', bg: 'rgba(248, 113, 113, 0.15)' };
  };

  const status = getShieldStatus(burnoutScore);
  const currentTrackObj = tracks.find((t) => t.id === activeTrack);

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '12px',
      padding: '14px 28px',
      borderBottom: '1px solid var(--border-glass)',
      background: 'rgba(7, 11, 20, 0.8)',
      backdropFilter: 'blur(16px)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #6EC1E4 0%, #A8C6A5 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 20px rgba(110, 193, 228, 0.4)',
        }}>
          <Shield size={20} color="#070B14" />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.2rem',
              fontWeight: '700',
              background: 'linear-gradient(135deg, #FFFFFF 0%, #BAE6FD 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.02em',
            }}>
              MindGuard
            </h1>
            <span style={{
              fontSize: '0.68rem',
              padding: '2px 8px',
              borderRadius: '999px',
              background: 'rgba(110, 193, 228, 0.15)',
              color: 'var(--calm-blue)',
              border: '1px solid rgba(110, 193, 228, 0.3)',
              fontWeight: '600',
            }}>
              AI 2.0
            </span>
          </div>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Multimodal Burnout Shield
          </p>
        </div>
      </div>

      {/* Center Burnout Status Pill */}
      <div
        onClick={onOpenDashboard}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '6px 16px',
          borderRadius: '999px',
          background: status.bg,
          border: `1px solid ${status.color}40`,
          cursor: 'pointer',
          transition: 'var(--transition-smooth)',
        }}
        title="Click to view Burnout Insights"
      >
        <Heart size={14} color={status.color} />
        <span style={{ fontSize: '0.82rem', fontWeight: '600', color: status.color }}>
          {status.label} ({burnoutScore}%)
        </span>
        <Activity size={13} color="var(--text-muted)" />
      </div>

      {/* Action Controls & Soundscape Selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', position: 'relative', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
        {/* Soundscape Dropdown Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className={`btn-ghost ${activeTrack ? 'active' : ''}`}
          style={{
            background: activeTrack ? 'rgba(168, 198, 165, 0.2)' : 'rgba(255, 255, 255, 0.05)',
            borderColor: activeTrack ? 'var(--sage-green)' : 'var(--border-glass)',
            color: activeTrack ? 'var(--sage-green-light)' : 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          {activeTrack ? <Volume2 size={15} color="var(--sage-green)" /> : <VolumeX size={15} />}
          <span style={{ fontSize: '0.82rem' }}>
            {currentTrackObj ? currentTrackObj.label : 'Zen Soundscapes'}
          </span>
          <ChevronDown size={14} style={{ opacity: 0.7 }} />
        </button>

        {/* Soundscape Dropdown Menu */}
        {isMenuOpen && (
          <div className="glass-panel" style={{
            position: 'absolute',
            top: '48px',
            right: '0',
            width: '260px',
            background: 'rgba(14, 22, 38, 0.95)',
            padding: '8px',
            borderRadius: '16px',
            border: '1px solid var(--border-glass-bright)',
            boxShadow: '0 15px 35px rgba(0, 0, 0, 0.5)',
            zIndex: 60,
          }}>
            <div style={{
              fontSize: '0.74rem',
              color: 'var(--text-muted)',
              padding: '6px 10px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              Select Restorative Music
            </div>

            {tracks.map((t) => {
              const Icon = t.icon;
              const isSelected = activeTrack === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => handleSelectTrack(t.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 12px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    background: isSelected ? 'rgba(168, 198, 165, 0.15)' : 'transparent',
                    color: isSelected ? 'var(--sage-green-light)' : 'var(--text-primary)',
                    transition: 'var(--transition-smooth)',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <Icon size={16} color={isSelected ? 'var(--sage-green)' : 'var(--calm-blue)'} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.84rem', fontWeight: isSelected ? '600' : '400' }}>
                      {t.label}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      {t.desc}
                    </div>
                  </div>
                  {isSelected && (
                    <span style={{ fontSize: '0.7rem', color: 'var(--sage-green)', fontWeight: '600' }}>
                      Active
                    </span>
                  )}
                </div>
              );
            })}

            {activeTrack && (
              <div
                onClick={() => handleSelectTrack(null)}
                style={{
                  marginTop: '6px',
                  paddingTop: '6px',
                  borderTop: '1px solid var(--border-glass)',
                  padding: '6px 12px',
                  fontSize: '0.78rem',
                  color: '#F87171',
                  cursor: 'pointer',
                  textAlign: 'center',
                  borderRadius: '8px',
                }}
              >
                Mute All Sounds
              </div>
            )}
          </div>
        )}

        {/* Burnout Radar Modal Trigger */}
        <button onClick={onOpenDashboard} className="btn-primary" style={{ padding: '8px 18px', fontSize: '0.84rem' }}>
          <Sparkles size={14} />
          Burnout Radar
        </button>
      </div>
    </header>
  );
}
