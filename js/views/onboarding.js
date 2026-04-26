// ============================================
// Mera Chunaav — Onboarding (Inline Pincode)
// Pincode entry lives inside the homepage now
// ============================================

const OnboardingView = {
  init() {
    this.setupPincodeInput();
    this.setupDashboardEntry();
  },

  setupPincodeInput() {
    const input = document.getElementById('pincode-input');
    if (!input) return;

    input.addEventListener('input', (e) => {
      e.target.value = e.target.value.replace(/\D/g, '').slice(0, 6);
      const len = e.target.value.length;

      if (len > 0) {
        input.classList.remove('digit-pop');
        void input.offsetWidth;
        input.classList.add('digit-pop');
      }

      if (len === 6) {
        setTimeout(() => this.onPincodeComplete(e.target.value), 400);
      }
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && input.value.length === 6) {
        this.onPincodeComplete(input.value);
      }
    });
  },

  async onPincodeComplete(pincode) {
    if (!DataModule.loaded) {
      await DataModule.load();
    }

    const constituency = DataModule.findByPincode(pincode);
    AppState.update('constituency', constituency);

    // Show inline reveal
    this.showReveal(constituency);
  },

  showReveal(constituency) {
    const pincodeStep = document.getElementById('pincode-step');
    const reveal = document.getElementById('home-reveal');

    // Fade out pincode input
    if (pincodeStep) {
      pincodeStep.style.transition = 'opacity 300ms ease, transform 300ms ease';
      pincodeStep.style.opacity = '0';
      pincodeStep.style.transform = 'translateY(-10px)';
      setTimeout(() => pincodeStep.style.display = 'none', 300);
    }

    // Show reveal card
    setTimeout(() => {
      if (reveal) reveal.classList.add('active');

      const nameEl = document.getElementById('reveal-name');
      const stateEl = document.getElementById('reveal-state');
      const votersEl = document.getElementById('reveal-voters');
      const turnoutEl = document.getElementById('reveal-turnout');
      const phaseEl = document.getElementById('reveal-phase');

      if (nameEl) nameEl.textContent = constituency.name;
      if (stateEl) stateEl.textContent = constituency.state;
      if (votersEl && typeof Animations !== 'undefined') {
        Animations.countUp(votersEl, constituency.electors.total, 1200);
      }
      if (turnoutEl) turnoutEl.textContent = constituency.turnout['2024'] + '%';
      if (phaseEl) phaseEl.textContent = 'Phase ' + constituency.phase;
    }, 350);
  },

  setupDashboardEntry() {
    const enterBtn = document.getElementById('enter-dashboard-btn');
    if (!enterBtn) return;

    enterBtn.addEventListener('click', () => {
      if (!AppState.constituency) return;
      // Default persona
      AppState.update('persona', 'General Voter');
      Router.navigate('dashboard');
    });
  }
};
