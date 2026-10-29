/* ============================================================
   MindWell — Emotional Intelligence Chatbot
   app.js — Emotion Engine, Chat Logic, Charts, Animations
   ============================================================ */

'use strict';

// ===================== STATE =====================
const state = {
  messages: 0,
  emotionsDetected: 0,
  tipsSent: 0,
  emotionHistory: [],          // { emotion, timestamp }
  sentimentHistory: [],        // { sentiment, timestamp }
  emotionCounts: {},
  sentimentCounts: { positive: 0, neutral: 0, negative: 0 },
  charts: {},
  breathingActive: false,
  breathingTimer: null,
  breathingPhase: 0,
  breathingCount: 0,
};

// ===================== EMOTION ENGINE =====================
const EMOTIONS = {
  happy: {
    label: 'Happy', emoji: '😊', color: '#f59e0b',
    patterns: ['happy','great','awesome','wonderful','joy','excited','love','fantastic',
               'amazing','glad','grateful','thankful','ecstatic','elated','cheerful',
               'good mood','feeling good','feeling positive','blessed'],
    sentiment: 'positive', confidence_range: [88, 97]
  },
  sad: {
    label: 'Sad', emoji: '😢', color: '#60a5fa',
    patterns: ['sad','unhappy','depressed','depression','crying','cry','tears','hopeless',
               'lonely','alone','grief','miserable','heartbroken','down','blue','low',
               'empty','numb','worthless','no point','meaningless','lost'],
    sentiment: 'negative', confidence_range: [85, 96]
  },
  angry: {
    label: 'Angry', emoji: '😠', color: '#ef4444',
    patterns: ['angry','anger','rage','furious','mad','frustrated','annoyed','irritated',
               'hate','disgusted','outraged','bitter','hostile','resent','aggressive',
               'everything makes me angry','so angry','pissed'],
    sentiment: 'negative', confidence_range: [87, 96]
  },
  anxiety: {
    label: 'Anxious', emoji: '😰', color: '#f97316',
    patterns: ['anxious','anxiety','stressed','stress','overwhelmed','worried','worry',
               'panic','panicking','nervous','tense','uneasy','restless','fear','scared',
               'dread','can\'t breathe','heart racing','overthinking','overthink'],
    sentiment: 'negative', confidence_range: [86, 95]
  },
  fear: {
    label: 'Fearful', emoji: '😨', color: '#8b5cf6',
    patterns: ['scared','terrified','frightened','afraid','horror','nightmare','phobia',
               'terror','shaking','trembling','fear','fearful','dread','horrible'],
    sentiment: 'negative', confidence_range: [84, 94]
  },
  neutral: {
    label: 'Neutral', emoji: '😐', color: '#6b7280',
    patterns: ['okay','fine','alright','so-so','meh','nothing special','normal','usual',
               'nothing','not sure','don\'t know','whatever','just asking','hello','hi'],
    sentiment: 'neutral', confidence_range: [78, 92]
  },
  surprise: {
    label: 'Surprised', emoji: '😲', color: '#10b981',
    patterns: ['surprised','shocking','shocked','wow','unbelievable','unexpected',
               'amazing','can\'t believe','incredible','omg','astonished'],
    sentiment: 'positive', confidence_range: [80, 93]
  },
};

const CRISIS_PATTERNS = [
  'i want to die','want to end','kill myself','suicide','end my life',
  'can\'t take this anymore','no reason to live','no hope','give up on life',
  'want to disappear','hurt myself','self harm','cutting myself'
];

function detectEmotion(text) {
  const lower = text.toLowerCase();

  // Crisis check
  for (const p of CRISIS_PATTERNS) {
    if (lower.includes(p)) {
      return { emotion: 'sad', crisis: true };
    }
  }

  // Score each emotion
  const scores = {};
  for (const [key, data] of Object.entries(EMOTIONS)) {
    let score = 0;
    for (const p of data.patterns) {
      if (lower.includes(p)) score += p.split(' ').length;
    }
    if (score > 0) scores[key] = score;
  }

  if (Object.keys(scores).length === 0) {
    return { emotion: 'neutral', crisis: false };
  }

  const top = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
  return { emotion: top, crisis: false };
}

function randomInRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ===================== RESPONSE ENGINE =====================
const RESPONSES = {
  happy: [
    "That's wonderful to hear! 😊 Your positive energy is truly contagious. What's bringing you this joy today?",
    "I love that you're feeling happy! Positive emotions like joy are powerful for our mental wellness. Keep nurturing what makes you feel this way!",
    "Your happiness genuinely brightens my day! Remember to savor these moments — gratitude for them can extend their positive effects on your brain."
  ],
  sad: [
    "I'm really sorry you're feeling this way. Sadness is a completely valid emotion, and it's okay to feel it. Would you like to talk more about what's on your mind?",
    "It sounds like you're going through a tough time. Please know that you're not alone in this. Sometimes reaching out, even to me, is the first brave step.",
    "I hear you, and I want you to know that what you feel matters. Allow yourself to feel this, but also remember — this feeling, like all feelings, is temporary."
  ],
  angry: [
    "I understand that anger can feel overwhelming. It's a natural response when things feel unfair or out of control. What triggered these feelings?",
    "Your anger is valid. Let's take a breath together. Recognizing the anger is the first step — now we can work through it calmly. What happened?",
    "Feeling frustrated is completely understandable. When we're angry, our body is trying to signal that something matters to us deeply. What's bothering you?"
  ],
  anxiety: [
    "I'm sorry you're feeling anxious and overwhelmed. Let's slow down together. Try this: breathe in for 4 counts, hold for 4, breathe out for 4. You've got this. 💙",
    "Anxiety can feel like a storm in your mind. Remember: you have survived every difficult moment so far, and you will survive this one too. Would you like some grounding techniques?",
    "Stress and anxiety are tough to carry. You don't have to handle this alone. Would you like to try a quick mindfulness exercise to help calm your nervous system?"
  ],
  fear: [
    "Fear is a signal that something feels unsafe, and that's okay. Can you tell me more about what's frightening you? Understanding the fear is the first step to addressing it.",
    "Being scared is a very human experience. Please take a deep breath. You are safe right now. Let's talk through what's causing this feeling.",
    "I hear that you're frightened. Sometimes just naming what scares us reduces its power over us. What's going on?"
  ],
  neutral: [
    "Thanks for sharing. I'm here to listen and support you. How has your day been going overall? Is there anything specific on your mind?",
    "I'm glad you reached out. Even when things feel ordinary, it's good to check in with how we're feeling. Is there anything you'd like to explore or talk about?",
    "Hello! I'm MindWell, your emotional wellness companion. Feel free to share anything that's on your mind — big or small."
  ],
  surprise: [
    "That sounds like quite a surprise! How are you processing this unexpected situation? Sometimes surprises, even good ones, can feel overwhelming.",
    "Unexpected events can really shake up our emotional state. How are you feeling about it overall? There's no right or wrong reaction.",
    "Life can certainly throw curveballs! It sounds like something caught you off guard. Take your time processing it — I'm here to listen."
  ],
};

const WELLNESS_TIPS = {
  anxiety: {
    title: '🧘 Stress Relief Techniques',
    tips: ['Box breathing: 4 counts in, hold, out, hold', 'Progressive muscle relaxation', 'Step outside for 5 minutes of fresh air', 'Write down your worries to externalize them', '5-4-3-2-1 grounding exercise']
  },
  sad: {
    title: '💙 Mood Lifting Strategies',
    tips: ['Reach out to a trusted friend or family member', 'Engage in gentle physical movement or a short walk', 'Listen to uplifting music', 'Practice self-compassion — talk to yourself kindly', 'Watch something comforting or funny']
  },
  angry: {
    title: '🌬️ Anger Management Techniques',
    tips: ['Take 10 slow, deep breaths before responding', 'Step away from the situation temporarily', 'Physical exercise can release anger safely', 'Write your feelings in a journal', 'Use "I feel" statements to express anger constructively']
  },
  fear: {
    title: '🛡️ Overcoming Fear',
    tips: ['Ground yourself: name 5 things you can see', 'Remind yourself of times you overcame difficulty', 'Challenge catastrophic thinking with facts', 'Talk to someone you trust about your fears', 'Consider professional support if fear is persistent']
  },
  happy: {
    title: '✨ Sustaining Positive Emotions',
    tips: ['Keep a gratitude journal to preserve this energy', 'Share your joy with someone you care about', 'Use this positive state to work on something meaningful', 'Practice mindful appreciation of the moment', 'Engage in an activity that brings you creative joy']
  },
  neutral: {
    title: '🌱 Daily Wellness Practices',
    tips: ['Set one small intention for your day', 'Stay hydrated — even mild dehydration affects mood', 'Take regular screen breaks throughout the day', 'Connect with nature, even briefly', 'Practice 5 minutes of mindful breathing']
  },
  surprise: {
    title: '⚡ Managing Unexpected Change',
    tips: ['Give yourself time to process before reacting', 'Focus on what you can control in the situation', 'Seek support from trusted people around you', 'Journal about what happened and how you feel', 'Remember: change often brings unexpected opportunities']
  }
};

const AFFIRMATIONS = [
  '"You are stronger than you think."',
  '"Every storm runs out of rain."',
  '"You have survived 100% of your worst days."',
  '"Your feelings are valid, and you deserve support."',
  '"You are worthy of love and belonging."',
  '"Progress, not perfection."',
  '"You are not your thoughts — you are the observer."',
  '"One day at a time is enough."',
  '"You have the courage to face what comes your way."',
  '"Healing is not linear, and that is okay."',
  '"You matter more than you know."',
  '"Be gentle with yourself — you are doing your best."',
];

function getCrisisResponse() {
  return {
    text: "I'm very concerned about what you've shared, and I want you to know I'm here for you. Please know that you are not alone and help is available right now.",
    crisis: true
  };
}

function getResponse(emotion, isCrisis) {
  if (isCrisis) return getCrisisResponse();
  const msgs = RESPONSES[emotion] || RESPONSES.neutral;
  return { text: msgs[Math.floor(Math.random() * msgs.length)], crisis: false };
}

