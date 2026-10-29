// web/src/services/speech.js
import { aiConfig } from './aiConfig';

class SpeechService {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.onResultCallback = null;
    this.onErrorCallback = null;
    this.onStateChangeCallback = null;
    this.onSpeechFinalizedCallback = null;

    // Buffers for speech accumulation & silence debounce
    this.accumulatedTranscript = '';
    this.interimTranscript = '';
    this.silenceTimer = null;

    this.initRecognition();
  }

  initRecognition() {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Speech recognition not supported in this browser.');
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';

    this.recognition.onstart = () => {
      this.isListening = true;
      if (this.onStateChangeCallback) this.onStateChangeCallback(true);
    };

    this.recognition.onend = () => {
      // Auto-restart if user still intended for mic to be active and not speaking
      if (this.isListening) {
        try {
          this.recognition.start();
          return;
        } catch (e) {
          // Ignore start error if already running
        }
      }
      this.isListening = false;
      if (this.onStateChangeCallback) this.onStateChangeCallback(false);
    };

    this.recognition.onerror = (event) => {
      if (event.error === 'no-speech') {
        // User is just quiet, ignore
        return;
      }
      console.warn('Speech recognition event warning:', event.error);
      if (this.onErrorCallback) this.onErrorCallback(event.error);
    };

    this.recognition.onresult = (event) => {
      let currentFinal = '';
      let currentInterim = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const item = event.results[i];
        if (item.isFinal) {
          currentFinal += item[0].transcript + ' ';
        } else {
          currentInterim += item[0].transcript;
        }
      }

      if (currentFinal) {
        this.accumulatedTranscript += currentFinal;
      }
      this.interimTranscript = currentInterim;

      const fullLiveText = (this.accumulatedTranscript + ' ' + this.interimTranscript).trim();

      // Notify caller of live streaming transcript for real-time subtitle display
      if (this.onResultCallback && fullLiveText) {
        this.onResultCallback({
          final: this.accumulatedTranscript.trim(),
          interim: this.interimTranscript.trim(),
          text: fullLiveText,
          isFinalChunk: !!currentFinal,
        });
      }

      // Reset and restart silence debounce timer
      if (fullLiveText.length > 1) {
        this.resetSilenceTimer();
      }
    };
  }

  resetSilenceTimer() {
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
    }

    const pauseMs = aiConfig ? aiConfig.getSpeechPauseMs() : 1400;

    this.silenceTimer = setTimeout(() => {
      this.finalizeUtterance();
    }, pauseMs);
  }

  finalizeUtterance() {
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }

    const fullUtterance = (this.accumulatedTranscript + ' ' + this.interimTranscript).trim();

    if (fullUtterance.length > 2) {
      this.accumulatedTranscript = '';
      this.interimTranscript = '';

      if (this.onSpeechFinalizedCallback) {
        this.onSpeechFinalizedCallback(fullUtterance);
      }
    }
  }

  flushNow() {
    this.finalizeUtterance();
  }

  startListening(onResult, onSpeechFinalized, onError, onStateChange) {
    this.onResultCallback = onResult;
    this.onSpeechFinalizedCallback = onSpeechFinalized;
    this.onErrorCallback = onError;
    this.onStateChangeCallback = onStateChange;

    this.accumulatedTranscript = '';
    this.interimTranscript = '';

    if (!this.recognition) {
      if (onError) onError('Speech recognition not supported in this browser');
      return;
    }

    try {
      this.recognition.start();
    } catch (e) {
      // Already started
    }
  }

  stopListening() {
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }
    this.isListening = false;
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {
        // Ignored
      }
    }
  }

  speak(text, onEnd) {
    if (!this.synth) {
      if (onEnd) onEnd();
      return;
    }
    this.synth.cancel();

    if (!text || !text.trim()) {
      if (onEnd) onEnd();
      return;
    }

    // Clean text of markdown tokens, asterisks, hashtags for calm speech output
    const cleanText = text
      .replace(/[*_#~[]()]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    const voices = this.synth.getVoices();
    const calmVoice = voices.find(
      (v) =>
        (v.name.includes('Natural') ||
          v.name.includes('Google') ||
          v.name.includes('Samantha') ||
          v.name.includes('Karen') ||
          v.name.includes('Victoria') ||
          v.name.includes('Zira')) &&
        v.lang.startsWith('en')
    );
    if (calmVoice) {
      utterance.voice = calmVoice;
    }

    if (onEnd) {
      utterance.onend = onEnd;
      utterance.onerror = onEnd;
    }

    this.synth.speak(utterance);
  }

  stopSpeaking() {
    if (this.synth) {
      this.synth.cancel();
    }
  }
}

export const speechService = new SpeechService();
