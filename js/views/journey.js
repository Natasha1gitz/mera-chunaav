// ============================================
// Mera Chunaav — Journey Map View
// ============================================

/**
 * Journey Map view controller.
 * Renders the full election timeline with alternating left/right cards,
 * expandable details, and deep-links to the AI Guide.
 * @namespace JourneyView
 */
const JourneyView = {
  initialized: false,

  /**
   * Initializes the journey timeline from the constituency's phase data.
   */
  init() {
    if (this.initialized) return;
    const c = AppState.constituency;
    if (!c) return;

    this.renderTimeline(c);
    this.initialized = true;
    setTimeout(() => Animations.refreshObserver(), 100);
  },

  renderTimeline(c) {
    const container = document.getElementById('timeline-container');
    if (!container) return;

    const phases = c.phases || [];
    container.innerHTML = '';

    // Vertical line background
    const lineDiv = document.createElement('div');
    lineDiv.className = 'timeline__line';
    lineDiv.innerHTML = `<div class="timeline__line-bg"></div>`;
    container.appendChild(lineDiv);

    phases.forEach((phase, i) => {
      const isLeft = i % 2 === 0;
      const item = document.createElement('div');
      item.className = `timeline__item timeline__item--${isLeft ? 'left' : 'right'} ${isLeft ? 'reveal-left' : 'reveal-right'}`;
      item.style.transitionDelay = `${i * 120}ms`;

      // Status
      const statusClass = phase.status === 'completed' ? 'timeline__node--completed' :
                          phase.status === 'active' ? 'timeline__node--active' : '';
      const statusBadge = phase.status === 'completed' ? '<span class="badge badge--success">✓ Completed</span>' :
                         phase.status === 'active' ? '<span class="badge badge--saffron">● Active</span>' :
                         this.getCountdown(phase.date);

      item.innerHTML = `
        <div class="timeline__node ${statusClass}">${phase.id}</div>
        <div class="timeline__card" data-phase="${phase.id}">
          <div class="timeline__card-phase">PHASE ${String(phase.id).padStart(2, '0')} — ${phase.label.toUpperCase()}</div>
          <div class="timeline__card-title">${phase.title}</div>
          <div class="timeline__card-duration">⏱ ${phase.days} day${phase.days > 1 ? 's' : ''}</div>
          <div class="timeline__card-desc">${phase.desc}</div>
          <div class="timeline__card-status">${statusBadge}</div>
          <div class="timeline__card-details">
            <div class="timeline__card-details-inner">
              <p style="font-size:13px;color:var(--muted);margin-bottom:8px;">Date: ${phase.date || 'TBD'}</p>
              <a class="timeline__card-ai-link" data-question="Tell me more about the ${phase.title.toLowerCase()} phase">Ask AI Guide ↗</a>
            </div>
          </div>
          <div class="timeline__connector"></div>
        </div>
      `;

      container.appendChild(item);
    });

    // Card expand/collapse
    container.querySelectorAll('.timeline__card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('.timeline__card-ai-link')) {
          e.preventDefault();
          const q = e.target.dataset.question;
          Router.navigate('ai-guide');
          setTimeout(() => {
            if (typeof AiGuideView !== 'undefined') AiGuideView.sendMessage(q);
          }, 500);
          return;
        }
        card.classList.toggle('expanded');
      });
    });
  },

  getCountdown(dateStr) {
    if (!dateStr) return '<span class="badge badge--muted">Date TBD</span>';
    const target = new Date(dateStr);
    const now = new Date();
    const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
    if (diff > 0) {
      return `<span class="badge badge--gold">In ${diff} days</span>`;
    }
    return '<span class="badge badge--success">✓ Completed</span>';
  }
};
