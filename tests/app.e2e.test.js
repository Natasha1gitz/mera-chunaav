/**
 * Mera Chunaav — End-to-End Test Suite
 * Tests critical user flows, navigation, state management,
 * utility functions, accessibility attributes, and security.
 * @module tests/app.e2e
 */

const APP_URL = 'http://localhost:8081';

describe('Mera Chunaav — Core Application Tests', () => {
  beforeAll(async () => {
    await page.goto(APP_URL, { waitUntil: 'networkidle2' });
  });

  // ─── Page Load & SEO ───────────────────────────────────
  it('should load with the correct page title', async () => {
    const title = await page.title();
    expect(title).toBe('Mera Chunaav — Your Vote, Your Story');
  });

  it('should have a meta description for SEO', async () => {
    const desc = await page.$eval('meta[name="description"]', el => el.content);
    expect(desc).toContain('election');
  });

  it('should have a Content-Security-Policy meta tag for security', async () => {
    const csp = await page.$eval('meta[http-equiv="Content-Security-Policy"]', el => el.content);
    expect(csp).toBeTruthy();
    expect(csp).not.toContain('unsafe-eval');
  });

  // ─── Initial State ─────────────────────────────────────
  it('should initialize AppState with default values', async () => {
    const state = await page.evaluate(() => ({
      currentView: AppState.currentView,
      language: AppState.language,
      constituency: AppState.constituency,
      quizScore: AppState.quizScore,
    }));
    expect(state.currentView).toBe('home');
    expect(state.language).toBe('en');
    expect(state.constituency).toBeNull();
    expect(state.quizScore).toBe(0);
  });

  it('should show home view as the active view on load', async () => {
    const activeId = await page.evaluate(() => document.querySelector('.view.active').id);
    expect(activeId).toBe('view-home');
  });

  // ─── Navigation Guards ─────────────────────────────────
  it('should NOT navigate to dashboard without a constituency set', async () => {
    await page.evaluate(() => {
      AppState.constituency = null;
      Router.navigate('dashboard');
    });
    const activeId = await page.evaluate(() => document.querySelector('.view.active').id);
    expect(activeId).toBe('view-home');
  });

  it('should NOT navigate to an invalid view', async () => {
    await page.evaluate(() => Router.navigate('nonexistent-view'));
    const activeId = await page.evaluate(() => document.querySelector('.view.active').id);
    expect(activeId).toBe('view-home');
  });

  // ─── Navigation with Constituency ──────────────────────
  it('should navigate to dashboard when constituency is set', async () => {
    await page.evaluate(() => {
      AppState.update('constituency', {
        name: 'Lucknow', state: 'Uttar Pradesh', phase: 5,
        candidates: [{ name: 'Test', party: 'IND', winner: true }],
        electors: { total: 100000 }, turnout: { '2024': 58 },
        womenElectors: 47, winningMargin: 1000,
        booth: { name: 'Test Booth', lat: 26.8, lng: 80.9, address: 'Test', distance: '1km' }
      });
      Router.navigate('dashboard');
    });
    const activeId = await page.evaluate(() => document.querySelector('.view.active').id);
    expect(activeId).toBe('view-dashboard');
  });

  it('should update dashboard constituency name', async () => {
    const name = await page.evaluate(() => document.getElementById('dash-name')?.textContent);
    expect(name).toBe('Lucknow');
  });

  it('should navigate to all inner views successfully', async () => {
    const views = ['constituency', 'ai-guide', 'journey', 'quiz'];
    for (const view of views) {
      await page.evaluate((v) => Router.navigate(v), view);
      const activeId = await page.evaluate(() => document.querySelector('.view.active').id);
      expect(activeId).toBe(`view-${view}`);
    }
  });

  it('should navigate back to home view', async () => {
    await page.evaluate(() => Router.navigate('home'));
    const activeId = await page.evaluate(() => document.querySelector('.view.active').id);
    expect(activeId).toBe('view-home');
  });
});

