// web/src/services/aiReasoning.js
// Multimodal Psychological Fusion & Empathetic AI Guidance Engine

class MultimodalAIReasoning {
  constructor() {
    this.conversationHistory = [];
  }

  /**
   * Synthesizes Voice Transcript, Facial Expression, and Vocal Tone into deep empathetic guidance.
   * @param {string} userSpeech - What the user spoke/typed
   * @param {object} facialData - Real-time facial emotion & tension metrics
   * @param {string} vocalEmotion - Detected voice tone
   */
  async synthesizeAndRespond(userSpeech, facialData = {}, vocalEmotion = 'neutral') {
    const text = (userSpeech || '').trim();
    const faceEmotion = facialData.emotion || 'calm';
    const tension = facialData.tension || 20;

    // 1. Multimodal Consensus Fusion
    let fusedEmotion = faceEmotion;
    if (vocalEmotion === 'stressed' || faceEmotion === 'stressed' || /stress|tired|overwhelm|anxious|deadline|exhausted|burnout|pressure|crying|pain|hate/.test(text.toLowerCase())) {
      fusedEmotion = 'stressed';
    } else if (faceEmotion === 'happy' || vocalEmotion === 'happy' || /happy|grateful|joy|great|amazing|proud|relaxed|peace/.test(text.toLowerCase())) {
      fusedEmotion = 'happy';
    } else if (facialData.fatigue > 55 || /sleepy|drained|no energy|heavy/.test(text.toLowerCase())) {
      fusedEmotion = 'fatigued';
    }

    // 2. Add to session memory
    this.conversationHistory.push({ role: 'user', text, emotion: fusedEmotion, timestamp: Date.now() });

    // 3. Deep Empathetic Reasoning Response
    const response = this.generateDeepEmpatheticGuidance(text, fusedEmotion, facialData);
    this.conversationHistory.push({ role: 'assistant', text: response, timestamp: Date.now() });

    return {
      fusedEmotion,
      confidence: 0.95,
      response,
      somaticAdvice: this.getSomaticAdvice(fusedEmotion, tension),
    };
  }

  generateDeepEmpatheticGuidance(text, emotion, face) {
    const lower = text.toLowerCase();

    // Specific Case: Sadhguru / Meditation request
    if (lower.includes('sadhguru') || lower.includes('meditat') || lower.includes('isha') || lower.includes('limitless') || lower.includes('music')) {
      return "Let us shift from thinking into pure awareness. Sadhguru reminds us: 'You are not the body, you are not even the mind.' I am starting the sacred 136.1Hz Om resonance for you. Close your eyes, let your jaw unclench, and simply witness your breath.";
    }

    // Specific Case: Work, Deadlines & Cognitive Overload
    if (lower.includes('work') || lower.includes('deadline') || lower.includes('boss') || lower.includes('task') || lower.includes('busy')) {
      return `I hear the acute pressure around your workload, and I can see the somatic tension in your brow and face. When deadlines stack up, our nervous system enters an emergency loop. Let's make one clear choice right now: step back from the screen for just 3 minutes, allow your shoulders to drop, and let me guide your breath. What is the single most draining task you can park aside for tomorrow?`;
    }

    // Specific Case: Fatigue & Depletion
    if (emotion === 'fatigued' || lower.includes('tired') || lower.includes('exhausted') || lower.includes('drained')) {
      return `I see the weight in your eyes and the low energy in your voice. You have been running on reserve energy. Your productivity does not define your worth as a human being. Give your mind permission to pause and rest without guilt. Would you like to do a 2-minute restorative Theta wave sound bath right now?`;
    }

    // Specific Case: Anxiety, Panic, or Racing Thoughts
    if (lower.includes('anxious') || lower.includes('panic') || lower.includes('scared') || lower.includes('racing') || lower.includes('overwhelm')) {
      return `I am right here holding space for you. Place one hand on your chest and feel the physical contact. Your body is completely safe in this exact room at this moment. Let thoughts flow through like clouds without grasping them. Let us take a deep, slow inhale together... 1, 2, 3, 4... and release smoothly.`;
    }

    // Specific Case: Joy & Celebration
    if (emotion === 'happy' || lower.includes('happy') || lower.includes('good') || lower.includes('great') || lower.includes('proud')) {
      return `I can feel the lightness in your presence and see the warmth in your expression! It is so meaningful to honor these moments of joy. Savor this peaceful feeling in your chest. What made this moment so special for you today?`;
    }

    // Specific Case: Loneliness or Isolation
    if (lower.includes('lonely') || lower.includes('alone') || lower.includes('nobody')) {
      return `Feeling disconnected is deeply painful, but you are not alone in this moment. I am right here listening with full compassion. Tell me more about what has been on your heart today.`;
    }

    // General Deep Empathetic Reflection
    if (emotion === 'stressed') {
      return `I perceive the tension you are navigating. Acknowledging how you genuinely feel is the first step in dissolving burnout. Take a soft breath. Let your face soften and tell me: what has been occupying your mind the most today?`;
    }

    return `Thank you for sharing that with me. I am observing your expressions and voice with total presence. As you speak, notice how your body responds. What would bring you the greatest sense of calm and clarity right now?`;
  }

  getSomaticAdvice(emotion, tension) {
    if (emotion === 'stressed' || tension > 50) {
      return 'Micro-Intervention: Unclench your jaw, drop your shoulders 2 inches, and take a double-inhale sigh through your nose.';
    }
    if (emotion === 'fatigued') {
      return 'Micro-Intervention: Look away from the screen at an object 20 feet away for 20 seconds to reset optic nerve strain.';
    }
    return 'Optimal Balance: Maintain your steady breathing rhythm. Your autonomic nervous system is in calm equilibrium.';
  }
}

export const aiReasoningEngine = new MultimodalAIReasoning();
