// web/src/components/ModeSwitcher.jsx
import React from 'react';
import { Mic, MessageSquare, Video, Layers, MicOff, VideoOff, FileText } from 'lucide-react';

export default function ModeSwitcher({
  currentMode,
  onModeChange,
  isMicOn,
  onToggleMic,
  isCamOn,
  onToggleCam,
  showTranscript,
  onToggleTranscript,
}) {
  const modes = [
    { id: 'voice', label: 'Voice Assistant', icon: Mic, badge: 'ChatGPT Style' },
    { id: 'text', label: 'Text & Journal', icon: MessageSquare },
    { id: 'video', label: 'Visual & Face', icon: Video },
    { id: 'combo', label: 'Multimodal Combo', icon: Layers, badge: 'All-In-One' },
  ];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '14px',
      margin: '20px 0 10px 0',
      zIndex: 20,
    }}>
      {/* Primary Mode Tabs */}
      <div className="mode-tabs-container">
        {modes.map((m) => {
          const Icon = m.icon;
          const isActive = currentMode === m.id;
          return (
            <button
              key={m.id}
              onClick={() => onModeChange(m.id)}
              className={`mode-tab ${isActive ? 'active' : ''}`}
            >
              <Icon size={16} />
              <span>{m.label}</span>
              {m.badge && (
                <span style={{
                  fontSize: '0.65rem',
                  padding: '2px 6px',
                  borderRadius: '999px',
                  background: isActive ? 'rgba(110, 193, 228, 0.3)' : 'rgba(255, 255, 255, 0.08)',
                  color: isActive ? '#BAE6FD' : 'var(--text-muted)',
                  fontWeight: '600',
                }}>
                  {m.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Granular Active Hardware / Stream Toggles */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        background: 'rgba(15, 23, 42, 0.5)',
        padding: '6px 14px',
        borderRadius: '999px',
        border: '1px solid var(--border-glass)',
      }}>
        <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginRight: '4px' }}>
          Active Streams:
        </span>

        {/* Mic Toggle */}
        <button
          onClick={onToggleMic}
          className={`btn-ghost ${isMicOn ? 'active' : ''}`}
          style={{
            padding: '4px 10px',
            fontSize: '0.76rem',
            background: isMicOn ? 'rgba(110, 193, 228, 0.15)' : 'transparent',
            borderColor: isMicOn ? 'var(--calm-blue)' : 'transparent',
            color: isMicOn ? 'var(--calm-blue-light)' : 'var(--text-muted)',
          }}
          title={isMicOn ? 'Mute Microphone' : 'Enable Microphone'}
        >
          {isMicOn ? <Mic size={13} /> : <MicOff size={13} />}
          <span>Mic {isMicOn ? 'ON' : 'OFF'}</span>
        </button>

        {/* Cam Toggle */}
        <button
          onClick={onToggleCam}
          className={`btn-ghost ${isCamOn ? 'active' : ''}`}
          style={{
            padding: '4px 10px',
            fontSize: '0.76rem',
            background: isCamOn ? 'rgba(168, 198, 165, 0.15)' : 'transparent',
            borderColor: isCamOn ? 'var(--sage-green)' : 'transparent',
            color: isCamOn ? 'var(--sage-green-light)' : 'var(--text-muted)',
          }}
          title={isCamOn ? 'Disable Camera' : 'Enable Camera'}
        >
          {isCamOn ? <Video size={13} /> : <VideoOff size={13} />}
          <span>Camera {isCamOn ? 'ON' : 'OFF'}</span>
        </button>

        {/* Live Subtitle Transcript Toggle */}
        <button
          onClick={onToggleTranscript}
          className={`btn-ghost ${showTranscript ? 'active' : ''}`}
          style={{
            padding: '4px 10px',
            fontSize: '0.76rem',
            background: showTranscript ? 'rgba(245, 198, 165, 0.15)' : 'transparent',
            borderColor: showTranscript ? 'var(--pastel-peach)' : 'transparent',
            color: showTranscript ? 'var(--pastel-peach)' : 'var(--text-muted)',
          }}
          title={showTranscript ? 'Hide Live Transcript' : 'Show Live Transcript'}
        >
          <FileText size={13} />
          <span>Live Subtitles {showTranscript ? 'ON' : 'OFF'}</span>
        </button>
      </div>
    </div>
  );
}