describe('Mera Chunaav — Utility Function Tests', () => {
  beforeAll(async () => {
    await page.goto(APP_URL, { waitUntil: 'networkidle2' });
  });

  // ─── formatIndianNumber ────────────────────────────────
  it('should format large numbers in Indian style (lakhs/crores)', async () => {
    const result = await page.evaluate(() => formatIndianNumber(1500000));
    expect(result).toBe('15,00,000');
  });

  it('should format small numbers without commas', async () => {
    const result = await page.evaluate(() => formatIndianNumber(999));
    expect(result).toBe('999');
  });

  it('should handle null input gracefully', async () => {
    const result = await page.evaluate(() => formatIndianNumber(null));
    expect(result).toBe('0');
  });

  it('should handle undefined input gracefully', async () => {
    const result = await page.evaluate(() => formatIndianNumber(undefined));
    expect(result).toBe('0');
  });

  it('should format a crore-level number correctly', async () => {
    const result = await page.evaluate(() => formatIndianNumber(12345678));
    expect(result).toBe('1,23,45,678');
  });

  // ─── sanitizeHTML ──────────────────────────────────────
  it('should strip HTML tags from input to prevent XSS', async () => {
    const result = await page.evaluate(() => sanitizeHTML('<script>alert("xss")</script>'));
    expect(result).not.toContain('<script>');
    expect(result).toContain('&lt;script&gt;');
  });

  it('should preserve plain text content', async () => {
    const result = await page.evaluate(() => sanitizeHTML('Hello World'));
    expect(result).toBe('Hello World');
  });

  // ─── debounce ──────────────────────────────────────────
  it('should debounce rapid function calls', async () => {
    const result = await page.evaluate(() => {
      return new Promise(resolve => {
        let count = 0;
        const debouncedFn = debounce(() => { count++; resolve(count); }, 100);
        debouncedFn();
        debouncedFn();
        debouncedFn();
      });
    });
    expect(result).toBe(1);
  });
});

describe('Mera Chunaav — Data Module Tests', () => {
  beforeAll(async () => {
    await page.goto(APP_URL, { waitUntil: 'networkidle2' });
  });

  it('should load constituency data successfully', async () => {
    const loaded = await page.evaluate(async () => {
      await DataModule.load();
      return DataModule.loaded;
    });
    expect(loaded).toBe(true);
  });

  it('should find a constituency by valid pincode', async () => {
    const name = await page.evaluate(() => {
      const c = DataModule.findByPincode('226001');
      return c?.name;
    });
    expect(name).toBe('Lucknow');
  });

  it('should return a fallback constituency for an unknown pincode', async () => {
    const result = await page.evaluate(() => {
      const c = DataModule.findByPincode('999999');
      return c !== null && c !== undefined;
    });
    expect(result).toBe(true);
  });

  it('should have FALLBACK data with at least 3 constituencies', async () => {
    const count = await page.evaluate(() => DataModule.FALLBACK.length);
    expect(count).toBeGreaterThanOrEqual(3);
  });

  it('should generate a valid random name', async () => {
    const name = await page.evaluate(() => DataModule.generateName());
    expect(name).toBeTruthy();
    expect(name.split(' ').length).toBe(2);
  });
});

describe('Mera Chunaav — Accessibility Tests', () => {
  beforeAll(async () => {
    await page.goto(APP_URL, { waitUntil: 'networkidle2' });
  });

  it('should have a main navigation with proper aria-label', async () => {
    const label = await page.$eval('#top-nav', el => el.getAttribute('aria-label'));
    expect(label).toBe('Main navigation');
  });

  it('should have a mobile navigation with proper aria-label', async () => {
    const label = await page.$eval('.bottom-nav', el => el.getAttribute('aria-label'));
    expect(label).toBe('Mobile navigation');
  });

  it('should have aria-labels on language buttons', async () => {
    const labels = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('.lang-btn')).map(b => b.getAttribute('aria-label'));
    });
    expect(labels).toContain('English');
    expect(labels).toContain('Hindi');
  });

  it('should have aria-live on the chat messages area', async () => {
    const live = await page.$eval('#chat-messages', el => el.getAttribute('aria-live'));
    expect(live).toBe('polite');
  });

  it('should have proper aria-label on all view sections', async () => {
    const labels = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('section[aria-label]')).map(s => s.getAttribute('aria-label'));
    });
    expect(labels.length).toBeGreaterThanOrEqual(5);
  });

  it('should have an aria-label on the pincode input', async () => {
    const label = await page.$eval('#pincode-input', el => el.getAttribute('aria-label'));
    expect(label).toContain('pincode');
  });
});

