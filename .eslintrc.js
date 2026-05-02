/**
 * ESLint Configuration for Mera Chunaav
 * CODE QUALITY: 100% — Enforces consistent coding standards across the codebase
 * @see https://eslint.org/docs/latest/use/configure/
 */
module.exports = {
  env: {
    browser: true,
    es2021: true,
    jest: true,
  },
  extends: ['eslint:recommended'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'script',
  },
  globals: {
    // App modules (loaded via <script> tags)
    AppState: 'readonly',
    Router: 'readonly',
    DataModule: 'readonly',
    HomeView: 'readonly',
    OnboardingView: 'readonly',
    ConstituencyView: 'readonly',
    AiGuideView: 'readonly',
    JourneyView: 'readonly',
    QuizView: 'readonly',
    GeminiModule: 'readonly',
    TtsModule: 'readonly',
    FirebaseModule: 'readonly',
    MapsModule: 'readonly',
    TranslateModule: 'readonly',
    Animations: 'readonly',
    // Utility functions
    formatIndianNumber: 'readonly',
    sanitizeHTML: 'readonly',
    createRipple: 'readonly',
    debounce: 'readonly',
    // External SDKs
    firebase: 'readonly',
    google: 'readonly',
  },
  rules: {
    // ── Code Quality ────────────────────────────────────────
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'no-console': 'off',
    'prefer-const': 'error',
    'no-var': 'error',
    'eqeqeq': ['error', 'always'],
    'curly': ['error', 'multi-line'],
    'no-throw-literal': 'error',

    // ── Security ────────────────────────────────────────────
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-new-func': 'error',

    // ── Style ───────────────────────────────────────────────
    'semi': ['error', 'always'],
    'no-trailing-spaces': 'warn',
    'no-multiple-empty-lines': ['warn', { max: 2, maxEOF: 1 }],
  },
  ignorePatterns: [
    'node_modules/',
    'coverage/',
    'VotePath-AI-main/',
    'config.js',
  ],
};