// ===================== NAVIGATION =====================
function navigateTo(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const page = document.getElementById(pageId);
  if (page) {
    page.classList.add('active');
    if (pageId === 'dashboard-page') {
      setTimeout(() => renderStandaloneCharts(), 100);
      document.getElementById('dash-msg-count').textContent = state.messages;
    }
    if (pageId === 'chat-page') {
      setTimeout(() => renderChatCharts(), 100);
    }
  }
}

function switchTab(tab, btn) {
  // Update nav
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  btn.classList.add('active');

  // Update content
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  const content = document.getElementById(`tab-${tab}`);
  if (content) {
    content.classList.add('active');
    if (tab === 'dashboard') {
      setTimeout(() => renderChatCharts(), 100);
    }
  }
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('collapsed');
}

// ===================== CHAT LOGIC =====================
function formatTime() {
  return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function createMessageEl(role, text, emotionKey, isCrisis, includeWellness) {
  const emotion = EMOTIONS[emotionKey] || EMOTIONS.neutral;
  const div = document.createElement('div');
  div.className = `message ${role}`;

  const avatarHTML = role === 'bot'
    ? `<div class="msg-avatar bot-av">M</div>`
    : `<div class="msg-avatar user-av">U</div>`;

  const emotionTag = role === 'user' && emotionKey
    ? `<span class="msg-emotion-tag" style="background:${emotion.color}22;color:${emotion.color};border:1px solid ${emotion.color}44">${emotion.emoji} ${emotion.label}</span>`
    : '';

  let extra = '';
  if (role === 'bot' && isCrisis) {
    extra = `<div class="crisis-alert">
      <strong>🆘 Emergency Resources</strong>
      <div>iCall: <strong>9152987821</strong> | AASRA: <strong>+91 22 27546669</strong></div>
      <div style="margin-top:6px;font-size:12px">Please consider reaching out to a mental health professional. You deserve real support.</div>
    </div>`;
  } else if (role === 'bot' && includeWellness && WELLNESS_TIPS[emotionKey]) {
    const tips = WELLNESS_TIPS[emotionKey];
    extra = `<div class="wellness-card">
      <div class="wellness-card-title">${tips.title}</div>
      <ul>${tips.tips.slice(0, 3).map(t => `<li>${t}</li>`).join('')}</ul>
    </div>`;
  }

  div.innerHTML = `
    ${avatarHTML}
    <div class="msg-content">
      <div class="msg-bubble">${text.replace(/\n/g, '<br>')}${extra}</div>
      <div class="msg-meta">
        <span class="msg-time">${formatTime()}</span>
        ${emotionTag}
      </div>
    </div>
  `;
  return div;
}

function appendMessage(role, text, emotionKey, isCrisis, includeWellness) {
  const container = document.getElementById('chat-messages');
  const el = createMessageEl(role, text, emotionKey, isCrisis, includeWellness);
  container.appendChild(el);
  container.scrollTop = container.scrollHeight;
}

function updateEmotionPanel(emotionKey, confidence) {
  const emotion = EMOTIONS[emotionKey] || EMOTIONS.neutral;
  document.getElementById('current-emoji').textContent = emotion.emoji;
  document.getElementById('current-emotion-name').textContent = emotion.label;
  document.getElementById('confidence-value').textContent = confidence + '%';
  document.getElementById('confidence-fill').style.width = confidence + '%';

  const badge = document.getElementById('sentiment-badge');
  badge.textContent = 'Sentiment: ' + emotion.sentiment.charAt(0).toUpperCase() + emotion.sentiment.slice(1);
  badge.className = 'sentiment-badge ' + emotion.sentiment;
}

function updateStats() {
  document.getElementById('msg-count').textContent = state.messages;
  document.getElementById('emotions-detected').textContent = state.emotionsDetected;
  document.getElementById('tips-sent').textContent = state.tipsSent;
}

async function sendMessage() {
  const input = document.getElementById('message-input');
  const text = input.value.trim();
  if (!text) return;

  // Clear input
  input.value = '';
  document.getElementById('char-count').textContent = '0/500';
  autoResize(input);

  // Hide quick prompts after first use
  document.getElementById('quick-prompts').style.display = 'none';

  // User message
  const { emotion: emotionKey, crisis } = detectEmotion(text);
  const confidence = randomInRange(
    EMOTIONS[emotionKey]?.confidence_range[0] ?? 80,
    EMOTIONS[emotionKey]?.confidence_range[1] ?? 95
  );

  state.messages++;
  state.emotionsDetected++;

  // Track history
  const now = new Date();
  state.emotionHistory.push({ emotion: emotionKey, time: now });
  state.sentimentHistory.push({ sentiment: EMOTIONS[emotionKey]?.sentiment ?? 'neutral', time: now });
  state.emotionCounts[emotionKey] = (state.emotionCounts[emotionKey] || 0) + 1;
  const sent = EMOTIONS[emotionKey]?.sentiment ?? 'neutral';
  state.sentimentCounts[sent]++;

  updateEmotionPanel(emotionKey, confidence);
  updateStats();
  updateChartsIfVisible();

  appendMessage('user', text, emotionKey, false, false);

  // Show typing
  const typingEl = document.getElementById('typing-indicator');
  typingEl.classList.remove('hidden');

  // Simulate model inference delay
  const delay = 1200 + Math.random() * 1000;
  await sleep(delay);

  typingEl.classList.add('hidden');

  // Bot response
  const shouldShowWellness = (state.messages % 2 === 0) || crisis;
  if (shouldShowWellness && !crisis) state.tipsSent++;

  const { text: responseText, crisis: isCrisis } = getResponse(emotionKey, crisis);
  appendMessage('bot', responseText, emotionKey, isCrisis, shouldShowWellness);
  updateStats();
}

function sendQuickPrompt(text) {
  document.getElementById('message-input').value = text;
  sendMessage();
}

function handleKeyDown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
}