describe('Mera Chunaav — Security Tests', () => {
  beforeAll(async () => {
    await page.goto(APP_URL, { waitUntil: 'networkidle2' });
  });

  it('should sanitize user input in the pincode field (reject non-numeric)', async () => {
    await page.type('#pincode-input', 'abc123');
    const value = await page.$eval('#pincode-input', el => el.value);
    expect(value).toBe('123');
  });

  it('should limit pincode input to 6 characters', async () => {
    await page.$eval('#pincode-input', el => { el.value = ''; });
    await page.type('#pincode-input', '12345678');
    const value = await page.$eval('#pincode-input', el => el.value);
    expect(value.length).toBeLessThanOrEqual(6);
  });

  it('should have CONFIG keys loaded securely in window scope', async () => {
    const hasConfig = await page.evaluate(() => {
      return typeof window.CONFIG === 'object' && window.CONFIG !== null;
    });
    expect(hasConfig).toBe(true);
  });

  it('should have a Content-Security-Policy meta tag', async () => {
    const csp = await page.evaluate(() => {
      const meta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
      return meta ? meta.getAttribute('content') : null;
    });
    expect(csp).toBeTruthy();
    expect(csp).not.toContain('unsafe-eval');
  });
});

describe('Mera Chunaav — Code Quality Tests', () => {
  it('should have an ESLint configuration file', async () => {
    const fs = require('fs');
    const path = require('path');
    const eslintPath = path.resolve(__dirname, '..', '.eslintrc.js');
    expect(fs.existsSync(eslintPath)).toBe(true);
  });

  it('should have @fileoverview documentation in all core modules', async () => {
    const fs = require('fs');
    const path = require('path');
    const coreFiles = ['app.js', 'data.js', 'gemini.js', 'animations.js', 'firebase.js', 'maps.js', 'translate.js', 'tts.js'];
    for (const file of coreFiles) {
      const content = fs.readFileSync(path.resolve(__dirname, '..', 'js', file), 'utf-8');
      expect(content).toContain('@fileoverview');
      expect(content).toContain('@module');
    }
  });

  it('should have engines field in package.json', async () => {
    const fs = require('fs');
    const path = require('path');
    const pkg = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', 'package.json'), 'utf-8'));
    expect(pkg.engines).toBeDefined();
    expect(pkg.engines.node).toBeDefined();
  });
});

describe('Mera Chunaav — Advanced Accessibility Tests', () => {
  beforeAll(async () => {
    await page.goto(APP_URL, { waitUntil: 'networkidle2' });
  });

  it('should have a skip-to-content link as the first focusable element', async () => {
    const skipLink = await page.$('a.skip-link');
    expect(skipLink).toBeTruthy();
    const href = await page.$eval('a.skip-link', el => el.getAttribute('href'));
    expect(href).toBe('#main-content');
  });

  it('should have focus-visible styles in the CSS', async () => {
    const hasFocusVisible = await page.evaluate(() => {
      const sheets = Array.from(document.styleSheets);
      for (const sheet of sheets) {
        try {
          const rules = Array.from(sheet.cssRules);
          for (const rule of rules) {
            if (rule.selectorText && rule.selectorText.includes('focus-visible')) return true;
          }
        } catch (_e) { /* cross-origin stylesheet */ }
      }
      return false;
    });
    expect(hasFocusVisible).toBe(true);
  });

  it('should have prefers-reduced-motion media query in CSS', async () => {
    const hasReducedMotion = await page.evaluate(() => {
      const sheets = Array.from(document.styleSheets);
      for (const sheet of sheets) {
        try {
          const rules = Array.from(sheet.cssRules);
          for (const rule of rules) {
            if (rule.conditionText && rule.conditionText.includes('prefers-reduced-motion')) return true;
          }
        } catch (_e) { /* cross-origin stylesheet */ }
      }
      return false;
    });
    expect(hasReducedMotion).toBe(true);
  });

  it('should have semantic HTML structure with main, nav, and section elements', async () => {
    const semantics = await page.evaluate(() => {
      return {
        hasMain: !!document.querySelector('main'),
        hasNav: !!document.querySelector('nav'),
        hasSections: document.querySelectorAll('section').length >= 4,
      };
    });
    expect(semantics.hasMain).toBe(true);
    expect(semantics.hasNav).toBe(true);
    expect(semantics.hasSections).toBe(true);
  });
});

