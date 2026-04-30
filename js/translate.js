// ============================================
// Mera Chunaav — Cloud Translation Module
// Translates key UI elements using Google Translate API.
// Caches results in memory and sessionStorage to avoid repeat calls.
// ============================================

/**
 * Cloud Translation module for dynamic UI localization.
 * Uses the Google Translate API to translate key UI elements
 * and caches results in memory and sessionStorage.
 * @namespace TranslateModule
 */
const TranslateModule = {
  cache: {},

  /**
   * Initializes language toggle buttons and binds click handlers.
   */
  init() {
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const lang = btn.dataset.lang;
        this.switchLanguage(lang);
        document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });
  },

  /**
   * Switches the application language by translating all key UI text elements.
   * Restores original English text when switching back to 'en'.
   * @param {string} lang - The target language code (e.g., 'hi', 'ta', 'bn').
   * @returns {Promise<void>}
   */
  async switchLanguage(lang) {
    AppState.update('language', lang);

    if (lang === 'en') {
      document.querySelectorAll('[data-original-text]').forEach(el => {
        el.textContent = el.dataset.originalText;
      });
      return;
    }

    const apiKey = window.CONFIG?.TRANSLATE_API_KEY;
    if (!apiKey) return;

    const elements = document.querySelectorAll(
      '.sidebar__constituency, .nav-link__label, .section-header__title, .metric-card__label, h1, h2, h3'
    );

    for (const el of elements) {
      if (!el.dataset.originalText) el.dataset.originalText = el.textContent;
      const text = el.dataset.originalText.trim();
      if (!text) continue;

      const cacheKey = `${lang}:${text}`;

      if (this.cache[cacheKey]) {
        el.textContent = this.cache[cacheKey];
        continue;
      }

      const stored = sessionStorage.getItem(cacheKey);
      if (stored) {
        el.textContent = stored;
        this.cache[cacheKey] = stored;
        continue;
      }

      try {
        const resp = await fetch(
          `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ q: text, target: lang, source: 'en' })
          }
        );
        const data = await resp.json();
        const translated = data.data?.translations?.[0]?.translatedText || text;
        el.textContent = translated;
        this.cache[cacheKey] = translated;
        sessionStorage.setItem(cacheKey, translated);
      } catch (err) {
        console.warn('Translation failed for text:', text, err);
        // Keep original text on failure
      }
    }
  }
};