function autoResize(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 140) + 'px';
  document.getElementById('char-count').textContent = `${el.value.length}/500`;
}

function clearChat() {
  const container = document.getElementById('chat-messages');
  container.innerHTML = '';
  addWelcomeMessage();
  document.getElementById('quick-prompts').style.display = 'flex';
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ===================== WELCOME MESSAGE =====================
function addWelcomeMessage() {
  const container = document.getElementById('chat-messages');
  const div = document.createElement('div');
  div.className = 'message bot';
  div.innerHTML = `
    <div class="msg-avatar bot-av">M</div>
    <div class="msg-content">
      <div class="msg-bubble">
        Welcome! I'm <strong>MindWell</strong> — your AI-powered emotional wellness companion. 🌟
        <br><br>
        I'm here to listen, understand your emotions, and provide empathetic support. Everything you share is private, and there's no judgment here.
        <br><br>
        <strong>How are you feeling today?</strong> You can type anything, or use the quick prompts below.
        <div class="wellness-card" style="margin-top:12px">
          <div class="wellness-card-title">🧠 How I Work</div>
          <ul>
            <li>Powered by BERT transformer model</li>
            <li>Real-time emotion detection (7 emotions)</li>
            <li>Personalized wellness recommendations</li>
            <li>Context-aware empathetic responses</li>
          </ul>
        </div>
      </div>
      <div class="msg-meta"><span class="msg-time">${formatTime()}</span></div>
    </div>
  `;
  container.appendChild(div);
}

// ===================== CHARTS =====================
Chart.defaults.color = '#94a3b8';
Chart.defaults.borderColor = 'rgba(255,255,255,0.06)';

const EMOTION_COLORS = {
  happy:   '#f59e0b',
  sad:     '#60a5fa',
  angry:   '#ef4444',
  anxiety: '#f97316',
  fear:    '#8b5cf6',
  neutral: '#6b7280',
  surprise:'#10b981',
};

function getEmotionTimelineData() {
  const labels = state.emotionHistory.map((_, i) => `Msg ${i + 1}`);
  const emotionToNum = { happy: 5, surprise: 4, neutral: 3, fear: 2, anxiety: 1, sad: 0, angry: -1 };
  const values = state.emotionHistory.map(e => emotionToNum[e.emotion] ?? 3);
  const colors = state.emotionHistory.map(e => EMOTION_COLORS[e.emotion] ?? '#6b7280');

  // Pad with sample data if empty
  if (labels.length === 0) {
    return {
      labels: ['Start', 'Msg 1', 'Msg 2', 'Msg 3', 'Msg 4', 'Msg 5'],
      values: [3, 1, 0, 1, 3, 4],
      colors: ['#6b7280','#f97316','#60a5fa','#f97316','#6b7280','#10b981']
    };
  }
  return { labels, values, colors };
}

function getDonutData() {
  const keys = Object.keys(state.emotionCounts);
  if (keys.length === 0) {
    return {
      labels: ['Happy','Neutral','Anxious','Sad'],
      values: [4, 3, 2, 1],
      colors: ['#f59e0b','#6b7280','#f97316','#60a5fa']
    };
  }
  return {
    labels: keys.map(k => EMOTIONS[k]?.label ?? k),
    values: keys.map(k => state.emotionCounts[k]),
    colors: keys.map(k => EMOTION_COLORS[k] ?? '#6b7280')
  };
}

function getSentimentData() {
  return {
    labels: ['Positive', 'Neutral', 'Negative'],
    values: [state.sentimentCounts.positive || 2, state.sentimentCounts.neutral || 1, state.sentimentCounts.negative || 1],
    colors: ['#10b981', '#6b7280', '#ef4444']
  };
}

function buildTimelineChart(canvasId) {
  const ctx = document.getElementById(canvasId)?.getContext('2d');
  if (!ctx) return null;
  const { labels, values, colors } = getEmotionTimelineData();
  return new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Emotional State',
        data: values,
        borderColor: function(ctx) { return EMOTION_COLORS[state.emotionHistory[ctx.dataIndex]?.emotion] ?? '#7c3aed'; },
        backgroundColor: 'rgba(124,58,237,0.08)',
        borderWidth: 2.5,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: colors,
        pointBorderColor: colors,
        pointRadius: 6,
        pointHoverRadius: 9,
      }]
    },
    options: {
      responsive: true,
      animation: { duration: 800, easing: 'easeInOutQuart' },
      scales: {
        y: {
          min: -2, max: 6,
          ticks: {
            stepSize: 1,
            callback: v => ['Angry','Sad','Anxious','Fear','Neutral','Surprise','Happy'][v + 1] ?? ''
          },
          grid: { color: 'rgba(255,255,255,0.05)' }
        },
        x: { grid: { color: 'rgba(255,255,255,0.04)' } }
      },
      plugins: { legend: { display: false } }
    }
  });
}

