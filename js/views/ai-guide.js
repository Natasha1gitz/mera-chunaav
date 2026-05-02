/**
 * @fileoverview AI Guide view controller for the Gemini-powered chat interface.
 * Manages persona-aware quick topics, streaming chat responses, voice input
 * via Web Speech API, TTS read-aloud, and graceful offline fallback.
 * @module views/ai-guide
 */

// ============================================
// Mera Chunaav — AI Guide View
// Persona-aware quick topics, streaming Gemini chat,
// voice input, TTS read-aloud, and graceful fallback.
// ============================================

/**
 * AI Guide view controller.
 * Manages persona-aware quick topics, Gemini streaming chat, voice input,
 * TTS read-aloud, and graceful offline fallback.
 * @namespace AiGuideView
 */
const AiGuideView = {
  initialized: false,
  isStreaming: false,
  lastRequestTime: 0,
  currentAiBubble: null,

  PERSONA_TOPICS: {
    'First-time Voter': [
      'How do I check my name on the voter list?',
      'What documents do I bring to the booth?',
      'What is NOTA and should I use it?',
      'How does the EVM machine work?',
      'Can I vote if I moved cities recently?'
    ],
    'NRI / Overseas': [
      'Can NRIs vote in Indian elections?',
      'What is the overseas voter registration process?',
      'Do I need to be physically present to vote?',
      'What is e-postal ballot for service voters?'
    ],
    'Divyang / PwD': [
      'What accessibility features are at polling booths?',
      'Can someone help me vote at the booth?',
      'Is there a priority queue for PwD voters?',
      'What is the Braille ballot facility?'
    ],
    'Rural Voter': [
      'How far is my nearest polling booth?',
      'Is there transport facility on election day?',
      'What if my name is not on the voter list?',
      'How to apply for voter ID card?'
    ],
    'Senior Citizen': [
      'Is there a priority queue for senior citizens?',
      'Can I vote from home if I cannot travel?',
      'What is postal ballot for seniors above 80?',
      'How to update my voter ID address?'
    ],
    'Women Voter': [
      'Are there women-only polling booths?',
      'What safety measures exist at booths?',
      'How has women voter turnout changed?',
      'What is the pink booth initiative?'
    ],
    'Student / Youth': [
      'At what age can I register to vote?',
      'How to register as a first-time voter?',
      'Can I vote at my college location?',
      'What is the significance of voter turnout?'
    ],
    'Researcher': [
      'Explain the nomination filing rules',
      'What is Model Code of Conduct?',
      'How are EVM votes counted?',
      'What is the role of Election Commission?',
      'Explain the delimitation process'
    ]
  },

  /**
   * Initializes the AI Guide view by rendering topics and setting up input handlers.
   */
  init() {
    if (this.initialized) return;
    this.renderTopics();
    this.setupInput();
    this.initialized = true;
  },

  /**
   * Renders persona-aware quick topic chips in the sidebar.
   */
  renderTopics() {
    const container = document.getElementById('ai-topics');
    if (!container) return;

    const persona = AppState.persona || 'First-time Voter';
    const topics = this.PERSONA_TOPICS[persona] || this.PERSONA_TOPICS['First-time Voter'];

    container.innerHTML = `
      <div class="ai-guide__topics-title">Quick Questions</div>
      ${topics.map(t => `<button class="topic-chip" aria-label="${t}">${t}</button>`).join('')}
    `;

    container.querySelectorAll('.topic-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const input = document.getElementById('chat-input');
        if (input) {
          input.value = '';
          Animations.typewriter(input, chip.textContent, 25).then(() => {
            this.sendMessage(chip.textContent);
          });
        }
      });
    });
  },

  /**
   * Sets up the chat input field, send button, and microphone button event listeners.
   */
  setupInput() {
    const input = document.getElementById('chat-input');
    const sendBtn = document.getElementById('chat-send');
    const micBtn = document.getElementById('chat-mic');

    if (input) {
      input.addEventListener('input', () => {
        input.style.height = 'auto';
        input.style.height = Math.min(input.scrollHeight, 160) + 'px';
      });
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.sendMessage(input.value);
        }
      });
    }

    if (sendBtn) {
      sendBtn.addEventListener('click', () => {
        if (input) this.sendMessage(input.value);
      });
    }

    if (micBtn && 'webkitSpeechRecognition' in window) {
      micBtn.addEventListener('click', () => this.startVoiceInput());
    } else if (micBtn) {
      micBtn.style.display = 'none';
    }
  },

  /**
   * Sends a user message to the Gemini AI and handles streaming response.
   * Implements rate limiting and graceful fallback to demo responses.
   * @param {string} text - The user's message text.
   * @returns {Promise<void>}
   */
  async sendMessage(text) {
    text = text.trim();
    if (!text || this.isStreaming) return;

    const now = Date.now();
    if (now - this.lastRequestTime < (window.CONFIG?.GEMINI_RATE_LIMIT_MS || 2000)) return;
    this.lastRequestTime = now;

    const input = document.getElementById('chat-input');
    if (input) { input.value = ''; input.style.height = 'auto'; }

    this.addMessage(sanitizeHTML(text), 'user');
    AppState.conversationHistory.push({ role: 'user', parts: [{ text }] });
    this.showTyping();

    try {
      this.isStreaming = true;
      if (typeof GeminiModule !== 'undefined' && window.CONFIG?.GEMINI_API_KEY) {
        await GeminiModule.streamChat(text);
      } else {
        await this.demoResponse(text);
      }
    } catch (err) {
      console.warn('AI chat error, falling back to demo:', err.message);
      this.hideTyping();
      if (this.currentAiBubble) {
        this.currentAiBubble.remove();
        this.currentAiBubble = null;
      }
      // Graceful fallback to demo response
      try {
        await this.demoResponse(text);
      } catch (fallbackErr) {
        console.warn('Demo fallback also failed:', fallbackErr.message);
        this.addMessage('Sorry, the AI service is currently unavailable. Please try again later.', 'ai');
      }
    } finally {
      this.isStreaming = false;
    }
  },

  /**
   * Appends a chat bubble to the message area.
   * @param {string} text - The message HTML content.
   * @param {string} role - Either 'user' or 'ai'.
   * @returns {HTMLElement} The created bubble element.
   */
  addMessage(text, role) {
    const area = document.getElementById('chat-messages');
    if (!area) return;

    area.querySelector('.chat-area__welcome')?.remove();

    const bubble = document.createElement('div');
    bubble.className = `chat-bubble chat-bubble--${role}`;

    const textContainer = document.createElement('div');
    textContainer.className = 'chat-bubble__text';
    textContainer.innerHTML = text;
    bubble.appendChild(textContainer);

    if (role === 'ai') {
      const speaker = document.createElement('button');
      speaker.className = 'chat-bubble__speaker';
      speaker.innerHTML = '🔊';
      speaker.setAttribute('aria-label', 'Read aloud');
      speaker.addEventListener('click', () => {
        if (typeof TtsModule !== 'undefined') {
          TtsModule.speak(textContainer.textContent);
        } else {
          const utterance = new SpeechSynthesisUtterance(textContainer.textContent);
          utterance.lang = AppState.language === 'hi' ? 'hi-IN' : 'en-IN';
          speechSynthesis.speak(utterance);
        }
      });
      bubble.appendChild(speaker);
    }

    area.appendChild(bubble);
    area.scrollTop = area.scrollHeight;

    if (role === 'ai') setTimeout(() => Animations.shimmerSweep(bubble), 100);

    return bubble;
  },

  /**
   * Handles a streaming token from the Gemini API, appending it to the current AI bubble.
   * @param {string} token - A partial text token from the SSE stream.
   */
  onStreamToken(token) {
    this.hideTyping();
    if (!this.currentAiBubble) {
      this.currentAiBubble = this.addMessage('', 'ai');
    }
    this.currentAiBubble.querySelector('.chat-bubble__text').textContent += token;
    const area = document.getElementById('chat-messages');
    if (area) area.scrollTop = area.scrollHeight;
  },

  /**
   * Finalizes the streamed response by rendering markdown formatting and saving to history.
   */
  onStreamEnd() {
    if (!this.currentAiBubble) return;
    const textContainer = this.currentAiBubble.querySelector('.chat-bubble__text');
    const rawText = textContainer.textContent;

    // Render basic markdown: **bold**, *italic*, bullet lists
    textContainer.innerHTML = rawText
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n\* (.*?)(?=\n|$)/g, '\n• $1');

    AppState.conversationHistory.push({ role: 'model', parts: [{ text: rawText }] });
    Animations.shimmerSweep(this.currentAiBubble);
    this.currentAiBubble = null;
  },

  /**
   * Shows a typing indicator animation in the chat area.
   */
  showTyping() {
    const area = document.getElementById('chat-messages');
    if (!area || area.querySelector('.typing-indicator')) return;
    const ind = document.createElement('div');
    ind.className = 'typing-indicator';
    ind.innerHTML = '<span></span><span></span><span></span>';
    area.appendChild(ind);
    area.scrollTop = area.scrollHeight;
  },

  /**
   * Removes the typing indicator from the chat area.
   */
  hideTyping() {
    document.querySelector('.typing-indicator')?.remove();
  },

  /**
   * Generates a demo response when the Gemini API is unavailable.
   * Simulates streaming by typing characters one at a time.
   * @param {string} question - The user's original question.
   * @returns {Promise<void>}
   */
  async demoResponse(question) {
    const c = AppState.constituency;
    const response = `Based on data from ${c?.name || 'your constituency'} in ${c?.state || 'your state'}, let me help you with that.\n\nThe constituency has ${c ? formatIndianNumber(c.electors.total) : 'many'} registered voters with a turnout of ${c?.turnout['2024'] || '58'}% in the 2024 general elections.\n\nIs there anything specific about the election process you'd like to know?`;

    this.hideTyping();
    this.currentAiBubble = this.addMessage('', 'ai');
    const textContainer = this.currentAiBubble.querySelector('.chat-bubble__text');
    const area = document.getElementById('chat-messages');

    for (const char of response) {
      textContainer.textContent += char;
      if (area) area.scrollTop = area.scrollHeight;
      await new Promise(r => setTimeout(r, 15));
    }
    this.onStreamEnd();
  },

  /**
   * Starts voice input using the Web Speech API (webkit).
   * Sets the recognized transcript as the chat input value.
   */
  startVoiceInput() {
    const recognition = new webkitSpeechRecognition();
    recognition.lang = AppState.language === 'hi' ? 'hi-IN' : 'en-IN';
    recognition.interimResults = false;

    const micBtn = document.getElementById('chat-mic');
    if (micBtn) micBtn.style.color = 'var(--danger)';

    recognition.onresult = (e) => {
      const input = document.getElementById('chat-input');
      if (input) input.value = e.results[0][0].transcript;
      if (micBtn) micBtn.style.color = '';
    };
    recognition.onerror = () => { if (micBtn) micBtn.style.color = ''; };
    recognition.onend  = () => { if (micBtn) micBtn.style.color = ''; };
    recognition.start();
  }
};
