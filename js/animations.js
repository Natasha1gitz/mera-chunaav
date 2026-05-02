/**
 * @fileoverview Animation utilities for Mera Chunaav including scroll-reveal
 * observers, count-up counters, confetti explosions, sparkline SVG generation,
 * shimmer sweeps, and typewriter text effects.
 * @module animations
 */

// ============================================
// Mera Chunaav — Animations Module
// IntersectionObserver, Counters, Confetti
// ============================================

/**
 * Animations module providing scroll-reveal observers, count-up counters,
 * confetti effects, sparkline generation, and micro-interaction utilities.
 * @namespace Animations
 */
const Animations = {
  // ---------- IntersectionObserver for scroll reveals ----------
  /**
   * Creates an IntersectionObserver that reveals elements and triggers count-up animations.
   * @returns {IntersectionObserver} The initialized observer instance.
   */
  initObserver() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            // If it's a counter, trigger count-up
            if (entry.target.dataset.countTo) {
              this.countUp(entry.target, parseInt(entry.target.dataset.countTo));
            }
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
    );

    document.querySelectorAll('.reveal, .reveal-left, .reveal-right, [data-count-to]').forEach(el => {
      observer.observe(el);
    });

    return observer;
  },

  /**
   * Re-initializes the observer for dynamically added elements.
   */
  refreshObserver() {
    this.initObserver();
  },

  // ---------- Count-up Animation ----------
  /**
   * Animates a numeric value from 0 to a target with easing.
   * @param {HTMLElement} element - The DOM element to update.
   * @param {number} target - The target number to count up to.
   * @param {number} [duration=1500] - Animation duration in milliseconds.
   */
  countUp(element, target, duration = 1500) {
    const start = 0;
    const startTime = performance.now();
    const isPercentage = element.dataset.countSuffix === '%';
    const isDecimal = element.dataset.countDecimal === 'true';

    const easeOut = t => 1 - Math.pow(1 - t, 3);

    function tick(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOut(progress);
      const current = start + (target - start) * easedProgress;

      if (isDecimal) {
        element.textContent = current.toFixed(1) + (isPercentage ? '%' : '');
      } else if (isPercentage) {
        element.textContent = Math.floor(current) + '%';
      } else {
        element.textContent = formatIndianNumber(Math.floor(current));
      }

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        // Final value with formatting
        if (isDecimal) {
          element.textContent = target.toFixed ? target.toFixed(1) + (isPercentage ? '%' : '') : target;
        } else if (isPercentage) {
          element.textContent = target + '%';
        } else {
          element.textContent = formatIndianNumber(target);
        }
        // Subtle bounce on completion
        element.style.animation = 'countBounce 300ms var(--ease-bounce)';
        setTimeout(() => { element.style.animation = ''; }, 300);
      }
    }

    requestAnimationFrame(tick);
  },

  /**
   * Sequentially reveals a list of elements with staggered fade-in and slide-up transitions.
   * @param {HTMLElement[]} elements - Array of DOM elements to animate.
   * @param {number} [delay=80] - Delay between each element's animation in milliseconds.
   */
  staggerReveal(elements, delay = 80) {
    elements.forEach((el, i) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(24px)';
      setTimeout(() => {
        el.style.transition = `opacity 400ms var(--ease-smooth), transform 400ms var(--ease-smooth)`;
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      }, i * delay);
    });
  },

  /**
   * Simulates a typewriter effect by appending characters one at a time.
   * @param {HTMLElement} element - The element to type into.
   * @param {string} text - The full text string to type.
   * @param {number} [speed=30] - Delay between each character in milliseconds.
   * @returns {Promise<void>} Resolves when the full text has been typed.
   */
  typewriter(element, text, speed = 30) {
    return new Promise(resolve => {
      let i = 0;
      element.textContent = '';
      function type() {
        if (i < text.length) {
          element.textContent += text.charAt(i);
          i++;
          setTimeout(type, speed);
        } else {
          resolve();
        }
      }
      type();
    });
  },

  // ---------- Confetti Explosion ----------
  /**
   * Creates a confetti explosion effect at the specified screen coordinates.
   * @param {number} originX - The X coordinate of the explosion origin.
   * @param {number} originY - The Y coordinate of the explosion origin.
   * @param {number} [count=60] - Number of confetti particles to generate.
   */
  confetti(originX, originY, count = 60) {
    const container = document.createElement('div');
    container.className = 'confetti-container';
    document.body.appendChild(container);

    const colors = ['#FF6B00', '#F5C518', '#22C55E', '#FFFFFF', '#FF8C35', '#3B82F6'];

    for (let i = 0; i < count; i++) {
      const particle = document.createElement('div');
      particle.className = 'confetti-particle';

      // Random properties
      const angle = (Math.random() * 360) * (Math.PI / 180);
      const velocity = 100 + Math.random() * 300;
      const x = Math.cos(angle) * velocity;
      const y = Math.sin(angle) * velocity - 200; // Bias upward
      const rotation = Math.random() * 720 - 360;

      particle.style.cssText = `
        left: ${originX}px;
        top: ${originY}px;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        --confetti-x: ${x}px;
        --confetti-y: ${y}px;
        --confetti-r: ${rotation}deg;
        width: ${4 + Math.random() * 8}px;
        height: ${4 + Math.random() * 8}px;
        border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
        animation-duration: ${800 + Math.random() * 600}ms;
        animation-delay: ${Math.random() * 100}ms;
      `;

      container.appendChild(particle);
    }

    setTimeout(() => container.remove(), 2000);
  },

  /**
   * Applies a shimmer sweep highlight animation to an element.
   * @param {HTMLElement} element - The element to animate.
   */
  shimmerSweep(element) {
    element.classList.add('shimmer-sweep');
    setTimeout(() => element.classList.remove('shimmer-sweep'), 1500);
  },

  /**
   * Applies a horizontal shake animation to an element.
   * @param {HTMLElement} element - The element to shake.
   */
  shake(element) {
    element.classList.add('anim-shake');
    element.addEventListener('animationend', () => {
      element.classList.remove('anim-shake');
    }, { once: true });
  },

  /**
   * Animates an SVG path drawing with a stroke-dasharray reveal.
   * @param {SVGPathElement} svgPath - The SVG path element to animate.
   * @param {number} [duration=1200] - Animation duration in milliseconds.
   */
  drawLine(svgPath, duration = 1200) {
    const length = svgPath.getTotalLength();
    svgPath.style.setProperty('--line-length', length);
    svgPath.style.strokeDasharray = length;
    svgPath.style.strokeDashoffset = length;
    svgPath.style.animation = `drawLine ${duration}ms var(--ease-smooth) forwards`;
  },

  // ---------- Generate Sparkline SVG ----------
  /**
   * Generates a sparkline SVG element from a data array.
   * @param {number[]} data - Array of numeric values to plot.
   * @param {number} [width=100] - SVG width.
   * @param {number} [height=36] - SVG height.
   * @param {string} [color='var(--saffron)'] - Stroke color for the line.
   * @returns {SVGElement} The constructed SVG sparkline element.
   */
  createSparkline(data, width = 100, height = 36, color = 'var(--saffron)') {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', height);
    svg.style.overflow = 'visible';

    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const padding = 4;

    const points = data.map((v, i) => {
      const x = (i / (data.length - 1)) * (width - padding * 2) + padding;
      const y = height - padding - ((v - min) / range) * (height - padding * 2);
      return `${x},${y}`;
    });

    // Area fill
    const area = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    const areaPoints = [
      `${padding},${height - padding}`,
      ...points,
      `${width - padding},${height - padding}`
    ].join(' ');
    area.setAttribute('points', areaPoints);
    area.setAttribute('fill', 'rgba(255, 107, 0, 0.1)');
    svg.appendChild(area);

    // Line
    const polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
    polyline.setAttribute('points', points.join(' '));
    polyline.setAttribute('fill', 'none');
    polyline.setAttribute('stroke', color);
    polyline.setAttribute('stroke-width', '2');
    polyline.setAttribute('stroke-linecap', 'round');
    polyline.setAttribute('stroke-linejoin', 'round');
    svg.appendChild(polyline);

    // Dots
    data.forEach((v, i) => {
      const x = (i / (data.length - 1)) * (width - padding * 2) + padding;
      const y = height - padding - ((v - min) / range) * (height - padding * 2);
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', x);
      circle.setAttribute('cy', y);
      circle.setAttribute('r', '3');
      circle.setAttribute('fill', color);
      circle.setAttribute('stroke', 'var(--navy)');
      circle.setAttribute('stroke-width', '2');
      svg.appendChild(circle);
    });

    return svg;
  }
};