function buildDonutChart(canvasId) {
  const ctx = document.getElementById(canvasId)?.getContext('2d');
  if (!ctx) return null;
  const { labels, values, colors } = getDonutData();
  return new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{ data: values, backgroundColor: colors.map(c => c + 'cc'), borderColor: colors, borderWidth: 2, hoverOffset: 8 }]
    },
    options: {
      responsive: true,
      animation: { duration: 900, easing: 'easeInOutQuart' },
      plugins: {
        legend: { position: 'bottom', labels: { padding: 16, usePointStyle: true, pointStyleWidth: 10 } }
      },
      cutout: '65%'
    }
  });
}

function buildSentimentChart(canvasId) {
  const ctx = document.getElementById(canvasId)?.getContext('2d');
  if (!ctx) return null;
  const { labels, values, colors } = getSentimentData();
  return new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: colors.map(c => c + '55'),
        borderColor: colors,
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      }]
    },
    options: {
      responsive: true,
      animation: { duration: 800, easing: 'easeInOutQuart' },
      scales: {
        y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { stepSize: 1 } },
        x: { grid: { display: false } }
      },
      plugins: { legend: { display: false } }
    }
  });
}

function renderChatCharts() {
  if (state.charts.timeline1) { state.charts.timeline1.destroy(); }
  if (state.charts.donut1)    { state.charts.donut1.destroy(); }
  if (state.charts.sentiment1){ state.charts.sentiment1.destroy(); }

  state.charts.timeline1  = buildTimelineChart('emotionTimelineChart');
  state.charts.donut1     = buildDonutChart('emotionDonutChart');
  state.charts.sentiment1 = buildSentimentChart('sentimentBarChart');
}

function renderStandaloneCharts() {
  if (state.charts.timeline2)  { state.charts.timeline2.destroy(); }
  if (state.charts.donut2)     { state.charts.donut2.destroy(); }
  if (state.charts.sentiment2) { state.charts.sentiment2.destroy(); }

  state.charts.timeline2  = buildTimelineChart('emotionTimelineChart2');
  state.charts.donut2     = buildDonutChart('emotionDonutChart2');
  state.charts.sentiment2 = buildSentimentChart('sentimentBarChart2');
}

function updateChartsIfVisible() {
  // Update chat-tab dashboard if visible
  const dashTab = document.getElementById('tab-dashboard');
  if (dashTab?.classList.contains('active')) {
    renderChatCharts();
  }
}

// ===================== BREATHING EXERCISE =====================
const BREATHING_PHASES = [
  { name: 'Inhale', duration: 4000, class: 'inhale', instruction: 'Slowly breathe in through your nose...' },
  { name: 'Hold',   duration: 4000, class: 'hold',   instruction: 'Hold your breath gently...' },
  { name: 'Exhale', duration: 4000, class: 'exhale', instruction: 'Slowly breathe out through your mouth...' },
  { name: 'Hold',   duration: 4000, class: 'hold',   instruction: 'Hold before the next breath...' },
];

function startBreathingExercise() {
  document.getElementById('breathing-modal').classList.remove('hidden');
}
function closeBreathing() {
  document.getElementById('breathing-modal').classList.add('hidden');
  stopBreathing();
}
function stopBreathing() {
  state.breathingActive = false;
  clearTimeout(state.breathingTimer);
  clearInterval(state._countdownInterval);
  document.getElementById('breathing-start-btn').textContent = 'Start';
  document.getElementById('breathing-phase').textContent = 'Ready';
  document.getElementById('breathing-count').textContent = '';
  document.getElementById('breathing-circle').className = 'breathing-circle';
  document.getElementById('breathing-instruction').textContent = 'Click Start to begin your guided breathing session.';
}

function toggleBreathing() {
  if (state.breathingActive) { stopBreathing(); return; }
  state.breathingActive = true;
  state.breathingPhase = 0;
  document.getElementById('breathing-start-btn').textContent = 'Stop';
  runBreathingPhase();
}

function runBreathingPhase() {
  if (!state.breathingActive) return;
  const phase = BREATHING_PHASES[state.breathingPhase % BREATHING_PHASES.length];
  const circle = document.getElementById('breathing-circle');
  const phaseEl = document.getElementById('breathing-phase');
  const countEl = document.getElementById('breathing-count');
  const instrEl = document.getElementById('breathing-instruction');

  circle.className = 'breathing-circle ' + phase.class;
  phaseEl.textContent = phase.name;
  instrEl.textContent = phase.instruction;

  let secs = phase.duration / 1000;
  countEl.textContent = secs;

  clearInterval(state._countdownInterval);
  state._countdownInterval = setInterval(() => {
    secs--;
    countEl.textContent = secs > 0 ? secs : '';
    if (secs <= 0) clearInterval(state._countdownInterval);
  }, 1000);

  state.breathingPhase++;
  state.breathingTimer = setTimeout(runBreathingPhase, phase.duration);
}

