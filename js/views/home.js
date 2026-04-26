// ============================================
// Mera Chunaav — Homepage Scroll Animation
// Two-phase transformation scroll:
//   Phase 1: Person silhouette → Inked finger
//   Phase 2: Inked finger → India map
// ============================================

const HomeView = {
  canvas: null,
  ctx: null,
  scrollProgress: 0,
  animFrameId: null,
  initialized: false,
  currentStage: 0,
  phase1Images: [],
  phase2Images: [],
  phase1Loaded: 0,
  phase2Loaded: 0,
  lastFrameIndex: -1,
  displayProgress: 0, // smoothed scroll for fluid motion

  // Phase 1: Person → Finger (sorted by frame number)
  PHASE1_FRAMES: [
    "Silhouette_transforming_into_202604270018_000.jpg",
    "Silhouette_transforming_into_202604270018_004.jpg",
    "Silhouette_transforming_into_202604270018_010.jpg",
    "Silhouette_transforming_into_202604270018_014.jpg",
    "Silhouette_transforming_into_202604270018_016.jpg",
    "Silhouette_transforming_into_202604270018_018.jpg",
    "Silhouette_transforming_into_202604270018_020.jpg",
    "Silhouette_transforming_into_202604270018_024.jpg",
    "Silhouette_transforming_into_202604270018_026.jpg",
    "Silhouette_transforming_into_202604270018_028.jpg",
    "Silhouette_transforming_into_202604270018_030.jpg",
    "Silhouette_transforming_into_202604270018_032.jpg",
    "Silhouette_transforming_into_202604270018_034.jpg",
    "Silhouette_transforming_into_202604270018_036.jpg",
    "Silhouette_transforming_into_202604270018_038.jpg",
    "Silhouette_transforming_into_202604270018_041.jpg",
    "Silhouette_transforming_into_202604270018_042.jpg",
    "Silhouette_transforming_into_202604270018_044.jpg",
    "Silhouette_transforming_into_202604270018_046.jpg",
    "Silhouette_transforming_into_202604270018_048.jpg",
    "Silhouette_transforming_into_202604270018_050.jpg",
    "Silhouette_transforming_into_202604270018_052.jpg",
    "Silhouette_transforming_into_202604270018_054.jpg",
    "Silhouette_transforming_into_202604270018_056.jpg",
    "Silhouette_transforming_into_202604270018_058.jpg",
    "Silhouette_transforming_into_202604270018_062.jpg",
    "Silhouette_transforming_into_202604270018_064.jpg",
    "Silhouette_transforming_into_202604270018_066.jpg",
    "Silhouette_transforming_into_202604270018_068.jpg",
    "Silhouette_transforming_into_202604270018_076.jpg",
    "Silhouette_transforming_into_202604270018_079.jpg"
  ],

  // Phase 2: Finger → India map (sorted by frame number)
  PHASE2_FRAMES: [
    "Finger_transforms_into_202604270019_001.jpg",
    "Finger_transforms_into_202604270019_003.jpg",
    "Finger_transforms_into_202604270019_007.jpg",
    "Finger_transforms_into_202604270019_009.jpg",
    "Finger_transforms_into_202604270019_011.jpg",
    "Finger_transforms_into_202604270019_013.jpg",
    "Finger_transforms_into_202604270019_015.jpg",
    "Finger_transforms_into_202604270019_019.jpg",
    "Finger_transforms_into_202604270019_021.jpg",
    "Finger_transforms_into_202604270019_023.jpg",
    "Finger_transforms_into_202604270019_027.jpg",
    "Finger_transforms_into_202604270019_029.jpg",
    "Finger_transforms_into_202604270019_033.jpg",
    "Finger_transforms_into_202604270019_035.jpg",
    "Finger_transforms_into_202604270019_039.jpg",
    "Finger_transforms_into_202604270019_041.jpg",
    "Finger_transforms_into_202604270019_043.jpg",
    "Finger_transforms_into_202604270019_047.jpg",
    "Finger_transforms_into_202604270019_051.jpg",
    "Finger_transforms_into_202604270019_053.jpg",
    "Finger_transforms_into_202604270019_055.jpg",
    "Finger_transforms_into_202604270019_059.jpg",
    "Finger_transforms_into_202604270019_061.jpg",
    "Finger_transforms_into_202604270019_063.jpg",
    "Finger_transforms_into_202604270019_065.jpg",
    "Finger_transforms_into_202604270019_067.jpg",
    "Finger_transforms_into_202604270019_071.jpg",
    "Finger_transforms_into_202604270019_075.jpg",
    "Finger_transforms_into_202604270019_077.jpg",
    "Finger_transforms_into_202604270019_079.jpg"
  ],

  init() {
    if (this.initialized) return;
    this.canvas = document.getElementById('home-canvas');
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.resize();
    this.loadImages();
    this.bindScroll();
    this.animate();
    this.initialized = true;

    window.addEventListener('resize', () => this.resize());
  },

  loadImages() {
    this.phase1Images = [];
    this.phase2Images = [];
    this.phase1Loaded = 0;
    this.phase2Loaded = 0;

    const baseUrl = 'https://firebasestorage.googleapis.com/v0/b/mera-chunaav.firebasestorage.app/o/home-animation%2F';

    // Phase 1: person to finger
    this.PHASE1_FRAMES.forEach((filename) => {
      const img = new Image();
      img.src = `${baseUrl}${filename}?alt=media`;
      img.onload = () => { this.phase1Loaded++; };
      this.phase1Images.push(img);
    });

    // Phase 2: finger to India
    this.PHASE2_FRAMES.forEach((filename) => {
      const img = new Image();
      img.src = `${baseUrl}${filename}?alt=media`;
      img.onload = () => { this.phase2Loaded++; };
      this.phase2Images.push(img);
    });
  },

  resize() {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(dpr, dpr);
    this.canvasW = rect.width;
    this.canvasH = rect.height;
  },

  bindScroll() {
    window.addEventListener('scroll', () => {
      const canvasSection = document.querySelector('.home__canvas-section');
      if (!canvasSection) return;

      const rect = canvasSection.getBoundingClientRect();
      const totalScroll = canvasSection.scrollHeight - window.innerHeight;
      const scrolled = -rect.top;
      this.scrollProgress = Math.max(0, Math.min(1, scrolled / totalScroll));

      // 5 stages: 0=Bharat, 1=You, 2=Choice, 3=Ink, 4=Nation
      this.currentStage = Math.min(4, Math.floor(this.scrollProgress * 5));

      // Update progress dots
      document.querySelectorAll('.home__progress-dot').forEach((dot, i) => {
        dot.classList.toggle('active', i <= this.currentStage);
      });

      this.updateTextOverlays();
    }, { passive: true });
  },

  updateTextOverlays() {
    const titles = document.querySelectorAll('.home__stage-title');
    const subtitles = document.querySelectorAll('.home__stage-subtitle');
    const cta = document.querySelector('.home__cta');
    const scrollHint = document.querySelector('.home__scroll-hint');

    titles.forEach((t) => {
      const stage = parseInt(t.dataset.stage);
      t.classList.toggle('visible', stage === this.currentStage);
    });
    subtitles.forEach((s) => {
      const stage = parseInt(s.dataset.stage);
      s.classList.toggle('visible', stage === this.currentStage);
    });

    if (cta) cta.classList.toggle('visible', this.currentStage === 4 && this.scrollProgress > 0.88);
    if (scrollHint) scrollHint.style.opacity = this.scrollProgress < 0.03 ? '0.5' : '0';
  },

  getBgColor(img) {
    // Hardcoded exact match requested by user to avoid compression artifact issues
    this.bgColor = 'rgb(245, 239, 235)';
    
    // Also update CSS variable or background color for smooth transitions if needed
    const canvasSection = document.querySelector('.home__canvas-section');
    if (canvasSection) canvasSection.style.backgroundColor = this.bgColor;
    
    // Automatically apply this image's background to the entire site so there are no borders
    document.documentElement.style.setProperty('--surface', this.bgColor);
    document.documentElement.style.setProperty('--surface-bright', this.bgColor);
    
    return this.bgColor;
  },

  /**
   * Draw image stretched horizontally to full width, but keep current calculated height
   */
  drawImageContain(img) {
    const ctx = this.ctx;
    const w = this.canvasW;
    const h = this.canvasH;

    // First calculate what the original height was supposed to be (with padding)
    const pad = Math.min(w, h) * 0.02;
    const availW = w - pad * 2;
    const availH = h - pad * 2;

    const imgRatio = img.width / img.height;
    const availRatio = availW / availH;

    let originalDrawH;

    if (imgRatio > availRatio) {
      // Image is wider than available area
      originalDrawH = availW / imgRatio;
    } else {
      // Image is taller than available area
      originalDrawH = availH;
    }

    // Stretch width to full screen width (w), keep the height the same
    const drawW = w;
    const drawH = originalDrawH;
    
    // Draw starting from 0 (left edge) and center vertically
    const drawX = 0;
    const drawY = (h - drawH) / 2;

    ctx.drawImage(img, drawX, drawY, drawW, drawH);
  },

  animate() {
    this.animFrameId = requestAnimationFrame(() => this.animate());
    const ctx = this.ctx;
    const w = this.canvasW;
    const h = this.canvasH;
    if (!w || !h) return;

    // Smooth the displayed progress for fluid motion
    const lerpSpeed = 0.12;
    this.displayProgress += (this.scrollProgress - this.displayProgress) * lerpSpeed;

    // Background matches image bg color exactly (dynamically extracted)
    ctx.fillStyle = this.phase1Images[0] ? this.getBgColor(this.phase1Images[0]) : '#f0ebe4';
    ctx.fillRect(0, 0, w, h);

    const totalPhase1 = this.phase1Images.length;
    const totalPhase2 = this.phase2Images.length;

    if (totalPhase1 === 0 && totalPhase2 === 0) return;

    // Split scroll: first 50% = phase1, second 50% = phase2
    const p = this.displayProgress;

    if (p <= 0.5) {
      // Phase 1: Person → Finger
      if (this.phase1Loaded === 0) return;
      const phaseProgress = p / 0.5; // 0 → 1 within phase1
      const frameIndex = Math.min(
        totalPhase1 - 1,
        Math.floor(phaseProgress * totalPhase1)
      );
      const nextIndex = Math.min(totalPhase1 - 1, frameIndex + 1);

      const img = this.phase1Images[frameIndex];
      const nextImg = this.phase1Images[nextIndex];

      if (img && img.complete) {
        this.drawImageContain(img);

        // Cross-fade to next frame for smoothness
        if (nextImg && nextImg.complete && frameIndex !== nextIndex) {
          const frameFrac = (phaseProgress * totalPhase1) - frameIndex;
          ctx.globalAlpha = frameFrac;
          this.drawImageContain(nextImg);
          ctx.globalAlpha = 1;
        }
      }
    } else if (p <= 0.52) {
      // Crossfade zone between phase 1 last frame and phase 2 first frame
      const crossFade = (p - 0.5) / 0.02;
      const lastP1 = this.phase1Images[totalPhase1 - 1];
      const firstP2 = this.phase2Images[0];

      if (lastP1 && lastP1.complete) {
        ctx.globalAlpha = 1 - crossFade;
        this.drawImageContain(lastP1);
      }
      if (firstP2 && firstP2.complete) {
        ctx.globalAlpha = crossFade;
        this.drawImageContain(firstP2);
      }
      ctx.globalAlpha = 1;
    } else {
      // Phase 2: Finger → India
      if (this.phase2Loaded === 0) return;
      const phaseProgress = (p - 0.52) / 0.48; // 0 → 1 within phase2
      const clampedProgress = Math.max(0, Math.min(1, phaseProgress));
      const frameIndex = Math.min(
        totalPhase2 - 1,
        Math.floor(clampedProgress * totalPhase2)
      );
      const nextIndex = Math.min(totalPhase2 - 1, frameIndex + 1);

      const img = this.phase2Images[frameIndex];
      const nextImg = this.phase2Images[nextIndex];

      if (img && img.complete) {
        this.drawImageContain(img);

        // Cross-fade to next frame for smoothness
        if (nextImg && nextImg.complete && frameIndex !== nextIndex) {
          const frameFrac = (clampedProgress * totalPhase2) - frameIndex;
          ctx.globalAlpha = frameFrac;
          this.drawImageContain(nextImg);
          ctx.globalAlpha = 1;
        }
      }
    }
  },

  destroy() {
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    this.animFrameId = null;
    this.initialized = false;
    this.phase1Images = [];
    this.phase2Images = [];
  }
};
