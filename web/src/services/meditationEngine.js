// web/src/services/meditationEngine.js
// Sadhguru 'Miracle of Mind' & Limitless Brain Lab Sacred Meditations & Brainwave Entrainment

class MeditationEngine {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.currentTrack = null;
    this.nodes = [];
    this.gainNode = null;
    this.onTrackChange = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
      this.gainNode = this.ctx.createGain();
      this.gainNode.gain.setValueAtTime(0.22, this.ctx.currentTime);
      this.gainNode.connect(this.ctx.destination);
    }
  }

  // 1. 🕉️ Sadhguru Sacred AUM Drone (136.1Hz Earth Year Frequency / Om resonance)
  playAumResonance() {
    this.init();
    this.stop();
    if (this.ctx.state === 'suspended') this.ctx.resume();

    // 136.1 Hz (C#) Earth Om Frequency
    const baseFreq = 136.1;

    // Fundamental Root Drone
    const root = this.ctx.createOscillator();
    root.type = 'sawtooth';
    root.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);

    // Warm Low-pass Filter to create rich temple drone
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, this.ctx.currentTime);

    // Harmonic Overtones (Perfect Fifth 204.15Hz + Octave 272.2Hz)
    const fifth = this.ctx.createOscillator();
    fifth.type = 'sine';
    fifth.frequency.setValueAtTime(baseFreq * 1.5, this.ctx.currentTime);

    const octave = this.ctx.createOscillator();
    octave.type = 'sine';
    octave.frequency.setValueAtTime(baseFreq * 2, this.ctx.currentTime);

    // Slow meditative pranayama breath modulation (12-second cycle)
    const breathLFO = this.ctx.createOscillator();
    breathLFO.type = 'sine';
    breathLFO.frequency.setValueAtTime(0.08, this.ctx.currentTime); // ~12s

    const breathGain = this.ctx.createGain();
    breathGain.gain.setValueAtTime(140, this.ctx.currentTime);
    breathLFO.connect(breathGain);
    breathGain.connect(filter.frequency);

    const subGain = this.ctx.createGain();
    subGain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    fifth.connect(subGain);
    octave.connect(subGain);

    root.connect(filter);
    filter.connect(this.gainNode);
    subGain.connect(this.gainNode);

    root.start();
    fifth.start();
    octave.start();
    breathLFO.start();

    this.nodes = [root, filter, fifth, octave, breathLFO, breathGain, subGain];
    this.currentTrack = 'aum';
    this.isPlaying = true;
    if (this.onTrackChange) this.onTrackChange('aum');
  }

  // 2. 🧠 Limitless Brain Lab: 6Hz Binaural Theta Wave (Subconscious Healing & Stress Dissolution)
  playLimitlessTheta() {
    this.init();
    this.stop();
    if (this.ctx.state === 'suspended') this.ctx.resume();

    // Base carrier 216Hz, 6Hz difference for Theta brainwave entrainment
    const leftOsc = this.ctx.createOscillator();
    const rightOsc = this.ctx.createOscillator();
    leftOsc.type = 'sine';
    rightOsc.type = 'sine';
    leftOsc.frequency.setValueAtTime(216, this.ctx.currentTime);
    rightOsc.frequency.setValueAtTime(222, this.ctx.currentTime); // 222 - 216 = 6Hz Theta!

    // Stereo Panner
    const merger = this.ctx.createChannelMerger(2);
    leftOsc.connect(merger, 0, 0);
    rightOsc.connect(merger, 0, 1);

    // 528Hz Solfeggio DNA repair / Transformation tone layer
    const solfeggio = this.ctx.createOscillator();
    solfeggio.type = 'sine';
    solfeggio.frequency.setValueAtTime(528, this.ctx.currentTime);

    const solfeggioGain = this.ctx.createGain();
    solfeggioGain.gain.setValueAtTime(0.04, this.ctx.currentTime);
    solfeggio.connect(solfeggioGain);
    solfeggioGain.connect(this.gainNode);

    merger.connect(this.gainNode);

    leftOsc.start();
    rightOsc.start();
    solfeggio.start();

    this.nodes = [leftOsc, rightOsc, merger, solfeggio, solfeggioGain];
    this.currentTrack = 'theta';
    this.isPlaying = true;
    if (this.onTrackChange) this.onTrackChange('theta');
  }

  // 3. ✨ Miracle of Mind: Isha Temple Singing Bowl & Chime
  playIshaTemple() {
    this.init();
    this.stop();
    if (this.ctx.state === 'suspended') this.ctx.resume();

    // 432Hz Grounding + 864Hz Celestial Bell
    const bowl1 = this.ctx.createOscillator();
    bowl1.type = 'sine';
    bowl1.frequency.setValueAtTime(432, this.ctx.currentTime);

    const bowl2 = this.ctx.createOscillator();
    bowl2.type = 'sine';
    bowl2.frequency.setValueAtTime(864, this.ctx.currentTime);

    const bowl3 = this.ctx.createOscillator();
    bowl3.type = 'triangle';
    bowl3.frequency.setValueAtTime(108, this.ctx.currentTime); // Low root

    const bellLFO = this.ctx.createOscillator();
    bellLFO.type = 'sine';
    bellLFO.frequency.setValueAtTime(0.1, this.ctx.currentTime);

    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(0.06, this.ctx.currentTime);
    bellLFO.connect(lfoGain);

    const gain2 = this.ctx.createGain();
    gain2.gain.setValueAtTime(0.05, this.ctx.currentTime);
    bowl2.connect(gain2);

    const gain3 = this.ctx.createGain();
    gain3.gain.setValueAtTime(0.12, this.ctx.currentTime);
    bowl3.connect(gain3);

    bowl1.connect(this.gainNode);
    gain2.connect(this.gainNode);
    gain3.connect(this.gainNode);

    bowl1.start();
    bowl2.start();
    bowl3.start();
    bellLFO.start();

    this.nodes = [bowl1, bowl2, bowl3, bellLFO, lfoGain, gain2, gain3];
    this.currentTrack = 'temple';
    this.isPlaying = true;
    if (this.onTrackChange) this.onTrackChange('temple');
  }

  // 4. 🌧️ Deep Shunya Rain (Limitless Rest)
  playShunyaRain() {
    this.init();
    this.stop();
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const bufferSize = this.ctx.sampleRate * 4;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (last + 0.02 * white) / 1.02;
      last = data[i];
      data[i] *= 3.8;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(650, this.ctx.currentTime);

    noise.connect(filter);
    filter.connect(this.gainNode);

    noise.start();
    this.nodes = [noise, filter];
    this.currentTrack = 'rain';
    this.isPlaying = true;
    if (this.onTrackChange) this.onTrackChange('rain');
  }

  playTrack(id) {
    switch (id) {
      case 'aum':
        this.playAumResonance();
        break;
      case 'theta':
        this.playLimitlessTheta();
        break;
      case 'temple':
        this.playIshaTemple();
        break;
      case 'rain':
        this.playShunyaRain();
        break;
      default:
        this.stop();
        break;
    }
  }

  stop() {
    this.nodes.forEach((n) => {
      try {
        if (n.stop) n.stop();
        if (n.disconnect) n.disconnect();
      } catch (e) {}
    });
    this.nodes = [];
    this.isPlaying = false;
    this.currentTrack = null;
    if (this.onTrackChange) this.onTrackChange(null);
  }
}

export const meditationEngine = new MeditationEngine();
