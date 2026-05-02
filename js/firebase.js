/**
 * @fileoverview Firebase integration module for anonymous authentication,
 * Firestore constituency lookups, and quiz score persistence.
 * Falls back to offline mode when Firebase SDK is unavailable.
 * @module firebase
 */

// ============================================
// Mera Chunaav — Firebase Module
// ============================================

/**
 * Firebase integration module for authentication and Firestore data persistence.
 * Handles anonymous auth, constituency lookups, and quiz score storage.
 * @namespace FirebaseModule
 */
const FirebaseModule = {
  db: null,
  auth: null,
  userId: null,

  /**
   * Initializes the Firebase app, Firestore database, and anonymous authentication.
   * Falls back to offline mode if the SDK or configuration is unavailable.
   * @returns {Promise<void>}
   */
  async init() {
    if (typeof firebase === 'undefined') {
      console.warn('Firebase SDK not loaded — running in offline mode');
      return;
    }

    const config = window.CONFIG?.FIREBASE;
    if (!config || config.apiKey === 'YOUR_FIREBASE_API_KEY') {
      console.warn('Firebase not configured — running in offline mode');
      return;
    }

    try {
      if (!firebase.apps.length) firebase.initializeApp(config);
      this.db = firebase.firestore();
      this.auth = firebase.auth();

      // Anonymous auth
      const user = await this.auth.signInAnonymously();
      this.userId = user.user.uid;
      AppState.update('userId', this.userId);
    } catch (err) {
      console.error('Firebase init error:', err);
    }
  },

  /**
   * Retrieves a constituency document from Firestore by name.
   * @param {string} name - The constituency name to search for.
   * @returns {Promise<Object|null>} The constituency data or null if not found.
   */
  async getConstituency(name) {
    if (!this.db) return null;
    try {
      const snap = await this.db.collection('constituencies').where('name', '==', name).limit(1).get();
      return snap.empty ? null : snap.docs[0].data();
    } catch (err) {
      console.warn('Firestore constituency lookup failed:', err);
      return null;
    }
  },

  /**
   * Persists the user's civic quiz score and progress to Firestore.
   * @param {number} score - The total score achieved.
   * @param {number} total - The total possible score.
   * @returns {Promise<void>}
   */
  async saveQuizScore(score, total) {
    if (!this.db || !this.userId) return;
    try {
      await this.db.collection('users').doc(this.userId).set({
        quizScore: score,
        quizTotal: total,
        constituency: AppState.constituency?.name,
        persona: AppState.persona,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
    } catch (err) {
      console.error('Save score error:', err);
    }
  }
};
