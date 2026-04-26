// ============================================
// Mera Chunaav — Firebase Module
// ============================================

const FirebaseModule = {
  db: null,
  auth: null,
  userId: null,

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

  async getConstituency(name) {
    if (!this.db) return null;
    try {
      const snap = await this.db.collection('constituencies').where('name', '==', name).limit(1).get();
      return snap.empty ? null : snap.docs[0].data();
    } catch { return null; }
  },

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
