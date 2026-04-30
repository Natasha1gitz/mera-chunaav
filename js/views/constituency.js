// ============================================
// Mera Chunaav — Constituency Intelligence View
// ============================================

/**
 * Constituency Intelligence view controller.
 * Renders voter metrics, turnout charts, candidate cards, and the polling booth map.
 * @namespace ConstituencyView
 */
const ConstituencyView = {
  initialized: false,

  /**
   * Initializes all sub-components of the constituency view.
   * Prevents re-initialization if already rendered.
   */
  init() {
    if (this.initialized) return;
    const c = AppState.constituency;
    if (!c) return;

    this.renderHero(c);
    this.renderMetrics(c);
    this.renderTurnoutChart(c);
    this.renderCandidates(c);
    this.renderMap(c);
    this.setupDragScroll();

    this.initialized = true;
    setTimeout(() => Animations.refreshObserver(), 100);
  },

  renderHero(c) {
    const ghost = document.getElementById('const-hero-ghost');
    const tagline = document.getElementById('const-hero-tagline');
    if (ghost) ghost.textContent = c.name;

    const winner = c.candidates.find(x => x.winner);
    if (tagline && winner) {
      tagline.textContent = `${c.name} returned ${winner.name} (${winner.party}) with a ${formatIndianNumber(c.winningMargin)} vote margin in 2024`;
    }
  },

  renderMetrics(c) {
    const metrics = [
      { label: 'REGISTERED VOTERS', value: c.electors.total, data: [c.electors.total * 0.88, c.electors.total * 0.94, c.electors.total], delta: '+6.2%', up: true },
      { label: '2024 TURNOUT', value: c.turnout['2024'], suffix: '%', decimal: true, data: [c.turnout['2014'], c.turnout['2019'], c.turnout['2024']], delta: (c.turnout['2024'] - c.turnout['2019']).toFixed(1) + '%', up: c.turnout['2024'] > c.turnout['2019'] },
      { label: 'WOMEN ELECTORS', value: c.womenElectors, suffix: '%', decimal: true, data: [43.1, 45.2, c.womenElectors], delta: '+2.0%', up: true },
      { label: 'WINNING MARGIN', value: c.winningMargin, data: [c.winningMargin * 1.2, c.winningMargin * 0.8, c.winningMargin], delta: 'Phase ' + c.phase, up: true }
    ];

    const grid = document.getElementById('metrics-grid');
    if (!grid) return;
    grid.innerHTML = '';

    metrics.forEach((m, i) => {
      const card = document.createElement('div');
      card.className = 'metric-card reveal';
      card.style.transitionDelay = `${i * 80}ms`;

      const sparkContainer = document.createElement('div');
      sparkContainer.className = 'metric-card__sparkline';
      const sparkSvg = Animations.createSparkline(m.data);
      sparkContainer.appendChild(sparkSvg);

      card.innerHTML = `
        <span class="metric-card__label">${m.label}</span>
        <span class="metric-card__value" data-count-to="${m.value}" ${m.suffix === '%' ? 'data-count-suffix="%"' : ''} ${m.decimal ? 'data-count-decimal="true"' : ''}>0</span>
        <div class="metric-card__delta ${m.up ? 'metric-card__delta--up' : 'metric-card__delta--down'}">
          ${m.up ? '↑' : '↓'} ${m.delta} vs 2019
        </div>
      `;
      card.insertBefore(sparkContainer, card.lastElementChild);
      grid.appendChild(card);
    });
  },

  renderTurnoutChart(c) {
    const container = document.getElementById('turnout-chart');
    if (!container) return;

    const years = ['2014', '2019', '2024'];
    const values = years.map(y => c.turnout[y]);
    const width = 600, height = 180, pad = 50;

    const maxV = Math.max(...values) + 5;
    const minV = Math.min(...values) - 5;
    const rangeV = maxV - minV;

    const getX = (i) => pad + (i / (years.length - 1)) * (width - pad * 2);
    const getY = (v) => pad + (1 - (v - minV) / rangeV) * (height - pad * 2);

    const points = values.map((v, i) => `${getX(i)},${getY(v)}`);
    const areaPoints = `${getX(0)},${height - pad / 2} ${points.join(' ')} ${getX(2)},${height - pad / 2}`;
    const lineLength = points.reduce((sum, p, i) => {
      if (i === 0) return 0;
      const [x1, y1] = points[i - 1].split(',').map(Number);
      const [x2, y2] = p.split(',').map(Number);
      return sum + Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    }, 0);

    let gridLines = '';
    for (let pct = 0; pct <= 100; pct += 20) {
      if (pct >= minV && pct <= maxV) {
        const y = getY(pct);
        gridLines += `<line x1="${pad}" y1="${y}" x2="${width - pad}" y2="${y}" class="turnout-chart__grid-line" />`;
        gridLines += `<text x="${pad - 8}" y="${y + 4}" text-anchor="end" class="turnout-chart__label">${pct}%</text>`;
      }
    }

    let dots = '';
    values.forEach((v, i) => {
      dots += `<circle cx="${getX(i)}" cy="${getY(v)}" r="5" class="turnout-chart__dot" data-year="${years[i]}" data-value="${v}" />`;
    });

    let yearLabels = '';
    years.forEach((y, i) => {
      yearLabels += `<text x="${getX(i)}" y="${height - 8}" text-anchor="middle" class="turnout-chart__label">${y}</text>`;
    });

    container.innerHTML = `
      <div class="turnout-chart__title">YOUR CONSTITUENCY'S PARTICIPATION OVER TIME</div>
      <div style="position:relative;">
        <svg class="turnout-chart__svg" viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet">
          ${gridLines}
          <polygon points="${areaPoints}" class="turnout-chart__area" />
          <polyline points="${points.join(' ')}" class="turnout-chart__line turnout-chart__line--animated" style="--line-length:${lineLength}" />
          ${dots}
          ${yearLabels}
        </svg>
        <div class="turnout-chart__tooltip" id="turnout-tooltip">
          <div class="turnout-chart__tooltip-year"></div>
          <div class="turnout-chart__tooltip-value"></div>
        </div>
      </div>
    `;

    // Tooltip hover
    container.querySelectorAll('.turnout-chart__dot').forEach(dot => {
      dot.addEventListener('mouseenter', (e) => {
        const tooltip = document.getElementById('turnout-tooltip');
        tooltip.querySelector('.turnout-chart__tooltip-year').textContent = dot.dataset.year;
        tooltip.querySelector('.turnout-chart__tooltip-value').textContent = dot.dataset.value + '%';
        tooltip.classList.add('visible');
        const rect = container.querySelector('svg').getBoundingClientRect();
        tooltip.style.left = (e.clientX - rect.left + 10) + 'px';
        tooltip.style.top = (e.clientY - rect.top - 40) + 'px';
      });
      dot.addEventListener('mouseleave', () => {
        document.getElementById('turnout-tooltip').classList.remove('visible');
      });
    });
  },

  /**
   * Renders candidate flip-cards with party colors, vote shares, and background details.
   * @param {Object} c - The constituency data object.
   */
  renderCandidates(c) {
    const container = document.getElementById('candidates-scroll');
    const countEl = document.getElementById('candidates-count');
    if (!container) return;

    if (countEl) countEl.textContent = c.candidates.length;
    container.innerHTML = '';

    c.candidates.forEach((cand, i) => {
      const initials = cand.name.split(' ').map(w => w[0]).join('');
      const card = document.createElement('div');
      card.className = `flip-card ${cand.winner ? 'flip-card--winner' : ''} hover-lift-lg`;
      card.setAttribute('aria-label', `${cand.name}, ${cand.party}, ${cand.voteShare}% votes`);
      card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'button');

      card.innerHTML = `
        <div class="flip-card__inner">
          <div class="flip-card__front">
            <div class="flip-card__party-strip" style="background:${cand.partyColor}"></div>
            ${cand.winner ? '<span class="winner-badge">Winner</span>' : ''}
            <div class="flip-card__avatar" style="border-color:${cand.partyColor}">${initials}</div>
            <div class="flip-card__name">${cand.name}</div>
            <div class="flip-card__party">${cand.symbol} ${cand.party}</div>
            <div class="flip-card__vote-share">${cand.voteShare}%</div>
          </div>
          <div class="flip-card__back">
            <div class="flip-card__back-row">
              <div><div class="flip-card__back-label">Assets</div><div class="flip-card__back-value">₹${cand.assets} Cr</div></div>
              <div><div class="flip-card__back-label">Criminal Cases</div><div class="flip-card__back-value ${cand.criminalCases > 0 ? 'flip-card__criminal' : ''}">${cand.criminalCases > 0 ? '⚠️ ' + cand.criminalCases : '✅ None'}</div></div>
            </div>
            <div class="flip-card__back-row">
              <div><div class="flip-card__back-label">Education</div><div class="flip-card__back-value">${cand.education}</div></div>
              <div><div class="flip-card__back-label">Age</div><div class="flip-card__back-value">${cand.age} yrs</div></div>
            </div>
            <div class="flip-card__back-label" style="margin-top:8px;font-size:10px;color:var(--muted)">Tap to flip back</div>
          </div>
        </div>
      `;

      card.addEventListener('click', () => card.classList.toggle('flipped'));
      card.addEventListener('keydown', (e) => { if (e.key === 'Enter') card.classList.toggle('flipped'); });
      container.appendChild(card);
    });
  },

  /**
   * Initializes the Google Map showing the nearest polling booth location.
   * @param {Object} c - The constituency data object containing booth coordinates.
   */
  renderMap(c) {
    const container = document.getElementById('map-container');
    const overlay = document.getElementById('map-overlay');
    if (!container) return;

    // Show booth info in overlay
    if (overlay && c.booth) {
      overlay.innerHTML = `
        <div class="map-overlay__name">📍 ${c.booth.name}</div>
        <div class="map-overlay__address">${c.booth.address}</div>
        <div class="map-overlay__distance">${c.booth.distance} away</div>
      `;
    }

    if (typeof MapsModule !== 'undefined') {
      MapsModule.init(container, c.booth.lat, c.booth.lng, c.booth.name).catch(() => {
        container.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--muted);font-size:14px;">🗺️ Map unavailable</div>`;
      });
    }
  },

  setupDragScroll() {
    document.querySelectorAll('.candidates-scroll, .h-scroll').forEach(el => {
      let isDown = false, startX, scrollLeft;
      el.addEventListener('mousedown', (e) => { isDown = true; startX = e.pageX - el.offsetLeft; scrollLeft = el.scrollLeft; el.style.cursor = 'grabbing'; });
      el.addEventListener('mouseleave', () => { isDown = false; el.style.cursor = 'grab'; });
      el.addEventListener('mouseup', () => { isDown = false; el.style.cursor = 'grab'; });
      el.addEventListener('mousemove', (e) => { if (!isDown) return; e.preventDefault(); const x = e.pageX - el.offsetLeft; el.scrollLeft = scrollLeft - (x - startX); });
    });
  }
};
