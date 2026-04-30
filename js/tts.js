// ============================================
// Mera Chunaav — Text-to-Speech Module
// ============================================

/**
 * Text-to-Speech module using the Google Cloud TTS API.
 * Falls back to the browser's native SpeechSynthesis API when no key is configured.
 * Selects premium Wavenet voices based on the user's language preference.
 * @namespace TtsModule
 */
const TtsModule = {
  audioContext: null,
  speaking: false,

  getContext() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    return this.audioContext;
  },

  /**
   * Speaks the given text aloud using Google Cloud TTS or browser fallback.
   * @param {string} text - The text content to synthesize into speech.
   * @returns {Promise<void>}
   */
  async speak(text) {
    if (this.speaking) return;

    // Strip HTML tags
    text = text.replace(/<[^>]*>/g, '');

    const apiKey = window.CONFIG?.TTS_API_KEY;
    if (!apiKey || apiKey === 'YOUR_TTS_API_KEY') {
      // Fallback to browser TTS
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = AppState.language === 'hi' ? 'hi-IN' : 'en-IN';
      utterance.rate = 0.9;
      speechSynthesis.speak(utterance);
      return;
    }

    this.speaking = true;
    try {
      const voice = AppState.language === 'hi' ? 'hi-IN-Wavenet-A' : 'en-IN-Wavenet-C';
      const langCode = AppState.language === 'hi' ? 'hi-IN' : 'en-IN';

      const resp = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: { text },
          voice: { languageCode: langCode, name: voice },
          audioConfig: { audioEncoding: 'MP3', speakingRate: 0.95 }
        })
      });

      const data = await resp.json();
      if (data.audioContent) {
        const audioData = atob(data.audioContent);
        const arrayBuffer = new ArrayBuffer(audioData.length);
        const view = new Uint8Array(arrayBuffer);
        for (let i = 0; i < audioData.length; i++) view[i] = audioData.charCodeAt(i);

        const ctx = this.getContext();
        const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(ctx.destination);
        source.start();
        source.onended = () => { this.speaking = false; };
      }
    } catch (err) {
      console.error('TTS error:', err);
      this.speaking = false;
    }
  }
};