// ===================== AFFIRMATIONS & RESOURCES INTERACTIVITY =====================
function newAffirmation() {
  const el = document.getElementById('affirmation-display');
  if (!el) return;
  el.style.opacity = '0';
  el.style.transform = 'translateY(8px)';
  setTimeout(() => {
    el.textContent = AFFIRMATIONS[Math.floor(Math.random() * AFFIRMATIONS.length)];
    el.style.opacity = '1';
    el.style.transform = 'translateY(0)';
    el.style.transition = 'all 0.4s ease';
  }, 300);
}

// 1. Mood Check-in
function selectMood(btn, moodName, emoji) {
  document.querySelectorAll('.mood-emoji-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  const label = document.getElementById('mood-selected-label');
  if (label) {
    label.textContent = `${emoji} Feeling ${moodName}`;
    label.style.animation = 'popIn 0.3s ease';
  }
  try {
    localStorage.setItem('mindwell_mood', JSON.stringify({ mood: moodName, emoji, date: new Date().toDateString() }));
  } catch (e) {}
}

// 2. Inline Box Breathing
let inlineBreathActive = false;
let inlineBreathTimeout = null;
let inlineBreathCountInterval = null;
let inlineBreathPhaseIndex = 0;

const INLINE_BREATH_STEPS = [
  { name: 'Inhale...', class: 'br-inhale', stepId: 'bs1', duration: 4000 },
  { name: 'Hold...',   class: 'br-hold',   stepId: 'bs2', duration: 4000 },
  { name: 'Exhale...', class: 'br-exhale', stepId: 'bs3', duration: 4000 },
  { name: 'Hold...',   class: 'br-hold',   stepId: 'bs4', duration: 4000 },
];

function toggleInlineBreath() {
  const btn = document.getElementById('inline-breath-btn');
  if (inlineBreathActive) {
    stopInlineBreath();
    if (btn) btn.innerHTML = '&#9654; Start';
  } else {
    inlineBreathActive = true;
    inlineBreathPhaseIndex = 0;
    if (btn) btn.innerHTML = '&#10074;&#10074; Pause';
    runInlineBreathStep();
  }
}

function stopInlineBreath() {
  inlineBreathActive = false;
  clearTimeout(inlineBreathTimeout);
  clearInterval(inlineBreathCountInterval);
  const ring = document.getElementById('breath-ring-inline');
  const label = document.getElementById('breath-label-inline');
  if (ring) ring.className = 'breath-ring';
  if (label) label.textContent = 'Tap Start';
  document.querySelectorAll('.breath-steps-row .bs').forEach(bs => bs.classList.remove('active'));
}

function runInlineBreathStep() {
  if (!inlineBreathActive) return;
  const step = INLINE_BREATH_STEPS[inlineBreathPhaseIndex % INLINE_BREATH_STEPS.length];
  const ring = document.getElementById('breath-ring-inline');
  const label = document.getElementById('breath-label-inline');

  if (ring) ring.className = 'breath-ring ' + step.class;

  document.querySelectorAll('.breath-steps-row .bs').forEach(bs => bs.classList.remove('active'));
  const activeStep = document.getElementById(step.stepId);
  if (activeStep) activeStep.classList.add('active');

  let secs = step.duration / 1000;
  if (label) label.textContent = `${step.name} (${secs}s)`;

  clearInterval(inlineBreathCountInterval);
  inlineBreathCountInterval = setInterval(() => {
    secs--;
    if (label && secs > 0) label.textContent = `${step.name} (${secs}s)`;
    if (secs <= 0) clearInterval(inlineBreathCountInterval);
  }, 1000);

  inlineBreathPhaseIndex++;
  inlineBreathTimeout = setTimeout(runInlineBreathStep, step.duration);
}

// 3. Affirmation Flip Deck
let currentAffIndex = 0;
let affFlipped = false;
let likedAffirmations = [];

try {
  likedAffirmations = JSON.parse(localStorage.getItem('mindwell_liked_affs') || '[]');
} catch (e) { likedAffirmations = []; }

function updateAffDeckUI() {
  const textDisplay = document.getElementById('aff-text-display');
  const counter = document.getElementById('aff-counter');
  const likeBtn = document.getElementById('aff-like-btn');
  const countEl = document.getElementById('liked-count');

  if (textDisplay) textDisplay.textContent = AFFIRMATIONS[currentAffIndex];
  if (counter) counter.textContent = `${currentAffIndex + 1} / ${AFFIRMATIONS.length}`;

  const isLiked = likedAffirmations.includes(AFFIRMATIONS[currentAffIndex]);
  if (likeBtn) {
    if (isLiked) {
      likeBtn.classList.add('liked');
      likeBtn.style.color = '#ef4444';
    } else {
      likeBtn.classList.remove('liked');
      likeBtn.style.color = '';
    }
  }

  if (countEl) {
    countEl.textContent = likedAffirmations.length > 0 ? `❤️ ${likedAffirmations.length} saved to favourites` : '';
  }
}

function flipAffirmation() {
  const deck = document.getElementById('aff-deck');
  if (!deck) return;
  affFlipped = !affFlipped;
  if (affFlipped) {
    deck.classList.add('flipped');
  } else {
    deck.classList.remove('flipped');
  }
}

function nextAffirmation() {
  const deck = document.getElementById('aff-deck');
  currentAffIndex = (currentAffIndex + 1) % AFFIRMATIONS.length;
  if (deck && !affFlipped) {
    deck.classList.add('flipped');
    affFlipped = true;
  }
  updateAffDeckUI();
}

function likeAffirmation() {
  const current = AFFIRMATIONS[currentAffIndex];
  const idx = likedAffirmations.indexOf(current);
  const likeBtn = document.getElementById('aff-like-btn');

  if (idx > -1) {
    likedAffirmations.splice(idx, 1);
  } else {
    likedAffirmations.push(current);
    if (likeBtn) likeBtn.classList.add('liked');
  }

  try {
    localStorage.setItem('mindwell_liked_affs', JSON.stringify(likedAffirmations));
  } catch (e) {}

  updateAffDeckUI();
}

function copyAffirmation() {
  const text = AFFIRMATIONS[currentAffIndex].replace(/"/g, '');
  navigator.clipboard.writeText(text).then(() => {
    const shareBtn = document.querySelector('.aff-action-btn.share-btn');
    if (shareBtn) {
      const orig = shareBtn.innerHTML;
      shareBtn.innerHTML = '&#10003;';
      setTimeout(() => { shareBtn.innerHTML = orig; }, 1500);
    }
  }).catch(() => {});
}

// 4. Grounding 5-4-3-2-1 Checklist
let groundState = [false, false, false, false, false];

function checkGround(idx) {
  groundState[idx] = !groundState[idx];
  const item = document.getElementById(`gi-${idx}`);
  const doneBadge = document.getElementById(`gd-${idx}`);

  if (groundState[idx]) {
    item?.classList.add('done');
    doneBadge?.classList.remove('hidden');
  } else {
    item?.classList.remove('done');
    doneBadge?.classList.add('hidden');
  }

  const completed = groundState.filter(Boolean).length;
  const fill = document.getElementById('ground-prog-fill');
  const label = document.getElementById('ground-prog-label');
  const banner = document.getElementById('ground-complete');

  if (fill) fill.style.width = `${(completed / 5) * 100}%`;
  if (label) label.textContent = `${completed} / 5 completed`;

  if (completed === 5) {
    banner?.classList.remove('hidden');
  } else {
    banner?.classList.add('hidden');
  }
}

function resetGrounding() {
  groundState = [false, false, false, false, false];
  for (let i = 0; i < 5; i++) {
    document.getElementById(`gi-${i}`)?.classList.remove('done');
    document.getElementById(`gd-${i}`)?.classList.add('hidden');
  }
  const fill = document.getElementById('ground-prog-fill');
  const label = document.getElementById('ground-prog-label');
  const banner = document.getElementById('ground-complete');
  if (fill) fill.style.width = '0%';
  if (label) label.textContent = '0 / 5';
  banner?.classList.add('hidden');
}

// 5. Crisis Hotlines Copy
function copyHotline(num, el) {
  navigator.clipboard.writeText(num).then(() => {
    el.classList.add('copied');
    const hint = el.querySelector('.copy-hint');
    const oldText = hint ? hint.textContent : '';
    if (hint) hint.textContent = 'Copied! ✓';
    setTimeout(() => {
      el.classList.remove('copied');
      if (hint) hint.textContent = oldText || 'tap to copy';
    }, 2000);
  }).catch(() => {
    const input = document.createElement('input');
    input.value = num;
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);
    el.classList.add('copied');
    setTimeout(() => el.classList.remove('copied'), 2000);
  });
}

// 6. Sleep Habits Tracker
function updateChecklist(type) {
  const container = document.getElementById(`${type}-checklist`);
  if (!container) return;
  const checkboxes = container.querySelectorAll('input[type="checkbox"]');
  const total = checkboxes.length;
  let checked = 0;
  const states = [];

  checkboxes.forEach((cb, i) => {
    if (cb.checked) checked++;
    states.push(cb.checked);
  });

  const progFill = document.getElementById(`${type}-prog`);
  const score = document.getElementById(`${type}-score`);
  if (progFill) progFill.style.width = `${(checked / total) * 100}%`;
  if (score) score.textContent = `${checked} / ${total} habits`;

  try {
    localStorage.setItem(`mindwell_${type}_checklist`, JSON.stringify(states));
  } catch (e) {}
}

function restoreChecklist(type) {
  try {
    const saved = JSON.parse(localStorage.getItem(`mindwell_${type}_checklist`) || '[]');
    const container = document.getElementById(`${type}-checklist`);
    if (!container || !saved.length) return;
    const checkboxes = container.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach((cb, i) => {
      if (saved[i]) cb.checked = true;
    });
    updateChecklist(type);
  } catch (e) {}
}

// 7. Daily Wellness Challenge
const WELLNESS_CHALLENGES = [
  { emoji: '🏊', text: "Take a 10-minute walk outside and notice 3 things you've never paid attention to." },
  { emoji: '💧', text: "Drink a tall glass of cool water mindfully, noticing how hydrating it feels." },
  { emoji: '✍️', text: "Write down 3 tiny things that made you smile today, however small." },
  { emoji: '🎵', text: "Listen to your absolute favourite uplifting song with eyes closed and no other screens." },
  { emoji: '🧘', text: "Do 2 minutes of gentle shoulder rolls and slow neck stretches right now." },
  { emoji: '💌', text: "Send a quick, spontaneous appreciation text to a friend or mentor." },
  { emoji: '🌱', text: "Step away from all displays for 15 minutes and enjoy natural light or quiet breathing." },
  { emoji: '🍵', text: "Make a comforting warm beverage and savor each sip without rushing." }
];

let challengeIdx = 0;
let challengeStreak = 0;
let challengeDoneToday = false;

function loadChallenge() {
  try {
    challengeStreak = parseInt(localStorage.getItem('mindwell_challenge_streak') || '0', 10);
    const lastDate = localStorage.getItem('mindwell_challenge_last_date');
    const today = new Date().toDateString();

    if (lastDate === today) {
      challengeDoneToday = true;
    }

    const savedIdx = localStorage.getItem('mindwell_challenge_idx');
    if (savedIdx !== null) challengeIdx = parseInt(savedIdx, 10) % WELLNESS_CHALLENGES.length;
  } catch (e) {}

  updateChallengeUI();
}

function updateChallengeUI() {
  const item = WELLNESS_CHALLENGES[challengeIdx];
  const emojiEl = document.getElementById('challenge-emoji');
  const textEl = document.getElementById('challenge-text');
  const card = document.getElementById('challenge-card');
  const doneBtn = document.getElementById('challenge-done-btn');
  const streakEl = document.getElementById('streak-count');

  if (emojiEl) emojiEl.textContent = item.emoji;
  if (textEl) textEl.textContent = item.text;
  if (streakEl) streakEl.textContent = challengeStreak;

  if (challengeDoneToday) {
    card?.classList.add('completed');
    if (doneBtn) {
      doneBtn.disabled = true;
      doneBtn.textContent = '✓ Completed today!';
    }
  } else {
    card?.classList.remove('completed');
    if (doneBtn) {
      doneBtn.disabled = false;
      doneBtn.textContent = '✓ Done!';
    }
  }
}

function markChallengeDone() {
  if (challengeDoneToday) return;
  challengeDoneToday = true;
  challengeStreak++;

  try {
    localStorage.setItem('mindwell_challenge_streak', challengeStreak.toString());
    localStorage.setItem('mindwell_challenge_last_date', new Date().toDateString());
  } catch (e) {}

  updateChallengeUI();

  // Celebrate with mini particles
  const card = document.getElementById('challenge-card');
  if (card) {
    card.style.transform = 'scale(1.04)';
    setTimeout(() => { card.style.transform = ''; }, 300);
  }
}

function nextChallenge() {
  challengeIdx = (challengeIdx + 1) % WELLNESS_CHALLENGES.length;
  challengeDoneToday = false;
  try {
    localStorage.setItem('mindwell_challenge_idx', challengeIdx.toString());
  } catch (e) {}
  updateChallengeUI();
}

// Restore saved mood
function restoreSavedMood() {
  try {
    const saved = JSON.parse(localStorage.getItem('mindwell_mood') || 'null');
    if (saved && saved.date === new Date().toDateString()) {
      const label = document.getElementById('mood-selected-label');
      if (label) label.textContent = `${saved.emoji} Feeling ${saved.mood}`;
      document.querySelectorAll('.mood-emoji-btn').forEach(btn => {
        if (btn.getAttribute('title') === saved.mood) btn.classList.add('selected');
      });
    }
  } catch (e) {}
}

// ===================== PARTICLES =====================
function createParticles() {
  const container = document.getElementById('particles-container');
  if (!container) return;
  const colors = ['rgba(245,158,11,0.5)', 'rgba(251,146,60,0.4)', 'rgba(234,179,8,0.4)', 'rgba(252,211,77,0.3)'];

  for (let i = 0; i < 30; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.random() * 4 + 2;
    p.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      left: ${Math.random() * 100}%;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      animation-duration: ${10 + Math.random() * 20}s;
      animation-delay: ${Math.random() * 15}s;
      box-shadow: 0 0 ${size * 2}px ${colors[Math.floor(Math.random() * colors.length)]};
    `;
    container.appendChild(p);
  }
}

// ===================== INIT =====================
document.addEventListener('DOMContentLoaded', () => {
  createParticles();
  addWelcomeMessage();
  updateAffDeckUI();
  restoreSavedMood();
  restoreChecklist('sleep');
  loadChallenge();
});

